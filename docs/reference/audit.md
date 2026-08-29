# Audit

<ContractNote file="openapi.yaml" />

## What gets recorded

Authentication events — successful and failed logins, OAuth logins, logout, password
reset, MFA failure, permission denial, rate-limit violation, account lock and unlock.

Two rules the writer holds to:

- **It never blocks the request.** Writes are fire-and-forget; a failure is logged and
  the user's operation still completes.
- **It never records credentials.** Only the action, category, status, IP, user agent
  and a small set of non-sensitive context fields.

## Endpoints

<!-- table-only: /api/audit/** — read-only reports over a time window. They take the same shape of query parameter and are independent of one another. -->
<ApiTable tag="Audit" />

Dashboard and reporting queries accept a time window. Requests are clamped server-side,
so an absurd `days` value returns a bounded window instead of attempting to scan
everything.

## Two limits to be clear about

::: warning The audit log is not tamper-evident
<Status kind="planned" /> It is an ordinary database table. There is no hash chain and no
checkpointing. Anyone with write access to the database can alter it without leaving a
trace.

**Do not present it as evidence** in any context that assumes integrity protection.
:::

::: warning Attribution is by user row, not identity root
<Status kind="planned" /> Human events are attributed to `user_id`. The architecture says
attribution should hold at the identity root so that it stays stable across everything
else about the account changing.

AI actor authentication already attributes to the identity root. The human paths have not
been migrated.
:::

Both are asserted-but-not-yet-true invariants in the
[conformance readout](/project/status) — `f4` and `f1`.

## Next

| | |
|---|---|
| Who can read audit data | [Administration](/reference/administration) |
| What the security model does and does not cover | [Threat model](/security/threat-model) |
