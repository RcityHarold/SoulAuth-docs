# API Conventions

Everything that applies across SoulAuth's **74 endpoints**. Read this once and
the per-module pages become short.

## Base URL and content type

All paths are relative to `APP_URL`. Requests and responses are JSON except
where OIDC mandates form encoding (the token endpoint).

```
Content-Type: application/json
```

## Authentication

Most endpoints take a bearer token from `POST /api/auth/login`:

```
Authorization: Bearer <token>
```

Exceptions:

- **`/api/oidc/authorize`** authenticates the *user's browser session* via
  cookie, not a bearer token.
- **`/api/oidc/token`** authenticates the *client*, via `client_secret_post` or
  `client_secret_basic`.
- **`/health`**, discovery and JWKS are unauthenticated.

## Response shape

Successful responses are **bare objects**. There is no envelope:

```json
{ "id": "user:abc", "email": "user@example.com", "is_admin": false }
```

::: warning This changed
Some endpoints previously wrapped results in `{"success": true, "data": {...}}`.
That was normalised away. If you are upgrading, remove the unwrapping step.
:::

OIDC endpoints are the deliberate exception — they return the shapes the
specification requires, envelope-free but spec-shaped:

```json
{ "access_token": "...", "token_type": "Bearer", "expires_in": 300 }
```

## Error shape

Most errors:

```json
{ "error": "Insufficient permissions" }
```

Four shapes exist in total, and knowing which is which saves debugging time:

| Shape | Where | Example |
| --- | --- | --- |
| `{"error": "..."}` | Most modules | `{"error": "User not found"}` |
| `{"error": "...", "error_description": "..."}` | OIDC endpoints (spec-mandated) | `{"error":"invalid_grant","error_description":"Client not found"}` |
| **Empty body** | `/api/rbac/*`, `/api/ops/*` | Status code only |
| Plain text | Framework-level rejections (malformed JSON, wrong content type) | `Failed to parse the request body as JSON` |

::: tip Empty error bodies are a known rough edge
The RBAC and ops modules return status codes with no body. They are usable —
403 means insufficient permission — but less informative than the rest of the
API. There are also no stable machine-readable error codes; error strings are
human-readable and may be reworded. Match on **status codes**, not message
text.
:::

## Status codes

| Code | Meaning |
| --- | --- |
| `200` | Success |
| `400` | Validation failure, malformed request |
| `401` | Missing, invalid or expired credentials |
| `403` | Authenticated but not permitted — also account suspended, inactive, deleted, or email unverified |
| `404` | Not found |
| `409` | Conflict — email or username taken, password already set |
| `429` | Rate limited |
| `500` | Internal error — details are logged, never returned |
| `501` | A feature that is not configured (e.g. a social provider with no credentials) |

`500` responses always read `{"error": "Internal server error"}`. Database
errors, connection strings and SQL never reach the client.

## Account status

An authenticated request from a non-`Active` account gets `403` with a specific
message: `Account suspended`, `Account inactive`, or `Account deleted`. This is
enforced on the OIDC path too, not only at login.

## Rate limiting

Per-route-template, per client IP. Exceeding it returns `429`.

Two notes:

- `/health` is exempt, so probes cannot be throttled into a false "dead
  process" signal.
- Credential endpoints (login, register, password reset, verify-email, MFA
  challenge) count against a shared backend and hold across replicas. Other
  endpoints use the per-process default rule.

## Permissions

Administrative endpoints require permissions from the `soulauth:` namespace:

```text
soulauth:users.read     soulauth:roles.read        soulauth:security.read
soulauth:users.write    soulauth:roles.write       soulauth:security.write
soulauth:audit.read     soulauth:roles.delete      soulauth:oidc_clients.read
                        soulauth:permissions.read  soulauth:oidc_clients.write
                        soulauth:permissions.write
```

The prefix is a boundary marker: these govern **SoulAuth's own administrative
surface**, not your application's authorization. See [Role in the Soulseed
Ecosystem](/guide/soulseed-ecosystem) and the [permissions
reference](./permissions).

## Pagination

List endpoints that paginate take `page` and `page_size` as query parameters.
Session listing is capped server-side at 200 entries and only returns
unexpired sessions.

## Time

Timestamps are RFC 3339 UTC. Reporting windows (`days`, `hours`) are clamped to
**366 days**; zero and negative values fall back to the endpoint default.

## Endpoints by module

| Module | Prefix | Count |
| --- | --- | --- |
| [Authentication](./auth) | `/api/auth` | 21 |
| [Users & Profiles](./users) | `/api/users` | 14 |
| [RBAC](./rbac) | `/api/rbac` | 17 |
| [OIDC](./oidc) | `/api/oidc`, `/.well-known` | 13 |
| [Security](./security) | `/api/security` | 2 |
| [Audit](./audit) | `/api/audit` | 5 |
| Ops | `/api/ops` | 1 |
| Health | `/health` | 1 |

::: tip These counts are generated
`scripts/extract-endpoints.mjs` in the docs repository parses the axum router
out of the SoulAuth source. During review this project's endpoint count was
quoted as 66, 68 and 70 at various times — none of which were right. Counting
by hand does not survive contact with a changing codebase.
:::
