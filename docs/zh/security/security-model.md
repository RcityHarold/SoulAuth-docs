# 安全模型

## SoulAuth 如何建立一项值得信任的身份事实

SoulAuth 是 Actor-native Identity & Authentication Infrastructure。因此，SoulAuth
Security 首先保护的不是某一个 Password、Token 或 Endpoint，而是：

> **身份与认证事实的正确性。**

最危险的情况不一定是系统无法确认当前 Actor 是谁。更危险的是：

> **系统实际上没有正确建立身份事实，却把当前 Principal 错误归因给了另一个
> ActorIdentity。**

因此，SoulAuth Security Model 从一个非常简单的原则开始：

```text
Unable to establish a required Trust Fact
≠
Permission to assume that Fact is true
```

如果一个 Security-critical Fact 无法按照适用 Contract 建立，SoulAuth 就不能宣称它
已经成立。

## 1 · Identity Misattribution 是核心 Security Failure

普通 Authentication Failure 通常意味着必要的 Authentication Trust 没有成功建立：

```text
Credential verification fails
        ↓
Authentication rejected
```

系统没有得到想要的结果，但 Security Boundary 仍然存在。另一种情况更严重：

```text
Actor A presents evidence
        ↓
system resolves Actor B
        ↓
Authentication succeeds as B
```

这里 Authentication 表面上"成功"了，但成功建立的是 **错误的 Actor Attribution**：

```text
Authentication Success
+
Wrong Actor Attribution
=
Security Failure
```

对于 Identity Infrastructure 来说，**认错 Actor，比单纯没有认出来更危险。**
SoulAuth 必须同时保护 Authentication Evidence 是否有效，以及这些 Evidence 最终是否
被正确绑定到对应 ActorIdentity。

## 2 · Trust 是有边界的 Fact，不是 Component Badge

SoulAuth 不使用"这个 Service 是 trusted，所以它输出的一切都可信"这样的模型，也不
使用"上一步已经验证，所以后面的判断可以自动继承 Trust"。

一个真正可以被依赖的 Trust Fact，必须能够回答：

```text
Source
+ Assertion / Fact
+ Verification
+ Scope
+ Purpose
+ Validity / Freshness
+ Consumer
```

换句话说，我们始终需要知道：

> **谁提供了什么事实，经过什么验证，在什么范围和时间内，可以被谁用于什么
> Decision。**

```text
Source Authority is claim-scoped
```

一个 Source 在某一类 Fact 上的 Authority，不会自动扩张到另一个 Domain：

```text
TLS verified            ≠  Access Token verified
Token signature valid   ≠  Token valid for this Resource
Authenticated Actor     ≠  Authorized Operation
```

Transport Trust 成立，不证明 Token 已经满足 Token Contract。Signature Verification
只是其中一个条件 —— Issuer、Resource / Audience、time、Token Profile 以及其它适用
Validation 仍然需要分别成立。Authentication 证明身份，它不会自动创造 Application、
SoulAuth Administration 或 Soulseed Governance 中的 Authority。

## 3 · Fail Closed：无法建立，不等于已经满足

SoulAuth 的 Fail Closed 原则作用于**当前正在建立的 Security-critical
prerequisite**。例如，如果当前 Actor Authentication 所需要的 Credential State 无法被
可信取得：

```text
Cannot establish required Authentication
→
do not authenticate the Actor
```

更一般地：

```text
Unknown Security State
≠
Satisfied Security State
```

但 Fail Closed 不等于任意 Dependency Failure 都必须让整个系统返回 Authorization
Denial。例如，一个与当前 Security Decision 无关的 Metrics Backend 失败，并不会自动
使所有已经存在的 Authentication Artifact 失效：

```text
Fail Closed
≠
Every Failure Is 403
```

真正的原则是：

> **Security-critical prerequisite 无法建立时，系统不能为了 Availability 把 Unknown
> 降级成 Satisfied。**

系统可以报告 technical failure、unavailable 或其它适合该 Boundary 的结果，但它不能
错误地 Allow。

## 4 · SoulAuth 保护什么

SoulAuth Security 不是围绕单一 Secret 建立的。它保护四类相互关联但不能混在一起的
Security Reality：

