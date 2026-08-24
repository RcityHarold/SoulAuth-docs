# Brute-force Protection

SoulAuth defends credential endpoints on two independent axes: **per-account**
and **per-IP** lockout, layered on top of per-route rate limiting.

## How it works

Every failed login increments a counter. When the counter reaches
`LOCKOUT_MAX_ATTEMPTS`, that identifier is locked for
`LOCKOUT_DURATION_MINUTES`. If no new failure arrives within
`LOCKOUT_RESET_WINDOW_MINUTES`, the counter returns to zero.

```bash
LOCKOUT_MAX_ATTEMPTS=5            # failures before locking (must be ≥1)
LOCKOUT_DURATION_MINUTES=15       # how long the lock lasts (must be ≥1)
LOCKOUT_RESET_WINDOW_MINUTES=60   # idle time that clears the counter
LOCKOUT_USER_ENABLED=true
LOCKOUT_IP_ENABLED=true
```

Zero is rejected for all three numeric values at startup —
`LOCKOUT_MAX_ATTEMPTS=0` would lock every account on its first attempt, and
that is more likely a typo than an intention.

## The two dimensions do different jobs

They are not redundant, and disabling either leaves a specific hole:

| Disabled | What you lose |
| --- | --- |
| `LOCKOUT_USER_ENABLED=false` | Protection against a **distributed** attack on one account — many source IPs, one target. Each IP stays under its own limit. |
| `LOCKOUT_IP_ENABLED=false` | Protection against **credential stuffing** — one source trying one password across thousands of accounts. No single account accumulates enough failures to lock. |

Turn one off only if you know which attack you are accepting.

## Accounts are keyed by email, including ones that do not exist

Lockout counts against the **email address supplied**, not against a user
record — and unknown addresses accumulate state exactly like real ones.

This is deliberate. If lockout only applied to existing accounts, then
"did this attempt create a lockout record?" would answer "does this account
exist?" — and the anti-enumeration work everywhere else in the API would be
undone by the defence mechanism.

## Checking status

```bash
curl -G https://auth.example.com/api/security/lockout \
  -H "Authorization: Bearer $TOKEN" \
  --data-urlencode "scope=user" \
  --data-urlencode "identifier=user@example.com"
```

```json
{
  "is_locked": true,
  "remaining_lockout_seconds": 812,
  "failed_attempts": 5
}
```

Requires `soulauth:security.read`.

The check goes through the same code path as login, which means it also retires
locks that have expired. What an administrator sees is what the user is
actually experiencing — not a stale snapshot that merely resembles it.

## Unlocking

```bash
curl -X POST https://auth.example.com/api/security/unlock \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"scope":"user","identifier":"user@example.com"}'
```

```json
{ "unlocked": true }
```

Requires `soulauth:security.write`.

`scope` is `user` (identifier is an email) or `ip` (identifier is an IP
address). Both must be lowercase — the API contract is pinned by a test.

**Unlocking is idempotent.** `"unlocked": false` means the identifier was not
locked to begin with: it never failed, or the lock had already expired. That is
a successful call, not an error. Call it twice and the second returns `false`.

::: tip Why this endpoint exists
The unlock capability was implemented in the service layer, and the
`soulauth:security.write` permission was seeded and granted, from early on —
but no route ever exposed any of it. The result was a real operational gap: an
administrator faced with a locked-out user could only wait for the timer or
edit the database by hand. For a service that advertises account lockout as a
feature, that is a missing half.
:::

## Every unlock is audited

Including the no-ops:

```json
{
  "action": "lockout_cleared",
  "category": "Security",
  "details": {
    "scope": "user",
    "identifier": "user@example.com",
    "was_locked": false
  }
}
```

Recording the operator and the target regardless of outcome is the point:
"an administrator tried to unlock this account" is worth keeping even when
there was nothing to unlock. Credentials never appear in audit details.

Identifiers containing control characters are rejected before they reach the
log — these values get read in terminals, and ANSI escapes there are an
injection channel.

## Rate limiting sits underneath

Lockout stops repeated *failures* against one identifier. Rate limiting caps
request *volume* per route, per IP, and applies whether or not requests fail.

Both are shared across replicas where it counts. Lockout state lives in the
database. Rate limiting runs two layers: an in-process check, then a
SurrealDB-backed shared count for the endpoints that carry an explicit rule —
login, registration, password reset, email verification, the MFA challenge.
Endpoints under the general default rule stay per-process, trading an N× ceiling
on ordinary traffic for not adding a database round trip to every request.

If the shared backend errors, the request is **allowed** and an error is logged.
The in-process layer still applies. Failing closed would turn a database hiccup
into a login outage — a deliberate trade, documented at the call site.

## Next steps

- [**Security Model**](./security-model) — the rest of the defences.
- [**Security API reference**](/reference/security) — exact schemas.
- [**Auditing**](./auditing) — finding these events later.
