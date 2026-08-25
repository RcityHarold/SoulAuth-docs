# 标准与符合性

## SoulAuth 如何使用标准，又如何准确证明自己履行了什么

SoulAuth 使用 OAuth、OpenID Connect 以及相关标准与其它系统建立可互操作的 Protocol
Boundary。但：

> **"使用标准"不是一句产品宣传。**

例如 `SoulAuth supports OpenID Connect` 本身并不是完整的 Conformance Claim。至少还
需要回答：

```text
Which Specification or Profile?
Which Protocol Role?
Which exact Scope?
Which Release or identified Deployment?
What Evidence supports the claim?
```

因此：

> **Standards Claim 必须是可限定、可追踪、可验证的事实**，而不能只是"兼容 OAuth"
> 或"支持 OIDC"。

## 1 · Claim Vocabulary

SoulAuth 需要严格区分几种经常被混用的状态：

| Claim | 在 Standards / Verification 语境中的含义 |
| --- | --- |
| **Implemented** | Runtime 中已经存在对应 Capability |
| **Tested** | 指定 Evidence Subject 已经运行声明的 Test / Test Profile |
| **Conformant** | 有适用 Evidence 支持某个 Implementation 满足声明 Specification / Profile 中的 Requirement |
| **Certified** | 已按照相应 External Certification Program，对明确 Scope 获得正式 Certification Status |

这些词不能互换：

```text
Implemented  ≠  Tested  ≠  Conformant  ≠  Certified
```

另外还有 **Supported**，但 Supported 不是本篇重新定义的 Standards Status。它属于
当前 Product Release 的 Public Support Contract，由 [项目状态](../project/status)
负责发布：

```text
Implemented  ≠  Supported
Tested       ≠  Supported
Conformant   ≠  Supported
```

一个 Capability 可能已经存在于代码中，却尚未进入当前正式 Support Surface。同样，
一项 Capability 可能运行过某些 Test，却不能因此自动升级为完整 Conformance Claim。

### `compatible` 不是正式 Conformance Status

`OAuth compatible`、`OIDC compatible` 这类表达可以用于描述 Integration Positioning。
但：

```text
OIDC compatible  ≠  OIDC Conformant  ≠  OIDC Certified
```

如果 Public Documentation 使用 **Conformant** 或 **Certified**，必须满足本文定义的
更严格 Claim Contract。

## 2 · 谁拥有哪一种 Semantics

SoulAuth 同时面对三种不同的 Semantic Authority，它们必须保持分离。

### External Specification

OAuth、OpenID Connect 及其它适用 External Specification 拥有**自己的 Protocol Term、
Wire Behavior 与 Normative Requirement**。如果 SoulAuth 声明符合某个 Specification
或 Profile，就必须按照该 Specification 解释它的 Protocol Semantics。

例如 `OAuth Client` 仍然是 OAuth Client。SoulAuth 不能因为内部存在 ActorIdentity，
就把标准中的 Client 重新解释成 Actor：

```text
External Specification owns External Protocol Semantics
```

### SoulAuth Declared Profile

一个外部标准通常允许多个合法实现选择。SoulAuth 不需要实现标准历史上出现过的每一种
Optional Capability，它可以声明一个更窄、更明确的 Profile：

```text
External Specification
        ↓  allowed protocol space
SoulAuth Declared Profile
        ↓  selected supported behavior
```

所以：

> **Interoperability 不要求 Maximum Optionality。**

SoulAuth 可以在 External Standard 允许的范围内支持较小的 Feature Surface、使用更
严格的 Security Requirement、限制某些 Client 或 Flow、缩小 Algorithm 或 Extension
选择。但：

```text
SoulAuth Profile
≠
Permission to weaken an applicable External MUST
```

如果 SoulAuth 声明符合某项 Requirement，就不能通过重新解释标准来迁就现有
Implementation。应该修正的是 Implementation、Declared Profile 或 Public Claim。

### SoulAuth Actor-native Semantics

OAuth / OIDC 解决的是**系统之间怎样使用共同 Protocol Language 互操作**。它们不会替
SoulAuth 定义：

```text
ActorIdentity   AIActor   HumanAccount   IdentityBinding   Identity vs Authority
```

