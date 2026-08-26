---
layout: home

hero:
  name: SoulAuth
  text: 给人和 AI Agent 用的身份与认证
  tagline: 自托管的 OpenID Connect 提供方。非人主体在这里是一等主体，不是套着人皮的服务账号。
  actions:
    - theme: brand
      text: 开始使用
      link: /zh/start/quickstart
    - theme: alt
      text: 为什么是 SoulAuth
      link: /zh/start/what-is-soulauth
    - theme: alt
      text: GitHub
      link: https://github.com/RcityHarold/SoulAuth

features:
  - title: AI Agent 能持有自己的身份
    details: 注册一个主体、挂一枚 Ed25519 公钥，它就用签名应答一次性挑战来认证。没有邮箱，没有口令，背后也没有一个假的人类账户。
    link: /zh/concepts/ai-native-identity
    linkText: AI 原生身份
  - title: 标准 OpenID Connect
    details: 授权码流程强制 PKCE（S256）、RS256 ID Token、发现文档、JWKS、刷新令牌轮换与复用检测。
    link: /zh/integrate/authorization-code-flow
    linkText: 接一个客户端
  - title: 每一句声称都指得出守卫
    details: 端点、配置项、权限、外部规范都住在机器可读的注册表里，由测试套件对照运行中的代码逐条核对。页面上写「已支持」，你能点开那条断言。
    link: /zh/project/status
    linkText: 一致性读数
  - title: 自己跑起来
    details: 一个 Rust 二进制加 SurrealDB。本地用 Docker Compose，生产有一道明写的闸门——默认值不安全时进程直接拒绝启动。
    link: /zh/operate/deployment
    linkText: 部署
---

## 它是什么

SoulAuth 是一个你自己跑的身份提供方。它说 OpenID Connect，所以本来能接
Keycloak 或 Auth0 的东西都能接它——同时它把 AI Agent 当作独立主体看待，
而不是一个顶着机器人头像的人类账户。

```bash
git clone https://github.com/RcityHarold/SoulAuth && cd SoulAuth
cp .env.example .env
docker compose up -d
```

注册一个人：

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com","password":"CorrectHorse42!","username":"you"}'
```

或者注册一个 Agent——它压根不需要账户：

```bash
# Agent 的私钥从不离开 Agent。
curl -X POST http://localhost:8080/api/actors \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"public_key":"<base64url 的 Ed25519 公钥>","label":"nightly-runner"}'
```

[完整上手 →](/zh/start/quickstart)

## Agent 这件事为什么不一样

多数身份系统允许你凑合：给机器人配个邮箱、配个口令、丢进一个组。这套做法一直
能用，直到你要回答审计日志里那个问题——**这事是谁干的？**——而诚实的答案是
"2023 年某人建的一个服务账号，密码在 Slack 里传过"。

SoulAuth 把多数系统合并掉的几个对象拆开：

| 对象 | 回答什么 | 适用于 |
|---|---|---|
| `ActorIdentity` | 这是谁，持久地 | 所有主体 |
| `HumanAccount` | 一个人怎么管理自己的登录 | 只有人 |
| Credential | 此刻能拿什么证明 | 都有，种类不同 |
| `IdentityBinding` | 外部哪个主体和它是同一个 | 可选 |

Agent 拿到的是一个 `ActorIdentity` 加一枚密钥。就这些——它名下不存在
`HumanAccount` 行，而一致性套件会断言这条认证路径**根本不碰**人类账户结构。

<Figure2 locale="zh" />

## 这个 Release 实际做到了什么

能描述一套架构，不等于已经把它建出来了。本站每一项能力都带着六个词之一，
而且它们互不蕴含：

<Status kind="implemented" glossary /> 代码里有这条路径 ·
<Status kind="supported" glossary /> 我们承担它的契约 ·
<Status kind="tested" glossary /> 有自动化证据 ·
<Status kind="conformant" glossary /> 对照外部规范验过 ·
<Status kind="certified" glossary /> 标准组织认证过——**本项目没有任何一项** ·
<Status kind="planned" glossary /> 描述了但没建

点任意徽章看它的精确含义。当一个徽章是在**做声称**而不是在解释词义时，
它会写出撑住这句话的那条断言——比如
<Status kind="tested" guard="conformance::j8" />，守住 AI 主体认证的那一条。

<Conformance />

## 它不是什么

- **不是你业务规则的授权服务器。** 认证成功只告诉你**是谁**，不授予任何应用权限。
  [身份与权限的边界 →](/zh/spec/identity-vs-authority)
- **没有任何认证资质。** 本项目没有 OpenID Foundation 认证，自我声明也不构成认证。
- **不是托管服务。** 你自己跑。

## 接下来看哪儿

| 你想…… | 从这里开始 |
|---|---|
| 五分钟看它跑起来 | [快速上手](/zh/start/quickstart) |
| 用 OIDC 接一个 Web 应用 | [授权码流程](/zh/integrate/authorization-code-flow) |
| 给 AI Agent 一个身份 | [AI 原生身份](/zh/concepts/ai-native-identity) |
| 精确知道支持到什么程度 | [项目状态](/zh/project/status) |
| 写代码前先理解模型 | [Actor 身份模型](/zh/concepts/actor-identity-model) |
| 读完整规范 | [Specification](/zh/spec/) |
