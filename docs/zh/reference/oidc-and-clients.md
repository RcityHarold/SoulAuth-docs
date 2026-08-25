# OIDC 与 Client

## SoulAuth 如何把 ActorIdentity 与 Authentication 映射进 OAuth / OpenID Connect

前面的参考已经回答两个更基础的问题。[Actor 与档案](./actors-and-profiles) 定义
Actor 是谁，以及 ActorIdentity 怎样持续存在；
[认证与会话](./authentication-and-sessions) 定义 Actor 怎样被 Authentication，以及
已经建立的 Authentication 怎样在有界条件下持续。

本篇不重新定义这些事实，它负责的是：

> **SoulAuth 怎样让 Client 通过 OAuth / OpenID Connect 参与标准 Protocol
> Transaction，并怎样把已经成立的 Identity / Authentication Facts 投影到对应
> Protocol Contract。**

```text
OAuth / OIDC
≠
SoulAuth Actor Ontology
```

OAuth / OIDC 拥有自己的 Protocol Semantics，SoulAuth 保持自己的 Actor-native
Identity Semantics。两者通过明确 Mapping 连接，而不是互相改写。

## 1 · Client 是 Protocol Participant，不是 Actor

OAuth Client 首先是**参与 OAuth Protocol 的软件实体**。它回答"哪个软件正在参与当前
Protocol Transaction"，ActorIdentity 回答"当前 Identity Subject 是谁"。因此：

```text
Client
≠
Actor
```

同一个 Actor 可以通过不同 Client 参与 Protocol；同一个 Client 也可以服务多个 Actor。
两者不构成一对一 Identity 关系。

### OAuth `client_id` 不是 Actor Identifier

```text
OAuth `client_id`  ≠  ActorIdentity Resource ID
OAuth `client_id`  ≠  Internal Client Resource ID by definition
```

即使某个实现中两个 Value 碰巧相同，Consumer 也不能在没有正式 Contract 的情况下把这种
相等解释为长期 Namespace Equivalence。

### Client Authentication 不等于 Actor Authentication

Client Authentication 证明**当前 Protocol Caller 满足了哪个 Client 的 Authentication
Contract**；Actor Authentication 证明**当前被认证的 Actor 是谁**。

```text
Client Authentication
≠
Actor Authentication
```

一个 Confidential Client 成功完成 Client Authentication，不会因此产生 Actor
Authentication Result；同样，Actor 成功 Authentication，也不会自动证明当前 Client
已经满足自己的 Client Authentication Requirement。

## 2 · Client Protocol Contract 有多个独立维度

Client 不能被压成一个 `client_id + secret` 对象。至少需要区分：

| Dimension | 回答的问题 |
| --- | --- |
| **Protocol Registration / Identifier** | 哪个 Client 正在参与 Protocol？ |
| **Confidentiality Classification** | 这个 Client 在当前 Profile 下能否可靠保管 Client Authentication Material？ |
| **Integration Profile** | 这个 Client 位于什么 Application Architecture 中？ |
| **Protocol Capabilities** | 当前 Declared Profile 允许它怎样参与 Protocol？ |

这些维度彼此相关，但不能相互替代。

### Public / Confidential 不是 Actor Kind

OAuth 中的 Public / Confidential 是 **Client confidentiality classification**，它不
描述 Actor：

```text
Public Client        ≠  AIActor
Confidential Client  ≠  Human
Confidential Client  ≠  Trusted or benign by definition
```

它只描述当前 Client Authentication assumptions。

### Client Confidentiality 与 Integration Architecture 分离

Browser、Native、BFF 或 server-side application 描述的是 Application / Integration
Architecture：

```text
Public / Confidential
≠
Browser / Native / BFF
```

例如在某些 BFF Architecture 中，Browser 本身可能不直接承担 OAuth Client Credential
Custody，而后端 Component 承担 Client Role。具体哪些 Integration Profile 属于当前
Supported Surface，由接入文档与 [项目状态](../project/status) 定义。

### Client Authentication Material 不是 Actor Credential

