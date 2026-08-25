# 生产环境检查表

## 证明这个 SoulAuth Deployment 已经可以承载 Production Identity Traffic

[部署](./deployment) 回答的是 **SoulAuth 能否在当前 Environment 中正确运行**。
本篇回答的是更严格的问题：

> **我们能否用证据证明，这个明确的 Release、Artifact、Configuration、Topology 和
> Enabled Feature Set，已经满足当前版本定义的 Production Baseline？**

```text
Healthy Deployment
≠
Production-ready Deployment
```

本篇不是"以后有时间再完善"的建议列表，它是一道 **Production Readiness Gate**。

## 1 · Production Readiness Result

每一项 Gate 只有三种结果：

- **PASS** —— 要求已经被适用 Evidence 证明。
- **BLOCKED** —— 要求没有满足，或者无法证明满足。
- **N/A** —— 当前 Feature 或 Contract 确实不适用，并且已经记录理由。

> **N/A 不是跳过检查的按钮。**

一个 Feature 只要在当前 Production Deployment 中启用，与它对应的 Required Gate 就不能
再用 N/A 绕过。

```text
任何 Required Gate 无法证明
=
Production Readiness Result: BLOCKED
```

## 2 · PASS 必须属于明确的 Sign-off Scope

Production Readiness 不是 SoulAuth Deployment 的永久属性。一次 PASS 必须绑定到**一个
明确的运行事实集合**。开始 Sign-off 以前，至少记录：

| Sign-off Scope | 必须回答 |
| --- | --- |
| **SoulAuth Release** | 当前审核的是哪个 Release |
| **Artifact Identity** | 实际运行的 binary / image / artifact 是什么 |
| **Artifact Provenance** | 该 Artifact 是否来自声明的 Release 来源并满足 verification contract |
| **Configuration Identity** | 当前 Production Configuration 如何被稳定识别 |
| **Deployment Topology** | 当前实际 Deployment 形态 |
| **Enabled Feature Set** | 当前真正启用了哪些 Supported Feature |
| **Sign-off Owner** | 谁对本次 Production Readiness 负责 |
| **Evidence** | 哪些 test、config、runbook、runtime observation 证明对应 Gate |
| **Timestamp** | 本次验证发生在什么时候 |

### Configuration Identity 不强制等于 Configuration Revision

如果 Current Config Contract 正式提供 Configuration Revision，可以记录它；如果没有，
使用 Current Contract 支持的等价、可重现 Configuration identity。

```text
Production Checklist
≠
Permission to invent a Configuration Revision
```

## 3 · Evidence 必须绑定 Subject 与 Scope

一份 Test 曾经成功，不足以证明当前 Production Artifact 已经通过。因此每份 Evidence
都必须能够回答：**验证的是哪个 Artifact？哪一组 Configuration？哪个 Topology？哪个
Feature / Contract Scope？**

```text
A test passed somewhere
≠
This deployment was verified
```

Production Sign-off 只接受与本次 Sign-off Scope 能够建立明确关系的 Evidence。

## 4 · Release & Artifact Gate —— REQUIRED

- [ ] 当前 Artifact 能够被明确识别。
- [ ] 当前 Artifact 属于 Current Release 正式支持的范围。
- [ ] 实际运行 Artifact 与本次审核的 Artifact 一致。
- [ ] Artifact provenance / integrity 已经按照 Current Release Contract 验证。
- [ ] Enabled Feature Set 没有超过 Current Release 正式 Supported Surface。
- [ ] Canonical Semantic 与 Architecture Integrity Checks 已经通过。
- [ ] 当前部署不存在会未经支持改变 ActorIdentity、Authentication、Client、Authority
      或其它 Canonical Semantics 的私有 Patch。

这里不使用"Architecture Conformant"来描述内部 Canonical Architecture。Standards
Conformance Claim 继续由 [标准与符合性](../security/standards-and-conformance) 管理。

## 5 · Enabled Feature 不能超出 Supported Surface

```text
Implemented  ≠  Supported
Configured   ≠  Supported
Enabled      ≠  Supported
```

Production Checklist 不能把 Runtime 里偶然存在、但 Current Release 没有正式支持的
能力变成 Production-ready Feature。因此：

> **先由 [项目状态](../project/status) 确认 Supported Surface，再由本篇验证这个
> Supported Feature 是否满足 Production Gate。**

