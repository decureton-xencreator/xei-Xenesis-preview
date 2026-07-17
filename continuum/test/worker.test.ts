import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

describe("versioned Worker surface", () => {
  it("reports the bounded local runtime without authentication or external effects", async () => {
    const response = await SELF.fetch("https://local.test/api/v1/continuum/health");
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      status: "ok",
      service: "xen-continuum-stage2",
      mode: "local-reconstruction",
      externalEffects: "disabled",
    });
  });

  it("does not claim unversioned API ownership", async () => {
    const response = await SELF.fetch("https://local.test/api/continuum/health");
    expect(response.status).toBe(401);
  });
});
