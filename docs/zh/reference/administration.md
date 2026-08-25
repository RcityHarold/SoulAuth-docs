# 管理

## SoulAuth Control Plane 中谁可以改变什么

SoulAuth 的 Control Plane 不是**权限更高的普通 API**。它允许经过授权的 Principal
改变 **SoulAuth 自己拥有的 Domain State** —— 例如 ActorIdentity lifecycle、
Credential state、IdentityBinding、Client configuration、AuthSession continuity 以及
SoulAuth-local Administrative Authority。

但：

```text
Administrative Authority  ≠  Unlimited Authority
Administrative Authority  ≠  Permission to violate Domain Invariants
```

Admin 能够请求一个已经被 Domain Contract 定义的合法 State Transition，它不能站在
Identity、Authentication、Security 与 Audit Contract 之外，重新定义这些 Contract。

> **SoulAuth 中的 Administrator 不是 God Mode。**

## 1 · Administrative Decision Model

一次 Administrative Operation 是否允许，不能只回答 `authenticated? + is admin?`。
完整 Decision 至少需要区分：

```text
Administrative Principal Context
        ↓
Authentication Result
        ↓
Required Assurance / Freshness
        ↓
Current Principal Eligibility
        ↓
Domain-scoped Administrative Authority
        + Target / Operation Preconditions
        ↓
Authorization Decision
        ↓
Administrative Effect
        ↓
Outcome
```

**Administrative Principal Context** 回答"当前 Control-plane Decision 中，谁正在尝试
执行这个 Operation"。Principal 是当前 Decision Context 中的行动主体，它不是新的
Persistent Identity Species，可以建立在 ActorIdentity 与适用 Authentication Context
之上。

**Authentication** 回答"当前 Principal 的身份是否已经按照要求得到证明"。但：

```text
Authenticated Principal
≠
Administrative Authority
```

知道 Caller 是谁，还没有回答它为什么可以改变目标 State。

**Assurance / Freshness** —— 某些高风险 Administrative Operation 可以要求特定
Authentication Assurance 或 Freshness。但：

```text
Administrative Permission  ≠  Authentication Assurance
Authority Satisfied        ≠  Authentication Freshness Satisfied
```

更强 Authentication 不会创造更多 Permission；拥有更多 Permission，也不意味着任何旧
Authentication 都自动足够。Exact Requirement 属于具体 Administrative Operation
Contract。

**Current Eligibility** —— 存在 Role 或 Permission Assignment，不意味着 Principal
当前必然能够使用它：

```text
Authority Assigned
≠
Principal Currently Eligible
```

Current Eligibility 必须按照当前有效的 Identity、Authentication 与 Authority
Contract 判断，不能仅因为过去曾经拥有 Authority，就无限延续当前 Administrative
Capability。

**Administrative Authority** 回答"为什么当前 Principal 有资格请求这一类
SoulAuth-owned Operation"。Authority 是 Domain-scoped 的，它不会因为 Principal 是
Admin，就扩张到所有 Domain。

**Target / Operation Preconditions** —— 即使 Principal 拥有正确 Authority，当前
Target State 也必须允许这个 Transition：

```text
Administrative Authority Satisfied
≠
Domain Preconditions Satisfied
```

Authority 回答"你有没有资格请求"；Precondition 回答"当前这件事是否合法发生"。

**Authorization Decision** —— Authority 与 Preconditions 只是 Decision Input，最终
仍然需要对当前这一具体 Administrative Request 作出 Authorization Decision：

```text
Authority
≠
Authorization Decision
```

**Administrative Effect** —— Authorization 为 Allow，仍然不等于现实已经改变。只有
State Transition 真正成立以后，才形成 Administrative Effect：

```text
Authorization Decision
≠
Administrative Effect
```

**Outcome** —— Effect 已经发生，也不自动等于整个 Operation 获得了理想 Outcome。
Dependency、notification 或其它后续工作仍可能具有自己的结果：

```text
Administrative Effect
≠
Outcome
```

这让 Control Plane 不会把 Permission、Decision、State Change 和 Result 压成同一个
"成功"。

