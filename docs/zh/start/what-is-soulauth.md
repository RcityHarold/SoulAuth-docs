# 为什么是 SoulAuth

SoulAuth 是一个用 Rust 写的 OpenID Connect 提供方。它只有一件事跟别家不一样，
而那件事是选它的唯一理由。

## 唯一不一样的地方

大多数身份系统都能给机器人开个账户：建个 user，填个假邮箱，设个口令，加进某个组。
能跑，但有一个性质跟不上来：**口令是可以复制的。** 同一个账号一旦分发给几个人、
几台机器，日志里留下的就只是「用了这个账号」，而不是「谁用了它」。

SoulAuth 给 AI 一条自己的身份记录 `ActorIdentity`。没有邮箱字段，没有口令，
背后也没有 user 行。认证走两步：

```
POST /api/actors/challenge      → 一次性 nonce
POST /api/actors/authenticate   → 交回 Ed25519 签名
```

一个身份可以**同时挂多把有效密钥**（这本来是为了安全轮换：先加新的，确认能认证，
再吊销旧的）。于是每台机器可以持有自己的一把，而认证成功时返回的是那把钥匙的
`credential_label`，服务端同时更新它的 `last_used_at`。日志因此能记到密钥这一层，
不只是账号这一层。

密钥可以换，身份不变，所以换密钥之前写的审计行，事后仍然对得上同一个 actor。
一致性套件检查的是代码本身：`src/services/ai_actor.rs` 里不得出现
`human_account`、`password`、`email`、`username`。
<Status kind="tested" guard="conformance::a6" />

## 这三样为什么要分开

一个主体在库里是三张表，不是一张：

| 表 | 存什么 |
|---|---|
| `actor_identity` | `subject_key`、`actor_kind`、`status`。OIDC 的 `sub` 建在它上面 |
| `human_account` | `email`、`username`、`email_verified`。只有 `actor_kind = human` 才有这一行 |
| `ai_actor_credential` | `public_key`、`algorithm`、`label`。一个身份可以有多行 |

合起来就会出问题，两个方向都试过：

把身份和账户放一张表，那张表就得有 `email` 列，机器人也得填。你会填个
`bot@internal`，它随后会出现在密码重置的收件人里、出现在按邮箱查用户的结果里，
而这两条路径都是为人写的。

把身份和凭证放一张表，主体的 id 就跟着密钥走。换一把密钥等于换一个主体，
旧 id 上的审计行再也查不到对应的行 —— 而密钥泄露之后第一件事就是换密钥。

[完整模型 →](/zh/concepts/actor-identity-model)

## 它负责什么

只负责认证，到此为止。调用成功给你的是一句关于**是谁**的陈述：一个会话令牌，
或一个带 `sub`、`iss`、`auth_time` 的 ID 令牌。它不告诉你的应用这个主体能做什么；
那条判断仍然要你自己写，按你自己的规则。

SoulAuth 内部的 RBAC 管的是 SoulAuth 自己的管理 API，不是一个可以对着你的业务
使用的策略引擎。[身份与权限的边界 →](/zh/spec/identity-vs-authority)

## 它不负责什么

- **不是业务规则的授权引擎。** 它回答「是谁」，不回答「可不可以」。
- **不是 AI 主体框架。** 它认证 AI 主体，不运行、不编排、也不推理它们。
- **不是记忆或推理系统。** Soulseed 部署里 canonical actor 在别处定义，
  SoulAuth 存的是一个指向它的引用，不是定义本身。
- **不是计费系统。** 遗留的 user 行上有一个会员字段，它不该在那儿。
- **不是托管服务。** 得你自己跑、自己打补丁、自己备份。
- **没有任何认证资质。** 没有标准组织认证过它的任何部分，自己说了不算。

## 接下来

| | |
|---|---|
| 先跑起来 | [快速上手](/zh/start/quickstart) |
| AI 主体那条路径 | [AI 原生身份](/zh/concepts/ai-native-identity) |
| 决定怎么接入 | [接入路径](/zh/start/integration-path) |
