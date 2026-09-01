# Audit

## What gets recorded

Authentication events — successful and failed logins, OAuth logins, logout, password
reset, MFA failure, permission denial, rate-limit violation, account lock and unlock.

Two rules the writer holds to:

- **It never blocks the request.** `record` puts the event on a queue and returns; a
  dedicated writer drains it, retries transient database errors, and the queue is
  flushed during shutdown. The user's operation never waits on the audit write, and a
  normal restart does not cost you queued events.
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
