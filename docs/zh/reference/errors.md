# 错误

## 响应形状

一共四种。知道哪个模块产生哪种，能省排查时间。

### 标准

API 的大部分：

```json
{ "error": "Insufficient permissions" }
```

### OIDC

规范要求，出现在 `/api/oidc/*` 协议端点上：

```json
{ "error": "invalid_grant", "error_description": "Client not found" }
```

### 空

`/api/rbac/*` 与 `/api/ops/*` 只返回状态码，**没有响应体**。
这里的 `403` 不会告诉你缺的是哪条权限，请查 [RBAC 参考](./rbac)。

### 纯文本

处理器执行之前的框架层拒绝 —— JSON 格式错、内容类型不对：

```
Failed to parse the request body as JSON
```

::: warning 没有稳定的机器可读错误码
错误串是给人看的，版本之间措辞可能变。**请按状态码匹配**，
不要按消息文本匹配。OIDC 的 `error` 字段是例外 —— 那些值由规范固定。
:::

## 状态码

| 码 | 含义 | 常见原因 |
| --- | --- | --- |
| `400` | 请求错误 | 校验失败、请求体格式错、标识为空、含控制字符 |
| `401` | 未认证 | 令牌缺失 / 无效 / 过期，密码错误 |
| `403` | 禁止 | 权限不足；账号停用 / 未激活 / 已删除；邮箱未验证 |
| `404` | 未找到 | 未知的用户、角色、权限或客户端 |
| `409` | 冲突 | 邮箱或用户名已存在；密码已设置 |
| `429` | 被限流 | 该客户端 IP 超出该路由限额 |
| `500` | 内部错误 | 一律 `{"error":"Internal server error"}` —— 细节只进日志 |
| `501` | 未配置 | 没配凭据的第三方登录 |

## 常见消息

| 消息 | 码 | 含义 |
| --- | --- | --- |
| `Invalid credentials` | 401 | 邮箱或密码错误 |
| `Invalid token` | 401 | 格式错、过期或已吊销 |
| `Email not verified` | 403 | 要求验证但未完成 |
| `Permission denied` / `Insufficient permissions` | 403 | 缺 `soulauth:` 权限 |
| `Account suspended` / `Account inactive` / `Account deleted` | 403 | 账号状态非 `Active` |
| `User not found` | 404 | |
| `Email already exists` / `Username already exists` | 409 | |
| `Password already set` | 409 | 对已有密码的账号调 `initialize-password` |
| `Invalid user ID` | 400 | record id 格式错 |
| `Internal server error` | 500 | 刻意不透明 |

## OIDC 错误码

依规范：

| 码 | 含义 |
| --- | --- |
| `invalid_request` | 格式错 —— 包括在**头部与请求体两处**同时带凭证 |
| `invalid_client` | 客户端认证失败 |
| `invalid_grant` | 授权码或 refresh token 无效、过期或已被用过 |
| `unauthorized_client` | 该客户端不允许这个 grant 类型 |
| `unsupported_grant_type` | |
| `invalid_scope` | |

::: danger 刷新时的 `invalid_grant` 可能意味着会话已被吊销
重放一个已轮换的 refresh token 会被当作被盗，
SoulAuth 会吊销该用户在该客户端上的全部令牌。
让用户重新登录 —— 同时去修那个导致重放的重试逻辑。
见[授权码流程](/zh/integrate/auth-code-flow#_6-刷新)。
:::

## 内部错误什么都不透露

`500` 响应永远是同一个字符串。数据库错误、SQL 与连接细节
只记在服务端，绝不返回。

如果你从令牌端点看到 `500`，那说明是真的数据库故障 ——
错误的输入得到的是干净的 `invalid_grant`。

## 下一步

- [**通用约定**](./api)
- [**权限**](./permissions)
