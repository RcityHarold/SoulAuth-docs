# 项目状态

现在能依赖什么，不能依赖什么。

## 读数

<Conformance />

上面每个数字都来自真跑那四条命令。这里没有任何估计值。

## 今天能用的

| 能力 | 状态 |
|---|---|
| 邮箱 + 口令认证 | <Status kind="supported" /> |
| TOTP 二次验证与备用码 | <Status kind="supported" /> |
| 账号锁定与按 IP 限流，跨副本合账 | <Status kind="supported" /> |
| 会话签发与吊销 | <Status kind="tested" guard="integration.sh" /> |
| **AI 主体身份与挑战—应答认证** | <Status kind="tested" guard="conformance::a6" /> |
| OIDC 授权码流程，强制 PKCE（S256） | <Status kind="tested" guard="integration.sh" /> |
| RS256 ID Token、发现文档、JWKS | <Status kind="supported" /> |
| 刷新令牌轮换、复用检测、令牌族吊销 | <Status kind="supported" /> |
| Google 与 GitHub 联邦登录 | <Status kind="supported" /> |
| 人类账户上的 RBAC | <Status kind="supported" /> |
| 不碰数据库即可引导第一个管理员 | <Status kind="tested" guard="integration.sh" /> |
| 认证事件审计 | <Status kind="implemented" /> |

本项目**没有任何一项**处于 <Status kind="conformant" glossary /> 或
<Status kind="certified" glossary />。没有标准组织认证过它的任何部分，
也不存在进行中的认证流程。

## 没建的

架构描述了、本 Release 里不存在：

| | 对你意味着什么 |
|---|---|
| <Status kind="planned" /> `ActorIdentity` 上的 RBAC | AI 主体能完成认证，但会话不携带权限，只能访问 `/api/actors/me`。 |
| <Status kind="planned" /> 收口的 `Credential` 对象 | 口令与 TOTP 仍在遗留的 `user` 表上。调用方看到的接口不变，但模型尚未完全落地。 |
| <Status kind="planned" /> 防篡改审计 | 审计日志是一张普通表。**不要拿它当证据。** |
| <Status kind="planned" /> 人类事件归因到身份根 | 人类审计行以 `user_id` 为键。AI 主体的事件已经归因到身份根了。 |
| <Status kind="planned" /> 物化的 `AuthenticationResult` | 目前只是内部 runtime fact。到调用方手上的会话令牌与 OIDC claims 是稳定的。 |
| <Status kind="planned" /> 正式的 assurance 分级 | 除了 `auth_time`，没有 assurance 模型。 |

## 你真会撞到的限制

这些不是路线图条目，是运行中系统的性质。

**`sub` 弱于模型所描述的。** 它带的是遗留 `user` 行的键，所以只在那一行的
生命周期内稳定，而不是 OIDC Core 期待的「永不重新分配」。这一点作为具名 caveat 记在
[规范与符合性](/zh/security/standards-and-conformance)里。

**吊销在副本之间有延迟。** 每个实例缓存已解析的会话；其它实例在
`AUTH_SESSION_CACHE_TTL_SECONDS` 之内才观察到登出或停用。单实例部署不受影响。

**没有 `/revoke`，也没有 `/introspect`。** SoulAuth 内部确实吊销令牌，
访问令牌也确实是它能查到的一行；但 RFC 7009 与 RFC 7662 都没有作为 wire 协议实现。
请对着 JWKS 在本地校验 ID Token。

**Docker Compose 只适合本地。** CI 每次推送都会端到端执行它，因此它确实能用；
但它的数据库凭证是开发默认值，SurrealDB 也没有 TLS。
生产环境请走[生产清单](/zh/operate/production-checklist)。

## 状态词怎么读

六个词，**任何一个都不蕴含另一个**：

<Status kind="implemented" glossary /> ·
<Status kind="supported" glossary /> ·
<Status kind="tested" glossary /> ·
<Status kind="conformant" glossary /> ·
<Status kind="certified" glossary /> ·
<Status kind="deprecated" glossary />

点任意徽章看它的精确含义。值得内化的一条后果：代码存在（`implemented`）不是
保留它的承诺（`supported`），而这两者都不说明它符合任何规范（`conformant`）。

站上的徽章如果是在**做声称**而不是解释词义，它会写出撑住这句话的那条断言。
如果看到某个徽章没有写出断言名，那是缺陷，`scripts/check-status.mjs` 本该拦住它。

## 自己验一遍

```bash
git clone https://github.com/RcityHarold/SoulAuth && cd SoulAuth
cargo test                    # 单元 + 一致性
./tests/integration.sh        # 对真实数据库跑端到端
./tests/deployment_walkthrough.sh   # 把部署文档执行一遍
```

被 ignore 的那些一致性测试不是无关噪声。每一条都是写好了、能跑、而当前实现
达不到的断言，并带着写明原因的注释。删掉一个 `#[ignore]` 发现它照样通过，
就是一个缺口被补上的方式。

## 接下来

| | |
|---|---|
| 边界是什么 | [规范](/zh/spec/) |
| 哪些 RFC 适用、哪些不 | [规范与符合性](/zh/security/standards-and-conformance) |
| 部署之前 | [生产清单](/zh/operate/production-checklist) |
