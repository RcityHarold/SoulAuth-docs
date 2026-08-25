# 验证 Token

## 在 Resource Server Boundary 验证 SoulAuth Access Token

前面的 Integration 流程解决了：Client 如何完成协议集成；Application 如何获得可信 OIDC
Authentication Result；Browser / BFF 如何安排 Token 与 Session Boundary。现在把视角
移动到 **Resource Server**。

当 API 收到一份 Access Token 时，真正的问题不是**"我能不能 Decode 它"**，而是：

> **"我能否按照事先建立的 SoulAuth Token Contract，证明这份 Access Token 值得被当前
> Resource 接受？"**

然后才继续问：

> **"这份 Token 提供的约束与 Application 自己的 Authority Model，是否允许当前
> Action？"**

```text
Token Trust
        ↓
Resource Applicability
        ↓
Request Authorization
```

## Before you start

Resource Server 在接收任何不可信 Token 以前，就应该已经知道：它信任哪个 SoulAuth
Authorization / Token Source；当前 API 对应哪个 Expected Resource / Audience
Context；它接受哪个 Current Access Token Profile；该 Profile 要求哪一种 Validation
Strategy；当前 Resource 需要检查哪些 token-level authorization constraints；Token
验证成功以后最终 Application Authorization 由谁负责。

这里最重要的顺序是：

```text
Configured Trust Contract
        ↓
Incoming Untrusted Token
        ↓
Validation
```

不能反过来：

```text
Incoming Untrusted Token → read unverified claims → decide what to trust
```

未验证 Token 里的 `iss`、`aud` 或其它 claim 可以成为 **Validation Input**，它们不能
成为 Resource Server 自己的 Trust Root。

## Step 1 · 只接受当前 Resource Contract 声明的 Access Token

普通 Protected Resource 处理的是 **Current Resource Contract 接受的 Access
Token**，不是"SoulAuth 发出来的任何 Token"。因此首先保持：

```text
ID Token
≠
API Access Token
```

ID Token 用于表达 OIDC Authentication Result；Access Token 用于进入它所声明的
Protected Resource Contract。即使二者来自同一个 Issuer、使用相同签名基础设施，也不能
互换。所以不要用以下方式调用普通 Resource API：

```http
Authorization: Bearer <ID_TOKEN>
```

## Step 2 · 按照 Current Token Profile 安全接收 Access Token

本篇不假设所有 Current Access Token 都一定采用 Bearer presentation。如果 Current
Access Token Profile 使用 Bearer Token，按照 Current Bearer Contract 与适用规范接收，
典型 HTTP 形式可能是：

```http
Authorization: Bearer <ACCESS_TOKEN>
```

不要为了方便把 Bearer Access Token 移动到 Current Contract 没有允许的 URL、ordinary
log 或其它高泄漏 surface。尤其保持：

```text
Raw Access Token
≠
Log / Audit Payload
```

如果需要 diagnostic / audit correlation，使用 Current Audit / Observability Contract
允许的 bounded representation。本篇不自行规定 digest、hash 或 reference 格式。

## Step 3 · Validation Strategy 来自 Contract，不来自 Token 外观

收到 Token 以后，不要因为它看起来像 `xxxxx.yyyyy.zzzzz` 就自行决定"这是 JWT，所以
本地验签即可"：

```text
Token Appearance      ≠  Validation Contract
Token Representation  ≠  Validation Strategy
```

Representation 可能是 structured 或 opaque / reference；Validation Strategy 可能是
local validation 或 online validation。二者不是固定一一对应。因此：

> **真正决定怎样验证的，是 Current SoulAuth Access Token Contract。**

### Validation Strategy at a glance

| Question | Local Validation | Online Validation |
| --- | --- | --- |
| **主要 Trust 判断发生在哪里** | Resource Server | Current Contract 声明的 trusted validation service |
| **每个 Request 是否需要在线访问 SoulAuth** | 不一定 | 依 Current Contract |
| **Freshness 怎样建立** | Token profile / lifetime / validation contract | Online validation contract |
| **是否替代 Application Authorization** | 否 | 否 |

