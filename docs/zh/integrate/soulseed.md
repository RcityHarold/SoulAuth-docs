# Soulseed 集成

可选。SoulAuth 默认独立运行，多数部署永远不需要这一页。

## 这个集成是什么

在 Soulseed 部署里，canonical actor 由 **SoulseedAGI** 定义，不在这里。
SoulAuth 认证那个主体，并持有一个指向它的引用——`actor_identity.canonical_actor_ref`。

```
SoulseedAGI        SoulAuth          SoulseedOS
定义主体            认证主体           运营与治理
```

方向是要紧的，而且不可逆转：持有一个引用不给 SoulAuth 任何定义、修改或推理
Mind、SubjectIntent、Memory 的能力。它认证主体，不决定谁是谁。

## 什么东西跨过边界

只有一个认证事实：*这个请求就是那个主体，在这个时刻、以这种方式被证明。*

不跨过去的：

- **权限。** 认证成功不授予任何 Soulseed 治理地位。
  [身份与权限的边界](/zh/spec/identity-vs-authority)
- **定义。** `canonical_actor_ref` 是个指针。SoulAuth 从不写另一端。
- **档案数据。** Soulseed 知道的关于某个主体的事，是 Soulseed 的。

## `canonical_actor_ref` 是受控声明

它**默认不暴露**给第三方 OIDC 客户端。一个指向另一套系统身份域的引用属于受控
Integration Claim，不是公开档案字段——默认发布它等于把部署拓扑泄露给每个依赖方。

## 独立运行不是降级

一个没有 Soulseed 绑定的主体，是完整、有效的 SoulAuth 主体。独立模式是默认，
不是回落：`identity_source` 为 `local`，`canonical_actor_ref` 为空。

本站没有任何内容假定 Soulseed 存在。你不跑它的话，读到这里可以停了。

## 接下来

| | |
|---|---|
| 完整的归属边界 | [Soulseed 与 Mind OS](/zh/spec/soulseed-and-mind-os) |
| 身份对象 | [Actor 身份模型](/zh/concepts/actor-identity-model) |
