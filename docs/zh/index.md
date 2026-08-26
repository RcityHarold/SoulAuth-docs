---
layout: home

hero:
  name: SoulAuth
  text: Actor-native 身份与认证基础设施
  tagline: Human 与 AIActor 通过同一份 first-class ActorIdentity contract 进入系统。由 TRANTOR LABS（新加坡）构建。
  actions:
    - theme: brand
      text: SoulAuth 是什么
      link: /zh/start/what-is-soulauth
    - theme: alt
      text: 快速开始
      link: /zh/start/quickstart
    - theme: alt
      text: GitHub
      link: https://github.com/RcityHarold/SoulAuth

features:
  - title: WHO —— ActorIdentity
    details: ActorIdentity 是 Canonical Actor Identity Anchor。Human 与 AIActor 都是 Actor Kind，共享 first-class identity standing —— 相同的身份契约，不是相同的实现或权限。
    link: /zh/concepts/actor-identity-model
    linkText: Actor 身份模型
  - title: WHERE —— Define → Authenticate → Operate
    details: SoulseedAGI 定义 Canonical Actor 与 Mind，SoulAuth 认证 ActorIdentity，SoulseedOS 运行与治理。SoulAuth 可独立运行，Soulseed 接入是可选关系。
    link: /zh/concepts/soulseed-and-mind-os
    linkText: Soulseed 与 Mind OS
  - title: HOW —— 逻辑职责
    details: Protocol Edge、Identity Domain、Authentication Core、有界连续性与 Federation，加上横跨全生命周期的 Control / Security / Audit 三个 Plane 与底层基础设施。
    link: /zh/concepts/architecture
    linkText: SoulAuth 架构
  - title: 边界 —— Authentication ≠ Authority
    details: 认证成功不会创造 Application Authority、Soulseed Governance Authority，也不会获得现实世界行动权。SoulAuth 在身份边界停止。
    link: /zh/concepts/identity-vs-authority
    linkText: 身份与权限
---

## SoulAuth

SoulAuth 从一个基础问题开始：

> **谁正在被认证？**

很多 application-centric identity system 自然围绕 Human User 或 Human Account 组织
长期 Identity。当系统开始需要让 AIActor 也能够作为自己被稳定识别、Authentication 和
Attribution 时，Human-specific account model 就不再足以充当整个 Identity Ontology 的
唯一根。

SoulAuth 因此采用 **Actor First** —— 先回答**谁是 Actor**，再回答**这个 Actor 怎样
证明自己**。

> Current Release 具体支持哪些能力、Protocol Profile、Deployment Surface 与
> Integration，统一以 [项目状态](/zh/project/status) 为准。

## WHO · 一个以 Actor 为中心的身份模型

<Figure
  src="/figures/figure-2-actor-centred-identity-model.zh.webp"
  alt="一个以 Actor 为中心的身份模型：Human 与 AIActor 通过不同 Credential 进入同一个 ActorIdentity。"
  title="Figure 2 · 一个以 Actor 为中心的身份模型"
/>

在 SoulAuth Identity Domain 中，**ActorIdentity** 是 Canonical Actor Identity
Anchor。Human 与 AIActor 都是 Actor Kind，二者共享 **First-class Identity
Standing** —— 都可以作为自己进入 ActorIdentity Canonical Identity Contract。

这不意味着：

```text
Same identity standing = Same implementation
Same identity standing = Same authority
```

Human 与 AIActor 可以拥有不同的 Credential、Authentication Method、Lifecycle 与
domain-scoped Authority。因此几个核心边界长期成立：

```text
ActorIdentity  ≠  HumanAccount
ActorIdentity  ≠  Credential
ActorIdentity  ≠  Client
Client         ≠  Actor
```

进一步理解：[AI 原生身份](/zh/concepts/ai-native-identity) ·
[Actor 身份模型](/zh/concepts/actor-identity-model) ·
[身份与权限](/zh/concepts/identity-vs-authority)

## WHY · 为什么是 Actor First

SoulAuth 并不是给传统 User 模型增加一个 `type = ai`。它真正改变的是 **Identity
Root**。

如果 AIActor 需要作为自己被识别和 Authentication，它就不应该必须先伪装成
HumanAccount、Client、Credential 或其它并不等价的对象。因此：

```text
Actor First
=
Identify who the Actor is
before deciding how that Actor proves itself
```

而不是：

```text
Human implementation = Entire identity ontology
```

更完整的理由由 [AI 原生身份](/zh/concepts/ai-native-identity) 负责解释。

## WHERE · SoulAuth 在 Soulseed 生态中的位置

<Figure
  src="/figures/figure-1-soulseed-agi-infrastructure.zh.webp"
  alt="LLM 之上的 Soulseed AGI 基础设施，SoulAuth 作为独立的身份与认证基础设施。"
  title="Figure 1 · Soulseed —— LLM 之上的 AGI 基础设施"
/>