```text
Client Authentication Material
≠
Actor Credential
```

前者证明 Client，后者参与建立 Actor Authentication。它们拥有不同 Subject、
Lifecycle、Security Boundary 与 Audit Meaning。因此 Client authentication material
发生 rotation 或 revocation，不自动意味着 Actor Credential 发生了任何变化。

## 3 · Authorization Request 包含多个独立前提

一个 OAuth / OIDC Authorization Request 不能被压缩成"Client 是合法的，所以请求
成功"。它至少涉及：

```text
Client Protocol Context
+ Applicable Actor Authentication
+ OAuth Authorization / Grant Semantics
```

因此：

```text
Valid Client         ≠  Valid Authorization Request
Valid AuthSession    ≠  Authorization Success
Authenticated Actor  ≠  OAuth Authorization Grant
```

每一层都需要满足自己的 Contract。

### 接受 Parameter 不等于执行 Parameter 语义

```text
Parameter Accepted
≠
Parameter Semantics Enforced
```

如果一个 Server 接受某个 Parameter，却静默忽略它的 Security Meaning，Client 可能基于
错误前提建立 Trust。因此：

> **一个被 Declared Profile 声称支持的 Security-relevant Parameter，必须真正执行它
> 声明的 Protocol Semantics。**

具体当前 Release 接受哪些 Authorization Parameter，由 Current Declared Profile 定义。

### `state`、`nonce` 与 AuthSession 不是同一个对象

```text
state  ≠  nonce  ≠  AuthSession identifier
```

它们的 Exact Generation、Return、Validation 与 Applicability 仍然服从相应 External
Specification 和 SoulAuth Declared Profile。本篇不会把它们重新定义成 SoulAuth
Identity Object。

## 4 · Existing AuthSession 只能复用 Authentication

一个已有 AuthSession 可以在适用 Protocol 和 Policy 允许时，为新的 Authorization
Transaction 提供已经建立的 Actor Authentication Context。但：

```text
Authentication Reuse  ≠  Authorization Reuse
Existing AuthSession  ≠  Automatic Authorization Success
```

AuthSession 可以回答"是否需要重新建立 Actor Authentication"，它不会回答"当前 Client
是否有资格完成整个 Authorization Transaction"。新的 Transaction 仍然拥有自己的
Client、Protocol、Scope、Security 和 Authorization Context。

### SSO 不产生 Cross-client Permission

```text
SSO
≠
Cross-client Permission Reuse
```

Client A 曾经完成一个 Authorization Flow，不会自动给 Client B 产生 Scope、Grant、
Permission 或 Application Authority。SSO 复用的是 Authentication，不是 Client
Authorization。

## 5 · Authorization Transaction 的三个时间层

```text
T_auth       Authentication established
T_authorize  OAuth authorization facts established
T_issue      Protocol artifact issued
```

```text
Authentication Time  ≠  Authorization Time  ≠  Token Issuance Time
```

这三个时间点可以接近，但它们的 Meaning 不同。

**Authentication-time Facts** 属于上游已经建立的 Authentication：ActorIdentity、
Authentication Time、Method / Composition、Assurance / Freshness。这些事实不能在
之后的 Token Issuance 阶段被重新发明。

**Authorization-time Facts** 属于当前 OAuth Transaction：Client Context、Redirect
Context、Request Context、Granted Scope、Applicable transaction protection、Actor
resolution、OAuth authorization result。这些 Fact 定义**当前 Transaction 到底是
什么**。

**Issuance-time Projection** 在新的 Protocol Artifact 真正签发时，可以根据当前
Declared Claim / Token Projection Contract 投影适用的 non-core data。但：

```text
Issuance-time projection
≠
Permission to rewrite authentication or authorization history
```

## 6 · Historical Transaction Fact 不被 Current State 重写

一个已经成立的 Authorization Transaction，不能因为 Current Profile、Current Client
Configuration 或 Current IdentityBinding 后来发生变化，就被重新解释成另一个
Transaction：

```text
Current Client Configuration
≠
Historical Authorization Transaction
```