## 2 · Administrative Effect 与 Propagation Freshness 分开

一个 Administrative Operation 首先拥有自己的 Canonical Effect。例如某项 Actor
lifecycle transition 已经在其 Source Domain 中生效 —— 这不自动证明所有 Replica、
Cache、Session Consumer、Token Consumer 或其它 Runtime Participant 已经同时观察到
这一变化：

```text
Administrative Effect  ≠  Propagation Freshness
Authority Effect       ≠  Authority Propagation Freshness
```

Effect 回答"Canonical State 现在是什么"；Freshness 回答"其它 Consumer 什么时候观察
到"。具体传播、缓存与 Replica Contract 由相应 Security / Operations Reference 定义。
本篇不承诺未经 Runtime Evidence 证明的 instant global invalidation。

## 3 · Administration 与 Configuration 分开

```text
Administration
≠
Configuration
```

Administration 主要改变 **SoulAuth-owned runtime domain objects 与 administrative
authority state**；Configuration 主要定义 **Runtime、Deployment 和 Security Policy
怎样被配置**。

所以有资格管理 Actor 或 Client，不自动意味着有资格修改 Deployment / Security
Configuration，反方向同样成立。Exact Configuration Contract 由
[配置](./configuration) 定义。

## 4 · Administrative Authority Model

Control Plane 不能被一个 `is_admin = true` 吞掉。至少需要区分：

```text
Permission
Role
Assignment
Authority to assign / grant authority
Administrative Operation
```

它们不是同一个对象。

**Permission** 表达 **SoulAuth Control Plane 中的一个 Administrative Capability**。
具体当前 Release 正式存在什么 Permission，由 **Permission Registry** 拥有 Exact
Vocabulary —— 在本仓库中即 `contracts/permissions.yaml`，它同时记录每条权限实际在
哪些 handler 上被检查。本篇只定义 Permission 怎样参与 Authority Model。

**Role** —— 如果 Current Authority Model 使用 Role，Role 可以聚合 Permission：

```text
Role
≠
Permission
```

### Role Definition 与 Assignment 分开

```text
Role Definition        ≠  Role Assignment
Permission Definition  ≠  Permission Assignment
```

前者回答"Role 包含什么 Capability"；后者回答"哪个 Principal 当前获得这个 Role"。
这两层不能因为实现方便被合并。

### Permission Possession 不等于 Grant Authority

这是 Administrative Authority 最重要的边界之一：

```text
Permission Possession
≠
Authority to Grant That Permission
```

一个 Principal 有权执行 Operation X，不意味着它自然有权把 Operation X 的 Authority
授予另一个 Principal：

```text
Administrative Operation Authority
≠
Authority to Grant Administrative Operation Authority
```

否则 Control Plane 会出现最直接的 Self-escalation 路径。

### 防止 Self-escalation

一个有限 Admin 不能因为自己已经拥有某项 Permission，就把更强 Authority 授予自己。
只有当前 Principal 本来就拥有明确的 **authority assignment / grant capability** 时，
相关 Assignment 才可能成立。具体 Assignment 与 Grant Operation 由 Current
Permission / Administration Contract 定义。

## 5 · Actor Kind 与 Client 都不产生 Admin Authority

Human 和 AIActor 是 Identity Classification；Administrator 属于 Control-plane
Authority：

```text
Actor Kind               ≠  Administrative Role
Registered OAuth Client  ≠  Administrative Authority
```

Administrative Authority 来自明确的 Authority Assignment，不是 Human 或 AIActor 这个
Kind 本身。一个 Client 能够参与 OAuth Protocol，不意味着它可以管理 SoulAuth Control
Plane。

## 6 · SoulAuth Administrative Authority 不外溢

```text
SoulAuth Administrative Authority  ≠  Application Business Authority
SoulAuth Administrative Authority  ≠  Soulseed Governance Authority
SoulAuth Administrative Authority  ≠  External Execution Authority
```

一个 Principal 有权管理 SoulAuth Client，不会因此自动成为另一个 Application 的
Administrator。

## 7 · Supported Administration 不等于 Direct Persistence Mutation

