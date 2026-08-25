# 项目状态

## 一个明确 Release，此刻究竟可以公开依赖什么

Project Status 回答的不是"SoulAuth 未来想做什么"，也不是"Repository 里现在恰好有什么
代码"。它回答：

> **对于一个明确的 SoulAuth Product Release，在一个明确的 Status Snapshot Time，
> 我们今天愿意公开承诺什么？**

```text
Project Status
=
Release-scoped Public Status Manifest
```

它不定义新的 ActorIdentity、Authentication、Protocol、Security 或 Configuration
语义 —— 这些已经由前面的 Canonical Reference 与 Contract 定义。本篇只负责把
**Current Release Reality** 准确投影出来。

## 当前状态

> **尚未发布任何 Public Release Status Snapshot。**
>
> SoulAuth 还没有完成正式产品 Release。按照本页自己定义的规则，这意味着 Release
> Status Gate 处于 **Incomplete**，而不是"状态为空白"。

```text
Unresolved Public Status
→
Release Status Gate Incomplete
```

正确做法是让这道门保持敞开并明说，而不是发布一份塞满 `TBD`、`Pending` 或未加限定
版本号的 Snapshot。下面全部内容描述的是：一份真实 Snapshot 必须满足的语法，以及
Release Process 必须注入哪些确切事实才可能存在这样一份 Snapshot。

### 今天确实已经存在的东西

机器可读契约已经落地，并由仓库中的符合性测试守卫：

| Surface | 它持有什么 |
| --- | --- |
| `contracts/permissions.yaml` | Administrative Permission 词汇，以及每条权限实际在哪里被检查 |
| `contracts/configuration.yaml` | Configuration 词汇：类型、必填性、默认值、生产闸门 |
| `contracts/openapi.yaml` | SoulAuth-owned HTTP Wire，与 Runtime 路由表对齐 |
| `contracts/standards.yaml` | 逐份规范的 implemented / supported / certified 状态 |

`contracts/standards.yaml` 当前记录的 **certified 规范数量为零** —— Certification
需要标准组织的正式流程作为 Evidence，绝不自我声明。

这些 Registry 是 Release 的**输入**，它们不是 Release Status Snapshot，它们的存在也
不构成 Support Claim。

## 1 · Release Facts 与 Status Snapshot Facts 分开

**Release Facts** 描述**这个 Release 是谁**：Product Release、Release Date、Source
Revision、正式 Release Artifact Identity。这些事实不会因为 Project 半年后停止支持这个
Release 而被重新定义。

**Status Snapshot Facts** 回答**在当前时间点，Project 怎样支持、维护和描述这个
Release**：Maintenance Support、Security Support、Capability Support、Lifecycle
Status、Known Limitations、Release Contract Alignment。

```text
Release Identity  ≠  Current Support State
Same Release      ≠  Same Project Status Forever
```

同一个 Release 可以今天 Supported，未来 Deprecated，再后来 Unsupported。改变的是
Project 当前承担的 Public Contract，不是 Release 本身。

### Release Date 不等于 Status Snapshot Time

```text
Release Date
≠
Status Snapshot Time
```

前者回答"这个 Release 什么时候发布"；后者回答"**这份 Status 判断什么时候成立**"。
Maintenance、Security Support、Lifecycle 等状态必须绑定 Snapshot Time，不能被永久
写进 Release Identity。

### Latest、Recommended 与 Supported 也不是同一个问题

```text
Latest Published Release
≠  Recommended Release
≠  Supported Release by definition
```

它们可以在某个 Snapshot 恰好指向同一个 Release，但不能因为值相同就把三个语义合并。
如果 Project 并未正式维护 Recommended Release，本页不创建这个字段。

## 2 · Release Identity、Artifact Identity 与 Provenance 分开

一个 Release 必须允许用户回答：**我部署的到底是什么？**

```text
Product Release
Source Revision
Release Artifact Identity
```

以及另外两个 Evidence 问题：

