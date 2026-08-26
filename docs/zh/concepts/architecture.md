# SoulAuth 架构

## SoulAuth 怎样构成 Actor-native Identity & Authentication Infrastructure

前面的 Concepts 已经建立了 SoulAuth 的核心语义：ActorIdentity 回答"谁"，
Authentication 回答"是否得到证明"，Identity 不自动产生 Authority，而 SoulAuth 自身
位于更大的 Soulseed / Mind OS 体系中的 Identity & Authentication Boundary。

现在把镜头拉回 SoulAuth 内部。一个最简单的 Authentication Service 可以被理解为：

```text
login
  ↓
verify
  ↓
issue result
```

但 SoulAuth 需要长期处理的不只是一次 Login。它还需要维持稳定 ActorIdentity、
Authentication、Authentication Continuity、Protocol Projection、Administration、
Security、Audit 以及持久化边界。因此：

> **SoulAuth 不是一组 Login Endpoint，而是一套围绕 ActorIdentity 构建的 Actor-native
> Identity & Authentication Infrastructure。**

这一篇不定义某个具体 Authentication Flow，也不冻结 Endpoint、Database Schema 或
Deployment Topology。它只回答：

> **SoulAuth 内部有哪些长期稳定的 Logical Responsibilities，以及这些职责之间必须
> 保持什么边界。**

## 1 · Figure 3：SoulAuth 的 Logical Responsibility Architecture

<Figure3 locale="zh" />

Figure 3 是 SoulAuth 自身的 Canonical Architecture View。它回答的是：

> **HOW：SoulAuth 由哪些 Logical Responsibilities 构成？**

Figure 3 不是 Runtime Sequence Diagram，也不是 Deployment Diagram：

```text
Figure 3               ≠  Mandatory Runtime Pipeline
Architecture Component ≠  Process ≠ Container ≠ Microservice
```

一个 SoulAuth Process 完全可以承担多个 Logical Responsibilities；未来某个
Responsibility 也可以被拆分成独立的 Runtime Unit。只要 Architecture Boundary 保持
不变，这些实现方式都可以演进。

| Architecture Responsibility | 回答的问题 |
| --- | --- |
| **Clients** | 哪些 software participants 与 SoulAuth 交互？ |
| **Access & Protocol Edge** | 外部请求怎样安全进入 SoulAuth？ |
| **Identity Domain** | 当前 Actor 是谁？ |
| **Authentication Core** | 要求的身份是否得到证明？ |
| **AuthSession** | 已建立的 Authentication Reality 怎样有界持续？ |
| **Token & Federation** | 身份与 Authentication facts 怎样通过受支持 Protocol Contract 向外投影？ |
| **Control Plane** | SoulAuth 自己怎样被治理？ |
| **Security Protection** | 哪些 Security Constraints 横跨整个生命周期？ |
| **Audit & Attribution** | 过去发生了什么，以及如何归因？ |
| **Persistence & Infrastructure** | Domain State 怎样被持久化并连接外部基础设施？ |

其中 **Control Plane、Security Protection、Audit & Attribution 是 Cross-cutting
Planes**。它们不是主流程结束后附加的三个模块。

## 2 · Clients 与 Access & Protocol Edge

SoulAuth 首先面对外部 software participants，这些 participants 通过 **Access &
Protocol Edge** 与 SoulAuth 交互。这里必须先保持一个基本边界：

```text
Client
≠
Actor
```

ActorIdentity 回答"谁正在被认证"，Client 回答"哪个软件正在参与当前 Protocol
Context"。一个 AIActor 可以通过某个 Agent Application 或其它 Client 与 SoulAuth
交互，这不会让 `AIActor = Client` 成立。

### Access & Protocol Edge

Access & Protocol Edge 负责 SoulAuth 支持的外部 Protocol Boundary。它的核心职责是：

> **接收外部输入，执行适用的 transport / protocol validation，并把已经规范化的请求
> 交给内部责任域。**

它可以承载不同类型的 HTTP、Browser 或 Protocol interaction，但具体 Protocol 形式
不会反向决定 Identity Ontology：

```text
Protocol Shape
≠
Identity Model
```

新的 Protocol Surface 未来可以增加，ActorIdentity 是什么不应该因此改变。具体
Endpoint、Parameter 与 Wire Contract 由相应 Reference 和 Machine-readable Contract
定义。