这些属于 SoulAuth 自己的 Canonical Semantic Contract。因此：

```text
External Protocol Semantics  ≠  SoulAuth Actor Ontology
Protocol Conformance         ≠  SoulAuth Semantic Invariants Proven
```

通过外部 OIDC Test Suite，不会自动证明：AIActor 不需要 HumanAccount；Client 与
Actor 始终分离；Credential 始终绑定到正确 ActorIdentity；Authentication 没有被提升成
Authority；Soulseed Integration 没有突破 Source-of-Truth Boundary。这些属于
**SoulAuth Semantic Invariant Verification**，而不是另一种外部 Standards Conformance
Status。

## 3 · 一个完整 Conformance Claim 包含什么

正式 Conformance Claim 至少需要绑定：

```text
Specification / Profile
Protocol Role
Claim Scope
Release or identified Deployment
Evidence Subject
Applicable Evidence
```

也就是说：

> **Conformance 从来不是对整个产品无限制成立的单一标签。**

### Protocol Role 是 Claim 的一部分

OAuth / OIDC 包含不同 Protocol Role，不同 Role 承担不同 Requirement：

```text
Conformance Claim
≠
Role-less Claim
```

SoulAuth 只能针对自己实际承担的 Protocol Role 以及实际声明的 Profile Scope 作
Conformance Claim。如果某项 Requirement 属于 Client、Relying Party、Resource Server
或其它参与方，SoulAuth 不能因为自己实现了 Server Capability，就替其它参与者声明
Conformance。

## 4 · External Requirement 与 SoulAuth Requirement 必须能够追溯

Public Documentation 中的 Normative Language 不能失去来源。当 SoulAuth 使用 `MUST`、
`MUST NOT`、`SHOULD`、`SHOULD NOT`、`MAY` 时，至少应该能够区分三种来源：

- **External Normative Requirement** —— 来自适用的 External Specification、Profile 或
  Security BCP。
- **SoulAuth Profile Requirement** —— 由 SoulAuth 在 External Standard 允许范围内
  进一步收紧的正式 Contract。
- **Operational Recommendation** —— 对 Operator 或 Integrator 有帮助的建议，但本身
  不是 Protocol Conformance Requirement。

```text
Recommendation
≠
Normative Requirement
```

更重要的是：**两个 Requirement 即使最终要求相同行为，也应该能够追溯是谁定义了
它。** 这样出现 Conflict 或 Drift 时，我们才能修正真正的 Source，而不是重新解释
下游文档。

## 5 · Standards Registry 与长期 Constitution 分开

外部 Standards Ecosystem 会变化：新的 Specification 可能发布，现有 Specification
可能被更新，Test Suite、Certification Profile 和 External Draft Status 同样会变化。
因此 SoulAuth 把两类信息分开。

**Long-lived Conformance Constitution** 就是本文，它定义长期不应漂移的规则：

```text
Claim must have Scope
Protocol Role must be explicit
External standard terms keep their external meaning
Evidence must have a defined Subject and Scope
Certification claims must not exceed their certified boundary
```

**Release-time Standards Registry** 维护会变化的事实：哪些 specification 适用、
当前声明哪个 profile、哪条 external requirement 适用、使用什么 test profile、存在
什么 evidence、外部标准处于什么状态。在本仓库中，这份 Registry 就是机器可读的
`contracts/standards.yaml`，由符合性测试守卫。

```text
Long-lived Claim Grammar  ≠  Current Standards Inventory
Internet Draft            ≠  Published Standard
```

一个 External Draft 今天处于什么 Revision，是 Registry Fact。它不应该被写成长期
SoulAuth Identity 或 Security Invariant。

## 6 · Metadata 本身就是 Standards Claim

Machine-readable Metadata 不是普通 Marketing Copy。当 SoulAuth 在 Metadata 中声明
某个 Endpoint、Flow、Response Type、Subject Type、Client Authentication Method、
Extension 或 Protocol Capability，Consumer 会把它当作 Machine Contract 的一部分。
所以：

> **Advertised Capability 必须是真实 Capability。**

更准确地说，一项被公开 Advertise 的 Capability 必须在同一声明 Scope 中已经
Implemented、位于当前 Release 正式 Support Contract 内，并拥有适用 Test /
Verification Evidence。但这不能写成：

