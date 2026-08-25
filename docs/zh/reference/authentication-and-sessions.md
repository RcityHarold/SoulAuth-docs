# 认证与会话

## SoulAuth 如何建立并维持 Authentication Reality

SoulAuth 的 Authentication Runtime 不等于一个单一的"登录系统"。它需要长期区分四种
不同语义：

```text
Credential  ≠  Authentication Evidence  ≠  Authentication Result  ≠  AuthSession
```

| Concept | 回答的问题 |
| --- | --- |
| **Credential** | 这个 Actor 长期拥有什么 Authentication Capability？ |
| **Authentication Evidence** | 当前这一次 Authentication 提供了什么证明？ |
| **Authentication Result** | 经过验证以后，SoulAuth 实际建立了什么 Authentication Fact？ |
| **AuthSession** | 已经建立的 Authentication 能否在有界生命周期内继续被复用？ |

这些对象彼此关联，但它们不能因为实现方便而被合并。同时始终保持：

```text
Authentication
≠
Authority
```

Authentication 建立的是**当前 Actor 是谁，以及这一身份事实以什么条件成立**。它不会
自动回答当前 Actor 接下来可以执行什么业务、治理或现实 Operation。

## 1 · Authentication Runtime Model

SoulAuth 的 Authentication 建立过程，不要求所有 Flow 都从同一个 Credential 类型
开始。更准确的通用模型是：

```text
Identity Context
        + Applicable Authentication Source
        + Current Evidence / Assertion
        ↓
Applicable Validation
        ↓
Authentication Result
        ↓
Assurance / Freshness
        ↓
AuthSession, if established
```

其中 Authentication Source 可能来自不同受支持的 Authentication Contract：SoulAuth
本地 Actor-bound Credential，或者经过正式 Federation Contract 验证的 External
Authentication Source。因此：

> **Credential 是 Local Actor Authentication 的重要 Capability，但不是所有
> Authentication 路径的 Universal Prerequisite。**

## 2 · Credential

Credential 是**与 ActorIdentity 相关联的长期 Authentication Capability**。它回答：

> **这个 Actor 可以通过什么受支持的能力证明自己？**

Credential 拥有独立 Lifecycle —— 当前 Contract 可以定义适用的 `create`、`rotate`、
`revoke`、`expire`。这些 Credential Lifecycle 不会自动改变 ActorIdentity：

```text
Credential rotation    ≠  ActorIdentity replacement
Credential revocation  ≠  ActorIdentity retirement
```

Credential 属于 Authentication 世界，它不是 Actor 本身。

## 3 · Authentication Evidence

Credential 与某一次 Authentication Attempt 实际使用的 Evidence 不是同一个东西：

```text
Credential              → long-lived authentication capability
Authentication Evidence → proof used for this authentication attempt
```

Evidence 通常只对当前 Request、当前 Challenge、当前 Transaction 或当前 Authentication
Flow 有 Meaning。因此：

```text
Credential
≠
Authentication Evidence
```

同样，Evidence 存在也不自动意味着验证已经成功。只有经过适用 Authentication Contract
验证以后，SoulAuth 才能建立 Authentication Result。

## 4 · Authentication Result

Authentication Result 表示 **SoulAuth 在当前 Authentication 中已经成立的事实**。它
首先是 **Runtime Fact**，不是默认 Public API Resource，也不是另一个持久化 Identity
Entity。

Authentication Result 可以支撑这些语义：被认证的 ActorIdentity；Authentication 建立
时间；使用的 Authentication Method 或 Composition；Assurance；Freshness；必要的
Authentication Context。

但这些是 **Authentication Fact Dimensions**，它们不会自动成为一个固定 JSON Schema 或
Public Resource Field。

### Authentication Result 不等于下游 Artifact

```text
Authentication Result  ≠  AuthSession
Authentication Result  ≠  Protocol Token
Authentication Result  ≠  Soulseed AuthContext
```

这些下游对象可以引用、携带或投影某些已经建立的 Authentication Facts，它们不是
Authentication Result 本身。

### Authentication Result 不保存 Raw Evidence

```text
Authentication Result
≠
Raw Evidence Container
```

