# Actor 与档案

## SoulAuth 中谁存在，哪些信息描述它，以及身份怎样持续

SoulAuth 的 Authentication 最终都必须回到一个基础问题：

> **当前被认证的 Actor 是谁？**

在 SoulAuth 中，这个问题由 **ActorIdentity** 回答。

`HumanAccount`、`Profile` 和 `IdentityBinding` 可以围绕 ActorIdentity 建立不同关系，
也拥有各自的职责和生命周期。但：

```text
ActorIdentity  ≠  HumanAccount  ≠  Profile  ≠  IdentityBinding
```

它们不能通过普通变化重新定义**这个 Actor 是谁**。

Credential 与 Client 同样不是 ActorIdentity，但它们的 Exact Contract 分别由
[认证与会话](./authentication-and-sessions) 和 [OIDC 与 Client](./oidc-and-clients)
定义。这一篇只负责 ActorIdentity 及其直接 Identity Resource 边界。

## 1 · ActorIdentity

### ActorIdentity 是 SoulAuth Identity Domain 的身份锚点

ActorIdentity 代表**一个 Actor 在 SoulAuth Identity Domain 中持续存在的身份**。它为
Authentication、IdentityBinding、historical attribution 以及其它需要引用 Actor 的
Domain 提供稳定的 Identity Anchor。因此：

```text
ActorIdentity  ≠  HumanAccount
ActorIdentity  ≠  Profile
ActorIdentity  ≠  Credential
ActorIdentity  ≠  Client
```

这些对象可以与 ActorIdentity 发生关系，它们不会因此成为 ActorIdentity 本身。

### ActorIdentity 的 Authority Scope 属于 SoulAuth Identity Domain

SoulAuth ActorIdentity 不是一个天然跨越所有 Identity System 的 Universal Global
Identity：

```text
SoulAuth ActorIdentity
≠
Universal Global Identity
```

其它 Identity Domain 可以拥有自己的 Subject 或 Identity Reference。如果 SoulAuth
需要与另一个 Domain 建立身份关系，必须通过明确、typed、受控的 relation 完成。不能
因为 Identifier 字符串相同、Email 相同或 Display Name 相同，就自动得出两边代表同一个
Identity。

### Human 与 AIActor 共享 ActorIdentity Contract

SoulAuth 的 Canonical Actor Kind 包括：

```text
Human
AIActor
```

两者都可以拥有完整 ActorIdentity。AIActor 不需要通过 HumanAccount、fake email 或
OAuth Client 身份才能成为 SoulAuth 中的 Actor。但：

```text
Same first-class ActorIdentity standing
≠ Same Credential
≠ Same extension
≠ Same authority
```

ActorIdentity standing 相同，不要求其它 Domain 完全相同。

### Actor Kind 属于 Identity Core

Actor Kind 不是 Profile 中的 presentation label：

```text
Actor Kind      ≠  Profile Attribute
Profile Update  ≠  Actor Kind Change
```

在同一个 ActorIdentity lifecycle 中，**ordinary resource mutation 不能改变 Actor
Kind**。Actor Kind 的 Exact Wire Representation 由当前 Machine-readable Resource
Contract 定义；本篇不从 Canonical Semantics 自行推导字段名或 Enum 值。

## 2 · ActorIdentity Reference 与 Identity Continuity

### ActorIdentity Resource ID

ActorIdentity Resource ID 用于**在 SoulAuth Resource Contract 中引用一个
ActorIdentity**。它属于 SoulAuth 自己的 Resource Namespace，不是 Universal Global
ID，也不能自动与其它 Protocol Identifier 合并。尤其：

```text
ActorIdentity Resource ID
≠
OIDC `sub`
```

OIDC Subject Policy 属于 [OIDC 与 Client](./oidc-and-clients)。本篇只守住 Namespace
Boundary。

### Identity Continuity

