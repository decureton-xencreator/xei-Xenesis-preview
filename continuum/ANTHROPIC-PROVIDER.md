# XEN-CPC-001 Anthropic Provider Connection

Status: adapter implemented and locally validated; Cloudflare authentication and secret entry pending
Default model: `claude-sonnet-5`
Secret name: `ANTHROPIC_API_KEY`

## Implemented boundary

The provider-neutral contract supports bounded completion, SSE streaming, tool definitions, strict tool schemas, JSON-schema output, timeouts, caller aborts, retry classification, `retry-after`, redacted errors, provider health, token accounting, and configurable cost accounting. Provider response bodies and credentials are never placed in thrown errors.

The default Sonnet 5 rates are the official introductory first-party Claude API rates verified on 2026-07-19: USD $2 per million input tokens and $10 per million output tokens through 2026-08-31. They must be revalidated before that date expires. Rates are constructor-configurable so a pricing change does not require changing the provider contract.

## Activation boundary

Claude remains disabled in local reconstruction mode. Do not place a key in `.dev.vars`, source code, generated files, screenshots, logs, or chat.

After the exact Cloudflare account, staging Worker name, resource bindings, and budget are confirmed:

1. Authenticate Wrangler in the project terminal.
2. Provision or bind the authorized staging resources.
3. Run `npx wrangler secret put ANTHROPIC_API_KEY --env staging`.
4. Enter the value only at Wrangler's private prompt.
5. Deploy the staging configuration with model execution disabled.
6. Enable a single capped smoke-test mission.
7. Verify provider-call, token, cost, checkpoint, artifact, and validation evidence before enabling additional missions.

Signing up for Claude or Claude Pro does not by itself prove Claude API billing and key access. Verify the Claude Console organization, API key permission, and spend limit before the smoke test.

Cloudflare account verification completed on 2026-07-19 for account `724d8b5c193838ea2871cca7aef7e0fb`. Staging D1, mission/dead-letter queues, R2, Durable Object, and Workflow resources were provisioned. The fail-closed Worker is deployed at `https://xen-continuum-stage2-staging.decureton.workers.dev`; its health endpoint returned HTTP 200 with `mode: staging` and `externalEffects: disabled`. Model execution remains disabled and no Anthropic secret has been entered.

## Safe initial policy

- One simultaneous Anthropic request.
- One provider call for the first smoke-test mission.
- Maximum 1,024 output tokens for the smoke test.
- Estimated mission cost ceiling: USD $0.10.
- Daily Anthropic ceiling before explicit adjustment: USD $5.00.
- Model escalation above Sonnet 5 requires recorded justification and approval.
- No repository writes, deployment actions, financial actions, or external communications during the first smoke test.
