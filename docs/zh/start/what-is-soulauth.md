# SoulAuth 是什么

SoulAuth 是由 TRANTOR LABS 构建的 **Actor-native Identity & Authentication
Infrastructure**。它从一个基础问题开始：

> **谁正在被认证？**

很多 application-centric identity system 自然以 Human User 或 Human Account 为长期
Identity Root。SoulAuth 把这一层向上提升为 **ActorIdentity**。

在 SoulAuth 中，Human 与 AIActor 都可以作为 Actor Kind 存在于同一个 ActorIdentity
Canonical Identity Contract 之下。它们共享的是 **First-class Identity Standing**，
而不是相同 Credential、相同 Authentication Method、相同 Lifecycle 或相同 Authority。

```text
Human + AIActor
        ↓
    ActorIdentity
```

这就是 SoulAuth 所说的 **Actor-native Identity**。

## 1 · SoulAuth 解决什么问题

Human-first identity model 长期以来非常有效，问题只会在系统开始需要另一种主体时出现。

一个 AI 系统如果只是 Application 内部调用的一项能力，它并不一定需要独立
ActorIdentity。但如果它开始需要：跨时间或 Runtime 保持 Identity Continuity；作为自己
被 Authentication；与 Human、Client 或其它 Actor 明确区分；在相关 Security History
中被独立 Attribution —— 那么 Identity Infrastructure 必须决定：

> **这个 AI 在 Identity Model 里究竟是什么？**

一种做法是继续把它折叠进已有语义：HumanAccount、Bot、Service Account、OAuth Client
或其它 machine-access abstraction。SoulAuth 不要求这些已有概念消失，它只是拒绝假设
它们自动等于 AIActor。

因此 SoulAuth 真正要解决的不是"怎样让 AI 登录"，而是：

> **怎样让不同 Actor Kind 在不互相伪装的情况下进入同一套可信 Identity &
> Authentication Infrastructure。**

## 2 · Actor-native 改变了什么

Actor-native 首先改变 **Identity Root**。传统 Human-first Application 可能自然围绕
`Human User` 组织自己的 identity model；SoulAuth 则把 Canonical Actor Identity
Anchor 放在 `ActorIdentity`。因此几个边界必须长期成立：

```text
ActorIdentity  ≠  HumanAccount
ActorIdentity  ≠  Credential
ActorIdentity  ≠  Client
```

HumanAccount 是 Human-specific identity extension；Credential 回答 Actor 怎样在适用
Authentication Contract 中证明自己；Client 回答哪个 software participant 正在使用
协议或服务；IdentityBinding 表达不同 identity domain representation 之间受控的关系。

这些对象可以彼此发生关系，但**没有任何一个可以替代 ActorIdentity 本身**。这就是
Actor-native Identity 与简单向传统 User Model 增加 `type = ai` 之间最重要的区别。

## 3 · Human 与 AIActor 的"统一"意味着什么

SoulAuth 所说的统一 Identity Infrastructure，并不意味着：

```text
Human = AIActor
```

也不意味着：

```text
same ActorIdentity standing = same implementation
```

真正统一的是 **Canonical Identity Contract** —— Human 与 AIActor 都不需要借用另一种
Actor 的 Identity，才能在 SoulAuth Identity Domain 中成为一等 Actor。

但是它们完全可以使用不同 Credential、不同 Authentication Method、拥有不同 Lifecycle
Extension、面临不同 Security Policy、获得完全不同的 Authority。因此：

```text
First-class Identity Standing
≠
Equal Authority
```

SoulAuth 统一**谁可以成为 Actor**，它不强迫**所有 Actor 怎样证明自己**。这一点也是
AI-native 与 Actor-native 之间真正的关系：

```text
AI-native     → asks for a more general identity model
Actor-native  → provides that architecture
```

## 4 · SoulAuth 负责什么

本篇不维护 Current Feature Matrix，这里描述的是 **SoulAuth Responsibility
Boundary**。

| Responsibility | SoulAuth 回答的问题 |
| --- | --- |
| **Identity** | 当前被表示和引用的 Actor 是谁 |
| **Authentication** | 当前 Actor 怎样按照适用 Contract 建立可信 Authentication Result |
| **Authentication Continuity & Bounded Projection** | 已建立的 Authentication 怎样在声明的生命周期与 Consumer Boundary 中继续或被消费 |
| **Administrative Control** | SoulAuth 自己拥有的 Identity / Authentication Domain 怎样被安全治理 |
| **Security & Historical Accountability** | SoulAuth-owned Trust 怎样被保护，关键事实怎样保持可追踪和可归因 |