### Actor Resolution 不能在后续 Exchange 中换成另一个 Actor

这是 SoulAuth Actor-native Identity 进入 OAuth 世界以后非常重要的边界。假设
Authorization-time Actor Resolution 已经确定：

```text
External Identity → ActorIdentity A
```

并建立了某个 outstanding transaction artifact。后来 IdentityBinding 发生变化，后续
Continuation 可以根据 Current Security Eligibility **拒绝**这次 Transaction，但不能
把原本属于 Actor A 的 Transaction 重新解释成 Actor B，然后继续成功：

```text
Authorization-time Actor Resolution
≠
Re-resolved into another Actor from current binding state
```

这是 **Historical Fact 与 Current Eligibility 分离**。

## 7 · Transaction Facts、Current Eligibility 与 Projection State

**Transaction-defining Facts** —— 一旦当前 Transaction 已经成立，后续阶段不能偷偷
重新解释它们：Client、Actor Resolution、Authentication Time、Granted Scope、
transaction protection context。

**Current Security Eligibility** —— 后续 Protocol Continuation 仍然可以重新判断：
当前 Artifact 是否过期；是否已经消费；当前 Client 是否仍 eligible；Actor lifecycle
是否允许；当前 security state 是否要求拒绝。这些检查可以产生 **Reject**，不能产生
**Rewrite History**。

**Issuance Projection State** —— 新的 Artifact 可以按照 Declared Projection Policy
使用当前允许的 non-core data。某些 presentation data 可以发生变化，但 Current
presentation 不会改变历史 ActorIdentity、Authentication Time 或 Granted Scope。

这一三分法，是本篇最重要的 Protocol Runtime Boundary 之一。

## 8 · Authorization Code

当 Declared Profile 使用 Authorization Code 时，它表示**一个短生命周期、
transaction-bound 的 Protocol Continuation Artifact**：

```text
Authorization Code  ≠  AuthSession
Authorization Code  ≠  Token
Authorization Code  ≠  Actor Credential
```

Code 延续的是 Authorization Transaction，不是 Authentication Session。

### Code 必须保持 Transaction Binding

Authorization Code 需要保持与其 Transaction Meaning 相关的绑定，可以包括适用的
Client、Redirect Context、transaction protection、Actor Resolution、granted
authorization context、Authentication Facts、lifetime / consumption semantics。

这些是 **Semantic Relations**，不意味着 Runtime 必须以同名 Field 持久化它们。

### Code consumption 与 Network Outcome 分开

对于 Declared one-time code semantics：

```text
first valid exchange  → consumed
subsequent reuse      → rejected
```

同时：

```text
Network Failure
≠
Authorization Code Was Not Consumed
```

如果 Server 已经完成 State Transition，但 Response 丢失，Client 不能根据 Timeout
自动推导 Code 仍然可用。

## 9 · PKCE 属于 Authorization Transaction Protection

PKCE 不会定义 ActorIdentity，它保护的是 Authorization Transaction 中 Code 与合法
Protocol Continuation 之间的关系：

```text
PKCE
≠
Actor Authentication Method
```

同样，Client 提交一个 PKCE-related Parameter，不意味着 SoulAuth 可以只接受字段然后
不执行其 Security Semantics。

当前 Release 哪些 Authorization Code Profile 要求 PKCE、支持哪些 method、Exact
request / validation / error semantics，必须由 Current Declared Profile、Machine
Contract 与 [项目状态](../project/status) 共同证明。本篇不会从 Semantic Master 自行
补齐这些答案。

## 10 · Token Endpoint 延续 Protocol Transaction，不重新 Login Actor

Token Endpoint 处理已经建立的 OAuth / OIDC Protocol Continuation 怎样转换成对应
Token Artifact。因此：

```text
Token Endpoint Client Authentication  ≠  Actor Authentication
Authorization Code Exchange           ≠  New Actor Authentication
```

Actor Authentication 已经在上游建立。Token Endpoint 验证的是当前 Protocol
Continuation 是否仍满足 Declared Contract 以及 Current Security Eligibility。