## 3 · Identity Domain

SoulAuth Core 的身份中心是 `ActorIdentity`。Identity Domain 回答：

> **当前 Authentication 究竟围绕谁发生？**

它维护 SoulAuth 自己的 ActorIdentity 及其身份关系，并为后续 Authentication 提供
稳定的 Identity Anchor。因此：

```text
Identity Domain
≠
Authentication Core
```

Identity Domain 确定 **Who**，Authentication Core 确定 **Proof**。

HumanAccount、Profile、IdentityBinding、Credential 等相邻 Concept 与 ActorIdentity
之间的完整 Ontology 已经由 [Actor 身份模型](./actor-identity-model) 定义，本篇不
重新定义这些 Concept。这里真正需要保持的是：

```text
ActorIdentity  ≠  HumanAccount
ActorIdentity  ≠  Credential
Client         ≠  ActorIdentity
```

周边对象的正常生命周期变化，也不会因为 Architecture 实现方式改变而静默替换
ActorIdentity。

## 4 · Authentication Core

Authentication Core 回答：

> **当前提供的 Authentication Evidence 是否满足声明的 Authentication Contract？**

它消费 Identity Context 与适用 Authentication Evidence，并建立相应的 Authentication
Result。因此：

```text
Identity              ≠  Authentication
Authentication Result ≠  Authority
```

Authentication Core 不会重新定义 ActorIdentity；它也不会因为 Authentication 成功，
就自动为当前 Actor 创造 Application Authority、SoulAuth Administrative Authority 或
Soulseed Governance Authority。

不同 Actor 可以使用不同 Credential Type 或 Authentication Method。但哪些 Method、
Credential Type、Assurance Level 或 Federation Profile 在当前 Product Release 中受到
正式支持，不由 Architecture Page 决定 —— 这些 Exact Contract 分别由
[认证与会话](../reference/authentication-and-sessions)、
[OIDC 与 Client](../reference/oidc-and-clients) 和
[项目状态](../project/status) 定义。

Architecture 只锁定：

> **Authentication Core 负责 Proof，而不是 Identity Ontology 或 Authority。**

## 5 · AuthSession

Authentication 成功以后，有些交互需要在有限时间内保持 Authentication Continuity，
这是 **AuthSession** 的责任。它回答：

> **已经建立的 Authentication Reality 如何在受控生命周期内继续被使用？**

```text
AuthSession               ≠  ActorIdentity
Authentication Continuity ≠  Authority Continuity
```

ActorIdentity 可以长期存在，而 AuthSession 可以创建、过期或撤销；Authority 也可能
在 AuthSession 仍然存在时发生变化。

SoulAuth AuthSession 还必须与其它 Runtime Session Namespace 保持分离：

```text
AuthSession  ≠  Mind Session  ≠  ConnectorSession  ≠  ExecutionSession
```

具体 Session Lifecycle 与 Runtime Contract 由
[认证与会话](../reference/authentication-and-sessions) 定义。

## 6 · Token & Federation

Authentication Reality 建立以后，Consumer 还需要一种受控方式获取适用的 Identity /
Authentication facts。**Token & Federation** 承担这一类 Protocol Responsibility，
它处理的是：

> **已经建立的事实怎样跨越 SoulAuth Boundary，被 Consumer 按照声明的 Contract
> 使用。**

```text
Protocol Projection
≠
Upstream Identity Source of Truth
```

Token、Claims 以及 Federation 产生的 Projection 不会取代 ActorIdentity 或
Authentication Runtime 中的 Canonical Meaning。但经过正确验证以后，它们可以在自己
声明的 Consumer Scope、Trust Contract 与 Validity Boundary 内被依赖。

具体 ID Token、Access Token、Refresh Token、OIDC Claims、`sub`、OAuth `scope` 与
Federation Profile，全部由 [OIDC 与 Client](../reference/oidc-and-clients) 与适用的
External Normative Specifications 定义。本篇不重新定义 Protocol Wire。

### Figure 中的 `Authenticated Identity / Claims`

Figure 3 可能使用 `Authenticated Identity / Claims` 表示 SoulAuth 向 Consumer 提供的
输出区域。这里需要精确理解：

> **它是 Figure-level output grouping，不是新的 Canonical Identity Object。**

SoulAuth 并不存在一个与 ActorIdentity 并列的 `AuthenticatedIdentity` 新身份实体。
Runtime 中成立的是 Authentication Result，以及按照具体 Protocol Contract 产生的
Claims / Projection。

