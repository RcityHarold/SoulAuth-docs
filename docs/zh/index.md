---
layout: home

hero:
  name: SoulAuth
  text: 面向人与 AI 主体的身份与认证
  tagline: 自托管的 OpenID Connect 提供方。AI 主体有自己的身份记录和自己的密钥，不是一行填了假邮箱的 user。
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
  - title: AI 主体能持有自己的身份
    details: 注册一个主体并为它登记一枚 Ed25519 公钥，此后它通过对一次性挑战签名来完成认证。没有邮箱，没有口令，背后也不存在伪造的人类账户。
    link: /zh/concepts/ai-native-identity
    linkText: AI 原生身份
  - title: 标准 OpenID Connect
    details: 授权码流程 + PKCE（只收 S256，public 客户端强制）、RS256 ID Token、发现文档、JWKS、刷新令牌轮换与复用检测。
    link: /zh/integrate/authorization-code-flow
    linkText: 接一个客户端
  - title: 每一句声称都指得出守卫
    details: 端点、配置项、权限、外部规范都存放在机器可读的注册表中，由测试套件对照运行中的代码逐条核对。页面上写「已支持」，就能点开撑住这句话的那条断言。
    link: /zh/project/status
    linkText: 一致性读数
  - title: 自行部署
    details: 一个 Rust 二进制加 SurrealDB。本地可用 Docker Compose；生产环境设有一道明写的闸门，默认值不安全时进程直接拒绝启动。
    link: /zh/operate/deployment
    linkText: 部署
---

## SoulAuth 是什么

SoulAuth 是一个自行部署的身份提供方，对外说标准 OpenID Connect，
原本接 Keycloak 或 Auth0 的系统照样能接它。区别是 AI 主体有一条自己的身份记录，
背后没有 user 行，也没有口令。

```bash
git clone https://github.com/RcityHarold/SoulAuth && cd SoulAuth
surreal start --bind 127.0.0.1:8000 --user root --pass root memory &

DB="--endpoint http://127.0.0.1:8000 --user root --pass root --namespace auth --database main"
surreal import $DB schema.sql
surreal import $DB initial_data.sql

export JWT_SECRET=$(openssl rand -hex 32) APP_URL=http://localhost:8080 \
       BIND_ADDR=127.0.0.1:8080 SMTP_HOST=127.0.0.1 SMTP_FROM=noreply@example.com
cargo run
```

也可以直接 `docker compose up -d`，容器里跑的就是上面这几步，
而它本身[每次推送都由 CI 执行](/zh/start/quickstart)。

系统没有默认账号。全新实例会在启动日志中打印一枚一次性引导令牌，
用它创建第一个管理员，全程无需接触数据库：

```bash
curl -X POST http://localhost:8080/api/bootstrap/admin \
  -H 'Content-Type: application/json' \
  -d '{"token":"<日志里那枚>","email":"you@example.com","username":"admin","password":"CorrectHorse42!"}'
```

AI 主体则完全不需要账户：

```bash
# 私钥始终留在 AI 主体一侧。
curl -X POST http://localhost:8080/api/actors \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"public_key":"<base64url 的 Ed25519 公钥>","label":"nightly-runner"}'
```

[完整上手 →](/zh/start/quickstart)

## AI 主体为何需要区别对待

多数身份系统允许你糊弄过去：给机器人一个邮箱、一个口令，丢进某个组。
这套做法一直够用，直到你得对着审计日志里的一行回答**这是谁干的**，
而真实答案是「2023 年某人建的服务账号，口令在 Slack 里传过一轮」。

SoulAuth 把多数系统合并在一起的几个对象拆开：

| 对象 | 回答什么 | 适用于 |
|---|---|---|
| `ActorIdentity` | 这是谁，且持久不变 | 所有主体 |
| `HumanAccount` | 一个人如何管理自己的登录 | 仅人类主体 |
| Credential | 此刻能用什么来证明 | 两者都有，种类不同 |
| `IdentityBinding` | 外部哪个主体与它是同一个 | 可选 |

AI 主体拿到的只有一个 `ActorIdentity` 和一枚密钥，名下不存在 `HumanAccount` 记录。
一致性套件会断言这条认证路径完全不涉及人类账户结构。

<Figure2 locale="zh" />

## 本 Release 实际做到了什么

同一件事可以「代码里有」但没测过，也可以「测过」但没对照外部规范验过。所以状态词
有七个，任意一个都不蕴含另一个：

<Status kind="implemented" glossary /> 代码里有这条路径 ·
<Status kind="supported" glossary /> 承担它的行为契约与向后兼容责任 ·
<Status kind="tested" glossary /> 有自动化证据 ·
<Status kind="conformant" glossary /> 对照外部规范验过 ·
<Status kind="certified" glossary /> 标准组织认证过（**本项目没有任何一项**） ·
<Status kind="planned" glossary /> 描述了但没建 ·
<Status kind="deprecated" glossary /> 还在，但已列入移除计划

点击任意徽章看它的精确含义。徽章在**做出声称**而不是解释词义时，会一并写出是哪条
断言在守：比如 <Status kind="tested" guard="conformance::j8" /> 指的是
`tests/conformance.rs` 里的 `j8`，它守的是 AI 主体认证那 13 项冻结面。

<Conformance />

## SoulAuth 不是什么

- **不是业务规则的授权服务器。** 认证成功只回答**是谁**，不授予任何应用权限。
  [身份与权限的边界 →](/zh/spec/identity-vs-authority)
- **不具备任何认证资质。** 本项目未通过 OpenID Foundation 认证，自我声明也不构成认证。
- **不是托管服务。** 需要自行部署与运维。

## 从哪里开始

| 你想…… | 从这里开始 |
|---|---|
| 五分钟内跑起来 | [快速上手](/zh/start/quickstart) |
| 用 OIDC 接入 Web 应用 | [授权码流程](/zh/integrate/authorization-code-flow) |
| 为 AI 主体建立身份 | [AI 原生身份](/zh/concepts/ai-native-identity) |
| 确认支持到什么程度 | [项目状态](/zh/project/status) |
| 动手前先理解模型 | [Actor 身份模型](/zh/concepts/actor-identity-model) |
| 阅读完整规范 | [规范](/zh/spec/) |
