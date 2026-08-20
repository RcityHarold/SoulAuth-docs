# Errors

## Response shapes

Four exist. Knowing which module produces which saves debugging time.

### Standard

Most of the API:

```json
{ "error": "Insufficient permissions" }
```

### OIDC

Spec-mandated, on `/api/oidc/*` protocol endpoints:

```json
{ "error": "invalid_grant", "error_description": "Client not found" }
```

### Empty

`/api/rbac/*` and `/api/ops/*` return a status code with **no body**. A `403`
here does not say which permission was missing; consult the [RBAC
reference](./rbac).

### Plain text

Framework-level rejections before the handler runs — malformed JSON, wrong
content type:

```
Failed to parse the request body as JSON
```

::: warning There are no stable machine-readable error codes
Error strings are human-readable and may be reworded between versions. **Match
on status codes**, not on message text. The OIDC `error` field is the exception
— those values are fixed by the specification.
:::

## Status codes

| Code | Meaning | Common causes |
| --- | --- | --- |
| `400` | Bad request | Validation failure, malformed body, empty identifier, control characters |
| `401` | Unauthenticated | Missing/invalid/expired token, wrong password |
| `403` | Forbidden | Insufficient permission; account suspended/inactive/deleted; email unverified |
| `404` | Not found | Unknown user, role, permission or client |
| `409` | Conflict | Email or username taken; password already set |
| `429` | Rate limited | Route limit exceeded for the client IP |
| `500` | Internal error | Always `{"error":"Internal server error"}` — details are logged only |
| `501` | Not configured | A social provider with no credentials |

## Common messages

| Message | Code | Meaning |
| --- | --- | --- |
| `Invalid credentials` | 401 | Wrong email or password |
| `Invalid token` | 401 | Malformed, expired or revoked |
| `Email not verified` | 403 | Verification required and not completed |
| `Permission denied` / `Insufficient permissions` | 403 | Missing `soulauth:` permission |
| `Account suspended` / `Account inactive` / `Account deleted` | 403 | Non-`Active` account status |
| `User not found` | 404 | |
| `Email already exists` / `Username already exists` | 409 | |
| `Password already set` | 409 | `initialize-password` on an account that has one |
| `Invalid user ID` | 400 | Malformed record id |
| `Internal server error` | 500 | Deliberately opaque |

## OIDC error codes

Per the specification:

| Code | Meaning |
| --- | --- |
| `invalid_request` | Malformed — including credentials sent in **both** the header and the body |
| `invalid_client` | Client authentication failed |
| `invalid_grant` | Code or refresh token invalid, expired or already used |
| `unauthorized_client` | Grant type not allowed for this client |
| `unsupported_grant_type` | |
| `invalid_scope` | |

::: danger `invalid_grant` on refresh may mean the session was revoked
Replaying a rotated refresh token is treated as theft, and SoulAuth revokes
every token that user holds for that client. Send the user through login again
— and fix the retry logic that caused the replay. See [the authorization code
flow](/integrate/auth-code-flow#_6-refresh).
:::

## Internal errors reveal nothing

`500` responses are always the same string. Database errors, SQL and
connection details are logged server-side and never returned.

If you see a `500` from the token endpoint, it indicates a genuine database
fault — bad input produces a clean `invalid_grant` instead.

## Next steps

- [**API Conventions**](./api)
- [**Permissions**](./permissions)
