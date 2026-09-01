# Audit

## What gets recorded

Authentication events — successful and failed logins, OAuth logins, logout, password
reset, MFA failure, permission denial, rate-limit violation, account lock and unlock.

Two rules the writer holds to:

- **It never blocks the request.** Writes are fire-and-forget; a failure is logged and
  the user's operation still completes. The flip side is that an event can be lost
  outright — the write runs in a spawned task, so a process that exits before it
  finishes drops the event without even a log line. Together with the table not being
  tamper-evident, treat this as an operations record, not as evidence.
- **It never records credentials.** Only the action, category, status, IP, user agent
  and a small set of non-sensitive context fields.

## Endpoints

<!-- table-only: /api/audit/** — read-only reports over a time window. They take the same shape of query parameter and are independent of one another. -->
<ApiTable tag="Audit" />

Dashboard and reporting queries accept a time window. Requests are clamped server-side,
so an absurd `days` value returns a bounded window instead of attempting to scan
everything.

## Next

| | |
|---|---|
| Who can read audit data | [Administration](/reference/administration) |
| What the security model does and does not cover | [Threat model](/security/threat-model) |
