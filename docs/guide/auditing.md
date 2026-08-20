# Auditing

SoulAuth records every security-relevant action as a structured event and
exposes five read endpoints over that history. Audit is a first-class feature
here, not a log file you are expected to scrape.

## What gets recorded

Each event carries an **action**, a **category**, a **status**, the acting
user, the client IP and user agent, a timestamp, and an action-specific
`details` object.

The actions:

| Action | Meaning |
| --- | --- |
| `login_success` | Password or MFA login succeeded |
| `login_failed` | Login attempt rejected |
| `oauth_login` | Sign-in via Google or GitHub |
| `logout` | Session ended |
| `password_reset` | Password changed through the reset flow |
| `mfa_failed` | TOTP verification rejected |
| `permission_denied` | An authorization check refused a request |
| `rate_limit_violation` | A request exceeded its route's rate limit |
| `account_locked` | Lockout threshold reached |
| `lockout_cleared` | An administrator invoked unlock |

Categories are `Authentication`, `Profile`, `Security`, `Permissions`, `Data`
and `System`. Statuses are `Success`, `Failed`, `Warning` and `Info`.

## No-ops are recorded too

`lockout_cleared` is written even when there was nothing to clear:

```json
{
  "action": "lockout_cleared",
  "category": "Security",
  "status": "Success",
  "details": { "scope": "user", "identifier": "user@example.com", "was_locked": false }
}
```

The fact worth keeping is *"an administrator attempted to unlock this
account"*. Whether a lock happened to be active at that moment is a detail of
the attempt, not a condition for recording it. An audit trail that only logs
effective actions cannot answer "who has been poking at this account".

Credentials never appear in `details`. Identifiers containing control
characters are rejected before they are written — audit output is read in
terminals, and ANSI escape sequences there are a log-injection channel.

## The endpoints

Note that they do **not** all require the same permission — the two that report
on security posture rather than activity history are gated on
`soulauth:security.read` instead.

| Endpoint | Permission | Purpose |
| --- | --- | --- |
| `GET /api/audit/dashboard` | `soulauth:audit.read` | Headline counts plus login and security trend series |
| `GET /api/audit/security-metrics` | `soulauth:security.read` | Authentication and lockout statistics, failed logins by IP, suspicious activity |
| `GET /api/audit/activity-summary` | `soulauth:audit.read` | Volume broken down by category, status, top users, hour of day |
| `GET /api/audit/security-report` | `soulauth:audit.read` | A narrative report: executive summary, incidents, behaviour analysis, recommendations |
| `GET /api/audit/system-health` | `soulauth:security.read` | Database status, active sessions, pending lockouts, uptime |

This split means the `auditor` role — which holds only `soulauth:audit.read` —
can read activity history but not security metrics or system health. If that is
not what you want, grant `soulauth:security.read` as well.

Full schemas are in the [audit API reference](/reference/audit).

## Time windows

The reporting endpoints take a window parameter — `days` or `hours` depending
on the endpoint. Both are clamped:

- Values are capped at **366 days** (or the equivalent 8,784 hours).
- Zero and negative values fall back to the endpoint's default.

Unbounded windows are a denial-of-service vector against your own database:
one request asking for a million days can pin the instance. The clamp is silent
by design — the request succeeds with the largest supported window rather than
failing.

## Per-user activity

Two endpoints outside the audit module cover individual history:

```
GET /api/users/activity-log             # the caller's own activity
GET /api/users/users/:user_id/activity-log   # another user's — needs soulauth:audit.read
```

Note the permission on the second: reading someone else's activity is an audit
capability, not a user-management one, even though the route lives under
`/api/users`.

## Retention

SoulAuth does not expire audit events. Expired authorization codes, tokens and
sessions are cleaned up periodically; audit history is not. If you have a
retention policy, implement it against the `user_activity` table.

## Feeding a SIEM

There is no push integration. Two workable approaches:

1. **Poll** `/api/audit/security-metrics` or `/api/audit/activity-summary` on a
   schedule and forward the result.
2. **Read `user_activity` directly** with a read-only database account for
   full-fidelity export.

Application logs go to stdout in `tracing` format, controlled by `RUST_LOG` —
useful for operational monitoring, but the audit table is the authoritative
security record.

## Next steps

- [**Audit API reference**](/reference/audit) — response schemas.
- [**Security Model**](./security-model) — what produces these events.
- [**Permissions**](/reference/permissions) — who can read them.