### Browser AuthSession 不是所有 Token Exchange 的 Universal Requirement

```text
Browser AuthSession Present
≠
Universal Token Exchange Requirement
```

Token Exchange 由其自己的 Protocol Contract 决定。如果某项 Actor / Session Security
Event 需要使 Outstanding Transaction 失效，应通过明确 Lifecycle / Eligibility
Contract 表达，不应依赖某个 Browser Cookie 是否碰巧存在。

## 11 · Protocol Artifact 不自动成为 Administrative Resource

Authorization Code、ID Token、Access Token 以及 Declared Profile 中的其它 Token
Artifact 属于 Protocol Layer：

```text
Protocol Artifact  ≠  Automatically Administrative Resource
Wire Artifact      ≠  Server-side State
```

Server 内部保存某种 Protocol State，不意味着 SoulAuth 必须提供对应 Raw Artifact
CRUD API。这两层拥有不同 Security 和 Lifecycle Contract。

## 12 · ID Token

ID Token 负责**按照 OIDC Contract 向 Client / Relying Party 表达 Authentication
Projection**：

```text
ID Token  ≠  Access Token
ID Token  ≠  ActorIdentity Resource
```

### ID Token Issuance Time 不等于 Authentication Time

```text
Token Issuance Time
≠
Authentication Time
```

一个 ID Token 今天签发，不意味着 Actor 刚刚在同一时刻重新 Authentication。
Authentication-related Claims 必须忠实反映上游真正建立的 Authentication Facts。

### OIDC `sub` 不是 ActorIdentity Resource ID

```text
OIDC `sub`
≠
ActorIdentity Resource ID
```

OIDC Subject 的 Exact Namespace / Mapping 由 Current Declared Subject Policy 定义。
如果不同 Client Context 使用不同 Subject Projection，ActorIdentity 仍然可以保持同一个
Actor。协议 Projection 不会反向重新定义 ActorIdentity。

### OIDC `sub` 不自动等于 Access-token Subject

```text
OIDC `sub`
≠
Access-token Subject by definition
```

ID Token / UserInfo 中的 Subject 服务 OIDC Client / RP Contract；Access Token 中的
Subject 如果存在，则服务 Resource / Access Token Contract。二者可以来自同一个
ActorIdentity，但 Wire Identifier 是否相同必须由各自 Profile 明确声明。

### Issued ID Token 不是 Live Profile View

```text
Issued ID Token
≠
Live Profile View
```

一旦 ID Token 已经签发，它的 Claims 不会因为 Current Profile 后来变化而自动重写。
新的 Protocol Artifact 是否可以投影新的 non-core presentation data，由 Declared
Claim Projection Policy 决定。

## 13 · Access Token

Access Token 负责 **Resource Access**。它不是 ID Token、ActorIdentity Resource、
Universal Actor Credential 或 Universal Authority：

```text
Access Token  ≠  ID Token
Access Token  ≠  JWT by definition
```

Access Token 的真实 Representation 必须由 Current Declared Access Token Profile
准确说明 —— 不能从 OAuth 这个词本身推导 JWT。

### Access Token Profile 必须定义自己的 Subject Contract

Access Token 可能表达 Actor-bearing context、Client-only context，或其它由 Declared
Profile 定义的 resource subject model。因此必须长期保持：

```text
Client-only Token  ≠  Actor Authentication Context
OAuth `client_id`  ≠  Access-token Actor Subject
```

一个 Resource Server 不能通过 `actor = client_id` 之类的隐式转换，把 Software Client
升级成 ActorIdentity。当前 Release 到底支持哪一种 Access Token Subject Model，必须由
Exact Profile 与 [项目状态](../project/status) 确认。

### OIDC Subject 与 Resource Subject 分离

```text
ActorIdentity
   ├─ OIDC Subject Projection
   └─ Resource Subject Projection
```

```text
OIDC Subject Projection
≠
Resource Subject Projection
```