ActorIdentity 需要保持这样的长期语义：Credential、Profile、Session 或其它外围状态
正常变化时，同一个 Actor 不会静默变成另一个 Actor。

```text
Credential change   ≠  Actor replacement
Profile change      ≠  Actor replacement
AuthSession change  ≠  Actor replacement
```

这里真正稳定的是 **Identity Continuity**。

### Stable Subject Foundation 是语义基础，不自动是 API 字段

SoulAuth 需要一种稳定的 Identity Continuity foundation。但：

```text
Stable Subject Foundation  ≠  Automatically Public Identifier
Stable Subject Foundation  ≠  Automatically Public Resource Field
Stable Subject Foundation  ≠  Automatically Database Key
```

它首先是**支撑 Identity Continuity 的 Canonical Semantic Primitive**。如果 Runtime
将这一语义物化成某个内部 stable identifier，那么该 identifier 拥有自己的 Namespace
与 Lifecycle Contract。

本篇不会因为存在这项 Semantic Requirement，就自行公开类似这样的字段：

```json
{ "stable_subject_id": "..." }
```

### Stable Identity 不等于永久保留所有数据

Identity Continuity 要求长期保持：同一个 Actor 仍然能够被稳定解释；历史 Attribution
不会被后来出现的 Actor 重写；用于 Identity Continuity 的稳定标识不会在自己的
Namespace 中被错误重分配。但：

```text
Identity Continuity          ≠  Full Record Retention
Logical Identity Continuity  ≠  Physical Retention of Every Actor-related Field
```

Profile、PII、communication data 或其它非必要信息，可以服从独立 Privacy / Retention
Contract。

## 3 · HumanAccount

### HumanAccount 是 Human-specific extension

HumanAccount 只属于 Human-specific account concern：

```text
HumanAccount
≠
ActorIdentity
```

Human 可以在 ActorIdentity 之外拥有 HumanAccount，AIActor 不需要 HumanAccount：

```text
AIActor without HumanAccount = valid ActorIdentity
```

HumanAccount 不能重新成为一个隐藏的"真正 User 对象"，迫使所有 Actor 都适配 Human
Account Model。

### HumanAccount 不等于 Profile

HumanAccount 与 Profile 属于不同责任域。HumanAccount 面向 Human-specific account
concern；Profile 面向 **description / presentation**。

Exact HumanAccount Field、Locator、Communication Metadata 或其它 Resource Schema，
由当前 Machine-readable Contract 定义。本篇不会在没有真实 Schema 依据时自行创造
`email`、`username`、`phone`、`recovery_state` 等 Public Field。

### HumanAccount 不等于 Credential

```text
HumanAccount
≠
Credential
```

HumanAccount 可以与 Credential 存在关系，它不会因此成为 Password、Secret 或
Credential Store。Credential 的 Exact Lifecycle 与 Authentication Contract 由
[认证与会话](./authentication-and-sessions) 定义。

### Login / Communication Attribute 不等于 Identity

Human-facing account data 可能参与 Login、Communication、Verification、Recovery 与
Federation，但这不会把这些 Attribute 升级成 ActorIdentity：

```text
Login Locator                   ≠  ActorIdentity
Verified Communication Channel  ≠  Cross-domain IdentityBinding
```

相同 Email、Phone 或其它 Locator 不能单独证明两个 Identity Domain 中的主体是同一个
Actor。

## 4 · Profile

### Profile 负责描述，不负责定义身份

Profile 回答"这个 Actor 怎样被描述或展示"，而不是"这个 Actor 是谁"：

```text
Profile           ≠  ActorIdentity
Profile Mutation  ≠  Identity Mutation
```

Profile 可以变化，而 ActorIdentity 继续保持连续。

### Profile 存在不等于 Caller 可以读取

Resource 内部存在某个 Profile Data，不意味着所有知道 ActorIdentity ID 的 Caller 都
可以得到它。必须分开：

