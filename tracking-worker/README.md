# Xen Choice Reporting

Private, minimal choice reporting for the Ed, Kim, and Ahmer premieres.

## Data boundary

The service stores only the invite audience, event type, selected commercial path, and timestamp. It does not store IP addresses, browser fingerprints, email addresses, manual searches, or company-discovery information.

## Production activation

1. Authenticate Wrangler to the authorized Cloudflare account.
2. Run `wrangler d1 create xen-choice-reporting` and replace the D1 placeholder in `wrangler.jsonc`.
3. Run `wrangler d1 migrations apply xen-choice-reporting --remote`.
4. Create a long random owner credential with `wrangler secret put ADMIN_TOKEN`.
5. Run `wrangler deploy`.
6. Set the deployed Worker URL in `../xen-choice-config.json`.
7. Create each private invite through `POST /v1/admin/invites` with the owner bearer token.

The returned `premiere_url` is the only link sent to that named viewer. The invite is opaque and stored in D1 only as a SHA-256 hash.