顺序不能反过来。

## 6 · Protocol & Issuer Gate —— REQUIRED IF APPLICABLE

如果当前 Production Deployment 启用了 issuer-based OAuth / OIDC capability：

- [ ] Production Issuer 已经明确。
- [ ] Public Protocol Surface 与 Declared Issuer 一致。
- [ ] Discovery / metadata 在适用时表达正确 Issuer。
- [ ] 当前签发 Artifact 与 Declared Issuer Contract 一致。
- [ ] Client 与 Resource Server 使用正确 Trust Source。
- [ ] Production Configuration 没有意外泄漏 localhost 或 development issuer。
- [ ] 当前启用 Protocol 使用的 Subject Namespace 与 Subject Policy 已经明确。

不能写成"Stable Subject 就是 Public Protocol Subject"。必须继续保持：

```text
ActorIdentity Resource ID  ≠  OIDC `sub`  ≠  Access-token Subject by definition
```

Exact Subject Contract 由 [OIDC 与 Client](../reference/oidc-and-clients) 定义。

## 7 · Production Protocol Validation —— REQUIRED IF APPLICABLE

对 Current Enabled Protocol Profile，Production Sign-off 必须完成接近真实 Production
Boundary 的 E2E Validation，至少验证两类事实：

**Positive Path** —— 声明支持的正常 Flow 能够按照 Contract 完成。
**Negative Path** —— 本应失败的 Flow 确实失败。

```text
Happy-path Success
≠
Sufficient Production Evidence
```

根据 Current Profile，适用测试可能包括：

- [ ] metadata / discovery 能够从正确 public boundary 读取。
- [ ] 声明支持的 authorization flow 能够完成。
- [ ] 当前 Profile 要求的 PKCE / redirect / transaction binding 得到验证。
- [ ] ID Token 在适用时按照正式 OIDC Contract 验证。
- [ ] Access Token 能够被目标 Resource 按照正式 Contract 验证。
- [ ] wrong-resource / wrong-audience Artifact 被拒绝。
- [ ] ID Token 不能冒充普通 API Access Token。
- [ ] Current Release 实际启用的 logout / session flow 符合其 Contract。

关键是：**Tests 由 Enabled Profile 派生**，不是 Checklist 创造 Profile。

## 8 · Network & Transport Gate —— REQUIRED

- [ ] Public Protocol Surface 满足当前 Production Transport Security Baseline。
- [ ] TLS certificate 在适用的 public boundary 中有效。
- [ ] Certificate hostname 与 public endpoint 一致。
- [ ] Certificate expiry / renewal failure 拥有可操作的 Monitoring Signal。
- [ ] Internal Listen Address 没有被误解释成 Public Issuer。
- [ ] Reverse Proxy / Ingress Trust Boundary 已经明确。
- [ ] Internet Caller 无法通过伪造 forwarded metadata 改变可信 Scheme、Host 或
      external request context。
- [ ] Proxy 到 SoulAuth 之间的链路满足当前 Deployment Security Policy。
- [ ] Public Protocol Exposure 与 Control Plane Exposure 明确分离。
- [ ] Persistence 不直接成为 Consumer Surface。
- [ ] Key / Secret Infrastructure 不直接成为 Consumer Surface。

如果 Issuer、Transport 或 Trusted Proxy Boundary 无法形成一致 Trust Contract：
**BLOCKED**。

## 9 · Keys & Secrets Gate —— REQUIRED

Production 不应该维护一份由本篇自行创造的 Key Purpose Registry。真正需要验证的是：
**Current Enabled Security Functions 真正依赖的 Key / Secret Purpose 都按照其正式
Contract 成立。**

- [ ] Required key / secret material 全部存在并可用。
- [ ] 不同 Security Purpose 没有未经 Contract 压缩成一份万能 Secret。
- [ ] Production 没有继续使用 development / demo secret material。
- [ ] Long-lived Production Secret 不进入 Source Repository。
- [ ] Long-lived Runtime Secret 不被烘焙进广泛分发的 Runtime Artifact。
- [ ] Raw Password、Token、Client Secret、Private Credential Material 等不会进入不
      适当的 Log、Metric、Trace 或 Audit surface。
