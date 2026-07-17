import { describe, expect, it } from "vitest";
import { authenticate } from "../src/auth";

describe("authentication boundary", () => {
  it("accepts explicit local identity only in reconstruction mode", () => {
    const request = new Request("https://local.test", {
      headers: {
        "x-xen-local-actor": "operator-1",
        "x-xen-local-tenant": "tenant-1",
        "x-xen-local-authority": "read,propose",
      },
    });
    const actor = authenticate(request, {
      XEN_RUNTIME_MODE: "local-reconstruction",
      XEN_AUTH_MODE: "local-headers",
    } as Env);
    expect(actor.authorities).toEqual(["read", "propose"]);
  });

  it("fails closed outside local reconstruction mode", () => {
    const request = new Request("https://runtime.example", {
      headers: { "cf-access-jwt-assertion": "unverified-placeholder" },
    });
    expect(() =>
      authenticate(request, { XEN_RUNTIME_MODE: "production", XEN_AUTH_MODE: "access" } as unknown as Env),
    ).toThrowError(expect.objectContaining({ code: "external_auth_not_configured" }));
  });
});