```text
Artifact Authenticity
Build / Publication Provenance
```

### Product Release 不等于 Source Revision

```text
Product Release
≠
Source Revision
```

一个 Product Release 可以指向明确 Source State，但 Source Revision 本身不是用户最终
运行的 Artifact。

### 一个 Product Release 可以拥有多个 Artifact

```text
Product Release
≠
Single Artifact by definition
```

一个 Release 包含一个还是多个正式 Artifact，由该 Release 真实发布记录决定。

### Artifact Identity 不等于 Artifact Authenticity

Artifact digest 可以回答**这组 bytes 是什么**，但不能自动回答**这组 bytes 是否真的是
Project 正式发布的**：

```text
Artifact Identity
≠
Artifact Authenticity
```

### Source Revision 不等于 Build Provenance

```text
Source Revision  ≠  Build Provenance
Tested Source    ≠  Tested Published Artifact
```

知道 Source Revision 是 X，不能单独证明 Released Artifact Y 确实由 X 通过声明的 Build
Process 产生。

### Mutable Tag 不等于 Immutable Artifact Identity

```text
Mutable Tag
≠
Immutable Release Artifact Identity
```

一个 mutable tag 可以是便利 Locator，但用户最终必须能够准确回答：**我实际运行的
Artifact 属于哪个 Product Release？**

## 3 · Current Release Snapshot

真正对外发布的 Project Status 应该首先给出**当前 Release 事实**，而不是让 Reader
先阅读大量 Status 理论。Snapshot 只展示 Project 当前真实维护并能够证明的字段，至少
覆盖：Product Release；Release Date；Status Snapshot Time；Source Revision；Release
Artifact Set；Artifact Identity；已经实际建立的 Authenticity / Provenance Status；
Documentation Scope；当前 Maintenance / Security Support。

如果 Project 正式维护其它独立 Contract Version，才显示它们；如果没有，不创建一个
看起来专业但实际上不存在的 Version Namespace —— 包括
`Deployment Configuration Revision` 或任何其它尚未成为正式 Project Contract 的
version identifier。

## 4 · Support Status

Support Status 只回答：

> **这个明确 Capability Scope 是否属于 Current Release 正式承担的 Public Support
> Contract？**

核心状态至少有 `Supported` 与 `Unsupported`，Exact Policy Vocabulary 由真实 Project
Policy 决定。

**Supported** 表示这个明确 Scope 属于 Current Release 正式维护的 Public Contract，
因此 Support Claim 至少必须能够指向 Canonical / Public Contract、Current Runtime、
Current Release，以及与 Claim Scope 相称的 Evidence。但必须保持：

```text
Supported
≠
Tested
```

Supported 不是一个"Tests=true"的别名 —— Evidence 与 Support 是相关但不同的维度。

**Unsupported** 表示这个明确 Capability Scope 不属于 Current Release Public Support
Contract：

```text
Unsupported                    ≠  Broken
Unsupported Public Capability  ≠  Implementation Absence by definition
```

Runtime 明确拒绝一个 Unsupported capability 可以是完全正确的行为；内部代码存在某个
实验能力，也不会让它自动进入 Public Support Contract。

## 5 · Support Status 与 Lifecycle Status 分开

Support 回答"Project 还承担不承担这个 Contract"；Lifecycle 回答"Project 怎样建议用户
继续使用它"。

```text
Support Status  ≠  Lifecycle Status
Deprecated      ≠  Unsupported
```

一个 Capability 完全可能：

```text
Support Status   = Supported
Lifecycle Status = Deprecated
```

意思是 Project 当前仍承担这个 Public Contract，但不建议新的 Integration 继续采用。
Exact Lifecycle Vocabulary 只使用 Current Project Policy 真正维护的状态 —— 本页不创建
新的 Lifecycle State Machine。

## 6 · 五种状态分开

```text
Implemented ≠ Supported ≠ Tested ≠ Conformant ≠ Certified
```

