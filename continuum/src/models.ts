export type ProviderFailureKind =
  | "authentication"
  | "permission"
  | "invalid_request"
  | "rate_limit"
  | "timeout"
  | "overloaded"
  | "provider"
  | "aborted";

export interface ModelToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  strict?: boolean;
}

export interface ModelRequest {
  system: string;
  prompt: string;
  maxTokens: number;
  timeoutMs?: number;
  signal?: AbortSignal;
  tools?: ModelToolDefinition[];
  outputSchema?: Record<string, unknown>;
}

export interface ModelUsage {
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number;
}

export interface ModelResponse {
  provider: string;
  model: string;
  text: string;
  stopReason?: string;
  usage: ModelUsage;
  requestId?: string;
}

export interface ModelStreamChunk {
  type: "text" | "usage";
  text?: string;
  usage?: ModelUsage;
}

export interface ProviderHealth {
  provider: string;
  model: string;
  ok: boolean;
  latencyMs: number;
}

export interface ModelProvider {
  complete(request: ModelRequest): Promise<ModelResponse>;
  stream(request: ModelRequest): AsyncGenerator<ModelStreamChunk, ModelResponse>;
  health(signal?: AbortSignal): Promise<ProviderHealth>;
}

export class ProviderError extends Error {
  constructor(
    message: string,
    readonly kind: ProviderFailureKind,
    readonly retryable: boolean,
    readonly status?: number,
    readonly retryAfterSeconds?: number,
    readonly requestId?: string,
  ) {
    super(message);
    this.name = "ProviderError";
  }
}

export class DisabledModelProvider implements ModelProvider {
  private disabled(): never {
    throw new ProviderError("External model execution is disabled in local reconstruction mode.", "permission", false);
  }
  async complete(_request: ModelRequest): Promise<ModelResponse> { return this.disabled(); }
  async *stream(_request: ModelRequest): AsyncGenerator<ModelStreamChunk, ModelResponse> { return this.disabled(); }
  async health(): Promise<ProviderHealth> { return { provider: "disabled", model: "none", ok: false, latencyMs: 0 }; }
}

export interface AnthropicProviderOptions {
  apiKey: string;
  model?: string;
  endpoint?: string;
  timeoutMs?: number;
  inputUsdPerMillion?: number;
  outputUsdPerMillion?: number;
  fetcher?: typeof fetch;
}

interface AnthropicMessage {
  id?: string;
  model?: string;
  stop_reason?: string;
  content?: Array<{ type: string; text?: string }>;
  usage?: { input_tokens?: number; output_tokens?: number };
}

const DEFAULT_MODEL = "claude-sonnet-5";
const DEFAULT_INPUT_USD_PER_MILLION = 2;
const DEFAULT_OUTPUT_USD_PER_MILLION = 10;

export class AnthropicProvider implements ModelProvider {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly endpoint: string;
  private readonly timeoutMs: number;
  private readonly inputRate: number;
  private readonly outputRate: number;
  private readonly fetcher: typeof fetch;

  constructor(options: AnthropicProviderOptions) {
    this.apiKey = options.apiKey;
    this.model = options.model ?? DEFAULT_MODEL;
    this.endpoint = (options.endpoint ?? "https://api.anthropic.com").replace(/\/$/, "");
    this.timeoutMs = options.timeoutMs ?? 60_000;
    this.inputRate = options.inputUsdPerMillion ?? DEFAULT_INPUT_USD_PER_MILLION;
    this.outputRate = options.outputUsdPerMillion ?? DEFAULT_OUTPUT_USD_PER_MILLION;
    this.fetcher = options.fetcher ?? fetch;
  }

  async complete(request: ModelRequest): Promise<ModelResponse> {
    const response = await this.send(request, false);
    const data = (await response.json()) as AnthropicMessage;
    const usage = this.usage(data.usage);
    return {
      provider: "anthropic",
      model: data.model ?? this.model,
      text: data.content?.filter((item) => item.type === "text").map((item) => item.text ?? "").join("") ?? "",
      usage,
      ...(data.stop_reason ? { stopReason: data.stop_reason } : {}),
      ...(response.headers.get("request-id") ? { requestId: response.headers.get("request-id")! } : {}),
    };
  }