真正的 Administrative Operation 必须经过受支持的 Domain Contract：

```text
Supported Administrative Mutation  ≠  Direct Persistence Mutation
Persistence Write Access           ≠  Administrative Authority
```

一个 Infrastructure Operator 可能在技术上能够修改 Database，这不会让 SoulAuth
Semantic Contract 认为该 Operator 拥有合法 Control-plane Authority。绕过正式 Domain
Operation 直接改变 Persistence，位于 Supported Administration Contract 之外，它可能
构成 Infrastructure / Integrity Incident。

## 8 · Administrative Authority 不能绕过 Domain Invariant

即使一个 Principal 拥有非常高的 Administrative Authority，也只能请求 Domain Model
本身允许的 Transition：

```text
Authorized Administrative Mutation
≠
Arbitrary State Mutation
```

Admin 不能通过普通 Administrative Operation：把 Client 变成 Actor；把 Credential
rotation 变成 Actor replacement；把 Profile mutation 变成 Actor Kind change；让
Current Binding 变化重写 Historical Attribution。

> **Authority 越高，并不意味着 Ontology 越弱。**

## 9 · Administrative Domains

本篇不重新定义这些 Domain 本体，只定义 **Control Plane 怎样被允许改变它们**。

| Administrative Domain | Administrative Operation 可以改变 | 它不因此重新定义 |
| --- | --- | --- |
| **ActorIdentity** | 当前支持的 lifecycle state | Actor Kind、identity history |
| **Credential** | 支持的 credential lifecycle state | ActorIdentity |
| **IdentityBinding** | cross-domain relation | source trust、historical attribution |
| **Client** | client registration / auth material / protocol configuration | ActorIdentity |
| **AuthSession** | authentication continuity state | Authentication Result、Credential、Token |
| **Administrative Authority** | SoulAuth-local authority assignment | Application / Soulseed Authority |

这些 Domain 可以存在显式 cross-domain effect，但不存在隐式状态等号。

## 10 · ActorIdentity Lifecycle Administration

ActorIdentity lifecycle semantics 由 [Actor 与档案](./actors-and-profiles) 定义。
Administration 负责当前 Principal 是否有资格请求某个已经 Supported 的 Lifecycle
Transition。

### Reactivation 不等于 Trust Resurrection

这是高风险 Control Plane 最重要的边界之一：

```text
Reactivation
≠
Trust Resurrection
```

ActorIdentity 重新进入适用 active lifecycle，不会自动复活已经独立撤销的 Credential、
IdentityBinding、AuthSession 或 Administrative Authority。每个 Domain 继续保持自己的
当前真实 State。

### Lifecycle Authority 不自动满足 Target Preconditions

```text
Lifecycle Authority
≠
Valid Lifecycle Transition by itself
```

Exact current transition、precondition 和 supported operation，由
[Actor 与档案](./actors-and-profiles)、Current Administrative Contract 与
[项目状态](../project/status) 共同定义。

## 11 · Credential Administration

Credential 本体和 Authentication Runtime 由
[认证与会话](./authentication-and-sessions) 定义。本篇只定义**谁有资格执行
Administrative Credential Mutation**。这里有三个长期边界。

### Credential Administration 不等于 Profile Administration

```text
Credential Administration
≠
Profile Administration
```

改变 Authentication Capability，不是 presentation update。

### Verification Material Mutation 是 Identity-critical Operation

改变用于证明 ActorIdentity 的 Verification Material，可能直接改变谁能够成功证明自己
是这个 Actor。因此这类 Mutation 属于 **Identity-critical Administrative
Operation**，它必须按照 Current Contract 拥有明确的 Authority、Authentication
Requirement 与 Target Preconditions。

### Administrative Authority 不等于 Secret Disclosure Authority

```text
Administrative Authority       ≠  Secret Disclosure Authority
Administrative Read Authority  ≠  Unlimited PII Visibility
```

一个 Principal 可以被授权 rotate、replace 或 revoke 某种 Credential，这并不意味着它
可以读取对应 raw authentication secret。Control Plane 同样服从 Least Privilege 与
Data Minimization。