## 7 · Cross-cutting Plane：Control Plane

SoulAuth 本身是一套需要治理的 Infrastructure，因此它拥有自己的 **Control Plane**，
负责：

> **对 SoulAuth-owned state 执行受控的 Administrative Operations。**

但：

```text
Control Plane
≠
Unlimited Authority
```

它不能因为拥有 Administrative Capability，就绕过 ActorIdentity、Security、Lifecycle
或 Audit Invariants。同时：

```text
SoulAuth Administrative Authority
≠ Application Authority
≠ Soulseed Governance Authority
```

Control Plane 只治理 SoulAuth 自己的 Domain。具体 Administrative Principal、Role、
Permission、Permission Assignment、Delegation 与 Authorization Decision 由
[管理](../reference/administration) 定义。

## 8 · Cross-cutting Plane：Security Protection

Security Protection 不是 Login 完成以后再加上的一个 Security Module。它横跨
Identity、Authentication、Credential、AuthSession、Protocol、Administration、Audit
与 Infrastructure。因此：

> **Security 是整个 Identity & Authentication Lifecycle 的横向约束。**

不同 Domain 可以拥有不同 Security Property 和 Key Purpose，Architecture 不要求把
这些职责合并成一个"Security Object"。具体 Threat、Authentication Protection、
Credential Protection、Replay Protection、Key Lifecycle 以及其它 Security Control
由后续 Security 文档定义。本篇只锁定：

```text
Security Protection
≠
Post-login Add-on
```

## 9 · Cross-cutting Plane：Audit & Attribution

Audit & Attribution 回答：

> **过去发生了什么，以及这些行为应该归因给谁？**

它横跨 Identity、Authentication、Protocol、Administration 与 Security 等关键 Domain。
SoulAuth 需要能够把重要历史事实与适用 Actor、Principal、Client、Request 或 Target
Context 建立清楚的 Attribution。

同时，SoulAuth 的 Audit 目标是：

```text
tamper-evident
```

而不是：

```text
tamper-proof
```

也就是说：

> **系统应该能够检测声明 Trust Model 内的重要历史记录是否发生未经允许的修改，而不是
> 宣称数字记录绝对无法被改变。**

Audit 不会成为新的 Current State Source，也不会替代外部 Execution Domain。具体
Event Model、Integrity Structure 与 Historical Accountability 由
[审计](../reference/audit) 定义。

## 10 · Persistence：Logical Stores 不等于 Physical Databases

Identity、Credential、AuthSession、OIDC、Security 与 Audit 都需要 Persistence。
Figure 3 冻结的 Canonical Logical Stores 包括：

```text
Identity   Credential   AuthSession   OIDC   Security   Audit
```

但这些是 **Logical Persistence Boundaries**，不是数据库部署要求：

```text
Logical Store  ≠  Physical Database
One Database   ≠  One Domain
```

多个 Logical Store 可以共享同一个 Physical Database；一个 Logical Domain 未来也可以
根据工程需要使用不同 Persistence Infrastructure。真正需要保持的是 semantic
ownership、lifecycle boundary、access discipline、write discipline 与 security
requirement，而不是数据库数量。

### No Canonical Control Store

Figure 3 不会为了视觉对称再创造一个 `Control Store` 作为新的 Canonical Logical
Store。Control Plane 管理的状态由对应 Domain 与 Repository Contract 承载。

```text
No Canonical Control Store
```

这不是缺失，而是避免让 Architecture Diagram 为了图形完整性创造新的 Domain Ontology。

## 11 · Infrastructure 实现 Domain，但不定义 Domain

Persistence 以外，SoulAuth 还可能需要连接不同 Infrastructure Capability，例如
Persistence Adapter、Key Management Adapter、External Identity Provider Adapter、
Delivery Adapter。概念上：

```text
Canonical Domain Contract
        ↓
Infrastructure Contract
        ↓
Adapter
        ↓
Concrete Implementation
```

因此：

```text
Adapter
≠
Domain Semantic Owner
```

更换 Database、Key Manager、External Identity Provider 或其它 Infrastructure 实现，
不应该自动改变 ActorIdentity、Authentication、Credential 或 Audit 的 Canonical
Meaning。这也是为什么：

```text
Persistence Schema
≠
Canonical Ontology
```

