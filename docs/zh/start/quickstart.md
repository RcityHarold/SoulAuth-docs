# 快速开始

## 从零获得第一份经过验证的 Authentication Result

这份 Quickstart 只做一件事：

> **从一个新的 SoulAuth Development Instance 出发，走通 Current Release 指定的 Golden
> Path，并得到第一份可以独立验证的 Authentication Result。**

```text
Start SoulAuth
        ↓
Verify Runtime Readiness
        ↓
Establish Minimal Client State
        ↓
Establish a Test Human
        ↓
Run the Current Golden-path Authentication
        ↓
Validate the Authentication Result
```

真正的成功不是 Process 启动，不是 Browser 跳回 Application，也不是 Token Endpoint
返回了一个 Response，而是：

> **Client 已经按照 Current Authentication / Protocol Contract 独立证明这次
> Authentication Result 可信。**

## Quickstart Success 不等于 Production Readiness

本页只使用 **Development Environment**。因此首先保持：

```text
Quickstart Success
≠
Production Readiness
```

Quickstart 证明当前 Release 的最短 Developer Path 可以工作。它不证明 Production Key /
Secret Boundary、Backup / Recovery、Production Issuer、Runtime Topology、Security
Operations、Production Evidence 已经满足上线要求。Production 前必须单独完成
[部署](../operate/deployment) 和 [生产环境检查表](../operate/production-checklist)。

## Before you start

只准备 Current Release 的官方 Local Development Path 真正要求的 Prerequisites：一个
运行中的 SurrealDB 实例，以及 Rust toolchain（edition 2021）。

Quickstart 不要求 Developer 直接连接 SoulAuth private persistence、手工建立 table、
手工插入 Actor / Client / Credential record，或通过修改 database state 绕过受支持
Control Plane：

```text
Quickstart
≠
Direct Persistence Setup
```

## Step 1 · Start SoulAuth

应用自身不执行任何 DDL —— schema 与种子数据一次性导入：

```bash
surreal import --endpoint http://127.0.0.1:8000 --user root --pass root \
    --namespace auth --database main schema.sql
surreal import --endpoint http://127.0.0.1:8000 --user root --pass root \
    --namespace auth --database main initial_data.sql
```

必填环境变量只有四个：

```bash
export JWT_SECRET=$(openssl rand -hex 32)   # 至少 32 个字符
export APP_URL=http://localhost:8080        # 环回地址让开发期闸门保持开放
export SMTP_HOST=127.0.0.1
export SMTP_FROM=noreply@localhost

cargo run
```

`APP_URL` 是**公开地址**，不是监听地址（那是 `BIND_ADDR`，默认 `0.0.0.0:8080`）。
它决定 OIDC issuer、外发邮件中链接的前缀，以及 session cookie 是否携带 `Secure`。
把它指向非环回主机会打开生产闸门。

完整配置词汇由 Config Registry 拥有，解释见 [配置](../reference/configuration)。

启动命令返回，不代表 Runtime 已经可以接受下一步 Integration。

## Step 2 · Verify Runtime Readiness

```text
Process Started
≠
Runtime Ready
```

```bash
curl -s http://localhost:8080/health
```

如果 Readiness 不能成立，不要继续 Client Provisioning 或 Authentication Flow，先进入
[故障排查](../operate/troubleshooting) 或 [部署](../operate/deployment) 定位问题。

## Step 3 · Verify the Current Protocol Surface

Golden Path 使用 OpenID Connect，因此在开始 Authentication 以前，先确认声明的 OIDC
Protocol Surface 真实可用。信任顺序仍然是：

```text
Configured Trusted Issuer
        ↓
Current OIDC Metadata
        ↓
Declared Protocol Endpoints
```

而不是：

```text
Unknown endpoint / token → Discover arbitrary issuer → Trust it
```

```bash
curl -s http://localhost:8080/.well-known/openid-configuration
```

这一步真正证明的是：Current Quickstart 所依赖的 Protocol Contract 已经可以被 Client
使用。Authorization Endpoint、Token Endpoint、key distribution、metadata 各自的完整
语义属于 [OIDC 与 Client](../reference/oidc-and-clients) 与
[授权码流程](../integrate/authorization-code-flow)。

## Step 4 · Establish the Quickstart Client

Authentication 开始以前，需要先建立一个软件 Client。继续保持：

```text
Client
≠
Actor
```

Client 回答**哪个 software participant 正在使用 SoulAuth**；Actor 回答**谁正在被
Authentication**。

Client 必须通过受支持的 administrative path 建立：

```text
Client Provisioning
≠
Direct Persistence Mutation
```

一个全新实例存在真实的死锁：注册 OIDC Client 需要 `soulauth:oidc_clients.write`，
该权限来自 `admin` 角色，而第一个 admin 此前只能通过直接写数据库授予。Current
Release 因此为这个窗口提供了一条 bootstrap 路径 —— 启动时 Runtime 会打印待执行的
命令，其中包含一枚新生成的令牌：