## 12 · IdentityBinding Administration

IdentityBinding 的本体由 [Actor 与档案](./actors-and-profiles) 定义。本篇负责谁可以
请求改变这条 cross-domain relation。

### Binding Management 不建立 Source Trust

```text
IdentityBinding Administration
≠
Source Trust Establishment
```

一个 Principal 有权管理 Binding，不意味着它能够把任意 External Provider 升级成
Trusted Identity Source。External source trust 属于 Federation / Configuration
Contract。

### Binding Mutation 不自动完成 Authentication

```text
IdentityBinding Exists
≠
Authentication Accepted
```

Admin 创建或改变 Binding 只改变 Relation，它不会自动创建 External Authentication
Result、AuthSession 或 Administrative Authority。

### Rebind 不是普通 Descriptive Update

如果 Current Release 支持 rebind：

```text
Rebind
≠
Ordinary Binding Update
```

因为它可能改变 External Identity 今后解析到哪个 ActorIdentity。因此它属于高风险
Identity mutation，而不是 Profile Editing。Current Release 是否支持 Rebind，以及
Exact Authority、Precondition 和 Wire Contract，由 Current Administration Contract 与
[项目状态](../project/status) 定义。

### Current Binding Mutation 不改写历史

```text
Current Binding Mutation
≠
Historical Attribution Rewrite
```

Admin 可以改变未来 relation，它不能重新解释过去已经发生的 Authentication 或 Audit
Attribution。

## 13 · Client Administration

Client Protocol Semantics 由 [OIDC 与 Client](./oidc-and-clients) 定义。
Administration 负责对 Registered Client 及其 administrative state 执行受控 Mutation。
必须区分 Client registration / identifier、Client Authentication Material、Client
Protocol Configuration —— 不能用一个无边界的 `update client` 吞掉所有安全意义。

### Administrative Client Registration 不等于 Dynamic Client Registration

```text
Administrative Client Registration
≠
OAuth Dynamic Client Registration Protocol
```

Control Plane 可以存在 Client creation capability，这不自动证明 SoulAuth 实现了
标准化 Dynamic Client Registration Protocol。

### Client Authentication Material 与 Client 本身分离

```text
Client Authentication Material  ≠  Client registration / protocol identity
Client credential rotation      ≠  Client replacement
```

### Secret Issuance 不等于 Secret Retrieval

```text
Secret Issuance
≠
Secret Retrieval
```

即使某项 supported operation 会生成新的 Client Secret，也不能由此推导以后能够通过
普通 Client Read 再次获取 raw secret。Current one-time disclosure behavior 必须以真实
Machine Contract 为准。

### Current Client Configuration 不重写 Historical Transaction

```text
Current Client Configuration
≠
Historical Authorization Transaction
```

今天改变 Redirect、Client Authentication Material 或其它 Protocol Configuration，
不会改变昨天已经成立的 Transaction 当时是什么。Current State 可以影响 future
eligibility，它不能 rewrite history。

## 14 · AuthSession Administration

AuthSession 语义由 [认证与会话](./authentication-and-sessions) 定义。Administration
负责对 Existing Authentication Continuity 执行受控管理。但这里有一条绝对重要的边界：

```text
Administrative Authority
≠
Actor Impersonation Authority
```

### Session Management 不等于 Mint Authentication

```text
Administrative Session Management
≠
Authority to mint an authenticated Actor session
```

Admin 可以在 Current Contract 允许时 inspect permitted session metadata、revoke an
existing session。这不会赋予"选择 Actor A，然后直接制造一个已认证 Session"的能力。

### Admin 不能 Fabricate Authentication Result

```text
Administrative Authority
≠
Authority to fabricate Authentication Result
```

即使 Admin reset Credential、change Verification Material 或 reactivate
ActorIdentity，下一次真正 Actor Authentication 仍然必须经过 Authentication Contract。

### Session Management 不披露 Session Credential

```text
AuthSession Resource Representation
≠
Session Credential Disclosure
```

管理一个 Session，不需要获得能够直接接管该 Session 的 raw authentication capability。