| Security Area | 主要保护什么 |
| --- | --- |
| **Identity & Authentication** | ActorIdentity continuity、IdentityBinding、Credential 与 Authentication Result 的正确归因 |
| **Protocol & Continuity** | Client、AuthSession 以及 Protocol Artifact 在正确 Purpose、Context 和 Lifecycle 中成立 |
| **Administrative & Infrastructure** | SoulAuth Control Plane、Configuration、Persistence、Key / Secret Infrastructure 不绕过 Domain Boundary |
| **Historical & Recovery** | Audit Attribution、tamper-evident integrity，以及 Restart / Restore 之后历史事实不被重新解释 |

具体 Endpoint、Authentication Method、Token Profile、Permission、Key Lifecycle 与
Recovery Procedure 由各自 Reference 和 Operations 文档定义。本篇只定义这些 Security
Property 为什么必须长期成立。

## 5 · Security Property A：Identity & Authentication Integrity

SoulAuth 必须始终能够区分：

```text
ActorIdentity  ≠  Credential  ≠  Client
Client Authentication  ≠  Actor Authentication
```

Credential 证明 Actor，Client Authentication 证明 Protocol 中的 Client。两者不能
因为同时参与一个 Request 就被合并。

同样，IdentityBinding 建立 cross-domain identity relation。它不会因此自动成为
Authentication Evidence，也不会把两个 Identity Domain 合并成一个 Identity
Namespace。

### Credential Protection 不只有 Confidentiality

Credential Security 当然包括 Secret Protection，但这还不够。同样重要的是：

> **Credential 或 Verification Material 必须继续绑定到正确 ActorIdentity。**

例如，即使某个 AIActor 的 Private Key 从未泄露，如果攻击者能够把 Actor A 对应的
Verification Material 替换成攻击者自己的 Public Key：

```text
Actor A → Attacker Verification Material
```

系统仍然可能错误地把攻击者 Authentication 为 Actor A。所以：

> **Verification Material Integrity 与 Secret Confidentiality 同样重要。**

SoulAuth Server 也不会因为支持一种非对称 Authentication 方式，就自动成为 AIActor
Private Key 的 Custodian。具体 Credential Protection 由
[认证防护](./authentication-protection) 与
[认证与会话](../reference/authentication-and-sessions) 定义。

## 6 · Security Property B：Protocol & Continuity Integrity

Authentication 成功以后，系统还需要保护已建立的 Authentication Reality 怎样持续，
以及怎样通过 Protocol Artifact 被正确使用。因此：

```text
AuthSession
≠
ActorIdentity
```

AuthSession 只负责 bounded Authentication continuity。它不会成为新的身份根，也不会
冻结 Authority。

Protocol Artifact 同样必须在自己的 Contract 中被解释。一个 Artifact 格式正确，不等于
在当前 Client、transaction、issuer、resource、time 和 purpose 中正确：

```text
Valid Representation
≠
Valid Protocol Context
```

具体 Authorization Code、Token、OIDC、Federation、Replay 与 Freshness Contract 由
[OIDC 与 Client](../reference/oidc-and-clients)、
[认证与会话](../reference/authentication-and-sessions) 和
[认证防护](./authentication-protection) 定义。本篇只锁住：

> **Artifact 不能脱离自己的 Purpose、Context 和 Lifecycle 被重新解释。**

## 7 · Security Property C：Administrative & Trust Boundary Integrity

SoulAuth 拥有自己的 Control Plane，因此它需要自己的 Administrative Authentication 与
Authority。但：

```text
Administrative Authority
≠
Unlimited Authority
```

一个已经被正确 Authentication 和 Authorization 的 Administrator，也不能绕过
SoulAuth 自己的 Domain Invariants。例如，Administrative Authority 不会自动获得：
重写 ActorIdentity Ontology；把 Client 当成 Actor；跳过 Credential Lifecycle；静默
修改 Audit History；取得 AIActor Private Key；创造 Soulseed Governance Authority。

```text
Authorized Administrator
≠
Permission to violate Domain Invariants
```

同样需要区分：

```text
Infrastructure Privilege
≠
SoulAuth Administrative Authority
```

一个 Infrastructure Operator 可能物理上能够访问 Database、Environment 或 Runtime。
这不意味着 SoulAuth Semantic Contract 认为该 Operator 拥有对应 Administrative
Permission。绕过正式 Control Plane 直接改变 Persistence：