```text
Resource Existence  ≠  Dereferenceability  ≠  Read Authority
Stored Profile Data ≠  Caller-visible Representation
```

Caller 最终能看到哪些字段，由具体 Resource、Authority、Privacy 和 Projection
Contract 决定。

### Identifier knowledge 不产生 Read Authority

```text
Knowledge of ActorIdentity Resource ID
≠
Authority to read Actor data
```

一个 Caller 能够引用 Actor，不意味着它能够读取 HumanAccount、Profile、
IdentityBinding 或其它相关 State。这也是为什么 **typed reference 与 data disclosure
必须分开设计**。

### Profile 不产生 Authority

```text
Profile Data
≠
Authority by itself
```

一个 descriptive field 即使名字类似 `role`，也不能自动变成 SoulAuth Permission 或
Application Authority。Authority 由对应 Authorization / Administration Contract
定义。

### Profile Field 不自动成为 OIDC Claim

```text
Profile Field Exists       ≠  Automatically Released as OIDC Claim
HumanAccount Field Exists  ≠  Automatically Released as OIDC Claim
```

Claim selection、scope、client policy 与 privacy disclosure 由
[OIDC 与 Client](./oidc-and-clients) 定义。本篇只定义：Stored Resource Data 与
Protocol Projection 不是同一层。

### No Profile 不等于 No Actor

```text
No Profile         ≠  No Actor
Profile Lifecycle  ≠  ActorIdentity Lifecycle
```

ActorIdentity 不会因为 Profile 不存在、减少或被隐私最小化而自动消失。

## 5 · IdentityBinding

### IdentityBinding 是受控的 Cross-domain Relation

IdentityBinding 表达**两个明确 Identity Domain 之间的一条正式关系**。它不是 Actor，
也不是 Credential 或 Authentication Result：

```text
IdentityBinding  ≠  ActorIdentity
IdentityBinding  ≠  Credential
IdentityBinding  ≠  Authentication Result
```

### Binding 不等于 Universal Identity Equivalence

这是 IdentityBinding 最重要的边界：

```text
IdentityBinding
≠
Universal Identity Equivalence
```

一个 Binding 只在声明的 Source Domain、Purpose、Trust Contract 与 Applicable
Lifecycle Context 中具有 Meaning。它不能把 External Identity、SoulAuth
ActorIdentity 与另一个 domain identity 变成一个没有 Namespace 和 Context 差异的
Universal Identity。

### IdentityBinding 的核心 Semantic Dimensions

一个 IdentityBinding 至少需要能够表达以下语义：

```text
Source Identity Domain
Source Subject / Typed Reference
Target SoulAuth ActorIdentity
Binding Purpose
```

这些是 **Semantic Dimensions**，它们不声明 Machine Contract 中的 Exact Field Name。
Status、Provenance、Timestamp 或其它 Metadata 只有在当前真实 Resource Contract 定义
时才属于 Public Wire。

### Binding Purpose 属于 Relation Meaning

两个 Binding 即使拥有相似结构，也不意味着它们拥有相同的 Trust Meaning：

```text
Same Relation Shape
≠
Same Binding Purpose
```

Binding Purpose 必须让 Consumer 能够理解**这条 Relation 究竟被允许用于什么**，它
不能从 Object Shape 自行猜测。

### IdentityBinding 不建立 Source Trust

IdentityBinding 描述的是 Source Identity 和 SoulAuth ActorIdentity 之间存在什么
Relation，它不会自动证明 Source 本身可信：

```text
IdentityBinding
≠
Source Trust Establishment
```

External Source 或 Integration Source 的 Trust 由相应 Federation / Integration
Contract 建立。

### Binding 存在不等于 Authentication 成功

```text
IdentityBinding Exists
≠
Authentication Accepted
```

