# Actor 身份模型

## SoulAuth 如何定义一个稳定的 Actor 身份

前一篇 [AI 原生身份](./ai-native-identity) 解释了为什么传统以 Human User 为中心的
Identity Model，很难自然容纳持续存在并独立行动的 AIActor。

这一篇继续回答更基础的问题：

> **在 SoulAuth 中，到底什么代表"这个 Actor 是谁"？**

我们在 TRANTOR LABS 设计 SoulAuth 时，没有把 HumanAccount、Credential、Client 或
Session 当作所有身份关系的根。SoulAuth 把它们分开，并把 **ActorIdentity** 放在
Identity Domain 的中心。

```text
Human
   \
    → ActorIdentity
   /
AIActor
```

Human 与 AIActor 都可以成为 first-class Actor。它们可以使用不同的 Credential、拥有
不同的扩展和运行方式，但不需要因此建立两套平行的身份模型。

## 1 · ActorIdentity：SoulAuth 的身份锚点

在 SoulAuth Identity Domain 内，**ActorIdentity 是唯一的 Canonical Actor Identity
Anchor**。它回答：

> **这个 Actor 是谁？**

ActorIdentity 首先承担的是身份连续性，而不是某一种 Login Method、Account、Session
或 Protocol representation。因此：

```text
ActorIdentity  ≠  HumanAccount
ActorIdentity  ≠  Credential
ActorIdentity  ≠  Client
ActorIdentity  ≠  AuthSession
```

ActorIdentity 可以关联这些对象，但它们的变化不会自动创造一个新的 Actor。

这也是 SoulAuth 与传统把 Account、Password、Profile、Session 等信息集中到一个
`User` 对象中的模型之间，一个重要区别。

### ActorIdentity 不是数据库 Schema

ActorIdentity 是 Semantic Contract。它定义：谁拥有这个身份；这个身份属于哪一种
Actor Kind；身份连续性如何被保持；哪些其它对象可以围绕它建立关系。

它并不要求 Runtime 必须存在某个固定字段、数据库表或 JSON structure。

ActorIdentity 的 Exact Resource Representation、Identifier 和 Lifecycle Contract，
由 [Actor 与档案](../reference/actors-and-profiles) 定义。

## 2 · Human 与 AIActor

SoulAuth 当前的 Canonical Actor Kind 包括：

```text
Human
AIActor
```

两者进入同一个 ActorIdentity Contract。这意味着：

> **Human 与 AIActor 拥有同样的 first-class ActorIdentity standing。**

但 identity standing 相同，并不意味着其它层也必须相同：

```text
Same first-class ActorIdentity standing
≠ Same Credential
≠ Same account extension
≠ Same lifecycle details
≠ Same Authority
```

Human 可以拥有 Human-specific 的账户能力。AIActor 不需要为了进入 SoulAuth 而伪造
Email、Username、Password 或 HumanAccount。因此：

```text
No HumanAccount
≠
Incomplete AIActor identity
```

一个没有 HumanAccount 的 AIActor，仍然可以是完整的 ActorIdentity。

## 3 · Identity Continuity：周边变化不等于身份变化

ActorIdentity 存在的核心价值之一，是让系统能够区分：

> **"这个 Actor 发生了变化"**

和：

> **"这已经变成另一个 Actor"。**

下面这些变化通常不应该自动创建新的 ActorIdentity：

| 变化 | 是否自动产生新的 ActorIdentity |
| --- | ---: |
| Profile 属性变化 | 否 |
| Credential 轮换 | 否 |
| 增加或撤销 Credential | 否 |
| IdentityBinding 变化 | 否 |
| 使用不同 Client | 否 |
| AuthSession 重新建立 | 否 |

```text
Credential change  ≠  Identity replacement
Profile change     ≠  Identity replacement
Session change     ≠  Identity replacement
```

真正需要长期稳定的是 **Identity Continuity**。

SoulAuth 内部可以使用稳定的 identity semantics 来支撑这种连续性，但这并不自动要求
存在一个公开的 `stable_subject_id`、独立 Resource 或固定数据库字段。

同样，OIDC `sub` 是下游 Protocol Subject Projection，不是 ActorIdentity Resource ID
的另一个名字，也不等于 ActorIdentity 内部的 continuity foundation。具体的 Resource
Identifier 由 [Actor 与档案](../reference/actors-and-profiles) 定义，OIDC Subject
Policy 与 Subject Projection Contract 由
[OIDC 与 Client](../reference/oidc-and-clients) 定义。

