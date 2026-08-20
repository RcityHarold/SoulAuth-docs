# Registering a Client

Every OIDC integration starts with a client registration. This needs an account
holding `soulauth:oidc_clients.write` — the built-in `admin` role has it.

## Creating a client

```bash
curl -X POST https://auth.example.com/api/oidc/clients \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "client_name": "My Application BFF",
    "client_type": "confidential",
    "redirect_uris": ["https://app.example.com/auth/callback"],
    "require_pkce": true,
    "allowed_grant_types": ["authorization_code", "refresh_token"],
    "allowed_response_types": ["code"],
    "allowed_scopes": ["openid"],
    "id_token_lifetime": 300
  }'
```

The response contains `client_id` and `client_secret`.

::: danger The secret is shown exactly once
Subsequent reads return `***`. If you lose it, your only recourse is
`POST /api/oidc/clients/:client_id/regenerate-secret` — which **immediately
breaks every component still using the old secret**. There is no cheap retry
here. Settle your redirect URIs and store the secret before you move on.
:::

## Fields

| Field | Notes |
| --- | --- |
| `client_name` | Human-readable, shown in the client list. |
| `client_type` | `confidential` or `public`. |
| `redirect_uris` | Validated at registration and again at authorization. Exact match. |
| `require_pkce` | Always effectively true for public clients — see below. |
| `allowed_grant_types` | `authorization_code`, `refresh_token`. |
| `allowed_response_types` | `code`. |
| `allowed_scopes` | `openid` at minimum. |
| `id_token_lifetime` | Seconds. **Silently clamped to 300.** |

::: warning `id_token_lifetime` above 300 is clamped, not rejected
Pass `3600` and you get 300 without an error. Write `300` so nobody later
concludes the parameter is being ignored.
:::

## Confidential vs public

**Confidential** clients hold a `client_secret`. Use this whenever anything
server-side is involved — which, per [Choosing a Path](./), should be almost
always.

**Public** clients hold no secret. For them, **PKCE is mandatory and `S256` is
the only accepted method**. A public client that omits `code_challenge` is
rejected at `/authorize` rather than being quietly downgraded to a weaker flow.

Use PKCE for confidential clients too. It costs nothing and closes the
authorization code interception window.

## Client authentication

The token endpoint accepts both methods advertised in the discovery document:

```bash
# client_secret_post — credentials in the form body
curl -X POST https://auth.example.com/api/oidc/token \
  -d grant_type=authorization_code -d code=... -d redirect_uri=... \
  -d client_id=... -d client_secret=... -d code_verifier=...

# client_secret_basic — credentials in the Authorization header
# (the default for most OIDC client libraries)
curl -X POST https://auth.example.com/api/oidc/token \
  -u "${CLIENT_ID}:${CLIENT_SECRET}" \
  -d grant_type=authorization_code -d code=... -d redirect_uri=... \
  -d client_id=... -d code_verifier=...
```

**Sending credentials in both places is rejected** with `invalid_request`.
SoulAuth does not pick one — that would let a mismatch between the two secrets
pass silently, and a mismatch is exactly the kind of anomaly worth surfacing.

::: tip Upgrading from an older build
`client_secret_basic` was only implemented on 2026-08-17. Before that the
discovery document advertised support while the token endpoint parsed the form
body only. On an older instance, a standard OIDC library will report
`Client secret required for confidential clients` — and the integrator will
recheck a configuration that was correct all along.
:::

## Managing clients

```
GET    /api/oidc/clients                            list
POST   /api/oidc/clients                            create
GET    /api/oidc/clients/:client_id                 read (secret masked)
PUT    /api/oidc/clients/:client_id                 update
DELETE /api/oidc/clients/:client_id                 disable
POST   /api/oidc/clients/:client_id/regenerate-secret
```

Reads require `soulauth:oidc_clients.read`; writes require
`soulauth:oidc_clients.write`.

`DELETE` **disables** rather than destroying. Existing tokens stop working; the
record remains so that audit events referencing the client stay meaningful.

## Next steps

- [**The Authorization Code Flow**](./auth-code-flow) — using the client.
- [**The BFF Pattern**](./bff) — if your front end is a browser app.
- [**OIDC API reference**](/reference/oidc) — exact request and response shapes.