当前 Authentication 仍然必须根据自己的 Runtime Contract 验证：当前 Source 是否可信；
当前 Evidence 是否有效；当前 Relation 是否适用；当前 Actor 是否 Eligible。Binding
只是 Relation Fact，不是 Authentication Decision。

### External Identity 必须带 Source Context

一个裸 Subject String 不足以定义 External Identity：

```text
External Subject String Alone
≠
External Identity
```

Cross-domain Reference 至少必须能够确定**它属于哪个 Source Identity Domain**：

```text
same subject string across two identity sources
≠
same external identity by definition
```

## 6 · Binding Resolution

### No Binding、Wrong Binding 与 Ambiguous Binding 必须分开

| Situation | Meaning |
| --- | --- |
| **No Binding** | 声明的 cross-domain relation 没有建立 |
| **Wrong Binding** | Source Identity 被错误归因到另一个 ActorIdentity |
| **Ambiguous Binding** | 当前 resolution context 无法唯一确定适用 ActorIdentity |

```text
No Binding
≠
Wrong Binding
```

Wrong Binding 属于 **Identity Misattribution**，这是 Security-critical failure。

### Ambiguous Binding 不得通过猜测完成 Resolution

在一个明确的 Source + Purpose + Trust Contract + Resolution Context 中，Binding
Resolution 必须能够得到**至多一个适用的 ActorIdentity**。如果出现歧义：

```text
Ambiguous Binding
→
do not resolve ActorIdentity
```

不能选择"最可能的 Actor"，也不能依赖数据库刚好先返回了哪一行。具体 Uniqueness
Enforcement、Transaction 或 Concurrency Mechanism 属于 Implementation /
Administrative Contract。本篇只冻结：

> **Ambiguous identity relation 不能被降级成 Successful Actor Resolution。**

### Current Binding 不能重写历史 Attribution

IdentityBinding 可以随时间发生变化。但：

```text
Current Binding
≠
Historical Authentication Attribution
```

今天 Relation 改变，不会让昨天已经发生的 Authentication Event 突然属于另一个 Actor。
历史 Attribution 应该按照 **event-time identity resolution** 解释：

```text
Current Binding Change
≠
Historical Attribution Rewrite
```

### 改变 Binding Target 不是普通 Profile Update

一个改变 cross-domain identity attribution 的 Operation 不是普通 descriptive
mutation：

```text
Binding target change
≠
Profile update
```

任何支持的 Binding create、revoke 或 rebind Operation，都必须服从当前正式
Administration 与 Resource Contract。本篇不从语义层自行发明 Endpoint 或当前 Support
Status。

## 7 · Cross-domain Reference 不转移 Ownership

IdentityBinding 可以把 SoulAuth ActorIdentity 与另一个 Identity Domain 中的 typed
reference 连接起来。但：

```text
IdentityBinding
≠
Source-of-truth Ownership Transfer
```

保存一个 External Reference，不让 SoulAuth 获得定义另一个 Identity Domain 的权力；
同样，另一个系统保存 SoulAuth ActorIdentity Reference，不让它成为 SoulAuth Identity
Domain 的 Writer。

Soulseed-specific Canonical Actor Binding、AuthContext 与 Integration 行为由
[Soulseed 接入](../integrate/soulseed) 定义。本篇只保留 Generic IdentityBinding
Contract。

## 8 · ActorIdentity Lifecycle

ActorIdentity 不是一次 Create 以后永远没有状态变化的静态 Resource，它拥有自己的
Lifecycle。Canonical lifecycle semantics 包括：

```text
Suspend
Reactivate
Retire
```

这些词描述的是 ActorIdentity Lifecycle Meaning。当前 Release 是否通过哪个 Endpoint、
Method 或 Wire Enum 暴露这些 Transition，由 [管理](./administration)、
Machine-readable Contract 与 [项目状态](../project/status) 共同定义。

**Suspend** 表示 ActorIdentity 继续存在，但当前普通 Active participation 受到限制。
Suspension 不会创建一个新的 Actor。