```text
Advertised = Implemented = Supported = Tested   ← 错误
```

正确关系是：

> **Advertisement 不能超过 Implemented、Supported 与 Evidenced Surface 的交集。**

### Internal Capability 不等于 Standards Capability

这是 Metadata 最容易产生错误 Claim 的地方。SoulAuth 内部可以创建 Client，并不自动
意味着 SoulAuth 实现了某个标准化 Dynamic Client Registration Protocol：

```text
Internal Capability
≠
Corresponding Standards Extension
```

只有当 Declared Profile、Machine Surface、Runtime Behavior 与 Applicable Evidence
全部成立以后，相应 Capability 才可以进入正式 Standards Claim。这是一个通用原则，
不限于 Client Registration。

## 7 · Conditional Capability 不会自动进入 Supported Profile

外部标准生态中存在大量 Optional Extension 和 Related Specification，SoulAuth 内部
也可能存在功能相似的 Capability。但：

> **功能相似，不等于标准协议已经实现。**

同样，某个 Security BCP 建议一种机制，不意味着当前 SoulAuth Release 已经实现这种
机制：

```text
Related Internal Behavior
≠
External Standards Support
```

具体某个 OAuth / OIDC Extension 当前是否 Implemented / Supported / Tested /
Conformant，不在本篇长期正文中冻结。这些事实由
[OIDC 与 Client](../reference/oidc-and-clients)、Standards Registry 与
[项目状态](../project/status) 共同提供当前 Release 的准确答案。

## 8 · Evidence 只证明自己的 Subject 与 Scope

Conformance 不能靠"Happy Path 跑通了"，也不能因为"运行过一些 Test"就自动推出完整
Conformance。必须知道：

```text
What was tested?
Which artifact or deployment?
Against which requirement?
Under which role and profile?
What result was expected?
What evidence was produced?
```

```text
Tested requires Evidence Subject + Test Scope
```

一个 Source Revision 上的测试结果，不会自动证明另一个 Binary、Container Image 或
Deployment；一个 Profile A 的测试结果，不会自动证明 Profile B。

### Standards Conformance Evidence

这一类 Evidence 专门支持 **External Specification / Profile / Protocol Role
Claim**，可以包括 Protocol tests、Metadata verification、Positive behavior
verification、Negative requirement verification 与 External conformance test suite
results。但：

```text
Test Suite
≠
Specification
```

Specification 定义 Requirement；Test Suite 验证 Implementation 在其覆盖范围内是否
满足这些 Requirement。Test Suite 不能反过来重新定义 Specification。

### Project Verification Evidence

SoulAuth 还有大量重要的内部 Contract 需要验证：ActorIdentity / Client separation、
Credential binding、Security invariants、Administration boundaries、Audit integrity、
Recovery behavior、Soulseed integration boundaries。这些 Evidence 很重要，但：

```text
Project Verification Evidence
≠
External Protocol Conformance
```

外部 OIDC Conformance Suite 不会替 SoulAuth 证明内部 Actor-native Architecture；
反过来，SoulAuth 自己的 Semantic Tests 也不会自动证明 OIDC Protocol Conformance。

## 9 · Requirement Traceability

正式 Standards Claim 最终应该能够追踪：

```text
External Requirement  or  SoulAuth Profile Requirement
        ↓
Applicable Protocol Role
        ↓
Declared Behavior
        ↓
Implementation
        ↓
Verification
        ↓
Evidence
        ↓
Public Claim
```

关键不是一定要使用哪一种工具，而是：**任何重要 Claim 都应该能够回到它真正依据的
Requirement 与 Evidence。** 这样发生 Drift 时，我们才能判断是 Specification 理解
错了、Declared Profile 写错了、Machine Contract 错了、Runtime 错了、Test 错了，还是
Public Claim 超出了 Evidence —— 而不是简单说"代码就是标准"或"文档就是标准"。

## 10 · Tested、Conformant 与 Certified

**Tested** 表示对一个明确 Evidence Subject 运行了声明 Test 或 Test Profile。除非该
Evidence 足以覆盖正在声明的 Conformance Scope，否则它不能单独推出 Conformant。