### Session Revocation 只改变 Authentication Continuity

```text
AuthSession Revocation  ≠  Credential Revocation
AuthSession Revocation  ≠  Universal Access Token Revocation
```

Session Administration 只能改变它真正拥有的 Domain State。

## 15 · Administrative Authority Lifecycle

Administrative Authority 本身也是 Current Security State。但仍需区分：

```text
Authority Definition          ≠  Authority Assignment
Current Authority Assignment  ≠  Authority Projection Artifact
```

例如某个 Role 已经被撤销，不意味着之前签发的某个 projection artifact 中的旧内容会
"物理消失"。真正 Runtime 是否实时 lookup、cache、session projection 或 token
projection，必须服从自己的 Freshness Contract：

```text
Administrative Authority Effect
≠
Authority Propagation Freshness
```

## 16 · Current Authority 不重写 Historical Authority

今天修改 Role 或 Permission，只改变 Current / Future Authority：

```text
Current Role / Permission State
≠
Historical Administrative Authorization
```

今天 Revoke Authority，不意味着昨天当时合法的 Operation 从未被授权；今天 Grant
Authority，也不能 retroactively authorize 昨天本来无权执行的 Operation。Historical
Administrative Authorization 必须按照 **event-time authority context** 解释。

## 17 · Concurrency、Preconditions 与 Retry

Security-sensitive Administrative Mutation 不能把 Concurrency 当成 Database 偶然性：

```text
Administrative Concurrency Semantics
≠
Database Implementation Detail
```

真正需要保证的是：在 State Transition 真正成立的边界上，Domain Invariant 仍然成立。

```text
Concurrency  ≠  Retry
```

Concurrency 回答"多个 Operation 同时竞争时怎么办"；Retry 回答"Caller 不知道上一次
Operation 是否已经产生 Effect 以后怎么办"。

```text
Network Failure   ≠  Administrative Mutation Did Not Happen
Same Final State  ≠  No Additional Observable Effects
```

State Change 可能已经 Commit 而 Response 丢失，所以不能因为 Transport Failure 就
blind retry；重复 Operation 可能最终得到相同 Resource State，但 Audit、Notification
或其它 Effect 可能不同，所以 Idempotency 必须按照具体 Operation Contract 解释。这些
共同规则继承 [API 约定](./api-conventions)。

## 18 · Administrative Failure 必须保持语义分层

```text
Authentication / Freshness Failure
Authority Failure
Domain Precondition Failure
Concurrency Conflict
```

```text
Authentication Failure  ≠  Authority Failure  ≠  Domain Precondition Failure
```

- **Authentication / Freshness Failure** —— Principal 可能已知，但当前 Authentication
  不满足 Operation 要求。
- **Authority Failure** —— Principal 已经正确 Authentication，但没有所需
  Administrative Authority。
- **Domain Precondition Failure** —— Principal 拥有 Authority，但当前 Target State
  不允许这个 Transition。

这些 Failure 需要不同的 remediation、retry 与 audit interpretation。Exact HTTP Status
与 Machine Error 由具体 Endpoint Contract 定义。

## 19 · Administrative Surface 不等于 Unlimited Visibility

Control Plane 是 privileged surface。但：

```text
Administrative Surface         ≠  Unlimited Read Authority
Administrative Read Authority  ≠  Unlimited PII Visibility
```

一个只能管理 Client 的 Principal，不应自动获得全部 Actor、Credential、Binding 或
Session Data。Resource existence、data visibility 和 mutation authority 继续保持
分离。

## 20 · Administrative Attribution

每一个 Security-sensitive Administrative Mutation 都必须能够稳定区分**谁执行了
Operation** 和**哪个对象被操作**：

```text
Administrative Initiator
≠
Administrative Target
```

例如一个 Principal 改变另一个 Actor 的 Binding，Initiator 和 Target 属于不同
semantic role。不能只记录 Target ID，然后丢失是谁执行了 Mutation。

### Operation 不等于 Audit Event

```text
Administrative Operation  ≠  Audit Event
Audit Presence            ≠  Administrative Authority
```