**Reactivate** 表示同一个 ActorIdentity 重新满足适用的 Active eligibility 条件：

```text
Reactivation
≠
New Actor Creation
```

**Retire** 表示 ActorIdentity 退出普通 Active lifecycle，同时保留必要的 Identity
Continuity 与 Historical Attribution：

```text
Retirement
≠
Identity History Erasure
```

Retire 不会把过去变成"这个 Actor 从未存在"。

### Suspend 不等于 Retire

```text
Suspension
≠
Retirement
```

两者承担不同 Lifecycle Meaning。不能因为它们都会影响当前 Actor participation，就把
它们合并成一个 generic inactive state。

### Actor Lifecycle 不等于 Credential Status

```text
ActorIdentity Lifecycle
≠
Credential Lifecycle
```

Actor 被 Suspend，不自动意味着所有 Credential 已经被 Revoked；Credential 被
Revoked，也不自动意味着 ActorIdentity 已经 Retired。具体 cross-domain propagation
必须由相应 Exact Contract 定义 —— 本篇不从 Lifecycle Ontology 自行推导隐式联动。

### Actor Lifecycle 不产生 Authority

```text
Actor Active
≠
Actor Authorized for every operation
```

Lifecycle 表达 ActorIdentity 当前的 Identity eligibility state，Authority 属于另一个
Decision Domain。

## 9 · Lifecycle 与 Historical Identity

ActorIdentity lifecycle 改变当前 State，它不能重写已经发生的历史：

```text
Current Actor State
≠
Historical Actor Fact
```

Retire 以后，历史 Authentication、Binding 和 Audit 仍然必须能够稳定解释它们在 event
time 指向哪个 ActorIdentity。

### Data minimization 不等于 Identity history erasure

Privacy 或 Retention Contract 可能允许减少 Profile、communication data、PII 或其它
非必要 metadata。但：

```text
Data Minimization  ≠  Actor Never Existed
Actor Retired      ≠  All descriptive data must remain forever
```

真正必须保留的是**满足 Identity Continuity、non-reassignment 与 historical
attribution 所需的最小事实**，而不是完整 Actor Aggregate 永久保存。

## 10 · Visibility、Dereferenceability 与 Read Authority

ActorIdentity 存在，不意味着任何知道它 Identifier 的人都能读取完整 Actor Data。
必须保持：

```text
Visibility  ≠  Dereferenceability  ≠  Read Authority
```

- **Visibility** —— 某个 Identifier 或 Representation 是否会在某个 Surface 出现。
- **Dereferenceability** —— 某个 Reference 是否存在受支持的方法解析到 Resource 或
  Representation。
- **Read Authority** —— 当前 Principal 是否有权读取具体 Data。

```text
ActorIdentity ID knowledge
≠
Profile read authority
```

同一个 Actor 也可以在不同 Caller Context 中得到不同的 bounded representation。这不是
身份不稳定，而是 **Data Minimization 与 Least Privilege**。

## 11 · Identity Resource 不承载 Authentication Secret

```text
ActorIdentity Resource  ≠  Credential Resource
Profile                 ≠  Credential Store
IdentityBinding         ≠  External Credential Store
```

Actor、HumanAccount、Profile 与 Binding Resource 不应该被当成 raw authentication
secret transport。具体 Credential 和 Secret Contract 属于
[认证与会话](./authentication-and-sessions) 与
[认证防护](../security/authentication-protection)。

## 12 · Current Representation 不能重写 Historical Attribution

```text
Current Profile          ≠  Historical Attribution Source
Current IdentityBinding  ≠  Historical Authentication Attribution
```

例如一个 Actor 今天改变 Display Name，不能让昨天的 Audit Event 改成"由当前 Display
Name 定义的另一个人执行"；一个 Binding 今天改变，也不能重新解释昨天已经建立的 Actor
Resolution。

