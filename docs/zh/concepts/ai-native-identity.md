# AI 原生身份

## 为什么 AI 时代需要把身份系统的主语从 User 提升到 Actor

SoulAuth 所说的 **AI-native Identity**，不是给传统身份系统增加一种"AI 登录方式"，
也不是：

```text
User + type = ai
```

真正的问题更早发生。如果一个 AI 系统开始需要：在较长时间尺度上保持身份连续性；作为
自己被 Authentication；在系统记录中被明确区分；在相关 Security History 中被正确
Attribution —— 那么身份基础设施必须重新回答：

> **谁可以成为身份系统真正承认的主体？**

SoulAuth 的回答是 **Actor-native Identity**：

```text
AI-native requirement
        ↓
Actor-native architecture
        ↓
Human + AIActor
        ↓
ActorIdentity
```

## 1 · AI-native 不是一种新的 Authentication Method

数字系统早已拥有大量处理 non-human access 的机制：API Key、Service Account、Bot、
OAuth Client、machine-oriented access pattern。这些机制本身并不会因为 AIActor 出现
而失效。问题在于：**它们并不总是在回答同一个问题。**

OAuth Client 主要回答"哪个 software participant 正在参与协议"；某种 access /
authentication material 回答"当前调用者提供了什么证明材料"；Service Account 可能承担
成熟的 machine access identity；Bot 也可能只是 Product Role 或 Interaction Label。

AI-native Identity 继续追问的是：

> **真正被 Authentication 的 Actor 是谁？**

如果一个 AI 只是 Application 内部的一项能力，Application 本身可能已经是系统唯一需要
建模的 Identity Context。但如果这个 AI 必须作为自己被长期区分、Authentication 并
Attribution，继续把它完全折叠进 Application、HumanAccount 或 Credential，就会开始
丢失身份语义。因此首先保持：

```text
Client      ≠  Actor
Credential  ≠  Actor
```

API Key 等外部概念也不能仅凭名称自动 cast 成 SoulAuth Canonical Credential，它们如何
映射由具体 Integration Contract 决定。

## 2 · 从 User First 到 Actor First

很多 application-centric identity system 自然从 Human User、Human Account 开始。这是
合理的历史起点 —— 因为很长时间里，最需要长期身份连续性的主体主要就是 Human，于是
Identity、Account、Credential、Session 与业务 Role 很容易都围绕 `User` 组织起来。

问题不在这种实现曾经有效，而在于：

> **一种成功的 Human implementation，很容易逐渐被误认为整个 Identity Ontology
> 本身。**

当 AIActor 进入以后，这个假设开始受到压力。如果所有 Identity 都必须先成为
"Human-like User"，那么 AI 最终往往只能伪装成 Human 账户、被折叠进 Service Account、
被称为 Bot，或让承载它的 Application Client 代替它成为 Identity。

SoulAuth 选择把 Identity Root 向上提升一层：

```text
Human
   \
    → ActorIdentity
   /
AIActor
```

这就是 **Actor First**。它不是降低 Human 的价值，也不是宣称 Human 与 AI 在所有意义上
相同。它只拒绝让 **HumanAccount** 这种 Human-specific implementation，提前决定所有
未来 Identity 主体必须用什么形式存在：

```text
HumanAccount
≠
Entire Identity Ontology
```

HumanAccount 可以继续存在，但它位于 Human-specific identity extension，而不是整个
SoulAuth Identity Root。

## 3 · Figure 2：Actor-native Identity

<Figure2 locale="zh" />

Figure 2 只表达一个核心关系：

```text
             ActorIdentity
             /           \
          Human         AIActor
```

这里的 Human 与 AIActor 是 **Actor Kind**，二者共享的是 **First-class Identity
Standing** —— 都位于同一个 ActorIdentity Canonical Identity Contract 之下。但是必须
同时保持：

```text
Same Identity Standing  ≠  Same Implementation
Same Identity Standing  ≠  Same Authority
```

所以 First-class identity standing 不意味着相同 Credential、相同 Authentication
Method、相同 Lifecycle Extension、相同 Authority、相同 Legal Status。真正共享的是
**ActorIdentity 这一层的 Canonical Identity 语义** —— 具体怎样证明身份、拥有哪些
extension、如何维护 runtime continuity，继续由各自 Domain Contract 定义。

## 4 · 什么叫 First-class Identity Standing

对于 AIActor，它至少意味着四件事。

**1 · Representation** —— AIActor 可以拥有属于自己的 ActorIdentity，不需要借用
HumanAccount、借用 OAuth Client，或让 Credential 本身充当 Identity。

**2 · Authentication** —— 当某个 Authentication Contract 适用于 AIActor 时，
Authentication 所建立的 Actor Context 可以明确指向这个 AIActor 本身，而不是先
Authentication 另一个 Human，然后仅仅因为 Human 启动了 Agent，就把 Human 和 AI 当成
同一个 Identity。

