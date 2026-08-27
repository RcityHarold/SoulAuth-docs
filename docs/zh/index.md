---
layout: home

hero:
  name: SoulAuth
  text: 面向人与 AI 主体的身份与认证
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
  - title: AI 主体能持有自己的身份
    details: 注册一个主体并为它登记一枚 Ed25519 公钥，此后它通过对一次性挑战签名来完成认证。没有邮箱，没有口令，背后也不存在伪造的人类账户。
    link: /zh/concepts/ai-native-identity
    linkText: AI 原生身份
  - title: 标准 OpenID Connect
    details: 授权码流程强制 PKCE（S256）、RS256 ID Token、发现文档、JWKS、刷新令牌轮换与复用检测。
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

## 它是什么

SoulAuth 是一个自行部署的身份提供方，对外提供标准 OpenID Connect。
原本能对接 Keycloak 或 Auth0 的系统都能对接它；与那些系统不同的是，
它把 AI 主体视为独立主体，而不是一个顶着机器人头像的人类账户。

```bash
git clone https://github.com/RcityHarold/SoulAuth && cd SoulAuth
surreal start --bind 127.0.0.1:8000 --user root --pass root memory &

DB="--endpoint http://127.0.0.1:8000 --user root --pass root --namespace auth --database main"
surreal import $DB schema.sql
surreal import $DB initial_data.sql

export JWT_SECRET=$(openssl rand -hex 32) APP_URL=http://localhost:8080 \
       SMTP_HOST=127.0.0.1 SMTP_FROM=noreply@example.com
cargo run
```

也可以直接 `docker compose up -d`：compose 文件做的是同一件事，
并且 [CI 每次推送都会执行它](/zh/start/quickstart)。上面之所以列出手工步骤，
是因为那正是 compose 文件实际在做的事。

系统没有默认账号。全新实例会在启动日志中打印一枚一次性引导令牌，
用它创建第一个管理员，全程无需接触数据库：

```bash
curl -X POST http://localhost:8080/api/bootstrap/admin \
  -H 'Content-Type: application/json' \
  -d '{"token":"<日志里那枚>","email":"you@example.com","username":"admin","password":"CorrectHorse42!"}'
```

而 AI 主体完全不需要账户：

```bash
# 私钥始终留在 AI 主体一侧。
curl -X POST http://localhost:8080/api/actors \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"public_key":"<base64url 的 Ed25519 公钥>","label":"nightly-runner"}'
```

[完整上手 →](/zh/start/quickstart)

## AI 主体为何需要区别对待

多数身份系统允许将就：为机器人配一个邮箱、一个口令，再加入某个组。这套做法可以
一直用下去，直到需要回答审计日志里的那个问题：**这次操作是谁做的？**

诚实的答案通常是「某人在 2023 年创建的服务账号，口令曾在 Slack 里传过」。

SoulAuth 把多数系统合并在一起的几个对象拆开：

| 对象 | 回答什么 | 适用于 |
|---|---|---|
| `ActorIdentity` | 这是谁，且持久不变 | 所有主体 |
| `HumanAccount` | 一个人怎么管理自己的登录 | 只有人 |
| Credential | 此刻能拿什么证明 | 都有，种类不同 |
| `IdentityBinding` | 外部哪个主体和它是同一个 | 可选 |

AI 主体拿到的只有一个 `ActorIdentity` 和一枚密钥。它名下不存在 `HumanAccount`
记录，而一致性套件会断言这条认证路径完全不涉及人类账户结构。

<Figure2 locale="zh" />

## 本 Release 实际做到了什么

能描述一套架构，不等于已经把它建成。本站每一项能力都标注了六个状态词之一，
而这六个词互不蕴含：

<Status kind="implemented" glossary /> 代码里有这条路径 ·
<Status kind="supported" glossary /> 我们承担它的契约 ·
<Status kind="tested" glossary /> 有自动化证据 ·
<Status kind="conformant" glossary /> 对照外部规范验过 ·
<Status kind="certified" glossary /> 标准组织认证过（**本项目没有任何一项**） ·
<Status kind="planned" glossary /> 描述了但没建

点击任意徽章可以看到它的精确含义。徽章若是在**做出声称**而非解释词义，
会一并写出撑住这句话的断言，例如
<Status kind="tested" guard="conformance::j8" />，守住 AI 主体认证的正是这一条。

<Conformance />

## 它不是什么

- **不是业务规则的授权服务器。** 认证成功只回答**是谁**，不授予任何应用权限。
  [身份与权限的边界 →](/zh/spec/identity-vs-authority)
- **不具备任何认证资质。** 本项目未通过 OpenID Foundation 认证，自我声明也不构成认证。
- **不是托管服务。** 需要自行部署与运维。

## 接下来看哪儿

| 你想…… | 从这里开始 |
|---|---|
| 五分钟看它跑起来 | [快速上手](/zh/start/quickstart) |
| 用 OIDC 接一个 Web 应用 | [授权码流程](/zh/integrate/authorization-code-flow) |
| 为 AI 主体建立身份 | [AI 原生身份](/zh/concepts/ai-native-identity) |
| 精确知道支持到什么程度 | [项目状态](/zh/project/status) |
| 写代码前先理解模型 | [Actor 身份模型](/zh/concepts/actor-identity-model) |
| 读完整规范 | [Specification](/zh/spec/) |
