# Soulseed 与 Mind OS

## SoulAuth 在 AGI Infrastructure 中的位置

SoulAuth 是独立的 **Actor-native Identity & Authentication Infrastructure**。它可以
Standalone 运行，也可以通过明确的 Integration Contract 进入 Soulseed 体系。

理解这两种使用方式为什么能够同时成立，需要先回答一个更大的架构问题：

> **当 AI 不再只是一次模型调用，而开始作为持续 Actor 存在时，Identity、Mind、
> Runtime 与 Governance 分别应该由谁负责？**

我们在 TRANTOR LABS 构建 Soulseed Architecture 时，没有把这些职责压进一个巨大的
"AI Platform"。相反，我们把不同 Source of Truth 分开：

```text
SoulseedAGI  → Canonical Actor / Mind
SoulAuth     → ActorIdentity / Authentication
SoulseedOS   → Runtime / Governance
```

这些系统可以深度组合，但它们不会因为组合而失去各自的边界。

## 1 · LLM、Mind OS 与 SoulseedOS

LLM 提供越来越强的推理、生成、规划和 Tool-use 能力。但：

```text
Intelligence Capability
≠
System Order
```

一个持续存在的 Actor 还需要解决 Identity、continuity、长期 state、Runtime、
Governance、外部行动与 accountability。

可以把 LLM 粗略理解为智能时代的 CPU。它提供核心智能能力，但不会独自决定：谁在
持续存在、哪些状态属于谁、怎样长期运行，以及谁有权改变什么。

### Mind OS

**Mind OS** 是我们用来描述这类更大系统问题的 Architecture Concept。它不是一个更大的
LLM，也不是某个 Agent Framework、Memory System 或单一应用的别名。它关心的是：

> **一个持续 Actor 与 Mind，需要怎样的系统秩序才能长期存在、运行、治理并进入
> 现实。**

### SoulseedOS

**SoulseedOS** 则是 Soulseed 体系中承担 Runtime 与 Governance 职责的具体系统。因此：

```text
Mind OS  ≠  SoulseedOS
```

Mind OS 是 Architecture Concept，SoulseedOS 是具体的 Runtime / Governance System。
同样：

```text
Mind OS  ≠  Identity Provider
```

持续 Actor 需要稳定 Identity，但 Identity & Authentication 不需要因此重新实现进
Mind OS。这就是 SoulAuth 存在的位置：

> **SoulAuth 提供独立的 Identity & Authentication Boundary。**

## 2 · Figure 1：Soulseed AGI Infrastructure

<Figure
  src="/figures/figure-1-soulseed-agi-infrastructure.zh.webp"
  alt="LLM 之上的 Soulseed AGI 基础设施：LLM 提供智能能力，Mind OS 内含 SoulseedAGI、SoulseedOS 与 Soulseed Apps；SoulAuth 位于 SoulseedOS 旁边，是独立的身份与认证基础设施，任意应用同样可以使用；Public Bridge 通向公共现实基础设施。"
  title="Figure 1 · Soulseed —— LLM 之上的 AGI 基础设施"
  caption="LLM 提供智能，Soulseed 为持续 AIActor 建立 Mind、运行、应用与公共现实所需要的系统秩序。SoulAuth 是独立的身份与认证基础设施 —— 既可被 SoulseedOS 使用，也可独立服务任意应用。"
/>

Figure 1 回答的不是 SoulAuth 内部怎样工作，而是：

> **SoulAuth 位于什么更大的系统中。**

从 SoulAuth 的视角，最重要的 Responsibility 关系可以压缩成：

| Component | Canonical Responsibility |
| --- | --- |
| **SoulseedAGI** | Canonical Actor / Mind semantics |
| **SoulAuth** | ActorIdentity / Authentication |
| **SoulseedOS** | Runtime / Governance |
| **Soulseed Apps** | Application experience 与 app-specific interaction |
| **Public Reality Infrastructure** | 在需要时承载跨主体的共享、可验证现实 |

这张图表达的是 **Architecture Relationship**。它不是 Deployment Topology，也不意味着
使用 SoulAuth 必须部署 Figure 1 中的全部组件。

## 3 · 谁拥有哪一层 Source of Truth

这套 Architecture 最重要的不是 Component 数量，而是：

> **谁拥有哪一种 Reality 的 Canonical Meaning。**

### SoulseedAGI

SoulseedAGI 定义 **Soulseed Domain 中的 Canonical Actor 与 Mind semantics**。因此：

```text
SoulAuth does not define Soulseed Canonical Actor / Mind
```