```bash
curl -X POST http://localhost:8080/api/bootstrap/admin \
  -H 'Content-Type: application/json' \
  -d '{"token":"<启动日志中的 TOKEN>","email":"you@example.com",
       "username":"admin","password":"<不短于配置的最小长度>"}'
```

系统中一旦存在管理员，这道门就永久关闭 —— 它的成功条件恰好就是它的停用条件。需要
确定值时用 `SOULAUTH_BOOTSTRAP_TOKEN` 显式指定；设为空串则完全关闭这条路径。

> **"第一个被注册的 Client"或 bootstrap 管理员是本 Release 的 Runtime 能力，不是
> 通用架构假设。** 正式注册 Client 及其 Contract 见
> [注册 Client](../integrate/register-a-client) 与
> [OIDC 与 Client](../reference/oidc-and-clients)。

## Step 5 · Establish the Test Human

这条 Golden Path 首先使用 **Human** 作为被 Authentication 的 Actor。这不意味着
SoulAuth 是 Human-only system，它只意味着 **Human interactive authentication 是
Current Quickstart 选择的第一条 Golden Path**。

使用 Current Release 正式支持的 Development Provisioning Path 建立一个可用于测试的
Human，并建立这条 Golden Path 真正需要的 Authentication 条件。这里不重新定义
HumanAccount、Credential、Password、MFA、Recovery 或其它 Authentication Method ——
它们属于 [Actor 与档案](../reference/actors-and-profiles) 与
[认证与会话](../reference/authentication-and-sessions)。

### Golden Path 不要求 AuthSession 必然存在

不要把 `Human → Authentication → AuthSession → Authorization Code` 读成强制 Runtime
推导：

```text
Successful Authentication
≠
AuthSession Necessarily Created
```

AuthSession 是否建立、怎样建立以及如何持续，由 Current Authentication Contract 定义。
Quickstart 只观察当前 Golden Path 真实发生的结果，不会为了让 Summary"更完整"而创造
一个不存在的阶段。

## Step 6 · Run the Current Golden-path Authentication

Current Quickstart Profile 使用 **Authorization Code Flow with PKCE**。本篇只负责
**运行它**，不重新解释它。

```text
Authorization Request
        ↓
Actor Authentication
        ↓
Authorization Response
        ↓
Transaction Validation
        ↓
Authorization Code Exchange
```

`state`、PKCE、`nonce`、redirect、Client Authentication 各自为什么存在、怎样工作，
进入 [授权码流程](../integrate/authorization-code-flow)。Quickstart 不重新成为第二份
Protocol Tutorial。

### Token Response 不是 Quickstart 的最终成功条件

```text
Token Response Success
≠
Verified Authentication Result
```

Token Endpoint 返回结果以后，仍然必须完成 Authentication Result Validation。本篇也不
维护完整 Token Response Field List，尤其不为了"顺便介绍"而宣布 Refresh Token、
UserInfo 或其它 optional token capability —— Current Token Surface 统一由
[OIDC 与 Client](../reference/oidc-and-clients) 定义。

## Step 7 · Validate the OIDC Authentication Result

Quickstart 的最后一步是完整验证 ID Token。不能：

```text
Decode JWT → Read Claims → Trust Identity
```

```text
ID Token Decoded
≠
ID Token Validated
```

Client 应该使用 Current Release 声明的 trusted Issuer、Current OIDC metadata /
verification contract、Current Profile 要求的完整 ID Token Validation 完成验证。
代表性的 Validation 可能包括 cryptographic validation、issuer、audience、time
validity，以及适用时的 transaction binding。完整 Normative Validation 规则不由
Quickstart 重新定义 —— 进入
[授权码流程](../integrate/authorization-code-flow) 与
[OIDC 与 Client](../reference/oidc-and-clients)。

## Step 8 · Interpret the Verified OIDC Subject Correctly

ID Token 完成验证以后，Client 可以消费经过验证的 OIDC Claims。其中 `sub` 必须始终在
**Trusted Issuer / Current OIDC Subject Contract** 中解释：

```text
Trusted Issuer
+
Validated `sub`
        ↓
Verified OIDC Subject Context
```

而不是：

```text
`sub` → Global Actor ID
```

### OIDC `sub` 不等于 ActorIdentity Resource ID

```text
OIDC `sub`
≠
ActorIdentity Resource ID
```

OIDC `sub` 属于 OIDC Subject Namespace；ActorIdentity Resource ID 属于 SoulAuth
Identity Domain Resource Namespace。不能仅因为字符串可能相同就做 implicit identifier
cast。

### OIDC `sub` 不等于 Stable Subject Foundation

```text
OIDC `sub`
≠
Stable Subject Foundation
```

本篇不再告诉 Developer"`sub` 就是稳定 Actor Subject"。Identity Continuity 与 OIDC
Subject Policy 是不同层面的语义。

### Mutable Profile Data 不替代 OIDC Subject

不要使用 Email、Username、Display Name 替代 Verified Issuer + `sub` 建立
Authentication Subject Mapping。完整 Subject Contract 继续由
[OIDC 与 Client](../reference/oidc-and-clients) 定义。

