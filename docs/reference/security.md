# Security API

`/api/security` — 2 endpoints for inspecting and clearing account and IP
lockouts. Conceptual background in [Brute-force
protection](/guide/lockout).

## `GET /api/security/lockout`

Requires `soulauth:security.read`.

```bash
curl -G https://auth.example.com/api/security/lockout \
  -H "Authorization: Bearer $TOKEN" \
  --data-urlencode "scope=user" \
  --data-urlencode "identifier=user@example.com"
```

**Query parameters**

| Name | Values | Notes |
| --- | --- | --- |
| `scope` | `user` \| `ip` | Lowercase only |
| `identifier` | email (for `user`) or IP (for `ip`) | Trimmed; must be non-empty and free of control characters |

**Response**

```json
{
  "is_locked": true,
  "remaining_lockout_seconds": 812,
  "failed_attempts": 5
}
```

The check runs the same code path as login, so it also retires expired locks.
What you see is what the user is experiencing.

## `POST /api/security/unlock`

Requires `soulauth:security.write`.

```bash
curl -X POST https://auth.example.com/api/security/unlock \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"scope":"user","identifier":"user@example.com"}'
```

**Response**

```json
{ "unlocked": true }
```

`unlocked` reports whether an **active** lock was cleared. `false` means the
identifier was not locked — never failed, or the lock had already expired.
That is a successful, idempotent call, not an error.

## Identifier rules

Applied to both endpoints:

- Trimmed of surrounding whitespace.
- Must not be empty → `400`.
- Must not contain control characters → `400`.

The control-character rule exists because identifiers land in audit details and
logs, which are read in terminals. Permitting ANSI escapes there is a
log-injection channel.

## Scope values are lowercase

`"user"` and `"ip"`. `"User"` is rejected. This is pinned by a test so it
cannot be changed casually — it is a public contract.

## User scope means the email address

Lockout counts against the **email supplied at login**, including addresses
with no account behind them. Unknown addresses accumulate lockout state exactly
like real ones — otherwise "did this produce a lockout record?" would be an
account-enumeration oracle.

## Auditing

Every unlock writes `lockout_cleared`, including no-ops:

```json
{
  "action": "lockout_cleared",
  "category": "Security",
  "status": "Success",
  "details": { "scope": "user", "identifier": "user@example.com", "was_locked": false }
}
```

The operator and the target are recorded. Credentials never are.

## Next steps

- [**Brute-force protection**](/guide/lockout) — tuning.
- [**Audit**](./audit) — finding these events.