它们可以映射自同一个 ActorIdentity，但不自动要求相同 Wire Identifier。Soulseed
AuthContext Projection 属于 [Soulseed 接入](../integrate/soulseed)，不由本篇重新
定义。

### Audience / Resource 与 OAuth `scope` 分离

Audience / Resource 回答"这个 Access Token 是为哪个 Resource Consumer 签发"；OAuth
`scope` 回答"该 Grant / Token 在适用 Resource Context 下声明什么有界能力范围"。因此：

```text
OAuth `scope`
≠
Audience / Resource
```

一个 Token 拥有 `scope = read`，不会因为另一个 Resource 也理解字符串 `read`，就自动
对那个 Resource 有效。

### Granted `scope` 不等于最终 Authorization

```text
Granted OAuth `scope`
≠
Final Resource Authorization Decision
```

Resource Server 仍然需要结合 Token Contract、Audience / Resource、applicable
`scope`、current resource policy 及其它 current decision context，形成自己的
Authorization Decision。OAuth `scope` 不是 Universal Actor Authority。

## 14 · Refresh Token

Refresh Token 只在 Declared Profile 包含相应 continuation capability 时具有 Protocol
Meaning，它服务的是 **Token / Grant Continuation**：

```text
Refresh Token  ≠  Access Token
Refresh Token  ≠  AuthSession
Refresh Token  ≠  Authorization Code
```

### Refresh 不等于 Reauthentication

```text
Refresh Token Exchange
≠
Actor Reauthentication
```

Client 使用 Refresh Token，不意味着 Actor 重新提交了 Authentication Evidence。因此：

```text
Authentication Time  ≠  Refresh Time  ≠  New Token Issuance Time
```

新的 Token 可以拥有新的 issuance time，它不能因此伪造新的 Authentication Time。

### Refresh Wire Artifact 与 Server State 分离

```text
Refresh Token Wire Artifact
≠
Server-side Continuation State
```

SoulAuth 内部如何保存、轮换或验证 continuation state 属于 Implementation 与 Security
Contract，它不会因为内部存在 state，就自动产生一个 Raw Refresh Token Administrative
Resource。当前 Release 是否发行 Refresh Token 以及 Exact Rotation / Reuse
Semantics，必须由 Current Declared Profile 和 [项目状态](../project/status) 确认。

## 15 · Scopes、Claims 与 Claim Projection

OIDC Claim 不是 Actor Resource JSON：

```text
OIDC Claims           ≠  Actor Resource Serialization
Profile Field Exists  ≠  Automatically Released Claim
```

Stored Actor / HumanAccount / Profile / IdentityBinding Data 不会因为存在就自动成为
OIDC Claim。

### Requested `scope` 不等于 Guaranteed Claim Set

```text
Requested `scope`  ≠  Granted `scope`  ≠  Guaranteed Claim Set
```

Claim Release 需要服从 Declared Claim Projection Contract，概念上可以由 protocol
requirements、established authentication facts、permitted actor/account data、client
policy 与 privacy policy 共同约束。但本篇不会把这一关系压成一个 Universal Claim
Formula —— Exact Claim Set 属于 Current Declared OIDC Profile。

### Claim 是 Purpose-bound Projection

Claims 表达当前 Protocol Consumer 被允许依赖的有界 Facts，它不是整个 Actor Aggregate
的数据库复制：

```text
Claim Projection
≠
Data Dump
```

## 16 · UserInfo

当 Declared Profile 包含 UserInfo 时，它承担**受保护的 OIDC Claim Projection**：

```text
UserInfo  ≠  Actor Administrative API
UserInfo  ≠  Profile Resource Dump
```

### UserInfo Access Token 不是 Universal SoulAuth API Token

```text
UserInfo Access Token
≠
Universal SoulAuth API Token
```

能够访问 UserInfo，不意味着同一个 Token 可以访问任意 SoulAuth Application /
Administrative Surface。它仍然服从自己的 Resource / Audience / `scope` / Token
Profile。

### UserInfo Subject 保持 OIDC Subject Contract

