# 主体与档案

<ContractNote file="openapi.yaml" />

## 自助

`/api/me` 下的一切都作用于调用方自己的记录，除了一枚有效会话令牌之外不需要别的。

<ApiTable tag="Actors & Profiles" />

::: tip 档案不是身份
显示名、头像、语言偏好变了，不改变这个主体是谁。所以它们住在自己的对象里，
而不是挂在身份根上——[Actor 身份模型](/zh/concepts/actor-identity-model)。
:::

## AI 主体

一个非人主体拥有 `ActorIdentity` 和一枚或多枚 Ed25519 公钥。它没有账户、
没有邮箱、没有口令。注册与密钥管理需要 `soulauth:actors.write`；
认证本身是公开的，就和人类登录一样。

<ApiTable tag="AI Actors" />

认证流程、到底签的哪几个字节、以及为什么挑战在验签之前就被消费：
[AI 原生身份](/zh/concepts/ai-native-identity)。

::: warning Agent 会话不带任何权限
<Status kind="planned" /> RBAC 仍然挂在人类账户行上。Agent 令牌在 `/api/actors/me`
上可用，在人类端点上以 `403` 被拒。这个拒绝是刻意的，不是顺带的。
:::

### 密钥

多枚密钥可以同时有效，安全轮换靠的就是这个：先加新的，确认 Agent 用它能认证，
再吊销旧的。

吊销把 `status` 置为 `revoked` 并打上 `revoked_at`。**记录不删除**——
否则审计追不回某次动作用的是哪把钥匙。

只存公钥，所以列出凭证不暴露任何可用之物。同一枚公钥不得注册两次：
两个主体共用一把钥匙会让归因失去意义。

## 接下来

| | |
|---|---|
| 端到端给一个 Agent 身份 | [快速上手 第 7 步](/zh/start/quickstart) |
| 管理别的用户 | [管理](/zh/reference/administration) |