SoulAuth 可以独立运行 —— 它不依赖 Soulseed 才能建立自己的 ActorIdentity 与 Identity /
Authentication Domain。

在 Soulseed ecosystem 中，最重要的责任边界可以压缩成：

```text
SoulseedAGI  → Define
SoulAuth     → Authenticate
SoulseedOS   → Operate / Govern
```

也就是 **Define → Authenticate → Operate**。SoulseedAGI 拥有 Soulseed Canonical Actor
与 Mind 的定义责任；SoulAuth 拥有自己的 ActorIdentity 与 Authentication 责任；
SoulseedOS 拥有 Runtime 与 Governance 责任。

因此 SoulAuth 不是 SoulseedAGI 的一部分，也不是 SoulseedOS 的内部 Identity module。
Soulseed Integration 是一种可选的 ecosystem integration，不是采用 SoulAuth 的前提。

进一步理解：[Soulseed 与 Mind OS](/zh/concepts/soulseed-and-mind-os) ·
[Soulseed 接入](/zh/integrate/soulseed)

## HOW · SoulAuth 的 Logical Architecture

<Figure
  src="/figures/figure-3-soulauth-architecture.zh.webp"
  alt="SoulAuth 逻辑职责架构，以 ActorIdentity 为身份根。"
  title="Figure 3 · SoulAuth —— Actor-native 身份基础设施架构"
/>

SoulAuth 的 Logical Architecture 由三部分组成。首先是 Identity 与 Authentication 的
主要责任链：

```text
Protocol / Edge
        ↓
Identity Domain
        ↓
Authentication Core
        ↓
bounded continuity / federation-facing responsibilities
```

这是一组 **Logical Responsibilities** —— 不是所有 Authentication 都必须经过完全相同的
Runtime Sequence。

第二组是三个 cross-cutting planes：

```text
Control Plane
Security Protection
Audit & Attribution
```

它们横向作用于 Identity 与 Authentication lifecycle。底层则是 **Persistence &
Infrastructure**，负责承载实际运行所需要的基础设施责任。

因此必须保持：

```text
Architecture Component  ≠  Deployment Unit
One Database            ≠  One Domain
```

物理部署可以简单，Logical Domain 仍然必须保持清楚。

完整架构：[SoulAuth 架构](/zh/concepts/architecture)

## Boundary · SoulAuth 负责到哪里

SoulAuth 负责 **Identity 与 Authentication**，以及维持这些责任所需要的
administrative control、security protection、historical accountability。

它不会把 Authentication 无限向上扩张：

```text
Authentication
≠
Authority
```

Identity 回答**是谁**；Authority 回答**为什么这个 Principal 在当前 Domain 里可以做
这件事**。

SoulAuth 不会因为 Authentication 成功，就自动创造 Application Authority、自动创造
Soulseed Governance Authority、自动获得现实世界行动权。

**SoulAuth 不定义 Mind。** AIActor 怎样思考、它的长期 Mind 是什么、它怎样形成
Memory、Judgment 或人格 —— 这些不属于 SoulAuth Identity Domain。

**SoulAuth 不负责 Agent Orchestration。** 它不决定 Agent 应该规划什么任务、调用哪个
Tool、怎样完成 Workflow。

**SoulAuth 不执行下游行为：**

```text
Authentication
≠
Execution
```

它可以证明 Actor Authentication 是否按照自己的 Contract 成立，但不会因此替 Actor
修改文件、调用外部系统、支付或执行其它现实行为。

进一步理解：[SoulAuth 是什么](/zh/start/what-is-soulauth) ·
[身份与权限](/zh/concepts/identity-vs-authority)

## Standalone 与 Soulseed

SoulAuth 的 Canonical Identity / Authentication 责任可以独立成立：

```text
SoulAuth can operate standalone.
Soulseed Integration ≠ Soulseed Runtime Dependency
```

具体 Current Release 是否支持某项 Standalone deployment、OIDC Profile 或 Soulseed
Integration Surface，不由本页宣布 —— 统一查看 [项目状态](/zh/project/status)。

## Security & Trust

Security 不是 SoulAuth 部署完成以后再附加的一层。在 Architecture 中，**Security
Protection** 以及 **Audit & Attribution** 本身就是 cross-cutting responsibilities。

本页不维护具体 Security Feature List，完整安全边界分别进入：

- [安全模型](/zh/security/security-model) —— 定义 Assets、Trust Boundaries 与
  Security Properties
- [威胁模型](/zh/security/threat-model) —— 定义 Adversaries、Threats 与 Failure
  Scenarios
- [认证防护](/zh/security/authentication-protection) —— 定义 Control 及其保证与限制
- [标准与符合性](/zh/security/standards-and-conformance) —— 定义 Standards / Profile
  Claim 以及 Evidence Boundary

## Get Started

第一次接触 SoulAuth，不需要线性读完全部文档。

**Understand** —— 如果你首先想判断 SoulAuth 是什么、它负责到哪里，进入
[SoulAuth 是什么](/zh/start/what-is-soulauth)。