```text
Direct Database Mutation
≠
Supported Administration
```

它属于 Infrastructure / Integrity Boundary 上的事件，而不是正常 Administration。

## 8 · Security Property D：Historical & Recovery Integrity

当前状态可以改变，过去已经发生的事实不能因此被重新解释：

```text
Current State
≠
Historical Fact
```

例如：

```text
T1  Authentication succeeds
T2  Actor is suspended
```

在 T2 以后，Actor 当前不再 Eligible，不意味着 T1 的 Authentication 从未成功。同样：

```text
Permission revoked      ≠  Historical Authorization invalidated
Configuration rollback  ≠  Historical rewrite
```

Audit 需要为重要 Identity、Authentication、Administrative 和 Security 事件提供足够的
Attribution，并拥有声明的 **tamper-evident** Integrity Property。但：

```text
tamper-evident
≠
tamper-proof
```

SoulAuth 不会宣称任何数字记录绝对不可修改。它要求的是：在声明的 Trust Model 中，
未经允许的历史修改能够被检测，或者相应 Integrity Boundary 明确失效。

Recovery 也必须服从同一个原则：

> **Restore 的目标是恢复可解释的 Canonical Truth，而不是制造一段更方便的历史。**

具体 Audit Event Model 与 Recovery Procedure 分别由 [审计](../reference/audit) 和
[运维与恢复](../operate/operations-and-recovery) 定义。

## 9 · 五个主要 Trust Boundaries

SoulAuth 不会把整个部署环境视为一个统一 Trust Zone。对于 Public Security Model，
五类 Boundary 已经足够描述主要关系。

### External Input Boundary

来自 Caller、Browser、Client、Network 或其它外部 Source 的数据，首先只是 **Input**：

```text
Caller-controlled Input
≠
Trusted Runtime Fact
```

Identifier、Header、Cookie、Token、Claim、redirect value 或其它输入，都必须经过适用
Contract 验证后，才能获得更强的 Meaning。

### Identity & Authentication Boundary

这一 Boundary 保护：当前 Client 是谁；当前 Actor 是谁；当前 Evidence 证明了什么；
Authentication Result 如何建立。必须保持：

```text
Client              ≠  Actor
Identity Resolution ≠  Authentication
```

知道某个 ActorIdentity Reference，不证明 Caller 就是这个 Actor。

### Administrative & Infrastructure Boundary

这一 Boundary 覆盖 Control Plane、Persistence、Configuration 以及 Key / Secret
Infrastructure。必须保持：

```text
Database Access  ≠  Authorized Administration
Data Access      ≠  Key Access
```

Key、Secret 与 Domain State 应该拥有清楚的 Purpose 和 Access Boundary，以限制真实
compromise scope。

### External Provider Boundary

External IdP、Key Manager、Delivery Provider 以及其它 Adapter 只在自己的 Contract
Scope 内提供事实。例如，一个 External Identity Provider 可以成为某些经过验证的
External Authentication Facts 的 Source，但它不会因此获得 SoulAuth ActorIdentity
Ownership、SoulAuth Administrative Authority 或 Soulseed Governance Authority：

```text
Verified External Trust
≠
Transitive Universal Trust
```

### Consumer / Integration Boundary

Application、API 与 SoulseedOS 可以消费 SoulAuth 提供的经过验证的 Identity /
Authentication facts。但：

```text
SoulAuth Authentication  ≠  Consumer Authorization
AuthContext              ≠  Governance Authority  ≠  Execution Authority
```

IdentityBinding 可以连接两个 Identity Domain，它不会把两个 Trust Domain 合并。
SoulAuth 的 Security Guarantee 在自己的 Contract Boundary 停止。

## 10 · Security Assumptions

完整 Security Guarantee 还依赖一组外部条件。这些条件不是"SoulAuth 无条件相信某个
Component"，而是**某类 Security Claim 成立所需要的外部 Security Dependency**。

### Trusted Runtime / Artifact

Production 环境需要运行与声明 Release 对应的 Runtime Artifact。如果 Runtime 本身被
未经授权地替换，Application-level Authentication Controls 无法独立恢复整个 Trust
Model。

### Protected Persistence 与 Key Infrastructure

Persistence、Key / Secret Infrastructure 必须按照适用 Security Contract 受到保护。
但：