- [ ] Key / Secret Lifecycle 独立于 Container / Replica 生命周期。
- [ ] Runtime 只拥有完成当前职责所需的 Key / Secret Access。
- [ ] Key / Secret ownership 已经明确。
- [ ] Key loss、replacement 或 compromise 至少存在正式 Operations / Recovery
      Procedure。

具体是否存在 OIDC Signing Key、Credential Protection Key、Audit Integrity Key 或其它
Key Purpose，由 Current Release 决定。

## 10 · Actor-held Credential Gate —— REQUIRED IF APPLICABLE

如果 Current Authentication Method 使用 actor-held private credential material：

- [ ] 该 private material 不进入 SoulAuth server custody。
- [ ] Current verification-material lifecycle 已经由 Authentication Contract 冻结。
- [ ] Actor Credential 与 Client Authentication Material 保持分离。
- [ ] Credential-binding negative tests 已经验证攻击者不能通过替换 Verification
      Material 冒充另一个 ActorIdentity。

```text
AIActor enabled
≠
Actor-held private-key method enabled
```

只有实际 Authentication Method 适用时，这组 Gate 才适用。

## 11 · Durable State Gate —— REQUIRED

- [ ] 需要跨 Restart 维持的 Canonical Identity / Authentication State 拥有受支持的
      durability mechanism。
- [ ] Current Enabled Protocol / Security Contract 中需要跨 Request 或 Restart 持续的
      state 已经验证其 continuity。
- [ ] 唯一关键 Production State 不依赖 ephemeral runtime filesystem 或 instance-local
      memory。
- [ ] Supported Administration 不依赖 Direct Database Mutation。
- [ ] Runtime 访问 Persistence 使用符合当前 Production Policy 的最小必要权限。
- [ ] Persistence transport / storage 满足适用的数据保护要求。
- [ ] Backup 自身拥有明确 Access Control 与 Sensitive Data Boundary。

```text
Durability    ≠  Permanent Retention
Durable State ≠  One Required Database Technology
```

## 12 · Audit Baseline Gate —— REQUIRED

Production Audit 的 Required Baseline 是 **Historical Accountability**：

- [ ] Current Release 要求记录的关键 Audit facts 拥有相应 coverage。
- [ ] Required Audit Record 使用受支持的 durable mechanism。
- [ ] Initiator、Runtime Origin、Target 等 Attribution Semantics 符合
      [审计](../reference/audit)。
- [ ] Audit Retention Policy 已经明确。
- [ ] Operational Log 没有被当成 Audit 替代品。
- [ ] Audit / observability 不会泄漏 raw authentication secret 或 token。

Production 不能因为"有日志"就认为"有 Audit"。

## 13 · Audit Integrity Gate —— REQUIRED IF CURRENT RELEASE CLAIMS IT

如果 Current Release 正式声明 tamper-evident、cryptographic audit integrity、
checkpoint / integrity verification 或其它 Audit Integrity Capability：

- [ ] 所需 Integrity Material / State 真实存在且可用。
- [ ] 对应 Integrity Verification 通过。
- [ ] Recovery 以后该 Integrity Contract 仍能按照 Current Release 声明解释。

如果 Current Release 没有这类 Claim，不需要本篇创造一把 Audit Integrity Key。

## 14 · Recovery Gate —— REQUIRED

Production Identity Infrastructure 不能只证明 Backup 存在，必须证明 **Recovery 真的
能工作**：

```text
Backup Exists        ≠  Recovery Works
Backup Completeness  ≠  Restore Every Historical Security State as Currently Active
```

- [ ] Backup Strategy 已经定义。
- [ ] Recovery Contract 明确哪些 state restore、invalidate 或重新建立。
- [ ] Restore 不会静默复活已经 expired、revoked、consumed 或根据 Current Recovery
      Contract 已经无效的 security-sensitive state。
- [ ] Backup Data 与 Key / Secret Material 拥有明确的独立保护边界。
- [ ] Recovery 能够恢复正确的 current key / reference relationship。
- [ ] 正式 Recovery Runbook 已经存在。
- [ ] 至少成功完成过一次 Restore Verification。
- [ ] Restore 以后 ActorIdentity Continuity 及相关 identifier non-reuse semantics
      得到验证。
- [ ] Restore 以后 Current Credential / Client / Security State 符合 Recovery
      Contract。