**Run** —— 如果你只想用 Current Release 最快获得第一次可验证成功，进入
[快速开始](/zh/start/quickstart)。它使用 Current Release 真实 Golden Path，不会替
Current Release 创造不存在的 Feature。

**Integrate** —— 如果你正在设计 Web、Backend / API、OIDC、AI / Agent 或 Soulseed
等真实 Integration Boundary，进入 [选择接入路径](/zh/start/integration-path)。

**Deploy** —— [部署](/zh/operate/deployment) 回答系统怎样部署；
[生产环境检查表](/zh/operate/production-checklist) 回答这个明确 Deployment 是否达到
Production Sign-off 要求。

## Current Release

本页描述 **SoulAuth 的 Canonical Product 与 Architecture**。它不负责回答：当前
Release 到底有哪些 Feature 已经 Supported？哪些仍 Unsupported？哪些已经 Deprecated？
哪些 Standards Claim 有 Evidence？哪个 Artifact 对应哪个 Source Revision？哪些
Compatibility Path 得到正式承诺？

这些全部进入 **[项目状态](/zh/project/status)**。因此长期保持：

```text
README Product Summary   ≠  Release Support Manifest
Architecture Possibility ≠  Current Supported Capability
```

本文档不会使用 `OIDC ✅` / `MFA ✅` / `SSO ✅` 这类没有 Scope、Release、Evidence
Subject 与 Snapshot Time 的简单 Badge 代替真实 Release Status。

## Documentation

SoulAuth Public Documentation 由以下 30 篇 Canonical Documents 组成：

| Module | Documents |
| --- | --- |
| **Entry** | 本页 |
| **开始** | [SoulAuth 是什么](/zh/start/what-is-soulauth) · [快速开始](/zh/start/quickstart) · [选择接入路径](/zh/start/integration-path) |
| **概念** | [AI 原生身份](/zh/concepts/ai-native-identity) · [Actor 身份模型](/zh/concepts/actor-identity-model) · [身份与权限](/zh/concepts/identity-vs-authority) · [Soulseed 与 Mind OS](/zh/concepts/soulseed-and-mind-os) · [SoulAuth 架构](/zh/concepts/architecture) |
| **接入** | [注册 Client](/zh/integrate/register-a-client) · [授权码流程](/zh/integrate/authorization-code-flow) · [浏览器与 BFF](/zh/integrate/browser-and-bff) · [验证 Token](/zh/integrate/verify-tokens) · [Soulseed 接入](/zh/integrate/soulseed) |
| **运行** | [部署](/zh/operate/deployment) · [生产环境检查表](/zh/operate/production-checklist) · [运维与恢复](/zh/operate/operations-and-recovery) · [故障排查](/zh/operate/troubleshooting) |
| **安全与信任** | [安全模型](/zh/security/security-model) · [威胁模型](/zh/security/threat-model) · [认证防护](/zh/security/authentication-protection) · [标准与符合性](/zh/security/standards-and-conformance) |
| **参考** | [API 约定](/zh/reference/api-conventions) · [认证与会话](/zh/reference/authentication-and-sessions) · [Actor 与档案](/zh/reference/actors-and-profiles) · [OIDC 与 Client](/zh/reference/oidc-and-clients) · [管理](/zh/reference/administration) · [审计](/zh/reference/audit) · [配置](/zh/reference/configuration) |
| **项目** | [项目状态](/zh/project/status) |

## At a glance

```text
WHO
→ ActorIdentity
→ Human + AIActor
→ first-class identity standing

WHERE
→ SoulseedAGI defines
→ SoulAuth authenticates
→ SoulseedOS operates / governs

HOW
→ Identity / Authentication responsibilities
→ Control / Security / Accountability
→ Infrastructure base

BOUNDARY
→ Authentication ≠ Authority
→ SoulAuth ≠ Mind owner
→ Authentication ≠ Execution

START
→ What is SoulAuth
→ Quickstart
→ Choose an Integration Path

PRODUCTION
→ Deployment
→ Production Checklist

CURRENT REALITY
→ Project Status
```

## Canonical Invariants

```text
ActorIdentity  ≠  HumanAccount
ActorIdentity  ≠  Credential
ActorIdentity  ≠  Client
Client         ≠  Actor

Same first-class identity standing  ≠  Same implementation

Authentication  ≠  Authority
SoulAuth        ≠  Mind owner
Authentication  ≠  Execution

Architecture Component  ≠  Deployment Unit
One Database            ≠  One Domain
```

更完整的定义进入各自 Canonical Owner —— 本页不成为第二个 Invariant Registry。

## About

SoulAuth 由 **TRANTOR LABS, Singapore** 构建。

TRANTOR LABS 的研究方法可以压缩成一句话：

> **哲学定义问题，工程验证答案。**

这句话表达 Project 背后的研究方法，它不是 SoulAuth Technical Contract 的一部分。