Operation 改变 Current State；Audit Event 记录过去发生了什么。Audit 也不是 Authority
Source。Exact Audit Event Contract 由 [审计](./audit) 定义。

### Admin 不能 Rewrite Audit History

```text
Administrative Authority         ≠  Authority to Rewrite Audit History
Current Administrative Mutation  ≠  Historical Attribution Rewrite
```

最高普通 Administrative Authority 也不会因此获得改写过去已发生 Security Facts 的
语义权力。

## 21 · Administration at a glance

| Boundary | Meaning |
| --- | --- |
| **Authenticated Principal ≠ Administrative Authority** | 身份证明不会自动创造 Control-plane 权能 |
| **Role ≠ Permission ≠ Assignment** | capability、aggregation 与当前归属分离 |
| **Permission possession ≠ grant authority** | 能做不等于能把"能做"授予别人 |
| **Administrative Authority ≠ Unlimited Authority** | Admin 永远有 Domain Scope |
| **Administrative Authority ≠ Domain Invariant Bypass** | 高权限不能重新定义合法状态 |
| **Persistence Access ≠ Administrative Authority** | 技术写能力不等于语义授权 |
| **Reactivation ≠ Trust Resurrection** | 一个 Domain 恢复不会复活其它已撤销 Trust |
| **Administrative Authority ≠ Secret Disclosure Authority** | 能改变 Credential 不等于能读取 raw secret |
| **Session Administration ≠ Actor Impersonation** | 管理 Session 不能制造 Actor Authentication |
| **Current Authority ≠ Historical Authority** | 今天 Role 变化不会重写昨天的 Decision |
| **Administrative Effect ≠ Propagation Freshness** | Canonical state 改变与全局观察时间分离 |
| **Initiator ≠ Target** | 谁操作与操作谁必须分别归因 |
| **Current Mutation ≠ Historical Rewrite** | 当前 Control-plane state 不能改写过去 |

整套 Administration 最终可以压缩为：

```text
Principal Context
+ Authentication
+ Assurance / Freshness
+ Current Eligibility
+ Administrative Authority
+ Target Preconditions
        ↓
Authorization Decision
        ↓
One Domain-scoped Administrative Effect
        ↓
Outcome
```

横向始终保持 `Audit / Attribution`，同时 `Effect ≠ Propagation Freshness`。

## Exact Contract Source

本篇定义 **Administrative Principal、Authority、Role / Permission / Assignment
关系、Administrative Mutation Boundary 以及 Historical Administrative Authorization
的 Human-readable Semantics**。

但 Exact Permission Vocabulary 不由本篇自行创造，它由 **Permission Registry** 拥有；
Exact HTTP Wire 由 **Published Machine-readable Contract** 拥有；当前 Release 到底
支持哪些 Administrative Operations 由 [项目状态](../project/status) 负责发布。

具体 Domain 对象：ActorIdentity 见 [Actor 与档案](./actors-and-profiles)；
Credential / AuthSession 见 [认证与会话](./authentication-and-sessions)；Client 见
[OIDC 与 Client](./oidc-and-clients)；Audit Event 见 [审计](./audit)；Configuration
见 [配置](./configuration)。因此：

> **Administrative Semantic Concept 存在，不意味着 Current Release 已经存在对应
> Endpoint。**

## 下一步

到这里，我们已经知道：谁可以成为 Administrative Principal；Authentication、
Assurance、Eligibility 与 Authority 怎样共同参与 Control-plane Decision；Role、
Permission、Assignment 与 grant authority 为什么不能合并；Admin 为什么不能绕过
Domain Invariants、泄露 Secrets 或伪造 Actor Authentication；Administrative Effect
为什么不能与 Propagation Freshness 混为一体；Current Authority 为什么不能改写
Historical Authority。

下一份正式进入 [审计](./audit)，它将回答：SoulAuth 怎样记录过去发生了什么；Actor、
Principal、Client、Target、Operation 与 Outcome 怎样被稳定归因；Current State 与
Historical Fact 怎样保持分离；tamper-evident Audit 到底保证什么，又不保证什么。