SoulAuth 可以认证一个 Actor。它不会因为拥有 ActorIdentity，就成为该 Actor 的
Memory、Judgment 或 Mind State 的 Source of Truth。

### SoulAuth

SoulAuth 负责 **ActorIdentity 与 Authentication**。它回答"这个 Actor 在 SoulAuth 中
是谁"，以及"当前要求的身份是否按照 Authentication Contract 得到了证明"。SoulAuth
不会因此拥有：

```text
Mind
Runtime Governance
Execution Authority
```

这也是为什么：

```text
ActorIdentity   ≠  Mind
Authentication  ≠  Runtime Governance
```

### SoulseedOS

SoulseedOS 负责 **持续 Actor 怎样运行，以及怎样被治理**。它可以消费通过受支持
Integration Contract 提供的、经过验证的 Identity / Authentication facts，然后继续
按照自己的 Runtime state、Governance policy、Authority 和 Execution conditions
运行和约束 Actor。因此：

```text
SoulAuth Authentication
≠
Soulseed Governance Authority
```

SoulAuth 证明是谁。SoulseedOS 决定它在自己的 Domain 中怎样被运行和治理。

### Soulseed Apps

Soulseed Apps 位于 Application Layer，它们让持续 Actor / Mind 进入具体使用场景。但
Application 的存在不会改变更上游的 Source of Truth：

```text
Application
≠
Canonical Mind Source of Truth
```

不同 Apps 可以拥有自己的 app-specific state，它们不需要各自重新创造一套 Canonical
Actor 或 Mind。

## 4 · Public Reality Infrastructure

有些 Reality 只需要存在于一个 Application 或 Runtime 内部；另一些 Reality 可能需要
跨 Actor、跨系统或跨组织被验证。**Public Reality Infrastructure** 面对的是后一类
问题。

这里的 `Public` 不表示所有内容都必须公开给所有人，而表示：

> **某些 Reality 需要进入跨主体可验证的共享边界。**

```text
Public
≠
Unconditional Public Disclosure
```

同样重要的是：

```text
Public Reality Infrastructure
≠
Mandatory SoulAuth Request Path
```

一次 Authentication、一次普通 Application Request 或一次内部 state transition，并不
因为 Soulseed 拥有 Public Reality Infrastructure，就必须经过它。只有当某项 Reality
的 Contract 确实需要跨主体验证时，它才进入相应边界。

## 5 · SoulAuth 必须可以 Standalone

SoulAuth 不是只有接入 Soulseed 以后才成立的内部组件。它拥有独立的 ActorIdentity
model、Authentication boundary、Protocol surface、Security boundary 与 Audit /
attribution responsibility。

```text
SoulAuth
├── Standalone
└── Soulseed Integration
```

Standalone 与 Soulseed Integration 不是两套 SoulAuth，也不是两套不同的 ActorIdentity
Ontology。它们使用的是：

> **同一个 SoulAuth Architecture，在不同系统关系中的两种使用方式。**

所以：

> **Soulseed Integration 不会成为 SoulAuth Standalone 运行的前置条件。**

普通 Application 可以只使用 SoulAuth；Soulseed 也可以通过正式 Contract 组合
SoulAuth。这两件事可以同时成立。

## 6 · Soulseed Canonical Actor 与 SoulAuth ActorIdentity

这是整个 Integration Boundary 中最容易被混淆的一组概念：

```text
Soulseed Canonical Actor
        ↕
   IdentityBinding
        ↕
SoulAuth ActorIdentity
```

两端都涉及 Actor，但它们属于不同 Domain。

**Soulseed Canonical Actor** 由 SoulseedAGI 定义，属于 Soulseed 的 Actor / Mind
Ontology。**SoulAuth ActorIdentity** 由 SoulAuth Identity Domain 维护，承担 Actor
进入 SoulAuth Identity & Authentication System 以后稳定的身份连续性。因此：

```text
Soulseed Canonical Actor
≠
SoulAuth ActorIdentity
```

而 IdentityBinding 只表示：两个明确 Domain 之间存在一条受控 Relation。它不会让两端
Ontology 合并，也不会把一个系统的 Source-of-Truth Ownership 转移给另一个系统：

```text
IdentityBinding
≠
Ontology Merge
```

同样重要的是：

> **一个 Standalone AIActor 不需要先绑定 Soulseed Canonical Actor，才能成为完整的
> SoulAuth ActorIdentity。**

Soulseed Binding 是可选的 cross-system relation，不是 AIActor 在 SoulAuth 中合法
存在的前置条件。

## 7 · Reference 不等于 Ownership

