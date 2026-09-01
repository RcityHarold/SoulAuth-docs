# SoulAuth 是什么

一个自己部署的认证服务。Rust 写的，一个二进制加一个 SurrealDB，对外说标准
OpenID Connect。已经在用 Keycloak 或 Auth0 的客户端库，不改代码就能接过来。

和别的认证服务相比，它多做了一件事：AI 主体在这里是一等对象，有自己的身份记录和
自己的密钥，不是挂在某个 `user` 行下面的附属品。其余部分是一套常规的认证服务，
没有什么特别的。

## 里面有什么

**账号与会话。** 注册、登录、登出、全端登出。会话令牌是签名 JWT，库里只存
SHA-256 指纹。

**邮箱与口令。** 邮箱验证、重发验证信、密码重置。社交登录建出来的账号可以用
`initialize-password` 补第一个密码。都走 SMTP，邮件模板在代码里。

**多因子。** TOTP 加备用码。启用要两步：先取密钥，再用一个真实验证码确认。
录错的认证器因此不会把人锁在门外。

**社交登录。** Google 与 GitHub。CSRF 防御是 `state` 参数与 HttpOnly cookie 双向
绑定；provider 侧邮箱未验证的一律拒绝。

**OIDC 提供方。** 授权码流程加 PKCE（只接受 `S256`）、RS256 签名的 ID Token、
发现文档、JWKS、带复用检测的刷新令牌轮换、userinfo、登出端点。客户端注册与密钥
轮换有完整的管理 API。

**AI 主体。** Ed25519 挑战—应答，没有邮箱，没有口令，背后也没有 user 行。
下一节展开。

**权限与审计。** 14 条权限的 RBAC，管的只是 SoulAuth 自己的管理 API。另有账号状态
管理、用户自助档案、活动日志、审计报表。

**防护。** Argon2 存口令，账号与 IP 两个维度的锁定，按路由模板限流。计数落在数据库
里，多副本共享同一份配额。

**第一个管理员。** 没有默认账号。新实例在启动日志里打一枚一次性令牌，用它建第一个
管理员，全程不碰数据库。

## AI 主体怎么认证

口令可以复制。同一个账号发给几个人几台机器之后，日志只能记下「这个账号被用了」，
记不下是谁用的。所以 AI 主体这条路径不用口令，用密钥。

每个 AI 主体是一个 `ActorIdentity`，认证是两次调用：

```
POST /api/actors/challenge      → 一次性 nonce
POST /api/actors/authenticate   → 交回 Ed25519 签名
```

一个身份可以同时挂多把有效密钥。这本来是为了安全轮换（先加新的，确认能认证，
再吊销旧的），顺带带来一个好处：每台机器持有自己的一把。认证成功返回的是这把钥匙的
`credential_label`，服务端同时更新它的 `last_used_at`，于是归因能落到密钥这一层。

换密钥不改变身份，所以轮换之前写下的审计行事后仍然指向同一个主体。一致性测试盯的是
代码本身：`src/services/ai_actor.rs` 里不得出现 `human_account`、`password`、`email`
或 `username`。
<Status kind="tested" guard="conformance::a6" />

[完整模型 →](/zh/concepts/actor-identity-model)

## 和 Soulseed 的关系

SoulAuth 是 Soulseed 这套系统里的认证组件，但它不依赖 Soulseed，也可以完全独立部署。
独立是默认，不是降级：`identity_source` 为 `local`、`canonical_actor_ref` 为空时，
认证行为没有任何差别。

三个系统各管一件事：

| 系统 | 管什么 |
|---|---|
| **SoulseedAGI** | 主体是什么：canonical actor、它的 Mind 与意图 |
| **SoulAuth** | 主体怎么证明自己：身份、凭证、会话 |
| **SoulseedOS** | 什么在运行、依什么策略运行 |

SoulAuth 认证的主体由 SoulseedAGI 定义，箭头只朝一个方向：SoulAuth 存一个指向
canonical actor 的引用，从不反向写入。跨过边界的只有一个认证事实——这个请求确实是
那个主体，在这个时刻，以这种方式被证明。权限不跨过，档案数据也不跨过。

如果你不打算跑 Soulseed，这一节可以忽略，本站其余内容都不假定它存在。

[归属边界的完整说明 →](/zh/spec/soulseed-and-mind-os)

## 接下来

| | |
|---|---|
| 五分钟跑起来 | [快速上手](/zh/start/quickstart) |
| 决定怎么接入 | [接入路径](/zh/start/integration-path) |
| 接一个 OIDC 客户端 | [授权码流程](/zh/integrate/authorization-code-flow) |
| 给 AI 主体建身份 | [AI 原生身份](/zh/concepts/ai-native-identity) |