```text
Stored
≠
Semantically Valid by definition
```

数据库中存在某条 Record，不会自动证明 Domain Invariants 成立。

### Reasonably Correct Time

Authentication、Token、AuthSession、Key Lifecycle 以及其它 time-sensitive Security
Decision 依赖可接受的 Clock 条件：

```text
Wall clock
≠
Universal causal truth
```

严重 Clock Failure 仍然可能破坏依赖时间的 Security Contract。

### Trusted Transport / Proxy Boundary

Production Protocol Surface 需要正确建立适用的 Transport 与 Proxy Trust。来自 Caller
自己的 forwarded metadata 不会因为出现在 Header 里就自动成为 Trusted Fact。

## 11 · Data Minimization 与 Disclosure Boundary

Identity Infrastructure 天然会接触 Sensitive Data。安全不仅意味着数据没有被攻击者
拿走，还意味着：

> **系统不会为了方便而不必要地收集、复制、传播和保留身份数据。**

```text
More Identity Data
≠
More Security
```

Claims、Token Projection、AuthContext 以及其它 Consumer-facing Surface，只应提供完成
声明 Contract 所需的数据。它们不是 SoulAuth Private Database 的复制渠道。同样：

```text
Auditability
≠
Secret Disclosure
```

Raw Secret、Private Key、Credential Secret 或其它 bearer-style sensitive material，
不应因为 Debug、Logging 或 Audit 需要而进入不适当的 Observability / Projection
Surface。具体 Disclosure、Logging 和 Audit 字段规则由对应 Security、Operations 与
Audit Contract 定义。

## 12 · SoulAuth 到哪里停止

一套成熟 Security Model 必须明确自己的责任边界。SoulAuth 负责：ActorIdentity；
Authentication；自己 Control Plane 中的 Security；自己产生和验证的 Trust Fact；
自己拥有的 Audit / Attribution Boundary。

SoulAuth 不会因为 Authentication 成功，就承担 Application Business Authorization、
Soulseed Mind Safety、Soulseed Governance、External Execution 正确性、External
Provider 永远安全或 Consumer Application 内部逻辑安全。因此：

```text
Out of Scope
≠
No Security Boundary
```

SoulAuth 虽然不负责 Application 的最终 Business Authorization，但它仍然必须：不把
Authentication 写成 Authority；不把 Client 写成 Actor；不输出超过自己 Contract 所
证明的事实；在自己的 Trust Boundary 准确停止。这就是 Shared Responsibility 真正有
意义的地方。

## 13 · Security at a glance

| Security Boundary | Meaning |
| --- | --- |
| **Unverified Input ≠ Trusted Fact** | 外部输入必须经过适用验证 |
| **Wrong Actor Attribution = Security Failure** | 成功认证到错误 Actor 仍然是失败 |
| **Source Authority is claim-scoped** | 一个 Source 的 Trust 不会无限扩张 |
| **Unknown Security State ≠ Satisfied State** | Security prerequisite 无法建立时不能隐式 Allow |
| **Authentication ≠ Authority** | Proof 不会自动创造行动权 |
| **Infrastructure Privilege ≠ Administrative Authority** | 技术能力不等于 Semantic Permission |
| **Current State ≠ Historical Fact** | 当前变化不能重写过去 |
| **tamper-evident ≠ tamper-proof** | Audit 保证可检测性，不宣称绝对不可修改 |
| **Recovery ≠ Historical Rewrite** | Restore 不能制造更方便的过去 |
| **More Identity Data ≠ More Security** | Data Minimization 本身属于安全纪律 |

把这些原则继续压缩，可以得到 SoulAuth Security Model 最核心的一句话：

> **每一份 Trust 都必须回答：它从哪里来，它证明了什么，它在什么范围和时间内成立，
> 以及它到哪里停止。**

上一层已经可信，**不意味着下一层可以省略自己的验证。**

## 下一步

这一篇回答的是：SoulAuth 需要长期保护哪些 Security Properties，以及 Trust 怎样在
不同 Boundary 中建立和停止。

下一篇 [威胁模型](./threat-model) 将从反方向继续：如果这些 Security Properties 必须
成立，攻击者、配置错误、系统故障或 Trust Drift 会试图破坏什么？随后
[认证防护](./authentication-protection) 再进入具体 Security Controls。