这张表说明两种可能的 Validation Strategy，它不表示 Current Release 一定同时支持
两种。

## Step 4A · Local Validation（if the profile uses it）

按照该 Profile 的完整 Validation Contract 执行。如果具体 Representation 是 JWT，
必须首先保持：

```text
JWT Decoded
≠
JWT Validated
```

Decode 只能让你看见 payload，它不能让其中的 claim 自动变成 Trusted Fact。同样：

```text
Valid Signature
≠
Valid Access Token
```

### 从预先建立的 Trust Contract 获得验证材料

如果 Current Local Validation Profile 使用 issuer-published public verification
material，Resource Server 应通过声明的 trusted metadata / key-distribution contract
获取它。

不要从未验证 Token 动态建立 Issuer Trust；不要永久把当前某一把 Signing Key 当成
Protocol Contract；不要接受 Token Header 自己声明的任意 algorithm 或 key source。
因此：

```text
Current Signing Key
≠
Token Protocol
```

Key 可以变化，Contract 必须保持可验证。

### Local Validation 的代表性检查

完整要求由 Current Access Token Profile 与适用 External Normative Specification
共同决定。代表性的检查可能包括：

```text
expected token profile / role
allowed cryptographic policy
trusted verification material
cryptographic validation
issuer
resource / audience
time / validity conditions
other profile-required constraints
```

这不是本篇自己定义的完整规范列表。如果 Current Release 正式声明采用某个标准 Access
Token Profile，Resource Server 必须完整验证那个 Profile，不能只执行 generic
signature validation。

### Same Issuer 不等于 Same Token Role

即使两个 Token 都来自同一个 SoulAuth Issuer，也不能因此推导它们在 Resource Server 中
承担同样角色：

```text
ID Token
≠
Access Token
```

Token Type Confusion 必须由 Current Token Profile 正确拒绝。

### Key Rotation 属于 Validation Contract

```text
Hard-coded Forever Key
≠
Key-lifecycle-aware Validation
```

如果 Current Profile 使用可轮换的 verification material，Resource Server 必须按照该
Contract 跟随合法 lifecycle 变化。Exact cache TTL、unknown key reference recovery、
refresh interval、overlap window 不由本篇定义。

### Local Validation 不自动等于 Live Revocation Check

必须避免：

```text
valid signature → live revocation was checked
self-contained artifact → can never be invalidated
```

真正的 freshness / revocation behavior 取决于 Current Token Lifetime、Validation
Strategy、Revocation Contract、Resource Contract。因此：

```text
Token Validation Success
≠
Universal Live Revocation Check
```

## Step 4B · Online Validation（if the profile uses it）

```text
Resource Server
        │  Access Token
        ▼
Trusted Online Validation Boundary
        │
        ▼
Contract-defined Token Context
        │
        ▼
Resource Server
```

如果 Current SoulAuth Profile 采用标准 OAuth Token Introspection，Exact endpoint、
caller authentication、response 和 cache semantics 继续由
[OIDC 与 Client](../reference/oidc-and-clients) 与适用标准定义。本篇不默认
Introspection Endpoint 一定存在。

### Online Validation 本身也是 Trust Relationship

知道一个 Token String，不意味着调用者天然有权查询任何 Token 状态。因此：

> **Online token validation itself must follow its declared authentication /
> authorization boundary。**

如果 Current Profile 使用 Introspection，Resource Server 如何证明自己的 Client /
Resource context，由那个 Contract 定义。

### Positive Token Status 不等于 Allow Every Action

```text
Positive Token Status
≠
Allow Every Application Action
```

Online Validation 可以帮助建立 Token Trust，它不会取代当前 Resource 的 Application
Authorization。

### Unable to Validate 不等于 Allow

```text
Unable to Validate
≠
Allow
```

Security-critical Trust Fact 无法建立时，不能因为 Availability 压力把 Unknown State
变成 implicit allow。但同时：

```text
Invalid Token
≠
Validation Infrastructure Failure
```