Raw authentication evidence 或 secret material 不会因为 Authentication 成功，就自动
进入 Authentication Result、AuthSession、Claims 或 Audit。具体 secret protection 与
observability policy 由 [认证防护](../security/authentication-protection) 和
[审计](./audit) 定义。

## 5 · Method、Flow 与 Continuity 不是一回事

```text
Authentication Method
≠
Authentication Flow / Composition
≠
Authentication Continuity
```

这是本篇最重要的 Runtime Boundary 之一。

**Authentication Method** 回答"当前通过什么 Verification Mechanism 验证 Evidence"，
它描述的是 Evidence 怎样被验证。具体 Current Release 支持哪些 Method，由当前 Machine
Contract 与 [项目状态](../project/status) 决定；本篇不从 Architecture 自行创造
Method 列表。

**Authentication Flow / Composition** 回答"为了完成当前 Authentication，需要哪些
验证条件或步骤组合成立"。一个 Flow 可以要求一个 Method，另一个 Flow 可以要求多个
验证条件全部满足。因此：

```text
one successful method
≠
completed authentication by definition
```

只有当前 Flow 声明的全部必要条件成立以后，才能建立 Completed Authentication Result。

**Authentication Continuity** 回答"此前已经建立的 Authentication 是否可以在当前条件
下继续被信任和复用"。AuthSession 属于这一层：

```text
AuthSession reuse
≠
Authentication Method
```

它没有自动重新验证原始 Credential，它验证的是**既有 Authentication Continuity 当前
是否仍然有效**。

## 6 · Method、Assurance、Freshness 与 Authority 分开

```text
Method   Composition / Factor   Assurance   Freshness
```

它们不能互相推导：

```text
Authentication Method  ≠  Authentication Assurance
Number of Factors      ≠  Universal Assurance Level
```

一个 Flow 使用多个 Factor，并不自动获得某个标准化 Assurance Level，除非 SoulAuth
明确采用并满足对应 Assurance Contract。

### Freshness 不等于 Session Lifetime

```text
Authentication Freshness
≠
AuthSession Lifetime
```

一个 Session 仍然有效，只说明 Authentication Continuity Contract 还成立。它不自动
说明当前 Authentication 足够新鲜，可以满足任何高敏感 Operation。

### Assurance 不创造 Authority

```text
Higher Authentication Assurance
≠
Greater Authority
```

一个 Operation 可以要求更高 Assurance，但满足更强 Authentication Requirement 不会
自动创造新的 Permission 或 Governance Authority。Authentication 仍然只负责 Proof，
Authority 继续属于对应 Decision Domain。

## 7 · Actor Kind 不决定 Authentication Method

SoulAuth 的 Human 与 AIActor 共享 ActorIdentity Contract。但：

```text
Actor Kind
≠
Authentication Method
```

Human 和 AIActor 可以使用不同的受支持 Credential 与 Verification Method，也可能随着
Release 演进获得新的 Authentication Method。这不会创建新的 Actor Kind，也不会改变
ActorIdentity Ontology。

因此 Actor-native Authentication 的关键不是为 AIActor 建立第二套 Identity Model，
而是：

> **让不同 Actor 能够在同一个 ActorIdentity Contract 下使用适合自己的 Authentication
> Capability。**

## 8 · Local Credential-based Authentication

对于使用 SoulAuth 本地 Actor Credential 建立 Authentication 的 Flow，基本关系是：

```text
ActorIdentity
        ↓
Actor-bound Credential
        ↓
Current Authentication Evidence
        ↓
Applicable Verification
        ↓
Authentication Result
```

这里需要守住两条边界：

```text
Credential exists                         ≠  Authentication succeeded
Cryptographic or credential verification  ≠  Authority
```

如果一个 Declared Flow 需要多个 Authentication Condition，那么只有全部必要条件满足
以后，Authentication 才算完成。

### HumanAccount 不是 Authentication Subject

Human-facing identity input 可能经过 HumanAccount 相关的 resolution，但最终建立
Authentication 的 Subject 仍然是 **ActorIdentity**：

```text
HumanAccount
≠
Authentication Subject
```

HumanAccount 可以帮助 Human-specific account resolution，它不会因此变成新的
Canonical Identity Root。

## 9 · Federated Authentication Boundary

Federated Authentication 需要把 External Authentication Fact 和 SoulAuth Actor
Authentication 分开：