Authentication 是核心环节，但 SoulAuth 并不把"Login 成功"视为 Identity
Infrastructure 的全部工作。它还必须保证 Identity、Authentication 与相关 Trust Facts
在自己拥有的 Domain Boundary 中保持语义一致、生命周期可解释，并能够通过声明的
Contract 被 Consumer 安全使用。

## 5 · SoulAuth 不是什么

产品边界不仅由做什么决定，也由**不做什么**决定。

### SoulAuth 不是 Mind 或 Memory System

SoulAuth 不会定义一个 AIActor 怎样思考、它的长期记忆是什么、人格或 Mind 怎样形成。
它负责 Identity 与 Authentication，不是 Mind Ontology 的 Canonical Owner。

### SoulAuth 不是 Agent Framework

SoulAuth 不负责 Task Planning、Tool Selection、Workflow Orchestration、Agent
Reasoning。一个 Actor 是谁属于 Identity 问题；这个 Actor 下一步怎样完成任务不是
SoulAuth 的职责。

### SoulAuth 不是通用 Authority Engine

```text
Authentication
≠
Authority
```

SoulAuth 可以对自己拥有的 administrative / identity-authentication domain 执行必要的
Authorization Decision，但成功 Authentication 不会自动创造 Application Authority、
Soulseed Governance Authority 或 External / Legal Authority。

Identity 回答 **是谁？** Authority 回答 **为什么当前主体在这个 Domain 里可以做
这件事？**

### SoulAuth 不是 Execution Runtime

SoulAuth 可以建立 ActorIdentity、Authentication Result、声明范围内的 Authentication
Context。它不会因此替 Actor 执行支付、修改文件、操作 Connector 或执行真实世界行为：

```text
Authentication
≠
Execution
```

### SoulAuth 不是 Billing 或 Entitlement System

Subscription、Plan、Commercial Entitlement 可以影响 Application 怎样向 Actor 提供
服务。但：

```text
Commercial Entitlement
≠
ActorIdentity
```

商业权益不能定义这个 Actor 是谁。

## 6 · 什么样的系统适合 SoulAuth

SoulAuth 不要求你的系统今天已经拥有 AIActor。

**Human Applications** —— 如果一个 Web / SaaS Application 今天只服务 Human，仍然可以
采用 Actor-native Identity，这样 HumanAccount 不会被误写成整个 Identity Ontology
本身。未来是否加入其它 Actor Kind，不需要今天决定。

**Backend / API Systems** —— 如果 Backend 需要消费已经通过 Public Contract 建立的
Authentication / Token Context，而不是读取 SoulAuth private persistence 来猜
Identity，Actor-native Identity 可以提供更清晰的 Boundary。

**AI / Agent Systems** —— 如果系统开始需要把 AIActor、Application Client、Human、
Credential 长期区分，SoulAuth 提供一套 Identity Architecture，使 AIActor 不必先被
强行表示成 HumanAccount、Bot label、Service Account 或 OAuth Client。

**Soulseed Ecosystem** —— 如果系统位于 Soulseed 生态中，SoulAuth 承担 Authentication
基础设施角色，而 SoulseedAGI 与 SoulseedOS 继续拥有自己的 Canonical Responsibility。

> **Actor-native 是一种 Architecture Generality，不是 AI Feature Requirement。**

## 7 · Standalone 与 Soulseed

SoulAuth 的 Identity / Authentication Boundary 不依赖 Soulseed 才能成立。因此：

> **SoulAuth can operate standalone.**

Standalone 并不改变 SoulAuth 的 Canonical Responsibility：ActorIdentity 仍属于
SoulAuth Identity Domain；Authentication 仍由 SoulAuth 建立；Consumer 通过 Current
Release 声明的 Public Contract 使用这些能力。

### Soulseed Integration 是可选关系

```text
SoulseedAGI  Defines Canonical Actor / Mind
        ↓
SoulAuth     Authenticates
        ↓
SoulseedOS   Operates / Governs
```