本页不重新定义这五个词。尤其 **Conformant 与 Certified 的精确 Claim Grammar 由
[标准与符合性](../security/standards-and-conformance) 拥有**。本页只汇总 Current
Release 实际上达到了什么 Status —— 不能通过 Project Status 重新创造 Standards
Claim。

### Canonical Semantics 不进入 Capability Support Matrix

`ActorIdentity`，以及 Human 与 AIActor 具有 first-class identity standing，属于
**Canonical Semantics**。它们不是一个 Release 可以选择 `Supported / Unsupported` 的
optional feature。

如果 Current Runtime 背离 Canonical Semantics，那是 **Release Contract Drift /
Defect**，不是"该 Ontology 在这个版本 Unsupported"。因此本页正式区分：

```text
Canonical Semantic Alignment
≠
Capability Support Surface
```

前者回答 Release 有没有正确实现上游 Canonical Meaning；后者回答 Current Release 具体
承担哪些 Public Capabilities。

## 7 · Capability Name 不等于 Complete Support Scope

`OIDC` 这样的名字不是完整 Support Claim，因为真正的 Capability Scope 可能还需要限定
Protocol Role、Flow、Client Profile、Subject Policy、Token Contract、Optional
Surface、Applicability Preconditions：

```text
Capability Name
≠
Complete Support Scope
```

Project Status 不能只展示 `OIDC ✅` 然后让 Reader 自己猜到底支持什么。

### Public Capability Matrix

| Dimension | Meaning |
| --- | --- |
| **Capability / Scope** | 到底承诺什么 |
| **Applicability** | 什么条件下适用 |
| **Support Status** | 是否进入 Current Public Contract |
| **Lifecycle Status** | Current Project Policy 如何看待该能力 |
| **Evidence / Status Reference** | 什么 Evidence 支持这个状态 |
| **Canonical Reference** | 精确 Contract 在哪里定义 |

不需要为每一行重复 `Implemented=true` / `Tested=true`，这些 Evidence 维度应该由对应
Evidence / Standards Surface 准确表达。

### Release Support 不等于 Deployment Runtime State

```text
Release Support ≠ Deployment Applicability ≠ Enabled State ≠ Operational Reality
```

Project Status 可以说明 Supported Capability 的 Applicability Preconditions，它不
负责报告某个用户 Deployment 此刻是否 Enabled 或 Healthy —— 那属于 Runtime /
Operations Surface。

## 8 · Every Public Status Claim Needs Evidence

```text
Public Status Claim
=
Defined Scope
+ Exact Release
+ Evidence Subject
+ Applicable Evidence
+ Status Snapshot Time
```

**Defined Scope** —— 到底在声称什么？**Exact Release** —— 针对哪个 Product Release？
**Evidence Subject** —— Evidence 真正验证的是 Source、Built Artifact、Released
Artifact、Identified Deployment、Protocol Profile 还是 Configuration / Feature
Scope？**Applicable Evidence** —— 到底是什么测试、验证、认证或 Traceability
Evidence？**Status Snapshot Time** —— 这个判断什么时候成立？

少掉其中任何一项，都有可能把 Public Claim 扩大到 Evidence 无法支撑的范围。

### Evidence Subject 不能省略

`tests passed` 不是一个完整的 Status Claim —— 必须继续问**测试的到底是什么**：

```text
Test Evidence          ≠  Published Artifact Evidence by default
Prior Release Evidence ≠  Current Release Evidence by default
```

旧 Evidence 只有在 Current Release Gate 能够建立明确 Traceability 时，才能继续支撑
Current Claim。

## 9 · Important Unsupported Surface

一个成熟 Project Status 不能只写什么支持，还必须告诉用户**哪些很容易被合理理解为
"应该存在"，但 Current Release 实际上并不承担 Public Support Contract**。

尤其在成熟 OAuth / OIDC 生态中，用户很容易根据相邻标准能力自动推断其它 Feature
存在。所以 Important Unsupported Surface 必须**显式**，不能依赖 Documentation
absence，更不能依赖"没有提到，应该就是没有"。