工程实现承载 Domain Contract，它不能因为当前实现方便，而获得重新定义 Domain 的
权力。

## 12 · Architecture Responsibility 不等于 Code Layout

Figure 3 也不规定 Repository 必须怎样组织：

```text
Architecture Responsibility
≠
Code Module by definition
```

一个 Responsibility 可以跨多个 internal module 实现；一个 code module 也可能服务多个
内部 Concern，只要 Dependency 与 Boundary 保持清晰。同样
`Architecture Component ≠ Deployment Unit`，所以不应该从 Figure 3 直接推导出这样的
强制部署：

```text
Identity Domain     → identity-service
Authentication Core → auth-service
Audit               → audit-service
```

这些都属于 Engineering / Deployment Decision，不是 Architecture Ontology。

## 13 · Architecture Contracts 保持系统可演进

模块化 Architecture 真正重要的不是有多少 box、directory、crate、service 或
database，而是：

> **不同 Responsibility 之间通过什么 Contract 协作，以及哪些 Meaning 不能被下游实现
> 反向修改。**

```text
Protocol Layer  cannot redefine  ActorIdentity
Adapter         cannot redefine  Domain Ontology
Persistence     cannot redefine  Lifecycle Meaning
```

输出侧同样如此。Consumer 应该通过受支持的 Contract 消费 SoulAuth 提供的 Identity /
Authentication facts，而不是直接读取 SoulAuth private persistence：

```text
Supported Integration
≠
Private Database Coupling
```

SoulAuth 内部实现可以继续演进。只要 Consumer 所依赖的 Public Contract 保持成立，就
不需要了解 SoulAuth 内部怎样存储或组织代码。

## 14 · Architecture Relationship 不等于 Release Capability

Figure 3 描述的是 SoulAuth **应该拥有哪些 Logical Responsibilities**。它不自动证明
当前 Product Release 已经实现所有可能的 Authentication Method、Protocol Profile、
Adapter 或 Integration Mode：

```text
Architecture Responsibility
≠
Current Supported Capability
```

当前 Release 到底支持什么，应以
[认证与会话](../reference/authentication-and-sessions)、
[OIDC 与 Client](../reference/oidc-and-clients)、
[配置](../reference/configuration)、
[项目状态](../project/status) 以及适用的 Machine-readable Contracts 为准。

Architecture 保持稳定，Release Status 保持诚实，两者不应该互相冒充。

## 15 · Architecture at a glance

| Architecture Boundary | Meaning |
| --- | --- |
| **Figure 3 ≠ Runtime Pipeline** | Logical responsibilities 不规定唯一调用顺序 |
| **Architecture Component ≠ Deployment Unit** | box 不等于 process / container / microservice |
| **Identity Domain ≠ Authentication Core** | Who 与 Proof 分离 |
| **Client ≠ Actor** | software participant 不等于 identity subject |
| **AuthSession ≠ ActorIdentity** | authentication continuity 不等于 identity |
| **Cross-cutting Plane ≠ Post-login Add-on** | Control / Security / Audit 横跨生命周期 |
| **Logical Store ≠ Physical Database** | persistence boundary 不决定数据库拓扑 |
| **One Database ≠ One Domain** | 物理集中不会消除逻辑边界 |
| **Adapter ≠ Semantic Owner** | infrastructure 不能定义 ontology |
| **Supported Integration ≠ Private DB Coupling** | Consumer 通过 Contract 集成 |

把它继续压缩，可以得到 SoulAuth Architecture 最核心的工程纪律：

```text
Stable Semantic Responsibilities
        ↓
Explicit Contracts
        ↓
Flexible Implementation
```

也就是说：

> **架构锁定职责和边界，而不是锁死代码、数据库或部署方式。**

## 下一步

到这里，整个 **Concepts** 模块完成闭环。我们已经知道：为什么 SoulAuth 采用
Actor-native Identity；ActorIdentity 是什么；Identity 为什么不等于 Authority；
SoulAuth 在 Soulseed / Mind OS 体系中位于哪里；SoulAuth 自己又由哪些 Logical
Responsibilities 构成。

如果你要开始使用 SoulAuth，接下来进入 **接入**，从
[注册 Client](../integrate/register-a-client) 开始。

如果你想继续阅读大量其它页面都依赖的横向契约，进入
[安全模型](../security/security-model)。
