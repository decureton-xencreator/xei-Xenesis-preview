import { describe, expect, it } from "vitest";
import { authenticate } from "../src/auth";

describe("authentication boundary", () => {
  it("accepts explicit local identity only in reconstruction mode", async () => {
    const request = new Request("https://local.test", {
      headers: {
        "x-xen-local-actor": "operator-1",
        "x-xen-local-tenant": "tenant-1",
        "x-xen-local-authority": "read,propose",
      },
    });
    const actor = await authenticate(request, {
      XEN_RUNTIME_MODE: "local-reconstruction",
      XEN_AUTH_MODE: "local-headers",
    } as Env);
    expect(actor.authorities).toEqual(["read", "propose"]);
  });

  it("fails closed when Access verification is incomplete", async () => {
    const request = new Request("https://runtime.example", {
      headers: { "cf-access-jwt-assertion": "unverified-placeholder" },
    });
    await expect(
      authenticate(request, { XEN_RUNTIME_MODE: "production", XEN_AUTH_MODE: "access" } as unknown as Env),
    ).rejects.toMatchObject({ code: "external_auth_not_configured" });
  });

  it("rejects missing Access assertions", async () => {
    await expect(
      authenticate(new Request("https://runtime.example"), { XEN_RUNTIME_MODE: "staging", XEN_AUTH_MODE: "cloudflare-access" } as unknown as Env),
    ).rejects.toMatchObject({ code: "authentication_required" });
  });
});