### ID Token 与 Access Token 继续分开

即使 Current Token Response 同时包含两者：

```text
ID Token      ≠  API Access Token
Access Token  ≠  JWT by definition
```

如果你的下一步是保护 Backend / API，进入
[验证 Token](../integrate/verify-tokens)。Quickstart 不通过"Access Token 可以
Decode"来推断它的 Public Contract。

## Expected Result

```text
Runtime Ready                                PASS
Current Protocol Surface                     PASS
Client Provisioning                          PASS
Human Authentication                         PASS
OIDC Transaction                             PASS
ID Token Validation                          PASS
Verified Issuer-scoped OIDC Subject Context  ESTABLISHED
```

最后一项意味着 Client 已经在 Current OIDC Subject Contract 中可信识别本次
Authentication 对应的 subject。它不意味着 Client 取得了 SoulAuth ActorIdentity
Resource 本身，也不意味着 Actor 获得了任何下游 Authority。

## Quickstart at a glance

| Boundary | Meaning |
| --- | --- |
| **Quickstart Success ≠ Production Readiness** | Development first success 不是 Production Gate |
| **Process Started ≠ Runtime Ready** | Process 存在不证明 Runtime 可服务 |
| **Client ≠ Actor** | 软件参与者不是被 Authentication 主体 |
| **Client Provisioning ≠ Direct Persistence Mutation** | 初始配置必须走受支持路径 |
| **Human Golden Path ≠ Human-only Architecture** | Human 只是第一条 Developer Path |
| **Authentication Success ≠ AuthSession Necessarily Created** | Session 不是所有 Authentication 的强制阶段 |
| **Protocol Explanation ≠ Quickstart Procedure** | Quickstart 运行 Protocol，不重新定义 Protocol |
| **Token Response Success ≠ Verified Authentication Result** | Exchange 成功后仍需 Validation |
| **ID Token Decoded ≠ ID Token Validated** | 可读不等于可信 |
| **OIDC `sub` ≠ ActorIdentity Resource ID** | 两个 Identifier Namespace 不能隐式合并 |
| **OIDC `sub` ≠ Stable Subject Foundation** | Protocol Subject 不是 Identity Continuity primitive |
| **ID Token ≠ API Access Token** | Authentication Result 与 Resource Access 分离 |
| **Access Token ≠ JWT by definition** | Representation 由 Token Contract 定义 |

## If it fails

| Failure Stage | Go to |
| --- | --- |
| **Runtime 无法启动 / Ready** | [部署](../operate/deployment) → [故障排查](../operate/troubleshooting) |
| **Initial Client Provisioning 失败** | [注册 Client](../integrate/register-a-client) → [管理](../reference/administration) |
| **Human provisioning / Authentication 失败** | [认证与会话](../reference/authentication-and-sessions) → [故障排查](../operate/troubleshooting) |
| **Authorization Transaction 失败** | [授权码流程](../integrate/authorization-code-flow) → [故障排查](../operate/troubleshooting) |
| **ID Token Validation 失败** | [OIDC 与 Client](../reference/oidc-and-clients) → [故障排查](../operate/troubleshooting) |
| **API 使用 Access Token 失败** | [验证 Token](../integrate/verify-tokens) → [故障排查](../operate/troubleshooting) |

如果出现 Identity Misattribution、unknown trust material、suspected persistence
corruption 或 security material compromise，不要继续普通 Quickstart 排障，进入
[运维与恢复](../operate/operations-and-recovery)。

## 下一步

如果你还不确定自己真实系统应该采用哪一种 Integration Boundary，进入
[选择接入路径](./integration-path)；如果你准备注册真实 Application Client，进入
[注册 Client](../integrate/register-a-client)；如果你要真正理解 Authorization Code
Transaction，进入 [授权码流程](../integrate/authorization-code-flow)；如果你要保护
Backend / API，进入 [验证 Token](../integrate/verify-tokens)；如果你准备进入真实
部署，进入 [部署](../operate/deployment)，然后
[生产环境检查表](../operate/production-checklist)；如果你希望理解 Human 与 AIActor
为什么共享 ActorIdentity Canonical Contract，进入
[AI 原生身份](../concepts/ai-native-identity) 与
[Actor 身份模型](../concepts/actor-identity-model)。

## Exact Contract Source

本篇拥有 **Current Release Golden-path Quickstart Procedure**。

repository URL、local runtime packaging、start command、readiness endpoint、default
port、initial Client provisioning mechanism、Client schema、Human provisioning
mechanism、Human Authentication Method、Authorization endpoint、PKCE profile、token
endpoint、Token Response schema、ID Token validation command、OIDC subject policy、
current supported feature set —— 所有这些 Exact 事实必须来自 Current Release
Artifact、Machine-readable Contracts、Canonical References、Runtime、Verification
Evidence、[项目状态](../project/status)。因此：

```text
Quickstart Consumes Current Contracts
Quickstart Does Not Define Current Contracts
```
