# 用户与档案 API

`/api/users` —— 14 个端点。分两组：自助（调用者自己的数据）
与管理（任意用户，需权限）。

## 自助

不需要特殊权限 —— 这些端点总是作用在已认证的调用者身上。

| 端点 | 用途 |
| --- | --- |
| `POST /api/users/profile` | 创建调用者的档案 |
| `GET /api/users/profile` | 读取 |
| `PUT /api/users/profile` | 更新 |
| `POST /api/users/preferences` | 创建偏好 |
| `GET /api/users/preferences` | 读取 |
| `PUT /api/users/preferences` | 更新 |
| `GET /api/users/activity-log` | 调用者自己的活动历史 |

## 管理

::: tip 重复的路径段不是笔误
这个模块挂在 `/api/users`，而它的管理路由在 `/users` 下，
于是得到 `/api/users/users/:user_id`。它是别扭的，也是真实路径。
:::

| 端点 | 权限 | 用途 |
| --- | --- | --- |
| `GET /api/users/users` | `soulauth:users.read` | 列出用户 |
| `GET /api/users/users/:user_id` | `soulauth:users.read` | 读取单个用户 |
| `PUT /api/users/users/:user_id/status` | `soulauth:users.write` | 修改账号状态 |
| `PUT /api/users/users/:user_id/membership` | `soulauth:users.write` | 修改会员等级 |
| `GET /api/users/users/:user_id/profile` | `soulauth:users.read` | 读取某用户档案 |
| `GET /api/users/users/:user_id/preferences` | `soulauth:users.read` | 读取某用户偏好 |
| `GET /api/users/users/:user_id/activity-log` | `soulauth:audit.read` | 读取某用户活动 |

注意最后一行：读别人的活动是**审计**能力，不是用户管理能力，
尽管路由挂在这里。

## 修改账号状态

```bash
curl -X PUT https://auth.example.com/api/users/users/user:abc/status \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"status": "Suspended"}'
```

状态取值：`Active`、`Suspended`、`Inactive`、`Deleted`。

设成 `Active` 以外的任何值都会立即做三件事：

1. 让该用户的鉴权缓存失效，
2. 删除其会话行，
3. 吊销其持有的每一个 OIDC access token 与 refresh token。

::: warning 为什么三件都要做
只改状态字段的话，它只在「下次有人来问」时才起作用。
一个已经握着 refresh token 的 OIDC 接入方会无限地轮换出新的
access token 和 ID Token —— 停用只在登录页生效，别处都不生效。
在补上令牌吊销之前，这是一个真实的认证绕过。
:::

在变更之前就已签发的 ID Token，消费方仍能验证成功直到它过期 ——
最多 300 秒。见
[吊销](/zh/integrate/soulseedos#吊销-以及你正在接受的那点陈旧)。

## 会员等级

```bash
curl -X PUT https://auth.example.com/api/users/users/user:abc/membership \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"membership_level": "pro", "membership_expiry": "2027-01-01T00:00:00Z"}'
```

::: danger `membership_level` 不是权限
它描述用户**付了什么钱**，不是用户**被允许做什么**。
在 SoulSeedOS 的语言里它属于 Product Entitlement / Billing / Marketplace
（`P0-DECISION-09 §4.7`），绝不能被当作授权判断。
把它当授权用，等于把你的计费档位放到安全路径上。
:::

## 活动日志

```
GET /api/users/activity-log?page=1&page_size=50
```

返回调用者自己的历史。动作词表见[审计](/zh/guide/auditing)。

## 已知限制

`GET /api/users/users` 会为每个用户各发一次查询来附加角色 —— 一个 N+1。
在几百个用户时没问题，在几十万时就有问题了。
写在这里，而不是留给你在压力下发现。

## 下一步

- [**RBAC**](./rbac)
- [**审计**](./audit)
- [**权限**](./permissions)