如果真正失败的是 validation infrastructure、dependency 或 network，其 external error
classification 仍然应该保留正确 Failure Stage。Fail Closed 不意味着把所有
Infrastructure Failure 伪装成同一种 Authentication Error。

## Step 5 · 确认 Resource Applicability

Token 通过基础 Trust Validation 以后，仍然必须确认它适用于当前 Resource Boundary：

```text
Trusted Issuer
≠
Correct Resource / Audience
```

例如，一个来自正确 SoulAuth Issuer 的 Access Token 可以合法适用于 Resource A，但并不
因此自动适用于 Resource B。所以 **Trusted Issuer 只是必要条件之一**。Resource Server
必须按照 Current Token Profile 验证 expected resource / audience semantics。

## Step 6 · 按照 Current Token Contract 解释 Actor / Client Context

Token 完成 Trust 与 Resource Applicability Validation 以后，Resource Server 才开始
消费已经被 Contract 允许使用的 Token Context。这一阶段最重要的纪律是：

> **不要猜 Subject。**

### OAuth `client_id` 不等于 ActorIdentity

```text
OAuth `client_id`      ≠  ActorIdentity
Client Authentication  ≠  Actor Authentication
```

一个 Agent Application 可以是合法 OAuth Client，它不会因此成为它所承载的 AIActor；
Client Context 也不会自动升级成 Actor Context。

### Actor-bearing Context 与 Client-only Context 分开

Current Access Token Contract 可能建立 `Actor-bearing Context`，也可能建立
`Client-only Context`。这不是两种新的 Identity Species，它描述的是**当前 Token 到底
建立了哪些经过 Contract 验证的 Request Context**：

```text
Client-only Context
≠
Actor Context
```

如果 Token 只建立 Client Context，Resource Server 不能自行补出一个 Actor。尤其不能
`OAuth client_id → ActorIdentity`，也不能从 Email、Username、arbitrary claim 或
token string 自行推导 ActorIdentity。

### OIDC ID Token `sub` 不等于 Access-token Subject

```text
OIDC ID Token `sub`
≠
Access-token Subject by definition
```

OIDC `sub` 属于 OIDC Authentication Result 的 subject namespace；Access Token 中的
subject semantics 属于 Current Access Token Profile。两者即使碰巧使用 `sub` 这个相同
claim name，也不能未经 Contract 假设成同一个 Identifier Namespace。这是
[OIDC 与 Client](../reference/oidc-and-clients) 已经冻结的边界，本篇必须完整继承。

### Access-token Subject 不等于 ActorIdentity Resource ID

```text
Access-token Subject
≠
ActorIdentity Resource ID by definition
```

除非 Current Token Contract 明确声明某个 typed mapping / representation relation，
Resource Server 不能进行 implicit identifier cast。因此本篇不定义 `actor_subject`、
`actor_id`、`principal_id` 等字段 —— Exact wire semantics 只属于
[OIDC 与 Client](../reference/oidc-and-clients) 与 Machine-readable Contract。

## Step 7 · 应用 OAuth Token Constraints

验证完成以后，Token 可能提供 Current Profile 声明的 OAuth authorization
constraints，其中可能包括 **OAuth `scope`**。但必须保持：

```text
OAuth `scope`  ≠  SoulAuth Permission
OAuth `scope`  ≠  Complete Application Authority
OAuth `scope`  ≠  Soulseed Governance Authority
```

OAuth `scope` 可以限制 Token 允许参与的 protocol / resource operation boundary，
它不会自动证明当前 Actor 可以对当前 Resource 执行这个具体 Action。不要把 OAuth
`scope` 升级成 Universal Permission System。

## Step 8 · 把最终 Authorization 交给 Application

Resource Server 已经建立 Validated Token Context，这时才进入 Application 自己的
Authorization Decision：

```text
Valid Access Token
≠
Authorized Request
```

```text
Validated Token Context
        ↓
Resource Applicability
        ↓
Token-level Constraints
        ↓
Application Actor / Action / Resource / Context Policy
        ↓
Authorization Decision
```

