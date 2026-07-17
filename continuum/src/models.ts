export interface ModelRequest {
  system: string;
  prompt: string;
  maxTokens: number;
}

export interface ModelResponse {
  provider: string;
  model: string;
  text: string;
  inputTokens?: number;
  outputTokens?: number;
}

export interface ModelProvider {
  complete(request: ModelRequest): Promise<ModelResponse>;
}

export class DisabledModelProvider implements ModelProvider {
  async complete(_request: ModelRequest): Promise<ModelResponse> {
    throw new Error("External model execution is disabled in local reconstruction mode.");
  }
}

export class AnthropicProvider implements ModelProvider {
  constructor(
    private readonly apiKey: string,
    private readonly model: string,
    private readonly fetcher: typeof fetch = fetch,
  ) {}

  async complete(request: ModelRequest): Promise<ModelResponse> {
    if (!this.apiKey) throw new Error("Anthropic credential is not configured.");
    const response = await this.fetcher("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "anthropic-version": "2023-06-01",
        "x-api-key": this.apiKey,
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: request.maxTokens,
        system: request.system,
        messages: [{ role: "user", content: request.prompt }],
      }),
    });
    if (!response.ok) {
      throw new Error(`Anthropic request failed with status ${response.status}.`);
    }
    const data = (await response.json()) as {
      content?: Array<{ type: string; text?: string }>;
      usage?: { input_tokens?: number; output_tokens?: number };
    };
    return {
      provider: "anthropic",
      model: this.model,
      text: data.content?.find((item) => item.type === "text")?.text ?? "",
      ...(data.usage?.input_tokens === undefined ? {} : { inputTokens: data.usage.input_tokens }),
      ...(data.usage?.output_tokens === undefined ? {} : { outputTokens: data.usage.output_tokens }),
    };
  }
}
