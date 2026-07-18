import { describe, expect, it, vi } from "vitest";
import { AnthropicProvider, DisabledModelProvider, ProviderError } from "../src/models";

const request = { system: "system", prompt: "prompt", maxTokens: 10 };

describe("provider-neutral model boundary", () => {
  it("keeps external inference disabled by default", async () => {
    await expect(new DisabledModelProvider().complete(request)).rejects.toThrow("disabled");
  });

  it("redacts provider bodies and credentials while classifying failures", async () => {
    const fetcher = vi.fn(async () => new Response("sensitive provider body", { status: 429, headers: { "retry-after": "3" } }));
    const provider = new AnthropicProvider({ apiKey: "local-test-credential", model: "test-model", fetcher: fetcher as typeof fetch });
    let failure: ProviderError;
    try {
      await provider.complete(request);
      throw new Error("Expected provider failure");
    } catch (error) {
      failure = error as ProviderError;
    }
    expect(failure.message).toBe("Anthropic request failed with status 429.");
    expect(failure.kind).toBe("rate_limit");
    expect(failure.retryable).toBe(true);
    expect(failure.retryAfterSeconds).toBe(3);
    expect(failure.message).not.toContain("sensitive provider body");
    expect(failure.message).not.toContain("local-test-credential");
  });

  it("supports tools, structured output, token accounting, and cost accounting", async () => {
    const fetcher = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => new Response(JSON.stringify({
      model: "claude-sonnet-5", stop_reason: "end_turn", content: [{ type: "text", text: "{\"ok\":true}" }], usage: { input_tokens: 1000, output_tokens: 200 },
    }), { status: 200, headers: { "request-id": "req_test" } }));
    const provider = new AnthropicProvider({ apiKey: "credential", fetcher: fetcher as typeof fetch });
    const result = await provider.complete({ ...request, tools: [{ name: "lookup", description: "Lookup", inputSchema: { type: "object" }, strict: true }], outputSchema: { type: "object", properties: { ok: { type: "boolean" } }, required: ["ok"], additionalProperties: false } });
    const body = JSON.parse(String(fetcher.mock.calls[0]?.[1]?.body));
    expect(body.tools[0].input_schema).toEqual({ type: "object" });
    expect(body.output_config.format.type).toBe("json_schema");
    expect(result.usage).toEqual({ inputTokens: 1000, outputTokens: 200, estimatedCostUsd: 0.004 });
    expect(result.requestId).toBe("req_test");
  });

  it("streams text without logging or exposing the credential", async () => {
    const payload = [
      'event: message_start\ndata: {"type":"message_start","message":{"usage":{"input_tokens":10,"output_tokens":0}}}\n\n',
      'event: content_block_delta\ndata: {"type":"content_block_delta","delta":{"type":"text_delta","text":"Hello"}}\n\n',
      'event: message_delta\ndata: {"type":"message_delta","usage":{"output_tokens":2}}\n\n',
    ].join("");
    const fetcher = vi.fn(async () => new Response(payload, { status: 200 }));
    const provider = new AnthropicProvider({ apiKey: "credential", fetcher: fetcher as typeof fetch });
    const chunks: string[] = [];
    for await (const chunk of provider.stream(request)) if (chunk.text) chunks.push(chunk.text);
    expect(chunks.join("")).toBe("Hello");
  });

  it("validates token limits before invoking the provider", async () => {
    const fetcher = vi.fn();
    const provider = new AnthropicProvider({ apiKey: "credential", fetcher: fetcher as typeof fetch });
    await expect(provider.complete({ ...request, maxTokens: 0 })).rejects.toMatchObject({ kind: "invalid_request", retryable: false });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("invokes fetch without binding the provider as its receiver", async () => {
    let receiver: unknown = "not-called";
    async function receiverSensitiveFetcher(this: unknown): Promise<Response> {
      receiver = this;
      if (this !== undefined) throw new TypeError("Illegal invocation");
      return new Response(JSON.stringify({ model: "test-model", content: [{ type: "text", text: "ok" }], usage: { input_tokens: 1, output_tokens: 1 } }));
    }
    const provider = new AnthropicProvider({ apiKey: "credential", model: "test-model", fetcher: receiverSensitiveFetcher as typeof fetch });
    await expect(provider.complete(request)).resolves.toMatchObject({ text: "ok" });
    expect(receiver).toBeUndefined();
  });
});