### Unsupported 不等于 Roadmap

```text
Unsupported       ≠  Roadmap Commitment
Known Limitation  ≠  Roadmap Promise
Project Status    ≠  Roadmap
```

Project Status 只回答**此刻什么成立**，不能用"Coming soon"把 Current Unsupported
Surface 包装成半支持状态。

### Known Limitation 不等于 Broken by definition

```text
Known Limitation
≠
Broken by definition
```

它可能是当前 Implementation Boundary、Design Constraint，也可能对应已知 Defect ——
仅看到这四个字不能自动判断是哪一种，Project Status 应该准确说明实际情况。

## 10 · Standards & Evidence Summary

本页不创造任何新的 Standards Claim。所有 Implemented / Tested / Conformant /
Certified 在 Standards 语境中的精确含义与 Claim Scope，来自
[标准与符合性](../security/standards-and-conformance)：

```text
Standards Status Summary
≠
New Conformance Claim
```

如果没有 Evidence，不写 Conformant；如果没有 Formal Certification，不写 Certified。

一个完整 Standards Summary 至少需要能够说明 Specification / Profile、Protocol Role、
Scope、Evidence Subject、Current Claim、Evidence，以及真实存在时的 Certification。
不能只写 `OIDC compliant` 作为完整状态。

## 11 · Security Support 也是 Snapshot Fact

```text
Security Support Status
≠
Immutable Release Fact
```

一个 Release 的 bytes 可以完全不变，但当前是否仍获得 Security Fix 支持可以改变。

```text
Security Testing          ≠  No Vulnerabilities
Release Security Controls ≠  Every Deployment Is Secure
```

任何 Security Test Claim 仍然需要 Evidence Subject 与 Test Scope；一个 Release 拥有
正确 Security Contract，不能证明任意 Deployment 都配置正确。

### Supported Release 不等于 Production-ready Deployment

```text
Supported Release
≠
Production-ready Deployment
```

Project Status 可以说明某 Release 是否属于 Current Public Support Contract，它不能给
任意 Deployment 盖上 `Production Ready ✅` —— 每个实际 Deployment 仍然需要
[生产环境检查表](../operate/production-checklist) 进行独立 Sign-off。

```text
Release Contract Alignment
≠
Deployment Readiness
```

注意这里不使用"Release Conformance"描述通用 Release Contract 一致性，`Conformant`
继续保留给 Standards / Profile Claim。

## 12 · Support Lifecycle

Project Status 应该准确说明：哪些 Release 仍在 Maintenance Support Window；哪些仍
获得 Security Support；哪些已经进入 Deprecated / End-of-Support 状态（如果 Project
Policy 存在这些概念）。

```text
Latest Published Release  ≠  Only Supported Release by definition
Open-source Maintenance   ≠  Commercial Support SLA
```

除非 Project 明确提供 Commercial SLA，"Supported"本身不能被解释成 24×7 响应时间或
商业服务承诺。

## 13 · Compatibility 是 Directional and Scoped

```text
Source Contract State
        ↓
Target Contract State
```

```text
Compatibility(A → B)  ≠  Compatibility(B → A)
Supported Upgrade     ≠  Supported Rollback
```

A → B 可以被正式支持，这不会自动证明 B → A 也安全。

Project Status 不预设每个 Release 都拥有完整的 API、Protocol、Configuration、
Persistence、Upgrade、Rollback 兼容性矩阵，只展示 **Current Release 真正承担
Compatibility Contract 的维度**。没有正式 Contract，就不创建 Version 或 Status。

### Version Number 不自动创造 SemVer Guarantee

```text
Version looks like x.y.z
≠
SemVer Compatibility Guarantee
```

Version 格式不能替 Project 创建兼容性承诺。

## 14 · Release Contract Alignment