```text
Validated External Authentication
        ↓
External Identity Context
        ↓
IdentityBinding Resolution
        ↓
SoulAuth ActorIdentity
        ↓
Authentication Result
```

这里最重要的不是某个具体 OIDC Parameter，而是几个 Runtime Boundary。

### External Authentication 不等于 IdentityBinding

```text
External Authentication
≠
IdentityBinding
```

External Provider 验证的是 External Identity Domain 中的 Subject；IdentityBinding
负责这个 External Identity 与哪个 SoulAuth ActorIdentity 存在正式关系。两者不能
合并。

### External Identity 需要 Source Context

```text
External Subject String Alone
≠
External Identity
```

External Identity 必须在 Source / Issuer / Identity Domain 上下文中解释。相同裸
Subject String 不能被用来猜测 SoulAuth 身份。

### Binding Resolution 不能靠猜

只有在适用的 External Trust、Authentication Validation、IdentityBinding 与 Actor
eligibility 成立以后，才能建立 SoulAuth Authentication Result。如果 Binding 结果
歧义，不能建立 Actor Authentication；Wrong Binding 则属于 Identity Misattribution。

### External Assurance 不自动成为 Local Assurance

```text
External Assurance
≠
Automatically SoulAuth Assurance
```

如果 SoulAuth 接受 External Assurance Signal，必须由正式 Federation Profile 定义其
Mapping 和 Trust Scope。具体 Federation / OIDC Protocol Semantics 由
[OIDC 与 Client](./oidc-and-clients) 定义。

## 10 · Authentication Result 不被下游 Projection 重新定义

OIDC、Soulseed Integration 或其它 Consumer 可以需要 Authentication Facts。但：

```text
Protocol Projection
≠
Authentication Source of Truth
```

正确关系是：

```text
Authentication Result
        ↓  declared projection contract
Consumer-facing representation
```

下游可以选择、投影、验证并消费这些 Fact，它不能重新发明"这次 Authentication 究竟
什么时候发生、证明了什么、达到了什么 Assurance"。具体 OIDC Claims 由
[OIDC 与 Client](./oidc-and-clients) 定义，具体 AuthContext 由
[Soulseed 接入](../integrate/soulseed) 定义。

## 11 · AuthSession

AuthSession 是**由 SoulAuth 维护的、有界 Authentication Continuity**。它让某些 Flow
能够在 Session Contract 允许时复用此前已经建立的 Authentication。因此：

```text
Successful Authentication
≠
AuthSession required
```

某次 Authentication 成功，不意味着一定创建 Session —— 是否建立 AuthSession 属于当前
Flow Contract。

### AuthSession 的 Identity Anchor 是 ActorIdentity

AuthSession 持续的是某个 ActorIdentity 已经建立的 Authentication Continuity。它不会
把 HumanAccount、Client 或 External Subject 变成新的 Session identity root。

### AuthSession 不等于其它 Authentication / Authorization Artifact

```text
AuthSession  ≠  Credential
AuthSession  ≠  Protocol Token / Grant
AuthSession  ≠  Authority
```

SoulAuth AuthSession 也不等于 Application Session、External Provider Session 或
Mind / Connector / Execution Session。这些 Session Namespace 可以发生关系，但不能
互换。

## 12 · AuthSession Resource 与 Session Credential 分开

如果 Session Management 暴露一个 AuthSession Resource，它可能拥有 Resource
Identifier；而一个 Caller 继续 Session 可能需要 Session Credential。两者必须分开：

```text
AuthSession Resource ID
≠
Session Credential
```

一个值如果持有它本身就足以继续建立 Session-based Authentication，那么它拥有
Authentication Capability，必须被当作 Sensitive Credential 处理，而不是普通 Public
Identifier。因此：

```text
Session Resource Representation
≠
Session Credential Disclosure
```

一个 Session Management Resource 不能因为需要显示 Session 信息，就普通返回能够直接
接管该 Session 的 Raw Credential。

## 13 · Session Time 与 Authentication Time 分开

```text
Authentication Time
≠
Session Lifetime
```

Authentication Time 表示 Authentication Evidence 真正完成验证、建立 Authentication
Fact 的时间；Session Lifetime 表示 Continuity Contract 还能持续多久。