在同一个 OIDC Subject Context 中，ID Token 与 UserInfo 不能一个使用 pairwise /
declared OIDC subject，另一个突然泄漏 ActorIdentity Resource ID：

```text
UserInfo `sub` = declared OIDC subject for that subject context
```

这里的等号表示 Subject Contract 必须一致，不是说所有 Token 和所有 Resource 都使用
相同 Identifier。

## 17 · Metadata 是 Machine-readable Capability Claim

Protocol Metadata 不是普通 Documentation Decoration，它向 Client 声明**当前这个
Deployment 实际提供什么 Protocol Capability**。因此：

> **Metadata advertising 不能超过真实 Implemented、Supported 与 Evidenced Surface。**

不能写成 `Advertised = Implemented = Supported = Tested`，因为这些是不同状态。更准确
的原则是：

> **一项被 Advertise 的 Capability，必须处于当前正式 Support Scope 中，并且与真实
> Runtime 和适用 Evidence 一致。**

这是 [标准与符合性](../security/standards-and-conformance) 定义的 Conformance Claim
Constitution 在本篇中的直接落地。

### Internal Capability 不等于 Protocol Capability

SoulAuth 内部可以通过 Control Plane 创建 Client，并不自动意味着 SoulAuth 实现了
标准化 Dynamic Client Registration Protocol：

```text
Internal Capability
≠
Corresponding Protocol Extension
```

Metadata 不能因为内部存在相似动作，就广告一个并未正式实现的标准 Endpoint。

## 18 · JWKS

JWKS 提供 **Declared Protocol Signing / Verification Profile 所需要的 Public
Verification Material**：

```text
JWKS
≠
SoulAuth Key Store
```

它不会暴露 Private Signing Key、Credential Protection Key、Audit Integrity Key 或
其它不属于当前 Protocol Verification Purpose 的 Key Material。

### `kid` 不是 Global Trust Anchor

```text
`kid`  ≠  Global Key Identity
`kid`  ≠  Trust Anchor by itself
```

Consumer 对某个 Signing Key 建立 Trust，需要结合 Trusted Issuer、Declared Metadata /
JWKS relationship、algorithm policy 与 applicable verification contract。仅有一个
`kid` 字符串，不能在任意 Source 中查找 Key 并自动建立 Trust。

### JWK 不拥有 Algorithm Policy

```text
JWK metadata
≠
Protocol algorithm policy
```

Key Material 可以声明某些属性，真正允许哪些 Algorithm 由 Declared Protocol Profile
决定。

## 19 · Logout

OIDC Protocol Logout 与 SoulAuth Local Session Lifecycle 是两个不同 Contract：

```text
OIDC Protocol Logout  ≠  SoulAuth Local Logout
Logout                ≠  Universal Access Token Revocation
```

一个 Protocol Logout Operation 不能未经 Token Contract 扩大成所有 Token 在所有
Resource Server 即时失效。具体 Current Logout Profile、Parameter、Redirect 与 Session
Scope，必须由 Declared Profile 与 [项目状态](../project/status) 确认。

## 20 · Protocol Errors

OAuth / OIDC Endpoint 保持自己的 Protocol Error Contract：

```text
Protocol Error
≠
Generic SoulAuth API Error
```

[API 约定](./api-conventions) 定义 SoulAuth-owned HTTP Common Grammar，它不会重新
命名 External Protocol 规定的错误语义。

### Redirect Context 必须先可信

如果 Authorization / Logout 等 Flow 需要通过 Redirect 返回 Protocol Result 或 Error，
Destination 本身必须先满足当前 Client 与 Redirect Contract：

```text
Untrusted Redirect
→
do not send sensitive protocol response there
```

尤其：

```text
`state` present
≠
Redirect trusted
```

Caller 提供一个 `state` 值，不会把未经验证的 URI 变成可信 Destination。

## 21 · Current Client Configuration 不重写 Historical Transaction

Client Configuration 可以变化，但：

```text
Current Client Configuration
≠
Historical Authorization Transaction
```

