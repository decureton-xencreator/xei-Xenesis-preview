import { createRemoteJWKSet, jwtVerify } from "jose";
import type { Actor, AuthorityLevel } from "./contracts";
import { RuntimeError } from "./errors";

const allowedAuthorities = new Set<AuthorityLevel>(["read", "propose", "approve", "execute", "admin"]);

type AccessEnv = Env & {
  XEN_ACCESS_TEAM_DOMAIN?: string;
  XEN_ACCESS_AUD?: string;
  XEN_ACCESS_ADMIN_EMAIL_SHA256?: string;
};

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function authenticate(request: Request, env: Env): Promise<Actor> {
  if (env.XEN_RUNTIME_MODE === "local-reconstruction" && env.XEN_AUTH_MODE === "local-headers") {
    const id = request.headers.get("x-xen-local-actor")?.trim();
    const tenantId = request.headers.get("x-xen-local-tenant")?.trim();
    const rawAuthorities = request.headers.get("x-xen-local-authority")?.split(",") ?? [];
    const authorities = rawAuthorities
      .map((item) => item.trim())
      .filter((item): item is AuthorityLevel => allowedAuthorities.has(item as AuthorityLevel));
    if (!id || !tenantId || authorities.length === 0) {
      throw new RuntimeError("local_identity_required", "Local requests require actor, tenant, and authority headers.", 401);
    }
    return { id, tenantId, authorities, source: "local-development" };
  }

  const accessEnv = env as AccessEnv;
  const assertion = request.headers.get("cf-access-jwt-assertion");
  if (!assertion) throw new RuntimeError("authentication_required", "Cloudflare Access authentication is required.", 401);
  if (!accessEnv.XEN_ACCESS_TEAM_DOMAIN || !accessEnv.XEN_ACCESS_AUD || !accessEnv.XEN_ACCESS_ADMIN_EMAIL_SHA256) {
    throw new RuntimeError("external_auth_not_configured", "Cloudflare Access verification is not fully configured.", 503);
  }

  const issuer = accessEnv.XEN_ACCESS_TEAM_DOMAIN.replace(/\/$/, "");
  try {
    const jwks = createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`));
    const { payload } = await jwtVerify(assertion, jwks, {
      issuer,
      audience: accessEnv.XEN_ACCESS_AUD,
      algorithms: ["RS256"],
      requiredClaims: ["sub", "email", "exp", "iat", "nbf"],
    });
    if (payload.type !== "app" || typeof payload.email !== "string" || typeof payload.sub !== "string") {
      throw new Error("Access token identity claims are invalid.");
    }
    if ((await sha256(payload.email.trim().toLowerCase())) !== accessEnv.XEN_ACCESS_ADMIN_EMAIL_SHA256) {
      throw new Error("Access identity is outside the runtime allowlist.");
    }
    return {
      id: payload.sub,
      tenantId: `access:${payload.sub}`,
      authorities: ["admin"],
      source: "cloudflare-access",
    };
  } catch {
    throw new RuntimeError("invalid_access_token", "Cloudflare Access authentication could not be verified.", 403);
  }
}

export function requireAuthority(actor: Actor, required: AuthorityLevel): void {
  if (!actor.authorities.includes(required) && !actor.authorities.includes("admin")) {
    throw new RuntimeError("authority_denied", `The ${required} authority is required.`, 403);
  }
}