本篇不重新定义 Application Authority Model，它只负责把**经过验证、范围明确的 Token
Context** 交给这个 Decision。

## 三个问题重新收束整个 Flow

```text
1. Token Trust
   Can I trust this artifact under my configured Token Contract?

2. Resource Applicability
   Is it valid and intended for this Resource Boundary?

3. Request Authorization
   Do the validated token constraints and the Application's own authority
   permit this concrete action?
```

真正不能发生的是：

```text
Token exists → Allow
```

## Token Verification 不读取 SoulAuth 私有 Persistence

Resource Server 应该通过 Current Token Contract（declared local validation 或
declared online validation）建立 Trust，而不是：

```text
Resource Server → SoulAuth private database → query token / session / actor state
```

```text
Token Verification
≠
Private Persistence Lookup
```

这继续保持 SoulAuth 架构已经冻结的原则：

```text
Supported Integration
≠
Private Database Coupling
```

## Failure Semantics

**1 · Access Token Trust Failure** —— required Access Token 不存在；artifact 不属于
accepted Access Token Contract；cryptographic / issuer / validity validation 失败；
required online validation 无法建立可信 Token Result。结果：**不要建立 Validated
Token Context。** 对外具体 HTTP / OAuth Error 服从 Current Resource / Token Profile。

**2 · Resource / Token Constraint Failure** —— Token 本身可以被信任，但不适用于当前
Resource，或没有满足当前 Token-level requirement。结果：**拒绝当前 Resource
Request**，但不要错误记录成"Token 一定是伪造的"。

**3 · Application Authorization Denial** —— Token Trust 成立、Resource Applicability
成立、Current token-level constraints 也满足，但 Application Policy 仍然拒绝当前
Actor / Client Context 对这个具体 Resource 执行当前 Action。结果：**Deny Application
Action** —— 这不是 Token Validation Failure。

### Preserve the Failure Stage

```text
Invalid Access Token      ≠  Validation Infrastructure Failure
Token Validation Failure  ≠  Application Authorization Denial
```

不要为了统一 Error Code 把所有 Failure 都压成一个"Token Error"。这对
Troubleshooting、Audit、Operations 都很重要。

## Audit / Observability Boundary

Resource Server 可以记录 Current Audit / Observability Contract 允许的 validation
outcome、bounded issuer / resource context、actor / client attribution context（在
已经可信建立时）、correlation information、authorization outcome。但核心原则不变：

```text
Raw Access Token
≠
Log / Audit Payload
```

本篇不定义 Audit Event Schema，Exact Historical Accountability 继续由
[审计](../reference/audit) 拥有。

## Expected Result

> **Validated, Resource-applicable Token Context**

它意味着：当前 Artifact 已经按照 Current Token Contract 完成验证；它适用于当前
Resource Boundary；Token 中允许消费的 Actor / Client / Constraint Context 已经按照
自己的 Contract 被解释；它现在可以作为 Application Authorization 的可信 Input。

它不意味着当前 Action 已经自动被允许。

## Complete Resource Server Flow

```text
Client / BFF
     │
     │ Access Token
     ▼
Resource Server
     │
     ├── Is this an accepted Access Token Contract?
     │
     ├── Which declared Validation Strategy applies?
     │      ├── Local, if supported
     │      └── Online, if supported
     │
     ├── Token trust established?
     │
     ├── Current validity / freshness conditions satisfied?
     │
     ├── Intended for this Resource / Audience?
     │
     ├── Actor-bearing Context or Client-only Context?
     │
     ├── Apply token-level constraints
     │
     ▼
Validated Token Context
     │
     ▼
Application Authorization
     │
     ├── Allow
     └── Deny
```

`Validated Token Context` 只是 Resource Server 完成 Current Contract 验证后的逻辑
结果，不是 SoulAuth 新增的 Canonical Domain Object。

## Verify Tokens at a glance