SoulAuth 的 Public Contract 不是一个单独文件。Current Release 可能由 Canonical
Documentation、Runtime、OpenAPI、Config Registry、Permission Registry、Standards
Registry、Verification Evidence 以及其它实际 Release Assets 共同描述。这些 Surface
不需要复制相同内容：

```text
Contract Alignment
≠
Contract Duplication
```

它们只需要在自己的 Ownership Scope 内共同描述同一个 Release Reality。

### Different Surface ≠ Different Meaning

```text
Code Release  ≠  Complete Public Contract
OpenAPI       ≠  Complete Public Contract
```

OpenAPI 拥有 SoulAuth-owned exact HTTP Wire，它不拥有 ActorIdentity Ontology、
External OAuth / OIDC 全部语义、Security Model 或 Project Status。同样，Runtime 行为
不能静默改写上游 Canonical Meaning。不存在 `code always wins` 或 `docs always win`
这样的盲目优先级 —— 发生不一致就调查 Contract Drift。

### Documentation Published 不等于 Documentation Aligned

```text
Documentation Published
≠
Documentation Aligned
```

一个页面已经上线，不证明它描述的是 Current Release Reality。如果 Documentation 写
Endpoint A 而 Current Runtime 只有 Endpoint B，页面存在并不能修复 Contract Drift。

### Material Contract Drift = Release Contract Defect

```text
Material Runtime / Public Contract Drift within declared ownership scope
=
Release Contract Defect
```

## 15 · Release Contract Surface Responsibility

| Surface | Responsibility |
| --- | --- |
| **Canonical Documentation** | Concepts、Guides、Semantic / Human-readable Contract |
| **Runtime** | 实际执行 Current Release 声明的 Contract |
| **OpenAPI** | SoulAuth-owned HTTP Wire Contract |
| **Config Registry** | Exact Configuration Vocabulary |
| **Permission Registry** | SoulAuth-local Administrative Permission Vocabulary |
| **Standards Registry** | Current Standards / Profile Claim Data |
| **Verification Evidence** | 测试与其它可验证 Evidence |

这不是"Runtime 拥有最终语义"。真正关系仍然是：

```text
Canonical Meaning
        ↓
Declared Contract
        ↓
Machine Representation
        ↓
Runtime
```

而 Evidence 从 Runtime 向上证明：

```text
Runtime → Verification → Evidence → Status
```

## 16 · SoulAuth Project Status 与 Soulseed Project Status 分开

```text
SoulAuth Project Status
≠ SoulseedAGI Project Status
≠ SoulseedOS Project Status
```

Soulseed Integration 是否 Supported 可以是 SoulAuth Current Capability。但：

```text
Soulseed Integration Support
≠
Soulseed Runtime Dependency
```

SoulAuth 仍然可以 Standalone；SoulseedAGI 或 SoulseedOS 发布新 Release，不会未经明确
Compatibility Contract 自动改变 SoulAuth Release Identity。

## 17 · Project Assets 各自负责自己的问题

Project Status 只回答**什么现在成立**。其它实际存在的 Project Asset 继续承担自己的
职责：CHANGELOG 记录随时间发生了什么变化；安全策略说明安全问题如何上报和处理；
贡献指南说明如何提交改动；LICENSE 说明法律使用与分发。但 Public Documentation 只
链接 Repository 真实存在的 Project Assets —— 本页不为了完整性创建一个并不存在的
文件。

## Project Status at a glance

