# 通用约定

适用于 SoulAuth 全部 **74 个端点**的规则。读一遍，后面各模块页就很短了。

## 基址与内容类型

所有路径相对于 `APP_URL`。请求与响应都是 JSON，
除了 OIDC 规范要求表单编码的地方（令牌端点）。

```
Content-Type: application/json
```

## 认证

多数端点接受 `POST /api/auth/login` 返回的 bearer 令牌：

```
Authorization: Bearer <token>
```

例外：

- **`/api/oidc/authorize`** 认的是*用户浏览器会话* cookie，不是 bearer 令牌。
- **`/api/oidc/token`** 认的是*客户端*，走 `client_secret_post`
  或 `client_secret_basic`。
- **`/health`**、发现文档与 JWKS 无需认证。

## 响应形状

成功响应是**裸对象**，没有信封：

```json
{ "id": "user:abc", "email": "user@example.com", "is_admin": false }
```

::: warning 这一点改过
部分端点此前把结果包在 `{"success": true, "data": {...}}` 里，
现已统一去掉。升级时请把剥壳那步删掉。
:::

OIDC 端点是刻意的例外 —— 它们返回规范要求的形状：

```json
{ "access_token": "...", "token_type": "Bearer", "expires_in": 300 }
```

## 错误形状

多数错误：

```json
{ "error": "Insufficient permissions" }
```

一共存在四种形状，分清它们能省下排查时间：

| 形状 | 出现位置 | 示例 |
| --- | --- | --- |
| `{"error": "..."}` | 多数模块 | `{"error": "User not found"}` |
| `{"error": "...", "error_description": "..."}` | OIDC 端点（规范要求） | `{"error":"invalid_grant","error_description":"Client not found"}` |
| **空响应体** | `/api/rbac/*`、`/api/ops/*` | 只有状态码 |
| 纯文本 | 框架层拒绝（JSON 格式错、内容类型不对） | `Failed to parse the request body as JSON` |

::: tip 空错误体是已知的粗糙处
RBAC 与 ops 模块只返回状态码、不带响应体。它们能用 —— 403 就是权限不足 ——
但信息量不如 API 其余部分。此外也**没有稳定的机器可读错误码**：
错误串是给人看的，措辞可能变。请按**状态码**匹配，不要按消息文本匹配。
:::

## 状态码

| 码 | 含义 |
| --- | --- |
| `200` | 成功 |
| `400` | 校验失败、请求格式错 |
| `401` | 凭据缺失、无效或过期 |
| `403` | 已认证但无权 —— 也包括账号被停用 / 未激活 / 已删除、邮箱未验证 |
| `404` | 未找到 |
| `409` | 冲突 —— 邮箱或用户名已存在、密码已设置 |
| `429` | 被限流 |
| `500` | 内部错误 —— 细节只进日志，绝不返回 |
| `501` | 某项功能未配置（例如没配凭据的第三方登录） |

`500` 响应一律是 `{"error": "Internal server error"}`。
数据库错误、连接串与 SQL 永远不会到达客户端。

## 账号状态

非 `Active` 账号发出的已认证请求会得到 `403` 与一条具体消息：
`Account suspended`、`Account inactive` 或 `Account deleted`。
这一校验在 OIDC 通路上同样生效，不只在登录时。

## 限流

按路由模板、按客户端 IP。超出返回 `429`。

两点说明：

- `/health` 被豁免，所以探针不会被限流成一个假的「进程已死」信号。
- 计数器按进程走。N 个副本且没有共享后端时，实际限额是你配置值的 N 倍。

## 权限

管理类端点需要 `soulauth:` 命名空间下的权限：

```text
soulauth:users.read     soulauth:roles.read        soulauth:security.read
soulauth:users.write    soulauth:roles.write       soulauth:security.write
soulauth:audit.read     soulauth:roles.delete      soulauth:oidc_clients.read
                        soulauth:permissions.read  soulauth:oidc_clients.write
                        soulauth:permissions.write
```

这个前缀是边界标记：它们管的是 **SoulAuth 自己的管理面**，
不是你应用的授权。见[在 Soulseed 生态里的位置](/zh/guide/soulseed-ecosystem)
与[权限参考](./permissions)。

## 分页

支持分页的列表端点接受 `page` 与 `page_size` 查询参数。
会话列表在服务端被截到 200 条，且只返回未过期的会话。

## 时间

时间戳是 RFC 3339 UTC。报告时间窗（`days`、`hours`）被夹在
**366 天**以内；零与负值回退到端点默认值。

## 按模块划分的端点

| 模块 | 前缀 | 数量 |
| --- | --- | --- |
| [认证](./auth) | `/api/auth` | 21 |
| [用户与档案](./users) | `/api/users` | 14 |
| [RBAC](./rbac) | `/api/rbac` | 17 |
| [OIDC](./oidc) | `/api/oidc`、`/.well-known` | 13 |
| [安全](./security) | `/api/security` | 2 |
| [审计](./audit) | `/api/audit` | 5 |
| Ops | `/api/ops` | 1 |
| 健康检查 | `/health` | 1 |

::: tip 这些数字是生成的
文档仓库里的 `scripts/extract-endpoints.mjs` 会从 SoulAuth 源码里解析
axum 路由表。审查期间这个项目的端点总数先后被说成 66、68、70 ——
没有一个是对的。手数的清单挺不过一个会变的代码库。
:::