**Conformant** 表示有适用 Evidence 支持当前 Implementation / Deployment 满足声明
Specification / Profile Scope 内的 Requirement。因此 Conformance 必须是
Specification-specific、Role-specific、Profile-specific、Scope-specific、Release or
Deployment-specific。

**Certified** 不是 SoulAuth 自己发明的加强版 Conformant，它属于对应 External
Certification Program 定义的正式 Status：

```text
Conformant     ≠  Certified
Tests Passed   ≠  Certified
```

Certification 只能在对应 Certification Program、Profile、Role、Deployment 与声明
Scope 内被解释。它不能自动推出：

```text
Certified Profile
=
Entire Product Security Proven
```

也不能推出 SoulAuth 所有 Actor-native Semantics、Soulseed Integration、Operational
Recovery 或其它不在 Certification Scope 内的能力全部得到证明。

## 11 · Release Status 属于 Project Status

Conformance Claim 必须绑定到明确 Release 或 identified Deployment。但**本篇不决定
当前 Release 究竟支持什么** —— 当前 Supported / Unsupported / Deprecated 以及某项
Capability 当前 Product Lifecycle Status，由 [项目状态](../project/status) 发布。

本篇只定义：**如果 Public Status 包含 Standards / Conformance Claim，这个 Claim
需要什么 Qualification 与 Evidence。**

```text
Conformance Constitution
≠
Project Status Manifest
```

一个旧 Release 曾经 Conformant，不等于一个未来 Release 自动继承相同 Claim。每个新
Release 仍然需要与自己的 Runtime、Machine Contract 和 Evidence 保持一致。

## 12 · Standards at a glance

| Claim / Boundary | 正确理解 |
| --- | --- |
| **OIDC-compatible** | Integration positioning，不自动等于 Conformant 或 Certified |
| **Implemented** | Capability 存在于 Runtime，不自动等于 Supported |
| **Supported** | Current Product Release 承担正式 Public Contract，由 Project Status 定义 |
| **Tested** | 明确 Evidence Subject 运行过声明 Test，不自动等于 Conformant |
| **Conformant** | Evidence 支持声明 Specification / Role / Profile / Scope |
| **Certified** | External Certification Program 中的正式 scoped status |
| **Advertised Capability** | 不得超过真实 Implemented、Supported 与 Evidenced Surface |
| **Internal Capability** | 不自动等于对应 Standards Extension |
| **External Protocol Conformance** | 不自动证明 SoulAuth Actor-native Semantic Invariants |
| **Certification** | 不自动证明整个 SoulAuth 产品安全 |

其中最重要的一组边界是：

```text
Implemented  ≠  Supported  ≠  Tested  ≠  Conformant  ≠  Certified
```

这些不是"成熟度从低到高"的一条简单直线，它们回答的是不同问题。

## 13 · SoulAuth 的 Standards Contract

把整篇继续压缩，可以得到下面这条链：

```text
External Normative Specification
        + SoulAuth Declared Profile
        ↓
Human-readable Contract + Machine-readable Contract
        ↓
Runtime Behavior
        ↓
Applicable Evidence
        ↓
Release-scoped Standards Claim
```

其中每一层都有自己的职责：External Specification 定义外部 Protocol Semantics；
SoulAuth Declared Profile 在合法标准空间内声明 SoulAuth 选择的行为；
Machine-readable Contract 准确表达可以被机器消费的 Protocol Surface；Runtime 真正
实现声明的行为；Evidence 证明自己的 Subject 和 Scope；Public Claim 只能在前面这些层
一致时成立。因此：

> **Standards Claim 不能比真实 Contract 和 Evidence 更宽。**

## 下一步

到这里，整个 **安全与信任** 模块的最后一个边界已经建立：安全模型定义什么必须可信；
威胁模型分析什么会破坏这些性质；认证防护定义具体 Control；标准与符合性定义哪些
External / Internal Contract 适用，以及我们凭什么对外作出 Claim。

接下来进入 **参考**。下一篇 [API 约定](../reference/api-conventions) 不再主要回答
"为什么这样设计"，而开始回答：**SoulAuth 自己拥有的 HTTP / API Common Grammar
到底是什么。**