| Boundary | Meaning |
| --- | --- |
| **Project Status ≠ New Semantic Source of Truth** | 本页只投影上游 Contract |
| **Release Identity ≠ Current Support State** | Release 不因 Support Policy 变化而重定义 |
| **Release Date ≠ Status Snapshot Time** | 发布与当前状态是两个时间 |
| **Product Release ≠ Source Revision** | 产品版本与代码状态分离 |
| **Artifact Identity ≠ Artifact Authenticity** | Bytes identity 不证明发布来源 |
| **Source Revision ≠ Build Provenance** | 知道源码不等于证明 Artifact 如何生成 |
| **Mutable Tag ≠ Immutable Artifact Identity** | `latest` 不能充当 Release Identity |
| **Implemented ≠ Supported ≠ Tested ≠ Conformant ≠ Certified** | 五种状态不能压成一个 Badge |
| **Support Status ≠ Lifecycle Status** | Deprecated 可以仍然 Supported |
| **Unsupported ≠ Broken** | 不属于 Public Contract 不等于实现故障 |
| **Canonical Semantics ≠ Optional Capability** | Canonical Meaning 不能被标记成 Unsupported |
| **Capability Name ≠ Complete Support Scope** | `OIDC ✅` 不是完整 Claim |
| **Release Support ≠ Deployment Operational State** | Project Status 不是 Live Runtime Dashboard |
| **Supported Release ≠ Production-ready Deployment** | Production 由检查表独立 Sign-off |
| **Compatibility(A→B) ≠ Compatibility(B→A)** | Compatibility 有方向与 Scope |
| **Supported Upgrade ≠ Supported Rollback** | Upgrade 不能推导 Downgrade |
| **Contract Alignment ≠ Contract Duplication** | 不同 Surface 各守 Owner 但描述同一 Reality |
| **Documentation Published ≠ Documentation Aligned** | 页面存在不证明 Current Accuracy |
| **Known Limitation ≠ Roadmap Promise** | 当前边界不是未来承诺 |
| **Project Status ≠ Roadmap** | 这里只描述今天 |
| **SoulAuth Project Status ≠ Soulseed Project Status** | 三个 Project Release Truth 独立 |

## Public Status Claim 的最终规则

```text
What exactly are we claiming?
        ↓
For which Product Release?
        ↓
What is the Evidence Subject?
        ↓
What Evidence supports it?
        ↓
Is that Evidence applicable to this Release and Scope?
        ↓
At what Snapshot Time does this Claim hold?
```

```text
Public Status Claim
=
Defined Scope + Exact Release + Evidence Subject
+ Applicable Evidence + Snapshot Time
```

如果一句"我们支持这个"无法继续回答这五个问题，它就还不应该成为 Project Status 里的
Public Claim。

## Current Release Data Boundary

本页和其它二十九篇文档有一个根本区别：前二十九篇可以先完成 Canonical Semantic
Final；本页如果没有真实 Release Data，仍然不能成为真正的 Public Status Snapshot。

因此，真正发布的 Project Status 必须由 Current Release Process 注入并验证至少以下
事实：Current Product Release；Release Date；Status Snapshot Time；Source Revision；
Release Artifact Set；Artifact Identity；实际 Authenticity / Provenance Status；
Documentation Scope；Current Supported / Unsupported Surface；Deprecated Surface
（如果存在）；Maintenance Support；Security Support；Current Standards Claims；
Evidence Subjects；Evidence Pointers；Certification（如果真实存在）；Compatibility
Commitments；Important Unsupported Surface；Known Limitations；Release Contract
Alignment Result。

> **这些事实不能由 Documentation 推理、补全或猜测。**

### No Placeholder Rule

最终 Public Project Status 禁止出现：

```text
<EXACT_RELEASE>   TBD   Pending   ?   blank status
```

```text
Unresolved Public Status
→
Release Status Gate Incomplete
```

—— 而不是留空以后发布。这条规则正是本页顶部说明"闸门敞开"而不是展示一份编造
Snapshot 的原因。

## Exact Semantic Ownership

本篇拥有 **Release Identity Summary、Support / Unsupported Public Status、Lifecycle
Status Projection、Evidence-backed Public Status Claims、Support Lifecycle、
Compatibility Summary、Unsupported Surface 以及 Release Contract Alignment
Summary**。

它不自行定义 ActorIdentity semantics、Authentication methods、Token profiles、
Configuration vocabulary、Permission vocabulary、Standards conformance semantics、
Production readiness、Audit semantics、Protocol wire behavior —— 它只汇总这些上游
Owner 对于 Current Release 已经证明成立的结果。
