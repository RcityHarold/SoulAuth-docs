# 架构

SoulAuth 是一个进程加一个数据库。这一页讲进程里有什么、数据库里放什么，
以及这个布局中哪些决定你在运维时会真的碰到。

## 大致形状

```
                    ┌──────────────────────────────────┐
   浏览器 / 应用 ──▶│  反向代理（TLS，你自己提供）     │
                    └────────────────┬─────────────────┘
                                     │ HTTP
                    ┌────────────────▼─────────────────┐
                    │            soulauth              │
                    │  ┌────────────────────────────┐  │
                    │  │ 限流（按路由）             │  │
                    │  ├────────────────────────────┤  │
                    │  │ 鉴权提取器 + 缓存          │  │
                    │  ├────────────────────────────┤  │
                    │  │ 路由    auth / users /     │  │
                    │  │         rbac / oidc /      │  │
                    │  │         security / audit   │  │
                    │  ├────────────────────────────┤  │
                    │  │ 服务    auth, oidc, mfa,   │  │
                    │  │         lockout, audit     │  │
                    │  └─────────────┬──────────────┘  │
                    └────────────────┼─────────────────┘
                                     │
                    ┌────────────────▼─────────────────┐
                    │           SurrealDB              │
                    │  用户、会话、令牌、角色、        │
                    │  权限、锁定、审计                │
                    └──────────────────────────────────┘
```

对外，SoulAuth 只和两类东西说话：发信的 SMTP 服务器，
以及做第三方登录的 Google / GitHub —— 而且两者都是可选的。

## 请求路径

这里的层序很重要，其中两处摆放是刻意的。

**限流跑在路由匹配之后。** 它用 axum 的 `route_layer` 而不是 `layer` 挂载，
这样中间件才能读到 `MatchedPath` —— 也就是路由**模板**
（`/api/auth/verify-email/:token`），而不是具体路径。
按原始路径分桶会让每个不同的 token 各占一个计数器，那等于没限流。
代价是打不中任何路由的请求（404）不再计数，而这类请求本来也碰不到业务逻辑。

**`/health` 注册在限流层之后**，因此不受限流约束。
存活探针在压力下被 429 打回，在编排器看来就是「进程死了」，于是重启副本。
限流本是为了扛住压力，那样反而成了压力下的自杀开关。

## API 调用的认证

请求带 bearer 令牌。`AuthedUser` 提取器校验令牌、查会话，并确认账号可用。

最后这项检查走的是唯一一个函数 `User::ensure_usable()`，
账号状态的解释只有这一处。停用、未激活、已删除的账号在这里被拒 ——
**包括 OIDC 令牌通路**，否则一个 refresh token 会替一个早已被关停的账号
持续换出新的 access token 和 ID Token。

会话校验有 `AUTH_SESSION_CACHE_TTL_SECONDS` 秒的缓存（默认 5）。
设成 `0` 则每个已认证请求都回库。账号状态变更或凭证被吊销时缓存会被显式失效，
所以这个 TTL 约束的是**不经过 SoulAuth 的**事件的陈旧窗口，
而不是经过它的那些。

## OIDC

SoulAuth 实现授权码流程：

1. `GET /api/oidc/authorize` —— 校验客户端、回调地址与 PKCE 挑战，
   然后签发一个短寿命授权码。
2. `POST /api/oidc/token` —— 一次性兑换成 access token、ID Token 与 refresh token。
3. `GET /api/oidc/userinfo` —— 用有效的 access token 换取 claims。

有三条性质值得知道：

- **公开客户端强制 PKCE**，且只接受 `S256`。
  公开客户端不带 `code_challenge` 会在 authorize 那步被拒，不会被静默降级。
- **Refresh token 会轮换，且检测重放。** 提交一个已经兑换过的 refresh token
  会作废整个令牌族 —— 这是被盗令牌被重放时的标准应对。
- **授权码在并发下也是一次性的。** 同一个码被同时兑换两次，恰好成功一次。

ID Token 用 RS256 签名，公钥通过 [`/api/oidc/jwks`](/zh/reference/oidc#get-api-oidc-jwks)
发布。消费方在本地验签，不需要为每个请求回调 SoulAuth。

::: warning 生产环境必须配签名密钥
不配 `OIDC_RSA_PRIVATE_KEY_PATH` 或 `OIDC_RSA_PRIVATE_KEY_PEM`，
SoulAuth 每次启动都会生成一把新密钥。此前签发的 ID Token 全部验不过，
不同副本之间也互不认账。这是[生产闸门](./deployment#生产闸门)
拒绝启动的条件之一。
:::

## 数据模型

全都在一个 SurrealDB 数据库里：

| 领域 | 表 |
| --- | --- |
| 身份 | `user`、`user_profile`、`user_preferences`、`identity`（按 provider 的第三方关联） |
| 会话 | `session` |
| OIDC | `oidc_client`、`auth_code`、`access_token`、`refresh_token` |
| 访问控制 | `role`、`permission`、`role_permission`、`user_role` |
| 防护 | `account_lockout` |
| 审计 | `user_activity` |

第三方身份按 **provider 与 subject 一起**做键。
只按 subject 查曾经是一个真实的跨 provider 账号接管漏洞：
数字 id 为 `4001` 的 GitHub 账号会匹配上 sub 为字符串 `"4001"` 的 Google 用户。

过期的授权码、令牌与会话由周期清理任务删除，不会一直堆积。

::: tip 一个值得知道的 SurrealDB 陷阱
SurrealDB 的比较是按类型排序的 —— `datetime` 和数字或字符串之间不会产生
有意义的比较结果。通过 JSON 绑定传入的 record ID 会退化成普通字符串，
于是 `role_id IN [...]` 会静默匹配不到任何东西。
这两个坑在源码的调用点都有注释。要扩展 SoulAuth 的查询，先读那些注释。
:::

## 并发

有三条路径在并发下是安全的，而且每一条都是验证过的，不是假设的：

- **授权码兑换** —— 恰好一个赢家。
- **Refresh token 轮换** —— 恰好一个新令牌族；重放旧的会触发重放检测。
- **失败登录计数** —— `failed_attempts += 1` 在单个事务里完成并带冲突重试，
  所以并发的失败登录不会靠竞态少算而绕过阈值。

## 跑多副本

除了两件事，SoulAuth 是无状态的：

1. **OIDC 签名密钥必须共享。** 每个副本配同一份 PEM，
   否则 A 签的令牌在 B 那里验不过。
2. **凭证端点的限流本来就是共享的。** 登录、注册、密码重置、邮箱验证与 MFA
   挑战都计在 SurrealDB 支撑的桶上，限额跨副本成立。一般 API 的默认规则
   刻意留在进程内 —— 给每个请求加一次数据库往返，比非凭证流量上的 N 倍上限
   更糟。

账号锁定不受影响 —— 它在数据库里，本来就是共享的。

## 下一步

- [**配置**](./configuration) —— 每个开关，以及哪些真的重要。
- [**安全模型**](./security-model) —— 这个形状在回应什么威胁。
- [**部署**](./deployment) —— TLS、代理与多副本的实际做法。