即 **Define → Authenticate → Operate**。更严格地说：SoulseedAGI 拥有 Soulseed
Canonical Actor / Mind；SoulAuth 拥有自己的 ActorIdentity 与 Authentication Domain；
两个 Identity Domain 可以通过 IdentityBinding 建立受控关系；SoulseedOS 消费经过声明
Contract 形成的 Authentication Context，并继续执行自己的 Runtime / Governance
Decision。因此：

```text
IdentityBinding
≠
Ontology Ownership Merge
```

SoulAuth 不会因为 Soulseed Integration 接管 Mind；SoulseedOS 也不会因为消费 SoulAuth
Authentication Context 接管 SoulAuth private Identity persistence。

## SoulAuth at a glance

| Boundary | Meaning |
| --- | --- |
| **SoulAuth = Actor-native Identity & Authentication Infrastructure** | 产品的 Canonical 定位 |
| **ActorIdentity ≠ HumanAccount** | HumanAccount 不是整个 Identity Root |
| **ActorIdentity ≠ Credential** | Authentication capability 不是 Identity 本身 |
| **ActorIdentity ≠ Client** | Software participant 不是 ActorIdentity |
| **Human / AIActor share first-class identity standing** | 二者可以作为一等 Actor Kind 进入同一 Canonical Identity Contract |
| **First-class Standing ≠ Same Implementation** | 不要求相同 Credential、Method 或 Lifecycle |
| **Authentication ≠ Authority** | 身份证明不会自动创造行动权 |
| **Authentication ≠ Execution** | SoulAuth 不执行 Actor 的现实动作 |
| **Commercial Entitlement ≠ ActorIdentity** | 商业权益不定义 Identity |
| **SoulAuth ≠ Mind System** | Mind 不属于 SoulAuth Canonical Responsibility |
| **SoulAuth ≠ Agent Framework** | Agent reasoning / orchestration 不属于 Identity |
| **Standalone ≠ Soulseed-dependent** | SoulAuth 可以独立运行 |
| **IdentityBinding ≠ Ownership Merge** | Soulseed Integration 不合并两个 Domain Ontology |

## 一句话理解 SoulAuth

> **SoulAuth 是一套 Actor-native Identity & Authentication Infrastructure。它不再假设
> Human User 是身份世界唯一可能的根，而以 ActorIdentity 作为 Canonical Actor Identity
> Anchor，使 Human 与 AIActor 都可以作为自己被表示和 Authentication，同时把
> Authority、Mind、Execution 与其它上层关系明确留在 Identity Boundary 之外。**
>
> **无论进入系统的是 Human 还是 AIActor，我们首先都应该能够可靠地知道：它是谁。**

## Current Release 与 Product Definition 分开

本页定义 **SoulAuth 是什么**。它不负责宣布 current deployment modes、current OIDC
profile、current authentication methods、MFA / SSO support、AuthSession capabilities、
token representation、administrative surfaces、conformance status。因此必须长期
保持：

```text
Product Definition          ≠  Current Feature Matrix
Architecture Responsibility ≠  Current Supported Capability
```

Current Support 以 [项目状态](../project/status) 以及对应 Reference、Machine
Contract、Runtime 与 Evidence 为准。

## 下一步

如果你希望立即开始运行 SoulAuth，进入 [快速开始](./quickstart)；如果你还不知道自己的
Web、Backend、AI / Agent 或 Soulseed integration 应该从哪里进入，进入
[选择接入路径](./integration-path)；如果你想理解为什么 AI 时代会推动 User First
转向 Actor First，进入 [AI 原生身份](../concepts/ai-native-identity)；如果你要理解
ActorIdentity、HumanAccount、IdentityBinding、Credential 与 Client 的 Canonical
关系，进入 [Actor 身份模型](../concepts/actor-identity-model)；如果你要理解为什么
Authentication 成功仍然不等于拥有行动权，进入
[身份与权限](../concepts/identity-vs-authority)。

## Exact Semantic Ownership

本篇拥有 **SoulAuth Product Definition、Actor-native Differentiation、Top-level
Responsibility Boundary、Top-level Non-goals、Standalone Viability 与 Soulseed
Optional Integration Boundary**。

它不自行定义 ActorIdentity / HumanAccount exact schema、Credential types、
Authentication methods、AuthSession contract、Token representation、OIDC profile、
MFA / SSO support、Administration API、Permission / Role vocabulary、deployment
topology、conformance status、release support status。这些 Exact 事实分别由
Canonical References、Machine-readable Contracts、Runtime、Verification Evidence、
[项目状态](../project/status) 拥有。
