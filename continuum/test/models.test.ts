import { describe, expect, it, vi } from "vitest";
import { AnthropicProvider, DisabledModelProvider } from "../src/models";

describe("provider-neutral model boundary", () => {
  it("keeps external inference disabled by default", async () => {
    await expect(
      new DisabledModelProvider().complete({ system: "system", prompt: "prompt", maxTokens: 10 }),
    ).rejects.toThrow("disabled");
  });

  it("does not disclose provider response bodies or credentials on failure", async () => {
    const fetcher = vi.fn(async () => new Response("sensitive provider body", { status: 401 }));
    const provider = new AnthropicProvider("local-test-credential", "test-model", fetcher as typeof fetch);
    const failure = await provider
      .complete({ system: "system", prompt: "prompt", maxTokens: 10 })
      .then(() => "")
      .catch((error: unknown) => (error instanceof Error ? error.message : String(error)));
    expect(failure).toContain("status 401");
    expect(failure).not.toContain("sensitive provider body");
  });
});