**3 · Identity Continuity** —— 如果 Actor 本身没有改变，Credential 变化、Application
Client 变化、Runtime 重启、Infrastructure 替换都不应该仅凭这些变化自动创造一个新的
ActorIdentity：

```text
Identity Continuity  ≠  Credential Continuity
Identity Continuity  ≠  Client Continuity
Identity Continuity  ≠  Runtime Continuity
```

**4 · Attribution** —— 当 AIActor 实际参与某个 Authentication 或 Security-relevant
context 时，系统应该能够把对应 Actor Context 明确指向它。这不意味着所有 Audit Event
都只有 AIActor 一个 Attribution 维度 —— Audit 仍然可以区分 Initiator、Runtime
Origin、Target、Actor Context、Client Context。真正重要的是：

> **AIActor 不需要永远隐藏在另一个 Human 或 Application 后面，才能被 Identity
> Infrastructure 认识。**

### First-class Identity Standing 不创造 Authority

"一等"不是无限 Permission，更不是 Human 与 AIActor 拥有一样的行动权：

```text
First-class Identity Standing
≠
Equal Authority
```

Identity 回答"这个 Actor 是谁"；Authority 回答"为什么这个 Actor 在当前 Domain 中可以
做某件事"。它们是不同问题。

## 5 · 同等身份地位，不要求相同身份实现

Human 与 AIActor 可以共享 ActorIdentity Canonical Identity Contract，但这并不要求
二者拥有同一种 Credential、同一种 Authentication Method、同一种 Lifecycle、同一种
extension。因此：

```text
Who is the Actor?
```

与：

```text
How does this Actor prove itself?
```

必须分开。前一个问题由 ActorIdentity 回答，后一个问题由 Credential 与 Authentication
Contract 回答。所以 Actor-native Identity 真正统一的是 **Identity 语义**，不是所有
实现细节。

## 6 · 已有 Machine Identity 概念为什么不自动等于 AIActor

Actor-native Identity 并不要求废弃现有 machine identity pattern，真正需要的是明确
每个概念到底回答什么问题。

| Concept / Pattern | 通常回答什么 | 为什么不自动等于 AIActor |
| --- | --- | --- |
| **Bot** | Product / interaction role | Bot label 本身不定义 Canonical ActorIdentity |
| **Service Account** | Machine access identity pattern | 可以很好地服务 machine access，但语义不自动等于持续 AIActor |
| **OAuth / OIDC Client** | 哪个 software participant 参与协议 | Client 不回答哪个 Actor 正在被 Authentication |
| **Credential** | Actor 怎样提供 Authentication capability | Credential 本身不是 Actor |
| **AIActor** | Actor-native Identity 中的 Actor Kind | 可以作为独立 ActorIdentity 存在 |

```text
Bot              ≠  AIActor by definition
Service Account  ≠  AIActor by definition
Client           ≠  AIActor
Credential       ≠  AIActor
```

这些关系并不互相排斥。同一个 AI 场景里完全可以同时存在：

```text
Application → Client
AIActor     → ActorIdentity
AIActor     → applicable Credential
```

各对象回答自己的问题。

## 7 · AIActor 作为身份主体，不是意识声明

把 AIActor 建模为 Actor Kind 是一个 **Identity Architecture 判断**，不是
consciousness claim、moral personhood claim 或 legal personhood claim：

```text
AIActor as Identity Actor  ≠  Claim of Consciousness
AIActor as Identity Actor  ≠  Claim of Legal Personhood
```

SoulAuth 不需要先解决"一个 AI 是否具有主观体验"，才能解决另一个独立工程问题："某个
AI 系统是否需要在相当长时间内被稳定区分、Authentication 和 Attribution"。身份基础
设施只回答后一个问题。

## 8 · Actor-native Identity 不要求系统今天就部署 AIActor

Actor-native Identity 并不是"每一个采用 SoulAuth 的 Application 现在都必须支持
AI"。一个今天只有 Human 的系统，同样可以采用：

```text
ActorIdentity
      ↓
HumanAccount
```

对最终 Human 用户来说，产品体验甚至可能并没有明显变化。真正变化发生在内部
Ontology：HumanAccount 不再被当成整个 Identity 本身。这也让 Human Identity 本身更加
清楚：

```text
Email changed               ≠  ActorIdentity changed
Credential changed          ≠  ActorIdentity changed
Application Client changed  ≠  ActorIdentity changed
```

因此：

> **Actor-native 是一种 Architecture Generality，不是 AI Feature Requirement。**

## 9 · AI-native Identity 在哪里停止

它最终只解决一个基础问题：

> **系统能否把这个 AIActor 作为自己认识，并在适用 Contract 中 Authentication 和
> Attribution。**