| Boundary | Meaning |
| --- | --- |
| **ID Token ≠ API Access Token** | Authentication Result 与 Resource Access 分离 |
| **Access Token ≠ JWT by definition** | Representation 由 Current Token Contract 定义 |
| **Token Appearance ≠ Validation Contract** | 长得像 JWT 不能决定信任方法 |
| **Token Representation ≠ Validation Strategy** | structured / opaque 与 local / online 不是固定一一对应 |
| **Decoded Token ≠ Validated Token** | 能读 claim 不代表 claim 可信 |
| **Valid Signature ≠ Valid Access Token** | Cryptographic success 只是 Validation 的一部分 |
| **Trusted Issuer ≠ Correct Resource / Audience** | 来自可信 Issuer 仍可能不适用于当前 API |
| **Valid Access Token ≠ Authorized Request** | Token Trust 不是最终 Application Decision |
| **OAuth `client_id` ≠ ActorIdentity** | Client identifier 不能冒充 Actor |
| **OIDC ID Token `sub` ≠ Access-token Subject** | 两个 Protocol Context 不能隐式合并 |
| **Access-token Subject ≠ ActorIdentity Resource ID** | Subject namespace 不能直接 cast |
| **Client-only Context ≠ Actor Context** | 没有 Actor Context 不能自行制造 |
| **OAuth `scope` ≠ SoulAuth Permission / Application Authority** | Scope 只是协议级 constraint |
| **Token Verification ≠ Private Persistence Lookup** | Consumer 通过 Public Contract 建立 Trust |
| **Raw Access Token ≠ Log / Audit Payload** | Token 不能扩散到错误数据域 |
| **Positive Online Token Status ≠ Allow Every Action** | Token 状态不能替代业务 Authorization |
| **Unable to Validate ≠ Allow** | Unknown Security State 不能转成 implicit allow |
| **Invalid Token ≠ Validation Infrastructure Failure** | Failure stage 必须保留 |

## If verification fails

| Failure | First place to look |
| --- | --- |
| **Artifact 不是 accepted Access Token** | [OIDC 与 Client](../reference/oidc-and-clients) / Current Token Profile |
| **Local validation 失败** | issuer / verification material / token profile / resource / time |
| **Online validation 失败** | online validation contract / caller trust / dependency |
| **Wrong Resource / Audience** | resource applicability |
| **Actor / Client Context 无法解释** | Access Token subject / context contract |
| **Token 可信但 Action 被拒绝** | Application Authorization |
| **问题只发生在部分 Runtime** | [故障排查](../operate/troubleshooting) / [部署](../operate/deployment) |
| **疑似 Token 或 trust material compromise** | [运维与恢复](../operate/operations-and-recovery) |

## 下一步

如果 Validated Token Context 需要转换成 SoulseedOS 可消费的 Authentication
Projection，进入 [Soulseed 接入](./soulseed)；如果需要 Exact Access Token
representation、Resource / Audience、OAuth `scope`、Actor-bearing / Client-only
semantics、Online Validation、Token Profile，进入
[OIDC 与 Client](../reference/oidc-and-clients)；如果需要理解 Token 相关
Protection、Replay 或 Secret Boundary，进入
[认证防护](../security/authentication-protection)；如果问题已经涉及 revocation、
trust-material incident 或 recovery，进入
[运维与恢复](../operate/operations-and-recovery)。

## Exact Contract Source

本篇拥有 **Access Token Verification Procedure**。

它不自行定义 Access Token representation、Bearer support、JWT support、RFC 9068
support、online validation / introspection support、sender-constrained token support、
resource / audience wire representation、Access Token claim schema、Access-token
subject representation、Actor-bearing Context wire shape、Client-only Context wire
shape、OAuth scope vocabulary、revocation freshness contract、exact HTTP / OAuth error
responses。

这些 Exact 事实必须来自 [OIDC 与 Client](../reference/oidc-and-clients)、
Machine-readable Protocol Contract、External Normative Specifications、Runtime、
Verification Evidence、[项目状态](../project/status)。因此必须保持：

```text
Standard Defines a Profile
≠
SoulAuth Supports That Profile
```

```text
Token Contains a Claim
≠
SoulAuth Has Assigned That Claim the Meaning the Consumer Guessed
```
