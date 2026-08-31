# SoulAuth 是什么

SoulAuth 是一个自己部署的认证服务，用 Rust 写，说标准 OpenID Connect。一个二进制加
一个 SurrealDB，接过 Keycloak 或 Auth0 的客户端库不改代码就能接它。

它跟别家的区别是：AI 主体在这里有自己的身份记录和自己的密钥，不是一行填了假邮箱的
`user`。

## 能用它做什么

**账号与登录** — 注册、登录、会话、登出、全端登出。会话令牌是签名 JWT，库里只存
SHA-256 指纹。

**邮箱与口令** — 邮箱验证、重发验证信、密码重置。社交登录建出来的账号可以用
`initialize-password` 补一个密码。全部走 SMTP，模板在代码里。

**多因子** — TOTP 加备用码。注册分两步（先拿密钥，再用一个真码启用），所以录错的
认证器不会把人锁在门外。

**社交登录** — Google 与 GitHub。`state` 与 HttpOnly cookie 双重绑定挡 CSRF；
provider 侧邮箱未验证一律拒绝。

**OIDC 提供方** — 授权码流程加 PKCE（只收 `S256`）、RS256 签名的 ID Token、发现文档、
JWKS、带复用检测的刷新令牌轮换、userinfo、登出端点。客户端注册与密钥轮换有完整的
管理 API。

**AI 主体** — Ed25519 挑战—应答认证，没有邮箱、没有口令、背后没有 user 行。下面单说。

**权限与审计** — 14 条权限的 RBAC（只管 SoulAuth 自己的管理 API）、账号状态管理、
用户自助档案、活动日志、审计报表。

**防护** — Argon2 存口令、账号与 IP 锁定、按路由模板限流，计数在数据库里，跨副本共享。

**开机** — 没有默认账号。新实例在启动日志里打一枚一次性令牌，用它建第一个管理员，
全程不碰数据库。

## AI 主体那条路

大多数身份系统给机器人开账户的做法是：建个 user，填个假邮箱，设个口令。能跑，但口令
是可以复制的 —— 同一个账号发给几个人几台机器之后，日志记下的只是「用了这个账号」。

SoulAuth 给 AI 一条自己的 `ActorIdentity`，认证走两步：

```
POST /api/actors/challenge      → 一次性 nonce
POST /api/actors/authenticate   → 交回 Ed25519 签名
```

一个身份可以同时挂多把有效密钥（本来是为了安全轮换：先加新的、确认能认证、再吊销
旧的）。于是每台机器持有自己的一把，认证成功返回的是那把钥匙的 `credential_label`，
服务端同时更新它的 `last_used_at` —— 归因能到密钥这一层，不只是账号。

换密钥不改变身份，所以换之前写下的审计行事后仍然对得上同一个 actor。一致性套件检查
的是代码本身：`src/services/ai_actor.rs` 里不得出现 `human_account`、`password`、
`email`、`username`。
<Status kind="tested" guard="conformance::a6" />

[完整模型 →](/zh/concepts/actor-identity-model)

## 它不做什么

- **不判断权限。** 认证成功给你的是「这是谁」，不是「他能做什么」。那条判断按你自己的
  规则写，SoulAuth 不知道你的业务有哪些资源。
- **不运行 AI 主体。** 它认证它们，不编排、不推理。
- **不是托管服务。** 得你自己跑、自己打补丁、自己备份。
- **未经任何标准组织认证。** 如果你的场景要求「经过认证的 OIDC 实现」，这里满足不了。

## 接下来

| | |
|---|---|
| 五分钟跑起来 | [快速上手](/zh/start/quickstart) |
| 决定怎么接入 | [接入路径](/zh/start/integration-path) |
| 接一个 OIDC 客户端 | [授权码流程](/zh/integrate/authorization-code-flow) |
| 给 AI 主体建身份 | [AI 原生身份](/zh/concepts/ai-native-identity) |