它不会自动回答：AIActor 能不能代表某个 Human 行动；能不能执行高风险操作；是否拥有
某个 Application Permission；是否拥有 Soulseed Governance Authority；是否具有什么
Legal Status。因此：

```text
Identity  ≠  Authority  ≠  Legal Status
```

Authentication 成功只建立当前 Authentication Contract 声明的 Authentication Result，
它不会自动产生 Application Authority、Governance Authority 或 Legal Authority。

## 10 · Standalone 与 Soulseed

SoulAuth 可以 Standalone 运行，此时 ActorIdentity 属于 SoulAuth Identity Domain。
如果启用 Soulseed Integration，SoulAuth ActorIdentity 可以通过 IdentityBinding 与
Soulseed Canonical Actor 建立受控关系。必须继续保持：

```text
IdentityBinding
≠
Ontology Ownership Merge
```

SoulAuth 不会因为 Integration 成为 Soulseed Canonical Actor 的 Owner；同样，SoulAuth
不定义或修改 Mind。这些 Ecosystem Boundary 由
[Soulseed 与 Mind OS](/zh/spec/soulseed-and-mind-os) 与
[Soulseed 接入](../integrate/soulseed) 进一步定义。

## AI-native Identity at a glance

| Boundary | Meaning |
| --- | --- |
| **AI-native ≠ another AI login method** | 它首先挑战 Human-only identity assumption |
| **AI-native Requirement ≠ Actor-native Architecture** | 前者提出问题，后者是 SoulAuth 架构答案 |
| **ActorIdentity ≠ HumanAccount** | HumanAccount 只是 Human-specific extension |
| **Client ≠ Actor** | Software participant 不是被 Authentication 的主体 |
| **Credential ≠ Actor** | Authentication capability 不是 Identity |
| **Bot ≠ AIActor by definition** | Product role 不自动成为 Canonical Actor Kind |
| **Service Account ≠ AIActor by definition** | Machine access identity 不自动等于持续 AIActor |
| **First-class Standing ≠ Same Implementation** | 不必使用相同 Credential 或 Method |
| **First-class Standing ≠ Equal Authority** | Identity standing 不创建行动权 |
| **Identity Continuity ≠ Credential / Client / Runtime Continuity** | 外围变化不应自动创建新 ActorIdentity |
| **AIActor as Identity Actor ≠ Consciousness Claim** | Engineering identity category 不是意识判断 |
| **AIActor as Identity Actor ≠ Legal Personhood** | Identity infrastructure 不裁决法律人格 |
| **Identity ≠ Authority ≠ Legal Status** | 本篇明确停止在 Identity Boundary |

## SoulAuth 对 AI-native Identity 的回答

```text
AI systems may increasingly need
stable identity, authentication, continuity and attribution
in their own right.
        ↓
A Human-only identity root is no longer general enough.
        ↓
SoulAuth adopts Actor-native Identity.
        ↓
ActorIdentity becomes the canonical identity anchor.
        ↓
Human and AIActor exist as Actor kinds
with first-class identity standing.
        ↓
Their Credential, Authentication Method, Lifecycle,
Authority and Legal Status may remain different.
```

所以：

> **AI-native Identity 提出要求：身份系统必须能够在需要时把 AIActor 作为独立 Actor
> 来认识。**
>
> **Actor First 给出架构原则：先回答谁是 Actor，再回答这个 Actor 怎样证明自己。**

## 下一步

如果你要继续理解 ActorIdentity、HumanAccount、IdentityBinding、Credential 与 Client
分别是什么，进入 [Actor 身份模型](./actor-identity-model)；如果你要继续理解为什么一个
Actor 已经完成 Authentication 以后仍然不能自动获得行动权，进入
[身份与权限](/zh/spec/identity-vs-authority)。

## Exact Semantic Ownership

本篇拥有 **AI-native Problem Framing、Actor First Motivation、First-class Identity
Standing 的概念边界，以及 Actor-native Identity 为什么存在**。

它不自行定义 ActorIdentity exact resource schema、HumanAccount exact schema、
AIActor / Human credential types、AIActor / Human authentication methods、Claims
schema、AuthSession support、AI-specific protocol flow、AIActor wire representation、
current supported feature set。这些 Exact 事实必须来自
[Actor 身份模型](./actor-identity-model)、
[Actor 与档案](../reference/actors-and-profiles)、
[认证与会话](../reference/authentication-and-sessions)、
[OIDC 与 Client](../reference/oidc-and-clients)、Machine-readable Contracts、
[项目状态](../project/status)。因此：

```text
Conceptual Possibility
≠
Current Supported Capability
```

本篇只解释为什么 Ontology 必须给 AIActor 留下成为 Actor 的合法位置，它不替 Current
Release 宣布 AIActor 今天具体怎样 Authentication。