- [ ] Restore 不会无痕重写、伪造或错误连续化 Historical Audit。

如果从未完成过成功的 Restore Verification：**BLOCKED**。这是本篇最重要的 Hard Gate
之一。

## 15 · Authentication Protection Gate —— REQUIRED

本篇不重新定义 [认证防护](../security/authentication-protection) 的 Control，它只
验证 **Current Enabled Authentication Method 使用的 Required Protection 已经真实生效
并有 Evidence**：

- [ ] Current Authentication Configuration 与 Declared Security Profile 一致。
- [ ] Current exposed Authentication Surface 拥有适用的 abuse protection。
- [ ] Enumeration Resistance 已经通过对应 negative test。
- [ ] Current replay-sensitive authentication / protocol mechanism 按照其 Contract
      验证。
- [ ] Security-sensitive recovery / verification material 的 storage protection 符合
      Current Contract。

### Password Authentication —— REQUIRED IF APPLICABLE

- [ ] Current Password Protection Profile 符合 Production Contract。
- [ ] Raw Password 不存在长期可读存储。
- [ ] At-rest protection 与 online abuse protection 都各自有对应 Control。
- [ ] 当前 password recovery path 符合 Recovery Security Contract。

### Additional Authentication Factor —— REQUIRED IF APPLICABLE

- [ ] Secret / verification material 符合 Current Protection Contract。
- [ ] Enrollment / removal / recovery 拥有相应 Authentication / Authority boundary。
- [ ] Documentation 没有把"additional factor"自动宣传成 phishing resistance。

## 16 · Client Gate —— REQUIRED IF CLIENT CAPABILITIES ARE ENABLED

- [ ] Production Client Configuration 与 development-only configuration 得到明确治理。
- [ ] Redirect matching 符合 Current Client Contract。
- [ ] Public Client 没有依赖它无法保密的 long-lived confidential secret。
- [ ] Confidential Client Authentication Material 进入 Production Secret Boundary。
- [ ] Client Registration / mutation 通过 Supported Control Plane 完成。
- [ ] 任何 development-only bootstrap credential 或 administrative path 如果存在，
      已经关闭、限制或纳入正式 Production Governance。
- [ ] Client Authentication 不会被解释成 Actor Authentication。

## 17 · AuthSession Gate —— REQUIRED IF APPLICABLE

- [ ] SoulAuth AuthSession 与 Application Session 明确分离。
- [ ] AuthSession expiry / continuity / revocation contract 已经明确。
- [ ] AuthSession 所需 durability 不依赖单一 Runtime 成为唯一 Source of Truth。
- [ ] Required session-fixation / credential-protection behavior 已经通过当前 Contract
      测试。

## 18 · Token & Resource Gate —— REQUIRED IF APPLICABLE

- [ ] ID Token 不被当作普通 API Access Token。
- [ ] Resource Server 不根据 Token"长得像什么"猜测 Validation Strategy。
- [ ] Trusted issuer / source 按照 Current Token Contract 预先建立。
- [ ] Required resource / audience validation 已经启用。
- [ ] OAuth `scope` 没有被错误升级成 SoulAuth Permission 或 Universal Authority。
- [ ] Raw Access Token 不进入普通 Log / Audit。
- [ ] Access-token Subject Semantics 已经明确。
- [ ] Resource Server 可以区分声明的 Actor Context 与 Client-only Context。
- [ ] Client-only Authentication 不会被静默解释成 authenticated Actor。

如果一个 Actor-aware Consumer 无法回答**当前 Artifact 到底建立了 Actor Context 还是
只有 Client Context**：**BLOCKED**。

## 19 · Refresh Continuation Gate —— REQUIRED IF SUPPORTED AND ENABLED

只有 Current Release 正式支持 Refresh Token 或等价 continuation capability 时才检查：

- [ ] Current lifecycle 已经冻结。
- [ ] Storage 与 Client-side custody 符合 Current Contract。
- [ ] Rotation / reuse / replay semantics 在适用时已经验证。
- [ ] Containment semantics 已经明确。
- [ ] Refresh Artifact 不会被当作普通 API Access Credential。

如果 Current Release 不支持：**N/A**，并记录 Current Support Rationale。

## 20 · Control Plane Gate —— REQUIRED