Historical Attribution 依赖 **event-time stable identity reference 与适用 Audit
Contract**。Exact Audit Representation 由 [审计](./audit) 定义。

## 13 · 本篇拥有的 Resources

| Resource / Concept | 本篇负责的核心语义 | 不是什么 |
| --- | --- | --- |
| **ActorIdentity** | SoulAuth Identity Domain 中的持续 Actor identity anchor | HumanAccount、Profile、Credential 或 Client |
| **HumanAccount** | Human-specific account extension | ActorIdentity 或 Credential |
| **Profile** | Actor description / presentation | Identity anchor 或 Authority source |
| **IdentityBinding** | scoped、purpose-bound cross-domain identity relation | Actor、Authentication Result 或 Universal Identity Equivalence |
| **ActorIdentity Lifecycle** | Suspend / Reactivate / Retire 及 Identity Continuity | Credential Status 或 Authority |

Credential Exact Contract 继续由 [认证与会话](./authentication-and-sessions) 负责；
Client 与 OIDC Subject 继续由 [OIDC 与 Client](./oidc-and-clients) 负责；
Soulseed-specific Binding 继续由 [Soulseed 接入](../integrate/soulseed) 负责。

## 14 · Actors & Profiles at a glance

| Boundary | Meaning |
| --- | --- |
| **ActorIdentity ≠ HumanAccount / Profile** | Actor 是谁与周边 extension 分开 |
| **ActorIdentity Resource ID ≠ OIDC `sub`** | Resource namespace 与 protocol subject namespace 分开 |
| **Stable Subject Foundation ≠ automatically public identifier** | continuity semantic primitive 不自动成为 API 字段 |
| **Profile ≠ Identity / Authority** | 描述数据不会定义 Actor 或行动权 |
| **Visibility ≠ Dereferenceability ≠ Read Authority** | Reference 存在不会自动开放数据 |
| **IdentityBinding ≠ Identity Equivalence** | Relation 有明确 source、purpose 与 trust boundary |
| **Binding exists ≠ Authentication succeeds** | Relation Fact 不是 Authentication Decision |
| **Ambiguous Binding ≠ successful actor resolution** | Identity Resolution 不能靠猜测 |
| **Suspend ≠ Retire** | 生命周期语义不能混用 |
| **Current Profile / Binding ≠ Historical Attribution** | 当前数据不会重写 event-time identity |

把这一页继续压缩，可以得到四个真正重要的问题：

```text
Who exists?                              → ActorIdentity
What describes that actor?               → HumanAccount / Profile
How is another identity domain related?  → IdentityBinding
How does the same identity persist?      → Lifecycle + Historical Continuity
```

## Exact Contract Source

本篇定义 **ActorIdentity、HumanAccount、Profile、IdentityBinding 与 ActorIdentity
Lifecycle 的 Human-readable Resource Semantics**。

Exact SoulAuth-owned HTTP Wire —— Path、Method、Field name、Schema、Enum wire value、
Response、Error —— 由当前 Published Machine-readable Contract 拥有。
[管理](./administration) 负责具体管理 Operation 的 Authority 与 Mutation Contract。
[项目状态](../project/status) 负责当前 Release 究竟 Support 哪些 Resource Surface 和
Lifecycle Operation。因此：

> **Semantic Concept 存在，不意味着一个同名 Field、Endpoint 或 Public Resource 一定
> 存在。**

## 下一步

到这里，我们已经建立：谁作为 Actor 存在，以及围绕这个 Actor 的 Account、Profile、
Binding 和 Lifecycle 怎样保持边界。

下一份进入 [认证与会话](./authentication-and-sessions)，它将继续回答：Credential
怎样成为 Authentication Capability；Authentication Evidence 怎样形成 Authentication
Result；AuthSession 怎样维持 bounded Authentication Continuity；ActorIdentity 成立
以后，Authentication Runtime 到底怎样工作。
