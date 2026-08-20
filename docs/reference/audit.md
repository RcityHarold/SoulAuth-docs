# Audit API

`/api/audit` — 5 reporting endpoints. Concepts and the action vocabulary are in
[Auditing](/guide/auditing).

## Permissions differ across these endpoints

| Endpoint | Permission |
| --- | --- |
| `GET /api/audit/dashboard` | `soulauth:audit.read` |
| `GET /api/audit/security-metrics` | `soulauth:security.read` |
| `GET /api/audit/activity-summary` | `soulauth:audit.read` |
| `GET /api/audit/security-report` | `soulauth:audit.read` |
| `GET /api/audit/system-health` | `soulauth:security.read` |

The built-in `auditor` role holds only `soulauth:audit.read`, so it cannot read
security-metrics or system-health. Grant `soulauth:security.read` as well for
full coverage.

## Time windows

Endpoints take `days` or `hours`. Both are clamped:

- Maximum **366 days** (8,784 hours).
- Zero or negative falls back to the endpoint default.

The clamp is silent — an oversized request succeeds with the largest supported
window. Unbounded windows are a denial-of-service vector against your own
database.

## `GET /api/audit/dashboard`

```json
{
  "period": "7d",
  "total_users": 1284,
  "active_sessions": 97,
  "failed_logins": 43,
  "locked_accounts": 2,
  "security_events": 61,
  "top_activities": [ { "action": "login_success", "count": 812, "percentage": 63.4 } ],
  "login_trends": [ /* time series */ ],
  "security_trends": [ /* time series */ ]
}
```

## `GET /api/audit/security-metrics`

```json
{
  "period": "7d",
  "authentication_stats": { /* success/failure counts */ },
  "lockout_stats": { /* lockouts triggered and cleared */ },
  "rate_limit_violations": 12,
  "permission_denials": 5,
  "failed_login_by_ip": [ { "ip_address": "203.0.113.7", "count": 31 } ],
  "suspicious_activities": [ /* flagged patterns */ ]
}
```

## `GET /api/audit/activity-summary`

```json
{
  "period": "30d",
  "total_activities": 9421,
  "by_category": [ { "category": "Authentication", "count": 7210 } ],
  "by_status":   [ { "status": "Success", "count": 8933 } ],
  "top_users":   [ { "user_id": "user:abc", "count": 214 } ],
  "hourly_distribution": [ /* 24 buckets */ ]
}
```

## `GET /api/audit/security-report`

A narrative report rather than raw counters.

```json
{
  "generated_at": "2026-08-20T10:00:00Z",
  "period": "30d",
  "executive_summary": { /* headline findings */ },
  "authentication_analysis": { /* patterns and anomalies */ },
  "security_incidents": [ /* notable events */ ],
  "user_behavior_analysis": { /* per-user patterns */ },
  "recommendations": [ /* suggested actions */ ]
}
```

## `GET /api/audit/system-health`

```json
{
  "timestamp": "2026-08-20T10:00:00Z",
  "database_status": { /* connectivity and latency */ },
  "active_sessions_count": 97,
  "pending_lockouts": 2,
  "memory_usage": { /* process memory */ },
  "uptime_seconds": 864000
}
```

::: tip Not a liveness probe
Use `/health` for orchestrator probes — it is unauthenticated and exempt from
rate limiting. This endpoint requires a permission and does real work.
:::

## Known limitation

`active_user_rate` in the reporting output can exceed 100% under some window
and data combinations. Treat it as indicative, not exact.

## Retention

Audit events are never expired automatically. Implement any retention policy
against the `user_activity` table directly.

## Next steps

- [**Auditing**](/guide/auditing) — the action vocabulary and SIEM options.
- [**Permissions**](./permissions)