- [ ] Network Exposure 受到明确限制。
- [ ] 使用正式 Authentication Boundary。
- [ ] 使用正式 Domain-scoped Authorization Policy。
- [ ] 高风险 Administrative Operation 满足当前 Required Assurance / Freshness Policy。
- [ ] SoulAuth Admin Authority 没有被解释成 Application 或 Soulseed Governance
      Authority。
- [ ] 没有未经治理的 default administrative credential。
- [ ] 所有 Current Supported initial / emergency administrative path 都被正式治理。
- [ ] Required Administrative Audit 能够正确区分 Initiator、Runtime Origin 与 Target。
- [ ] Direct Persistence Mutation 不构成 Supported Administration Path。

### Emergency Administrative Path —— REQUIRED IF APPLICABLE

- [ ] 它没有使用未经治理的共享默认凭证。
- [ ] Authority Scope 明确。
- [ ] 使用会产生 Current Audit Contract 要求的 Evidence。
- [ ] 有明确 owner 和 review policy。
- [ ] 它不能绕过 Canonical Domain Invariants。

如果不存在：**N/A**。Checklist 不会为了"满足 Production"而要求创建 Break-glass
capability。

## 21 · Runtime Gate —— REQUIRED

- [ ] Liveness 与 Readiness 明确分离。
- [ ] Readiness 不依赖固定 sleep 猜测 dependency state。
- [ ] Required system time 满足 Current Authentication / Protocol Contract。
- [ ] Development-only debug 或 unsafe diagnostic behavior 已关闭或严格限制。
- [ ] 当前 Readiness 真实覆盖本 Instance 承诺服务的 core dependencies。
- [ ] Feature-specific dependency failure 不会未经 Contract 扩大成整个 Runtime
      Failure。

## 22 · Replication Gate —— REQUIRED IF SUPPORTED AND DEPLOYED

第一条先确认：

- [ ] Current Release 正式支持本次 replicated topology。

然后验证：

- [ ] Cross-replica protocol / authentication continuity 通过。
- [ ] Current enabled stateful protection 不能通过切换 Replica 绕过。
- [ ] Required one-time / replay-sensitive semantics 跨 Replica 仍成立。
- [ ] AuthSession continuity 在适用时符合 Current Contract。
- [ ] Replica 之间没有形成互相冲突的 key / trust lifecycle view。
- [ ] Instance-local cache 不成为唯一关键 Security Fact。
- [ ] Replica routing 不会破坏 Current Audit Contract 要求的 Attribution / durability
      semantics。

这里验证的是**跨 Replica Security Semantics**，不是"所有 State 必须使用同一个
Database"，也不创建 `SecurityStateStore` 这个新的 Canonical Component。

## 23 · Operational Ownership Gate —— REQUIRED

- [ ] Production Owner 明确。
- [ ] Security Incident Owner 明确。
- [ ] Key / Secret Owner 明确。
- [ ] Persistence Owner 明确。
- [ ] Backup / Recovery Owner 明确。
- [ ] Audit / Security Review Responsibility 明确。
- [ ] Upgrade / Release Responsibility 明确。
- [ ] Production Change Process 明确。
- [ ] Incident Escalation Path 明确。
- [ ] Recovery Objective 明确。
- [ ] 最近一次 Restore Verification 能够满足当前 Recovery Objective。

RPO / RTO 可以使用组织采用的正式等价指标 —— 本篇不强制某种组织术语。

## 24 · Conditional Feature Gates

以下 Gate 全部属于 **REQUIRED IF APPLICABLE**，未启用时可以 N/A，但必须有明确
Applicability Rationale。

## 25 · Browser / BFF Gate —— IF ENABLED

- [ ] Current Browser Architecture 已经冻结。
- [ ] Production Browser Flow 已经完成真实 E2E Validation。
- [ ] Current Profile 要求的 PKCE / transaction-binding control 已经验证。
- [ ] OIDC transaction correlation 没有被误当成 Application CSRF Protection 的完整
      替代。
- [ ] Application Logout、SoulAuth Logout 与 Token Lifecycle 能够被区分。
- [ ] Origin / CORS / cookie settings 与真实 Browser Topology 一致。

如果使用 Full BFF：