跨系统 Architecture 中，一个非常容易出现的问题是：某个系统保存了另一个系统的 ID 或
Reference，随后逐渐开始把这份 Reference 当成自己定义对方的权力。SoulAuth 明确避免
这种设计。

```text
Reference
≠
Ownership
```

例如，SoulAuth 可以维护一个指向 Soulseed Canonical Actor 的受控 Reference。这不
意味着 SoulAuth 可以重新定义这个 Canonical Actor。同样，SoulseedOS 可以消费来自
SoulAuth 的身份 / Authentication facts，这不意味着 SoulseedOS 成为 ActorIdentity 的
Source of Truth。

跨系统 Reference 解决的是**怎样可靠地连接两个 Domain**，它不会自动改变**谁拥有哪个
Domain**。

## 8 · 通过 Contract 协作，而不是共享私有实现

系统边界清楚，不意味着系统之间彼此孤立，恰恰相反。稳定组合依赖**明确、受支持的
Public Contract**，而不是直接读取另一个系统的 private database。

```text
SoulseedOS
does not read
SoulAuth private persistence
to redefine ActorIdentity
```

SoulAuth 通过正式 Integration Surface 提供必要的身份 / Authentication facts；
SoulseedOS 验证这些输入，然后继续处理自己的 Runtime 与 Governance。这样可以同时
保留：

```text
Independent Source of Truth
+
Composable Integration
```

具体 IdentityBinding 如何表示、Canonical Actor Reference 如何传递、Authentication
facts 怎样形成 AuthContext、Consumer 怎样验证这些内容，由
[Soulseed 接入](../integrate/soulseed) 定义。本篇只冻结：

> **Integration 发生在 Contract Boundary，而不是 private implementation coupling。**

## 9 · Architecture Relationship 不等于当前 Release Capability

这一篇描述的是 SoulAuth 与 Soulseed 之间的 **Architecture Relationship**。它不自动
证明当前 Product Release 已经支持某一个具体 Adapter、Endpoint 或 Integration Mode：

```text
Architecture Relationship
≠
Release Capability Status
```

具体当前能够使用哪些 Integration Surface，请以
[选择接入路径](../start/integration-path)、
[Soulseed 接入](../integrate/soulseed) 与
[项目状态](../project/status) 为准。

这让 Architecture 可以保持稳定，同时让当前 Release 诚实描述真正已经实现和验证的
能力。

## 10 · Boundary at a glance

| Boundary | Meaning |
| --- | --- |
| **LLM ≠ Mind OS** | Intelligence capability 不等于持续 Actor 所需的完整 system order |
| **Mind OS ≠ SoulseedOS** | Architecture Concept 不等于具体 Runtime / Governance System |
| **ActorIdentity ≠ Mind** | Identity continuity 不等于 cognitive / mind state |
| **SoulAuth ≠ SoulseedAGI** | Authentication infrastructure 不拥有 Canonical Actor / Mind semantics |
| **SoulAuth ≠ SoulseedOS** | Authentication 不拥有 Runtime / Governance |
| **IdentityBinding ≠ Ownership Transfer** | Cross-domain relation 不改变 Source of Truth |
| **Reference ≠ Ownership** | 保存或解析 Reference 不产生定义权 |
| **Integration Contract ≠ Private DB Sharing** | 系统通过稳定 Contract 组合 |
| **Standalone ≠ Soulseed-dependent** | Soulseed 不是 SoulAuth 成立的前置条件 |
| **Public Reality Infrastructure ≠ 强制认证路径** | 共享可验证基础设施按需要参与 |

把这些边界再压缩，可以得到本篇最重要的架构关系：

```text
SoulseedAGI  defines Actor / Mind
SoulAuth     establishes Identity / Authentication
SoulseedOS   runs / governs
Contracts    connect the domains without merging them
```

## 下一步

到这里，我们已经知道 **SoulAuth 在哪里**。

如果你想继续理解 SoulAuth 自己的内部 Architecture，进入
[SoulAuth 架构](./architecture)：它会回答 Actor-native Identity & Authentication
Infrastructure 内部怎样组织 Identity Domain、Authentication、AuthSession、Protocol、
Control Plane、Security、Audit 与 Persistence。

如果你的目标是把 SoulAuth 与 SoulseedOS 连接起来，则继续
[Soulseed 接入](../integrate/soulseed)，那里会进入具体的 Integration Boundary 与
AuthContext Contract。

SoulAuth 与 Soulseed 的关系最终可以压缩成一句：

> **SoulAuth 保持独立的 Identity & Authentication Boundary，同时通过明确 Contract 与
> Soulseed 组合，而不成为 Mind、Runtime 或 Governance 本身。**
