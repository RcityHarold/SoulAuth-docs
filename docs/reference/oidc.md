# OIDC API

13 endpoints: 7 protocol endpoints plus 6 for client management. Integration
walkthroughs are in [Integrate](/integrate/).

## Discovery

### `GET /.well-known/openid-configuration`

Unauthenticated. Also served at `/api/oidc/.well-known/openid-configuration` —
the same handler mounted at both paths, so clients that assume either
convention work.

```bash
curl -s https://auth.example.com/.well-known/openid-configuration | jq
```

::: danger Copy `issuer` from here
Do not assemble the issuer by hand. Trailing slash, port, `www` — one character
of difference and every token fails validation.
:::

### `GET /api/oidc/jwks`

Unauthenticated. The RSA public keys for verifying ID token signatures.

```json
{ "keys": [ { "kty": "RSA", "use": "sig", "alg": "RS256", "kid": "...", "n": "...", "e": "AQAB" } ] }
```

Cache it. Refetch only on an unrecognised `kid`.

## Protocol endpoints

### `GET /api/oidc/authorize`

| Parameter | Required | Notes |
| --- | --- | --- |
| `response_type` | yes | `code` |
| `client_id` | yes | |
| `redirect_uri` | yes | Must exactly match a registered URI |
| `scope` | yes | Must include `openid` |
| `state` | recommended | Returned unchanged; your CSRF defence |
| `code_challenge` | required for public clients | base64url(SHA-256(verifier)) |
| `code_challenge_method` | with a challenge | `S256` only |
| `nonce` | optional | Echoed into the ID token |

::: warning This endpoint uses a browser session, not a bearer token
Without a SoulAuth session, the user is redirected to `LOGIN_PAGE_URL` (default
`{APP_URL}/login`) with a `return_to` parameter. You must supply that page: it
calls `POST /api/auth/login`, then redirects to `return_to`.
:::

PKCE is mandatory for public clients, `S256` only. A public client omitting
`code_challenge` is rejected here — not downgraded.

### `POST /api/oidc/token`

Form-encoded. Client authentication via `client_secret_post` **or**
`client_secret_basic` — **not both**; sending credentials in both places is
rejected with `invalid_request` rather than silently picking one.

**Authorization code grant**

```bash
curl -X POST https://auth.example.com/api/oidc/token \
  -u "${CLIENT_ID}:${CLIENT_SECRET}" \
  -d grant_type=authorization_code \
  -d code=... -d redirect_uri=... -d client_id=... -d code_verifier=...
```

**Refresh grant**

```bash
curl -X POST https://auth.example.com/api/oidc/token \
  -u "${CLIENT_ID}:${CLIENT_SECRET}" \
  -d grant_type=refresh_token -d refresh_token=...
```

```json
{
  "access_token": "...",
  "id_token": "...",
  "refresh_token": "...",
  "token_type": "Bearer",
  "expires_in": 300
}
```

::: danger Refresh tokens rotate; replay revokes everything
Each refresh returns a new refresh token and kills the old one. Presenting an
already-rotated token is treated as theft and revokes **all** of that user's
tokens for that client.

Serialize refreshes per session. Never blindly retry after a timeout — verify
whether the previous attempt succeeded first.
:::

Authorization codes are single-use, including under concurrency: two
simultaneous redemptions produce exactly one success.

A **wrong client secret does not consume the code** — fix the secret and retry
with the same code.

Errors follow the OIDC shape:

```json
{ "error": "invalid_grant", "error_description": "Client not found" }
```

### `GET /api/oidc/userinfo`

Bearer access token. Returns claims for the authenticated subject.

Account status is enforced here — a suspended account gets `403`, not claims.

### `GET /api/oidc/logout`

RP-initiated logout.

| Parameter | Notes |
| --- | --- |
| `id_token_hint` | The ID token; its `sid` identifies the session |
| `post_logout_redirect_uri` | Where to send the browser afterwards |

## ID token claims

| Claim | Notes |
| --- | --- |
| `iss` | `APP_URL` without a trailing slash |
| `sub` | Stable user identifier |
| `aud` | Your `client_id` |
| `exp` / `iat` | Lifetime is **capped at 300 seconds** |
| `sid` | Authentication session id — always present |
| `nonce` | Echoed if supplied |

::: tip An empty `sid` means you have the access token
SoulAuth refuses to sign an ID token when it cannot resolve a session
reference, so it never issues one without `sid`. This is the most common
integration mix-up.
:::

## Client management

Reads need `soulauth:oidc_clients.read`; writes need
`soulauth:oidc_clients.write`.

| Endpoint | Purpose |
| --- | --- |
| `GET /api/oidc/clients` | List |
| `POST /api/oidc/clients` | Create — **the only time the secret is returned** |
| `GET /api/oidc/clients/:client_id` | Read (secret masked as `***`) |
| `PUT /api/oidc/clients/:client_id` | Update |
| `DELETE /api/oidc/clients/:client_id` | Disable |
| `POST /api/oidc/clients/:client_id/regenerate-secret` | New secret |

`id_token_lifetime` above 300 is **silently clamped** to 300.

`DELETE` disables rather than destroys, so audit events referencing the client
remain meaningful.

Regenerating a secret breaks every component using the old one, immediately.

Details and full field list: [Registering a Client](/integrate/clients).

## Next steps

- [**The Authorization Code Flow**](/integrate/auth-code-flow)
- [**Verifying ID Tokens**](/integrate/verifying-tokens)