- [ ] Raw OAuth Token 不暴露给 Browser Application。
- [ ] BFF Session Cookie 满足 Current Cookie Security Baseline。
- [ ] Current CSRF Defense 已经验证。
- [ ] BFF Resource Proxy 只能访问声明允许的 Resource Boundary。
- [ ] BFF 不能成为 unrestricted outbound proxy。

## 26 · Federation Gate —— IF ENABLED

- [ ] External Provider Configuration 通过 Current Federation Contract 验证。
- [ ] External identity 使用 source-qualified subject semantics。
- [ ] External Identity 与 SoulAuth ActorIdentity 之间的 IdentityBinding Contract
      已经明确。
- [ ] External Authentication 与 SoulAuth local Actor Credential 保持分离。
- [ ] Provider secret / client material 进入 Production Secret Boundary。
- [ ] Provider failure / compromise impact 已经按 Declared Trust Scope 分析。
- [ ] Current Audit Contract 要求的 Federation Event 已有对应 Coverage。

## 27 · Mail / Recovery Delivery Gate —— IF ENABLED

- [ ] Production delivery provider 已经配置并可用。
- [ ] Provider credential 进入 Production Secret Boundary。
- [ ] Verification / Recovery link 使用正确 Production Public Boundary。
- [ ] Security-sensitive artifact 按照 Current Verification / Recovery Contract 保护。
- [ ] Delivery failure 不会被静默解释成成功。
- [ ] 当前组织要求的 sender / deliverability baseline 已经满足。

## 28 · AIActor Gate —— IF ENABLED

- [ ] AIActor 使用 ActorIdentity Contract，而不是伪造 HumanAccount。
- [ ] AIActor Credential 与 Client Authentication Material 保持分离。
- [ ] AIActor Authentication 能够独立 Attribution。
- [ ] Current AIActor Authentication Method 属于 Current Supported Surface。

如果该 Method 使用 actor-held private credential material：

- [ ] private material 不进入 SoulAuth server custody。
- [ ] Verification Material lifecycle 已经冻结。
- [ ] Freshness / replay semantics 已经通过对应 Method Contract 验证。

## 29 · Soulseed Integration Gate —— IF ENABLED

- [ ] Soulseed Integration 不读取 SoulAuth private persistence 作为 Integration
      Contract。
- [ ] Trust Validation 与 Adapter Translation 职责分离。
- [ ] Client-only Context 不能生成 Actor AuthContext。
- [ ] AuthContext 中的 ActorIdentity reference / context semantics 已经冻结。
- [ ] Soulseed-specific IdentityBinding Contract 已经冻结。
- [ ] AuthContext Wire Contract 已经冻结。
- [ ] AuthContext provenance / validity boundary 已经建立。
- [ ] Assurance / Freshness 不会被直接解释成 Authority。
- [ ] Adapter 不会执行 Runtime Authority / Governance Decision。

如果这些最基本的 Contract 无法解释：**Soulseed Production Integration = BLOCKED**。

## 30 · Automatic Blockers

以下任何一类情况成立，都应直接阻止 Production Sign-off。

**Release Truth 无法建立** —— 当前运行 Artifact、Release 或 Supported Feature Scope
无法被证明。

**Trust Boundary 不一致** —— Issuer、transport、proxy、identity namespace 或其它
required trust context 无法形成一致 Contract。

**Required Security / Durability / Recovery Evidence 缺失** —— Critical Gate 只有文档
声明，没有可验证 Evidence。

**Privileged / Secret Boundary 不安全** —— Control Plane 暴露、default credential、
raw secret leakage 或其它关键边界明显违反 Current Production Contract。

**Enabled Feature Contract 仍然含糊** —— 一个 Production Feature 已经打开，但其
identity、authentication、authority、freshness 或 failure semantics 仍然说不清楚。

以及最基本的一条：

```text
Any REQUIRED gate that cannot be proven  =  BLOCKED
```

## 31 · Final Sign-off

### PASS

只有以下条件全部成立：

- [ ] 所有 REQUIRED Gate 均为 PASS。
- [ ] 所有适用的 Conditional Gate 均为 PASS。
- [ ] 所有 N/A 都有明确 Applicability Rationale。
- [ ] 没有 Automatic Blocker。
- [ ] Sign-off Scope 完整。
- [ ] Evidence 与 Current Sign-off Scope 建立明确关系。

