# 暴力破解防护

SoulAuth 在两个彼此独立的轴上保护凭证端点：**按账号**与**按 IP** 的锁定，
叠加在按路由的限流之上。

## 怎么工作

每次登录失败让计数器加一。计数达到 `LOCKOUT_MAX_ATTEMPTS` 时，
该标识被锁 `LOCKOUT_DURATION_MINUTES` 分钟。
若 `LOCKOUT_RESET_WINDOW_MINUTES` 内没有新的失败，计数归零。

```bash
LOCKOUT_MAX_ATTEMPTS=5            # 锁定前的失败次数（必须 ≥1）
LOCKOUT_DURATION_MINUTES=15       # 锁多久（必须 ≥1）
LOCKOUT_RESET_WINDOW_MINUTES=60   # 多久没新失败就清零
LOCKOUT_USER_ENABLED=true
LOCKOUT_IP_ENABLED=true
```

三个数值项在启动时都拒绝 0 —— `LOCKOUT_MAX_ATTEMPTS=0`
会让每个账号第一次尝试就被锁，那更像手误而不是意图。

## 两个维度干的是不同的活

它们不冗余，关掉任一个都留下一个具体的洞：

| 关掉 | 你失去什么 |
| --- | --- |
| `LOCKOUT_USER_ENABLED=false` | 对单个账号的**分布式**攻击的防护 —— 多个源 IP 打一个目标，每个 IP 都待在自己的限额内。 |
| `LOCKOUT_IP_ENABLED=false` | 对**撞库**的防护 —— 一个源用一个密码去撞成千上万个账号，没有任何单个账号会积累到足以触发锁定的失败次数。 |

只有在你清楚自己正在接受哪种攻击时，才关掉其中一个。

## 账号维度按邮箱计，包括不存在的邮箱

锁定计在**提交的邮箱地址**上，而不是计在用户记录上 ——
而且未知地址和真实地址一样累积状态。

这是刻意的。如果锁定只对已存在的账号生效，
那么「这次尝试有没有产生锁定记录」就回答了「这个账号存不存在」——
API 里其它地方做的全部抗枚举工作，会被这个防护机制自己拆掉。

## 查状态

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

需要 `soulauth:security.read`。

这个查询走的是与登录同一条代码路径，因此它也会顺带把已过期的锁定归位。
管理员看到的状态与用户实际遇到的一致，而不是一个仅供观赏的快照。

## 解锁

```bash
curl -X POST https://auth.example.com/api/security/unlock \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"scope":"user","identifier":"user@example.com"}'
```

```json
{ "unlocked": true }
```

需要 `soulauth:security.write`。

`scope` 取 `user`（标识是邮箱）或 `ip`（标识是 IP）。
两者都必须小写 —— 这个对外契约被一条测试钉死。

**解锁是幂等的。** `"unlocked": false` 表示该标识本来就没被锁：
可能从未失败过，也可能锁已到期。这是成功调用，不是错误。
连调两次，第二次返回 `false`。

::: tip 这组端点为什么会存在
解锁能力在服务层早就实现了，`soulauth:security.write` 这条权限
也一直在种子数据里并已授予 —— 但从来没有任何路由把它们暴露出来。
后果是一个真实的运维缺口：管理员面对一个被锁住的用户，
除了等锁定自然过期或者直接改数据库，什么也做不了。
对一个把账号锁定当作卖点的认证服务，这一半是缺的。
:::

## 每次解锁都留审计

包括空操作：

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

无论结果如何都记下操作者与目标，正是要点所在：
即使当时没有锁可解，「有管理员试图解锁这个账号」依然值得留存。
审计详情里从不出现凭据。

含控制字符的标识符在进日志前就被拒 —— 这些值会在终端里被读，
那里的 ANSI 转义是一条注入通道。

## 限流在下面垫着

锁定挡的是针对一个标识的反复**失败**。
限流卡的是每个路由、每个 IP 的请求**量**，无论请求成功与否都算。

有一点两者不同：限流计数器在进程内存里，除非你配了共享后端，
否则 N 个副本就是 N 倍限额。锁定状态在数据库里，天然共享。

## 下一步

- [**安全模型**](./security-model) —— 其余的防护。
- [**安全 API 参考**](/zh/reference/security) —— 精确的结构。
- [**审计**](./auditing) —— 事后怎么找到这些事件。