## 4 · IdentityBinding：连接两个 Identity Domain

一个 Actor 可能同时存在于其它 Identity Domain —— External Identity Provider 中的
Subject、Enterprise Identity Source 中的身份，或 SoulseedAGI 中定义的 Canonical
Actor。

SoulAuth 使用 **IdentityBinding** 表达这些身份与 SoulAuth ActorIdentity 之间经过
治理的 cross-domain relation：

```text
External Identity
        ↕
IdentityBinding
        ↕
ActorIdentity
```

IdentityBinding 回答：

> **两个明确 Identity Domain 之间，是否存在一条受控的身份关系？**

它不表示两端已经成为同一个 Identity Namespace：

```text
IdentityBinding  ≠  ActorIdentity
IdentityBinding  ≠  Identity Equivalence
IdentityBinding  ≠  Credential
```

### Binding 不等于 Authentication

IdentityBinding 存在，只说明一条身份关系已经建立。它并不证明当前来自 External
Identity Source 的 Authentication Assertion 可信。

Federated Authentication 仍然必须验证当前的外部 Authentication Reality；只有验证
成立以后，IdentityBinding 才能用于把对应 External Subject 解析到 SoulAuth
ActorIdentity。具体 Federation 与 Authentication Runtime Contract，由
[认证与会话](../reference/authentication-and-sessions) 和
[OIDC 与 Client](../reference/oidc-and-clients) 定义。

## 5 · Credential：证明 Actor，而不是定义 Actor

**Credential** 是 Actor 用于证明自身身份的 Authentication Capability。它回答：

> **这个 Actor 可以通过什么能力证明自己？**

```text
Credential
≠
ActorIdentity
```

一个 ActorIdentity 可以拥有一个或多个 Credential。Credential 也拥有自己的
Lifecycle —— 可以被创建、轮换、撤销或过期，但这些变化不会自动改变 ActorIdentity
continuity：

```text
Credential lifecycle
≠
ActorIdentity lifecycle
```

Human 与 AIActor 可以使用不同类型的 Credential。哪些 Credential Type 和
Authentication Method 在当前 Release 中被正式支持，由
[认证与会话](../reference/authentication-and-sessions) 与
[项目状态](../project/status) 定义。

### Credential 不等于 Authentication Evidence

Credential 是一种较长期存在的 Authentication Capability。一次具体 Authentication
Attempt 中真正用于验证的输入或证明属于 **Authentication Evidence**：

```text
Credential
≠
Authentication Evidence
```

Credential 是什么，属于 Identity / Authentication 边界。它怎样被验证、怎样形成
Authentication Result，则属于 Authentication Runtime Contract。

### SoulAuth Credential 不等于外部访问凭证

Actor 还可能持有其它系统的 API Credential、Connector Credential 或 Access Token。
这些材料用于 Actor 访问其它系统；SoulAuth Credential 用于 Actor 向 SoulAuth 证明
自身身份。两者属于不同 Trust Domain，不应因为都叫 Credential 而混在一起。

## 6 · 围绕 ActorIdentity 工作的其它概念

ActorIdentity 不是 SoulAuth Identity System 中唯一的重要 Concept，但其它 Concept
都有自己的职责。

| Concept | 负责什么 | 不是什么 |
| --- | --- | --- |
| **HumanAccount** | Human-specific account extension | ActorIdentity |
| **Profile** | 描述和展示 Actor | Identity anchor |
| **Credential** | 提供 Authentication capability | Actor |
| **IdentityBinding** | 连接两个 Identity Domain | Identity equivalence |
| **Client** | OAuth / OIDC Protocol software participant | Actor |
| **AuthSession** | 保持有限时间内的 Authentication continuity | ActorIdentity |
| **Token / Claims** | 携带或投影有界的 Protocol facts | Upstream ActorIdentity |
| **Audit** | 保存历史行为与 Attribution evidence | Current identity state |

这张表最重要的不是对象数量，而是职责边界。

### HumanAccount

HumanAccount 是 Human-specific extension。它可以承载 Human-facing account concern，
但 `HumanAccount ≠ ActorIdentity`，AIActor 不需要 HumanAccount。它的 Exact Resource
和 Lifecycle 由 [Actor 与档案](../reference/actors-and-profiles) 定义。