```text
Production Readiness Result = PASS
```

它表示：

> **当前明确的 Release、Artifact、Configuration、Topology 和 Enabled Supported
> Feature Set，已经满足本版本定义的 Production Baseline，可以按照组织自己的 Change
> 与 Operations Policy 接收 Production Identity Traffic。**

### BLOCKED

任何 REQUIRED Gate 失败，或者无法用适用 Evidence 证明，结果就是 `BLOCKED`。不能通过
"我们暂时接受风险"把 SoulAuth Production Baseline 中的 BLOCKED 重命名成 PASS。

组织可以有自己的 Risk Acceptance Process，但：

```text
Organization Risk Acceptance
≠
SoulAuth Baseline PASS
```

## 32 · PASS 会因 Material Change 失效

Production Readiness 是**有版本、有范围、有证据、会失效的事实**，不是一次性仪式。

所谓 Material Change，是任何可能使上次 Sign-off 依赖的 assumption、evidence、trust
boundary、supported feature、configuration 或 deployment behavior 失效的变化。典型
例子包括：Release change；Issuer change；Key / Secret architecture change；
Persistence / schema change；Token / Subject Contract change；Browser Architecture
change；Replica Topology change；Control Plane Exposure change；Soulseed Integration
Contract change；major Security Policy change。

Material Change 发生以后，**重新验证受影响的 Gate** —— 不是机械宣布所有过去 Evidence
全部无效，也不能自动认为旧 PASS 继续成立。

## 33 · Production Checklist at a glance

| Rule | Meaning |
| --- | --- |
| **Healthy ≠ Production-ready** | 能运行不等于可以承载真实 Identity Traffic |
| **PASS 属于明确 Sign-off Scope** | PASS 不是产品永久属性 |
| **Artifact Identity ≠ Artifact Authenticity** | 知道运行什么不等于证明来源可信 |
| **Enabled ≠ Supported** | 配置打开不能创造 Current Support |
| **Happy path ≠ sufficient evidence** | Negative path 必须正确失败 |
| **N/A ≠ skip** | 只有真实不适用才能 N/A |
| **Backup exists ≠ recovery works** | 必须实际完成 Restore Verification |
| **Audit baseline ≠ cryptographic integrity feature** | Integrity 能力只有被 Current Release 声明时才要求 |
| **Client Context ≠ Actor Context** | Production 不能容忍身份语义歧义 |
| **Replication configured ≠ topology supported** | Current Release 必须先支持 |
| **Risk acceptance ≠ baseline PASS** | 组织治理不能改写 SoulAuth Gate |
| **Material change ≠ prior PASS remains valid** | 受影响 Gate 必须重新验证 |
| **Evidence without subject/scope ≠ production proof** | Evidence 必须指向本次 Deployment |
| **Any unproven REQUIRED Gate = BLOCKED** | Production Gate 不能靠假设通过 |

## Exact Contract Source

本篇拥有 **Production Readiness Gate、Sign-off Scope、PASS / BLOCKED / N/A 语义、
Evidence Requirement、Conditional Applicability、Automatic Blocker 与 Material-change
Revalidation**。

本篇不拥有：which OAuth profile exists、whether MFA exists、whether Refresh Token
exists、whether Break-glass exists、whether Audit Integrity exists、whether replicated
deployment is supported、which AIActor authentication method exists。这些必须首先来自
[项目状态](../project/status)、[认证与会话](../reference/authentication-and-sessions)、
[OIDC 与 Client](../reference/oidc-and-clients)、[配置](../reference/configuration)
与 Runtime / Release Evidence。

> **Production Checklist 只能检查一个已经 Supported 的能力是否满足 Production
> Gate，它不能让一个 Unsupported 或未冻结 Feature 变成 Production-ready。**

## 下一步

```text
部署          Can this deployment run correctly?
        ↓
Healthy Deployment
        ↓
生产环境检查表  Can this exact deployment prove it is ready for production?
        ├── BLOCKED
        └── PASS
```

下一步自然进入 [运维与恢复](./operations-and-recovery)，它真正回答：**Production
上线以后，怎样维持这份已经被证明的 Trust State；当 Key、Persistence、Configuration、
Replica 或 Security Boundary 发生故障时，又怎样恢复，而不破坏 Identity Continuity 与
Historical Accountability？**