  async *stream(request: ModelRequest): AsyncGenerator<ModelStreamChunk, ModelResponse> {
    const response = await this.send(request, true);
    if (!response.body) throw new ProviderError("Anthropic stream was unavailable.", "provider", true);
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let text = "";
    let finalUsage = this.usage();
    while (true) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      const frames = buffer.split("\n\n");
      buffer = frames.pop() ?? "";
      for (const frame of frames) {
        const dataLine = frame.split("\n").find((line) => line.startsWith("data: "));
        if (!dataLine) continue;
        const event = JSON.parse(dataLine.slice(6)) as {
          type?: string;
          delta?: { type?: string; text?: string; stop_reason?: string };
          message?: AnthropicMessage;
          usage?: { input_tokens?: number; output_tokens?: number };
          error?: { type?: string };
        };
        if (event.type === "error") throw new ProviderError("Anthropic stream failed.", event.error?.type === "overloaded_error" ? "overloaded" : "provider", true);
        if (event.delta?.type === "text_delta" && event.delta.text) {
          text += event.delta.text;
          yield { type: "text", text: event.delta.text };
        }
        const rawUsage = event.usage ?? event.message?.usage;
        if (rawUsage) {
          finalUsage = this.usage({
            input_tokens: rawUsage.input_tokens ?? finalUsage.inputTokens,
            output_tokens: rawUsage.output_tokens ?? finalUsage.outputTokens,
          });
          yield { type: "usage", usage: finalUsage };
        }
      }
      if (done) break;
    }
    return {
      provider: "anthropic",
      model: this.model,
      text,
      usage: finalUsage,
      ...(response.headers.get("request-id") ? { requestId: response.headers.get("request-id")! } : {}),
    };
  }

  async health(signal?: AbortSignal): Promise<ProviderHealth> {
    this.requireCredential();
    const started = Date.now();
    const fetcher = this.fetcher;
    const response = await fetcher(`${this.endpoint}/v1/models/${encodeURIComponent(this.model)}`, {
      headers: this.headers(),
      ...(signal ? { signal } : {}),
    });
    if (!response.ok) throw this.failure(response);
    return { provider: "anthropic", model: this.model, ok: true, latencyMs: Date.now() - started };
  }

  private async send(request: ModelRequest, stream: boolean): Promise<Response> {
    this.requireCredential();
    if (!Number.isInteger(request.maxTokens) || request.maxTokens < 1 || request.maxTokens > 128_000) {
      throw new ProviderError("Anthropic maxTokens is outside the authorized range.", "invalid_request", false);
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort("timeout"), request.timeoutMs ?? this.timeoutMs);
    const onAbort = () => controller.abort("caller");
    request.signal?.addEventListener("abort", onAbort, { once: true });
    try {
      const body = {
        model: this.model,
        max_tokens: request.maxTokens,
        system: request.system,
        messages: [{ role: "user", content: request.prompt }],
        stream,
        ...(request.tools?.length ? { tools: request.tools.map((tool) => ({ name: tool.name, description: tool.description, input_schema: tool.inputSchema, ...(tool.strict === undefined ? {} : { strict: tool.strict }) })) } : {}),
        ...(request.outputSchema ? { output_config: { format: { type: "json_schema", schema: request.outputSchema } } } : {}),
      };
      const fetcher = this.fetcher;
      const response = await fetcher(`${this.endpoint}/v1/messages`, {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      if (!response.ok) throw this.failure(response);
      return response;
    } catch (error) {
      if (error instanceof ProviderError) throw error;
      if (controller.signal.aborted) {
        const callerAborted = request.signal?.aborted === true;
        throw new ProviderError(callerAborted ? "Anthropic request was aborted." : "Anthropic request timed out.", callerAborted ? "aborted" : "timeout", !callerAborted);
      }
      throw new ProviderError("Anthropic network request failed.", "provider", true);
    } finally {
      clearTimeout(timeout);
      request.signal?.removeEventListener("abort", onAbort);
    }
  }

  private headers(): Record<string, string> {
    return { "content-type": "application/json", "anthropic-version": "2023-06-01", "x-api-key": this.apiKey };
  }

  private requireCredential(): void {
    if (!this.apiKey) throw new ProviderError("Anthropic credential is not configured.", "authentication", false);
  }

  private failure(response: Response): ProviderError {
    const status = response.status;
    const kind: ProviderFailureKind = status === 401 ? "authentication" : status === 403 ? "permission" : status === 429 ? "rate_limit" : status === 529 ? "overloaded" : status >= 500 ? "provider" : "invalid_request";
    const retryAfter = Number(response.headers.get("retry-after"));
    return new ProviderError(
      `Anthropic request failed with status ${status}.`,
      kind,
      status === 408 || status === 409 || status === 429 || status >= 500,
      status,
      ...(Number.isFinite(retryAfter) ? [retryAfter] : [undefined]),
      ...(response.headers.get("request-id") ? [response.headers.get("request-id")!] : []),
    );
  }

  private usage(raw?: { input_tokens?: number; output_tokens?: number }): ModelUsage {
    const inputTokens = raw?.input_tokens ?? 0;
    const outputTokens = raw?.output_tokens ?? 0;
    return { inputTokens, outputTokens, estimatedCostUsd: (inputTokens * this.inputRate + outputTokens * this.outputRate) / 1_000_000 };
  }
}
