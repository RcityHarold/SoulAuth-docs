# 安全 API

`/api/security` —— 2 个端点，用于查询与解除账号 / IP 锁定。
概念背景见[暴力破解防护](/zh/guide/lockout)。

## `GET /api/security/lockout`

需要 `soulauth:security.read`。

```bash
curl -G https://auth.example.com/api/security/lockout \
  -H "Authorization: Bearer $TOKEN" \
  --data-urlencode "scope=user" \
  --data-urlencode "identifier=user@example.com"
```

**查询参数**

| 名称 | 取值 | 说明 |
| --- | --- | --- |
| `scope` | `user` \| `ip` | 只接受小写 |
| `identifier` | `user` 传邮箱，`ip` 传 IP | 会去空白；不能为空，不能含控制字符 |

**响应**

```json
{
  "is_locked": true,
  "remaining_lockout_seconds": 812,
  "failed_attempts": 5
}
```

这个查询走的是与登录同一条代码路径，因此也会顺带把已过期的锁定归位。
你看到的就是用户正在经历的。

## `POST /api/security/unlock`

需要 `soulauth:security.write`。

```bash
curl -X POST https://auth.example.com/api/security/unlock \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"scope":"user","identifier":"user@example.com"}'
```

**响应**

```json
{ "unlocked": true }
```

`unlocked` 表示这次调用是否真的解除了一个**处于锁定中**的记录。
`false` 表示该标识本来就没被锁 —— 从未失败过，或者锁已到期。
那是一次成功的、幂等的调用，不是错误。

## 标识符规则

两个端点都适用：

- 去掉首尾空白。
- 不能为空 → `400`。
- 不能含控制字符 → `400`。

控制字符这一条的存在，是因为标识符会进审计详情与日志，
而它们会在终端里被读。在那里放行 ANSI 转义就是一条日志注入通道。

## scope 取小写

`"user"` 和 `"ip"`。`"User"` 会被拒。
这一点被一条测试钉死，不能随手改动 —— 它是对外契约。

## user 维度指的是邮箱

锁定计在**登录时提交的邮箱**上，包括背后没有账号的地址。
未知地址和真实地址一样累积锁定状态 —— 否则
「这次有没有产生锁定记录」就成了一个账号枚举信道。

## 审计

每次解锁都会写一条 `lockout_cleared`，包括空操作：

```json
{
  "action": "lockout_cleared",
  "category": "Security",
  "status": "Success",
  "details": { "scope": "user", "identifier": "user@example.com", "was_locked": false }
}
```

操作者与目标都会被记录，凭据从不。

## 下一步

- [**暴力破解防护**](/zh/guide/lockout) —— 调参。
- [**审计**](./audit) —— 事后怎么找到这些事件。