### Profile

Profile 描述 Actor，它可以变化。但 `Profile ≠ ActorIdentity` —— 改变 Display Name、
Avatar 或其它 presentation data，不会自动替换 ActorIdentity。

### Client

Client 是 Protocol Software Participant。它回答的是"哪个软件正在与 SoulAuth
交互"，而 ActorIdentity 回答"谁正在被认证"：

```text
Client                 ≠  Actor
Client Authentication  ≠  Actor Authentication
```

一个 Request 可以同时具有 Actor Context 和 Client Context，但两者不能合并成一个
"超级身份"。Client 的注册、`client_id`、Protocol Metadata 与 Client Authentication
Contract，由 [OIDC 与 Client](../reference/oidc-and-clients) 定义。

### AuthSession

AuthSession 保持已经建立的 Authentication Reality 在有限时间内持续。因此
`AuthSession ≠ ActorIdentity` —— AuthSession 可以过期或撤销，而 ActorIdentity 仍然
存在。

### Token 与 Claims

Token 和 Claims 可以向 Consumer 携带经过验证的身份或 Authentication Projection。
它们不会取代上游 ActorIdentity。经过正确验证以后，Consumer 可以在声明的 Protocol
Scope 与 Validity Boundary 内依赖这些 Projection，但它们不会因此成为新的 Identity
Source。

### Audit

Audit 记录过去发生了什么。它可以引用 ActorIdentity、Credential、Client、AuthSession
以及其它 Runtime Context。但历史记录不会成为新的 ActorIdentity，也不会替代当前
Identity State。

## 7 · Standalone SoulAuth 与 Soulseed

同一套 ActorIdentity Model 同时适用于 Standalone SoulAuth 和 Soulseed Integration。

### Standalone

SoulAuth 不依赖 Soulseed 才能建立 ActorIdentity。Human 和 AIActor 都可以直接成为
SoulAuth 中的 first-class ActorIdentity。特别是：

> **Standalone AIActor 不需要先绑定一个 Soulseed Canonical Actor 才能成立。**

### Soulseed

在 Soulseed 生态中，Canonical Actor 与 Mind semantics 由 **SoulseedAGI** 定义。
SoulAuth 可以通过 IdentityBinding，把自己的 ActorIdentity 与 Soulseed Canonical
Actor 建立明确的 cross-system relation。但这条关系不会改变双方的 Ownership：

```text
SoulseedAGI  defines Canonical Actor / Mind
SoulAuth     authenticates ActorIdentity
```

因此：

```text
IdentityBinding
≠
Permission to redefine Soulseed Canonical Actor
```

SoulAuth 不会因为建立 Binding 而获得定义或修改 Mind 的权力。Soulseed 的完整
Architecture Relationship 见 [Soulseed 与 Mind OS](./soulseed-and-mind-os)；具体
Runtime Integration 见 [Soulseed 接入](../integrate/soulseed)。

## 8 · 把整个模型压缩成五条边界

### 1. ActorIdentity 是身份锚点

```text
ActorIdentity answers "Who is this Actor?"
```

### 2. Human 与 AIActor 共享同一个身份模型

```text
Human + AIActor → first-class ActorIdentity
```

AIActor 不需要伪装成 HumanAccount、Bot、Service Account 或 OAuth Client。

### 3. 周边对象不是 Actor

HumanAccount、Credential、Client、Profile、AuthSession、Token 都可以围绕
ActorIdentity 工作，但都不能替代它。

### 4. Relation 与 Proof 分开

```text
IdentityBinding  → identity relation
Credential       → authentication capability
```

两者解决不同问题。

### 5. Identity Continuity 不依赖周边对象保持不变

Credential、Profile、Binding、Client 或 Session 发生正常变化，**不应该静默创造另一个
Actor**。这就是 ActorIdentity 作为稳定身份锚点的意义。

## 下一步

到这里，我们已经知道 **SoulAuth 如何回答"这个 Actor 是谁"**。

但知道是谁，还没有回答：**这个 Actor 为什么有权执行某个 Operation？**
Authentication 成功，也不意味着 Authority 自动成立。

下一篇 [身份与权限](./identity-vs-authority) 将继续处理这条边界：Identity、
Authentication 与 Authority 为什么必须始终分开。