今天更新 Client，不会重新解释昨天已经成立的 Client、Redirect、Actor Resolution 或
Granted Scope。同样：

```text
Lifecycle Effect
≠
Propagation Freshness
```

某个 Client lifecycle change 如果需要影响新的 Authorization、Outstanding Transaction
或 Token Continuation，其 Effect 和 Runtime Observation Freshness 必须由 Current
Exact Contract 分别说明，不能未经实现证明承诺所有 Artifact 在所有 Consumer 中瞬时
失效。

## 22 · OIDC & Clients at a glance

| Boundary | Meaning |
| --- | --- |
| **Client ≠ Actor** | software protocol participant 不是 ActorIdentity |
| **Client Authentication ≠ Actor Authentication** | Client proof 与 Actor proof 分离 |
| **OAuth Authorization ≠ Application / Soulseed Authority** | Protocol authorization 不是 Universal 行动权 |
| **Valid AuthSession ≠ Authorization Success** | Authentication reuse 不会完成整个 Transaction |
| **Parameter accepted ≠ semantics enforced** | Supported security parameter 必须真正执行 |
| **Authentication Time ≠ Authorization Time ≠ Issuance Time** | 三个不同事实层 |
| **Historical Transaction ≠ Current Mutable State** | 当前 Binding / Profile / Client config 不能重写过去 |
| **Authorization Code ≠ AuthSession / Token** | transaction continuation 与 session / token 分离 |
| **OIDC `sub` ≠ ActorIdentity Resource ID** | protocol subject 与 resource identifier 分离 |
| **OIDC Subject ≠ Access-token Subject by definition** | 两个 Consumer Domain 拥有独立 subject contract |
| **ID Token ≠ Access Token** | authentication projection 与 resource access artifact 分离 |
| **`scope` ≠ Audience / Resource ≠ Final Authorization** | capability vocabulary、target 和 decision 分离 |
| **Claims ≠ Actor Resource Serialization** | claims 是 purpose-bound projection |
| **Metadata advertising ≤ real supported capability** | Machine-readable metadata 必须说真话 |
| **Wire Artifact ≠ Server State** | protocol representation 与 internal persistence 分离 |

把整篇继续压缩：

```text
Actor Authentication
        + Client Protocol Context
        ↓
Authorization Transaction
        ↓
Protocol Continuation / Artifact
        ↓
Declared Subject / Claim / Resource Projection
        ↓
Consumer trusts only its declared contract
```

OAuth / OIDC 的作用是**建立 Interoperability**，不是重新定义 ActorIdentity。

## Exact Contract Source

本篇定义 **Client、Authorization Transaction、OIDC Subject、Token Purpose、Scope /
Audience / Claims、Metadata、JWKS、Logout 与 Protocol Error 的 Human-readable
Protocol Semantics**。

但 External OAuth / OIDC Normative Semantics 继续由对应 External Specification 拥有；
SoulAuth 到底选择其中哪些行为，由 **Declared SoulAuth Profile** 定义；当前 Release
到底正式 Support 哪些 Profile / Feature，由 [项目状态](../project/status) 发布；
机器可读的 Protocol Metadata 与相关 Wire Surface 必须与 Runtime 和 Declared Profile
一致。因此：

> **External Standard 存在一个 Feature，不意味着 SoulAuth 支持它。**
>
> **Semantic Model 允许一种 Profile，不意味着 Current Release 已经实现它。**

## 下一步

到这里，我们已经知道：Client 如何与 Actor 保持分离；已有 Authentication 怎样进入
OAuth / OIDC Transaction；Authorization Transaction 怎样保持自己的历史 Fact；OIDC
Subject、Access-token Subject、Scope、Audience 与 Claims 怎样分别保持 Namespace 和
Purpose Boundary；Metadata 为什么必须准确反映真实 Capability。

下一份正式进入 [管理](./administration)，它将回答：SoulAuth 自己的 Control Plane
怎样定义 Administrative Principal、Role、Permission、Assignment 与受控 Mutation，
以及 Administrator 究竟能够改变什么，又绝不能绕过什么。