### Session Activity 不刷新 Authentication Time

```text
Session Activity
≠
Authentication Time Refresh
```

Session 持续被使用，不会把过去的 Authentication 自动变成"刚刚重新认证"。

### Session Renewal 不等于 Reauthentication

```text
Session Renewal
≠
Reauthentication
```

Session Contract 可以允许某种 continuity renewal，但只有真正重新提交并验证适用
Authentication Evidence，才能建立新的 Reauthentication Fact：

```text
Valid Session
≠
Fresh Authentication by definition
```

## 14 · Authentication Reuse 不等于 Authorization Reuse

Existing AuthSession 可以在适用 Policy 允许时，为新的 Flow 提供已有 Authentication
Context。但：

```text
Authentication Reuse  ≠  Authorization Reuse
Existing AuthSession  ≠  Automatic Authorization Success
```

新的 Protocol 或 Application Operation 仍然拥有自己的 Client context、Authority、
Policy、Resource、Freshness Requirement 与 Decision Context。AuthSession 只回答
**已有 Actor Authentication 是否可以复用**，它不会替新的 Authorization Decision
作出结论。

## 15 · Logout 与 Revocation Scope

"Logout"必须始终解释自己的 Scope。SoulAuth Local Session Logout 表示**终止声明
Scope 内的 SoulAuth Authentication Continuity**。它不自动意味着 Application 自己的
Session 已经终止、External IdP Session 已经终止，或所有 Access Token 已在所有
Resource Server 即时失效：

```text
SoulAuth Local Logout  ≠  Application Logout
Local Logout           ≠  Universal Token Revocation
```

具体 OIDC Logout Protocol 由 [OIDC 与 Client](./oidc-and-clients) 定义。

### Revocation Effect 与 Revocation Freshness 分开

**Revocation Effect** —— 一旦 AuthSession 已经进入 effective revoked state：

```text
Effective Revoked AuthSession
→
must not establish future session-based authentication
```

这是本篇拥有的 Runtime Semantic。

**Revocation Freshness** —— Revocation 什么时候被所有需要执行这个 Decision 的
Runtime Participant 观察到？这涉及 Replica、Cache、Security-state propagation 与
Infrastructure：

```text
Revocation Effect
≠
Revocation Freshness
```

本篇定义 Effect，具体 Propagation / Operations Contract 由安全与运维文档继续定义。

## 16 · 不同 Lifecycle 不会自动联动

Credential、IdentityBinding、ActorIdentity 与 AuthSession 拥有不同 Lifecycle：

```text
Credential Revocation       ≠  AuthSession Revocation
IdentityBinding Revocation  ≠  AuthSession Revocation
ActorIdentity Suspension    ≠  AuthSession Revocation
```

这些事件可以按照 Current Contract 触发关联 Security Policy，但**它们不是同一个 State
Transition**。所以不能因为 Credential 被撤销，就在没有 Contract 依据的情况下自动
声称所有 Session 和 Token 已经全局、即时失效，反过来同样不能。生命周期之间真正有哪些
Propagation Effect，必须由 Current Release Exact Contract 明确规定。

## 17 · Authentication Failure 必须保持 Stage Meaning

Public Error 为了 Enumeration Resistance 或安全原因，可以隐藏部分内部细节。但内部
Runtime 不能因此把不同 Failure Stage 揉成一个事实：

```text
No Identity Resolution
≠
Wrong Identity Resolution
```

后者可能是 **Identity Misattribution**，这和"没有找到 Actor"完全不是同一种 Security
Failure。因此：

> **Public Error Masking 不能反向抹掉内部 Runtime Semantics。**

Exact HTTP / Protocol Error Contract 由 [API 约定](./api-conventions) 和对应
Protocol Reference 定义。

### Required Authentication State 不可用时不能成功

如果当前 Authentication 依赖一个 Security-critical State，而该 State 无法被可靠
建立：

```text
Required Authentication State Unknown
≠
Authentication Success
```

SoulAuth 不能为了 Availability 把 Unknown 自动降级为 Satisfied。具体 Caller-facing
Failure 可以是 Authentication failure、temporary failure、unavailable 或其它由该
Surface 定义的 Error，但它不能虚构成功。

