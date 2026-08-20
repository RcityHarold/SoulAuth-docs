# 审计 API

`/api/audit` —— 5 个报告端点。
概念与动作词表见[审计](/zh/guide/auditing)。

## 这些端点要的权限并不相同

| 端点 | 权限 |
| --- | --- |
| `GET /api/audit/dashboard` | `soulauth:audit.read` |
| `GET /api/audit/security-metrics` | `soulauth:security.read` |
| `GET /api/audit/activity-summary` | `soulauth:audit.read` |
| `GET /api/audit/security-report` | `soulauth:audit.read` |
| `GET /api/audit/system-health` | `soulauth:security.read` |

内置的 `auditor` 角色只持有 `soulauth:audit.read`，
因此读不了 security-metrics 与 system-health。
要完整覆盖，请一并授予 `soulauth:security.read`。

## 时间窗

端点接受 `days` 或 `hours`，两者都会被夹住：

- 上限 **366 天**（8,784 小时）。
- 零与负值回退到端点默认值。

夹取是静默的 —— 超额请求会以最大受支持窗口成功。
无界时间窗是针对你自己数据库的拒绝服务向量。

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
  "login_trends": [ /* 时间序列 */ ],
  "security_trends": [ /* 时间序列 */ ]
}
```

## `GET /api/audit/security-metrics`

```json
{
  "period": "7d",
  "authentication_stats": { /* 成功 / 失败计数 */ },
  "lockout_stats": { /* 触发与解除的锁定 */ },
  "rate_limit_violations": 12,
  "permission_denials": 5,
  "failed_login_by_ip": [ { "ip_address": "203.0.113.7", "count": 31 } ],
  "suspicious_activities": [ /* 被标记的模式 */ ]
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
  "hourly_distribution": [ /* 24 个桶 */ ]
}
```

## `GET /api/audit/security-report`

一份叙述式报告，而非原始计数器。

```json
{
  "generated_at": "2026-08-20T10:00:00Z",
  "period": "30d",
  "executive_summary": { /* 主要发现 */ },
  "authentication_analysis": { /* 模式与异常 */ },
  "security_incidents": [ /* 值得注意的事件 */ ],
  "user_behavior_analysis": { /* 按用户的模式 */ },
  "recommendations": [ /* 建议动作 */ ]
}
```

## `GET /api/audit/system-health`

```json
{
  "timestamp": "2026-08-20T10:00:00Z",
  "database_status": { /* 连通性与延迟 */ },
  "active_sessions_count": 97,
  "pending_lockouts": 2,
  "memory_usage": { /* 进程内存 */ },
  "uptime_seconds": 864000
}
```

::: tip 这不是存活探针
编排器探针请用 `/health` —— 它无需认证且豁免限流。
这个端点需要权限，而且会做真正的计算。
:::

## 已知限制

报告输出里的 `active_user_rate` 在某些时间窗与数据组合下可能超过 100%。
把它当指示性数字，不要当精确值。

## 保留期

审计事件不会被自动过期。任何保留策略请直接针对 `user_activity` 表实施。

## 下一步

- [**审计**](/zh/guide/auditing) —— 动作词表与 SIEM 方案。
- [**权限**](./permissions)
