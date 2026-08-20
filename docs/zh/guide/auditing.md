# 审计

SoulAuth 把每个安全相关动作记成结构化事件，并在这份历史之上提供五个读端点。
审计在这里是一等特性，不是一份指望你自己去扒的日志文件。

## 记了什么

每条事件带**动作**、**类别**、**状态**、操作用户、客户端 IP 与 User-Agent、
时间戳，以及一个随动作而异的 `details` 对象。

动作清单：

| 动作 | 含义 |
| --- | --- |
| `login_success` | 密码或 MFA 登录成功 |
| `login_failed` | 登录尝试被拒 |
| `oauth_login` | 经 Google 或 GitHub 登录 |
| `logout` | 会话结束 |
| `password_reset` | 通过重置流程改了密码 |
| `mfa_failed` | TOTP 校验被拒 |
| `permission_denied` | 某次鉴权检查拒绝了请求 |
| `rate_limit_violation` | 请求超出该路由的限流 |
| `account_locked` | 达到锁定阈值 |
| `lockout_cleared` | 管理员调用了解锁 |

类别有 `Authentication`、`Profile`、`Security`、`Permissions`、`Data`、
`System`。状态有 `Success`、`Failed`、`Warning`、`Info`。

## 空操作同样记录

即使没有东西可清，`lockout_cleared` 也会被写下：

```json
{
  "action": "lockout_cleared",
  "category": "Security",
  "status": "Success",
  "details": { "scope": "user", "identifier": "user@example.com", "was_locked": false }
}
```

值得留存的事实是*「有管理员试图解锁这个账号」*。
当时恰好有没有锁生效，是这次尝试的一个细节，不是记录它的条件。
一份只记录「有效动作」的审计轨迹，回答不了「谁一直在戳这个账号」。

`details` 里从不出现凭据。含控制字符的标识符在写入前就被拒 ——
审计输出会在终端里被读，那里的 ANSI 转义是一条日志注入通道。

## 端点

::: warning 它们要的权限并不相同
其中两个报告的是安全态势而非活动历史，因此改由 `soulauth:security.read` 把关。
:::

| 端点 | 权限 | 用途 |
| --- | --- | --- |
| `GET /api/audit/dashboard` | `soulauth:audit.read` | 头部计数，加上登录与安全趋势序列 |
| `GET /api/audit/security-metrics` | `soulauth:security.read` | 认证与锁定统计、按 IP 的失败登录、可疑活动 |
| `GET /api/audit/activity-summary` | `soulauth:audit.read` | 按类别、状态、活跃用户、小时分布拆解的量 |
| `GET /api/audit/security-report` | `soulauth:audit.read` | 叙述式报告：执行摘要、事件、行为分析、建议 |
| `GET /api/audit/system-health` | `soulauth:security.read` | 数据库状态、活跃会话、待处理锁定、运行时长 |

这个分割意味着只持有 `soulauth:audit.read` 的 `auditor` 角色
能读活动历史，但读不了安全指标和系统健康。
若不合你的预期，一并授予 `soulauth:security.read`。

完整结构见[审计 API 参考](/zh/reference/audit)。

## 时间窗

报告端点接受 `days` 或 `hours`，两者都会被夹住：

- 上限 **366 天**（等价 8,784 小时）。
- 零与负值回退到该端点的默认值。

无界的时间窗是针对你自己数据库的拒绝服务向量：
一个请求要一百万天就能把实例钉住。这个夹取是刻意静默的 ——
请求会以最大受支持窗口成功，而不是失败。

## 单用户活动

审计模块之外还有两个端点覆盖个人历史：

```
GET /api/users/activity-log                   # 调用者自己的活动
GET /api/users/users/:user_id/activity-log    # 别人的 —— 需要 soulauth:audit.read
```

注意第二个的权限：读别人的活动是**审计**能力，不是用户管理能力，
尽管这条路由挂在 `/api/users` 下面。

## 保留期

SoulAuth 不会让审计事件过期。过期的授权码、令牌与会话会被周期清理，
审计历史不会。如果你有保留策略，请针对 `user_activity` 表实施。

## 接入 SIEM

没有推送集成。两条可行路径：

1. **轮询** `/api/audit/security-metrics` 或 `/api/audit/activity-summary`
   并转发结果。
2. **用只读数据库账号直接读 `user_activity`**，做全保真导出。

应用日志以 `tracing` 格式输出到 stdout，由 `RUST_LOG` 控制 ——
它适合运维监控，但审计表才是权威的安全记录。

## 下一步

- [**审计 API 参考**](/zh/reference/audit) —— 响应结构。
- [**安全模型**](./security-model) —— 是什么产生了这些事件。
- [**权限**](/zh/reference/permissions) —— 谁能读它们。