## 18 · Retry 与 Unknown Outcome

Authentication Runtime 继续服从 [API 约定](./api-conventions) 定义的基本 Retry
原则：

```text
Network Failure
≠
Operation Did Not Happen
```

例如某个 Operation 可能 consume one-time state → response lost → caller observes
timeout。此时 Caller 不能自动认为原 Operation 从未发生。因此：

```text
Retryable Transport Condition
≠
Safe Authentication Retry
```

一个 Authentication-sensitive Operation 是否能够重试，由该 Operation 自己的 Contract
定义。不能 Blind Retry。

## 19 · Authentication Result 与 Audit Event 分开

```text
Authentication Result
≠
Authentication Audit Event
```

Authentication Result 属于当前 Runtime Trust Decision；Audit Event 属于 Historical
Accountability。一次 Authentication Attempt 可以产生一个或多个 Audit / Security
Event，但 Audit Record 不是当前 Caller 用来证明自己身份的 Authentication Object。
Exact Audit Event 与 Attribution 由 [审计](./audit) 定义。

## 20 · Authentication & Sessions at a glance

| Boundary | Meaning |
| --- | --- |
| **Credential ≠ Evidence** | 长期 Capability 与当前 Attempt Proof 分离 |
| **Evidence ≠ Authentication Result** | 输入证明不等于已建立事实 |
| **Method ≠ Flow ≠ Continuity** | Verification、Composition 与 Session reuse 属于不同层 |
| **Authentication Result ≠ AuthSession** | 一次成立的 Fact 不等于长期 Continuity |
| **Assurance / Freshness ≠ Authority** | 更强或更新的 Authentication 不创造 Permission |
| **Actor Kind ≠ Authentication Method** | Human / AIActor 共享 Identity Model，不要求相同 Method |
| **AuthSession Resource ID ≠ Session Credential** | 管理 Reference 与接管 Capability 分开 |
| **Session Renewal ≠ Reauthentication** | Continuity 变化不会制造新的 Authentication Fact |
| **Authentication Reuse ≠ Authorization Reuse** | SSO 复用 Proof，不复用行动权 |
| **Logout ≠ Universal Token Revocation** | Session 终止不会无限扩大 Lifecycle Effect |
| **Revocation Effect ≠ Revocation Freshness** | Canonical effect 与传播可见性分开 |
| **Result ≠ Audit Event** | 当前 Runtime Fact 与历史记录分开 |

整篇最终可以压缩为：

```text
Authentication Source
        + Current Evidence / Assertion
        ↓
Validation
        ↓
Authentication Result
        ↓
Assurance / Freshness
        ↓
AuthSession, if established
```

每向下一层推进，都必须继续问：**上一层真正证明了什么？** 以及 **它没有证明什么？**

## Exact Contract Source

本篇定义 **Credential、Authentication Evidence、Authentication Result、Assurance /
Freshness 与 AuthSession 的 Human-readable Runtime Semantics**。

但 Exact Wire 不能由本篇自行创造。Authentication endpoint、Credential method name、
Evidence schema、Cookie / Header、Session resource field、Session state enum、Error
code、Challenge format、Cryptographic canonicalization —— 只有在当前 Published
Machine-readable Contract、Runtime 和 [项目状态](../project/status) 明确支持时，才
属于 Public Reference。

具体 OAuth / OIDC Token 与 Client Contract 继续由
[OIDC 与 Client](./oidc-and-clients) 负责；具体 Administration Operation 由
[管理](./administration) 负责；具体 Audit Shape 由 [审计](./audit) 负责。

## 下一步

到这里，我们已经知道：ActorIdentity 怎样通过 Authentication Source 和当前 Evidence
建立 Authentication Result；Authentication Result 与 Assurance / Freshness 怎样保持
边界；AuthSession 又怎样在不重新定义身份或 Authority 的情况下维持 bounded
Authentication Continuity。

下一份正式进入 [OIDC 与 Client](./oidc-and-clients)，它将回答：SoulAuth 怎样把这些
Identity / Authentication Facts 映射进 OAuth / OpenID Connect；Client 到底是什么；
`client_id`、Issuer、`sub`、ID Token、Access Token、Claims 和 Protocol Profile 之间
是什么关系。
