import type { Actor, AuthorityLevel } from "./contracts";
import { RuntimeError } from "./errors";

const allowedAuthorities = new Set<AuthorityLevel>(["read", "propose", "approve", "execute", "admin"]);

export function authenticate(request: Request, env: Env): Actor {
  if (env.XEN_RUNTIME_MODE !== "local-reconstruction" || env.XEN_AUTH_MODE !== "local-headers") {
    const assertion = request.headers.get("cf-access-jwt-assertion");
    if (!assertion) {
      throw new RuntimeError("authentication_required", "Cloudflare Access authentication is required.", 401);
    }
    throw new RuntimeError(
      "external_auth_not_configured",
      "Cloudflare Access JWT verification is not configured; non-local access is denied.",
      503,
    );
  }

  const id = request.headers.get("x-xen-local-actor")?.trim();
  const tenantId = request.headers.get("x-xen-local-tenant")?.trim();
  const rawAuthorities = request.headers.get("x-xen-local-authority")?.split(",") ?? [];
  const authorities = rawAuthorities
    .map((item) => item.trim())
    .filter((item): item is AuthorityLevel => allowedAuthorities.has(item as AuthorityLevel));

  if (!id || !tenantId || authorities.length === 0) {
    throw new RuntimeError(
      "local_identity_required",
      "Local requests require actor, tenant, and authority headers.",
      401,
    );
  }

  return { id, tenantId, authorities, source: "local-development" };
}

export function requireAuthority(actor: Actor, required: AuthorityLevel): void {
  if (!actor.authorities.includes(required) && !actor.authorities.includes("admin")) {
    throw new RuntimeError("authority_denied", `The ${required} authority is required.`, 403);
  }
}
