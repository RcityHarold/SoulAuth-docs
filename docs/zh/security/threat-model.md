# 威胁模型

## SoulAuth 的 Security Properties 怎样失败

[安全模型](./security-model) 定义 SoulAuth 必须长期守住什么：ActorIdentity 必须被
正确归因；Credential 与 Verification Material 必须绑定到正确 ActorIdentity；Client
不能被重新解释成 Actor；Authentication 不能自动扩张成 Authority；Protocol Artifact
只能在自己的 Contract 中成立；Trust Boundary 变化之后，系统仍然必须能够正确解释
Current State 与 Historical Fact。

Threat Model 把问题反过来：

> **什么恶意行为、错误、故障或状态漂移，可能让这些 Security Properties 不再成立？**

```text
Threat
≠
Known Vulnerability
```

Threat 被纳入模型，不表示 Current SoulAuth Implementation 已经存在对应漏洞。它表示：
**SoulAuth 必须理解并防御这条 Security Failure Path。**

## 1 · Capability-based Threat Model

SoulAuth 不以"谁看起来更危险"建立 Threat Model。它关注的是：

> **谁或什么拥有怎样的 Capability，以及这个 Capability 能够作用于哪条 Trust
> Boundary。**

```text
Actor Kind  ≠  Trust Level
AIActor     ≠  Threat Class
```

Human 与 AIActor 都是 Actor。它们都可能正常行动、恶意行动、Credential 被盗、受到其它
系统控制、滥用已经合法获得的 Capability。真正决定 Threat 的是 **Capability，而不是
身份标签**。

## 2 · Threat Source 不一定是 Adversary

很多 Security Failure 来自攻击者，但不是全部。例如：

```text
replicas run incompatible security semantics
        ↓
the same artifact receives different decisions
        ↓
a declared Security Property fails
```

这可能来自 Operator Error、Configuration Drift、Software Defect、Clock Failure、
Replica Divergence 或 Recovery Mistake。因此：

```text
Threat Source
≠
Adversary
```

但普通 Reliability Failure 也不会自动进入 Threat Model。只有当一个 Fault 能够破坏
已声明的 Security Property 或 Trust Boundary，它才成为 **Security-relevant Threat
Source**。

## 3 · Authenticated 不等于 Benign

Authentication 证明当前 Identity Context 满足了声明的 Authentication Contract，它不
证明当前主体意图良善。同样，Registered Client 不因注册而天然 benign；Administrative
Principal 不因拥有 Authority 而天然 benign。

```text
Authenticated / Registered / Authorized
≠
Benign by definition
```

一个已经合法 Authentication 的 Actor 仍然可以滥用自己的身份；一个拥有 Administrative
Authority 的 Principal 也可能被 Compromise、恶意滥权或错误操作。

## 4 · Cryptographic Assumption

本 Threat Model 在当前 Declared Cryptographic Profile 及其安全假设成立的前提下，不把
"直接破解正确使用的底层 Cryptographic Primitive"作为普通攻击者的默认 Capability。

但现实 Threat 仍然包括 Key theft、Key replacement、Key custody compromise、
Wrong-key validation、Lifecycle error、Secret disclosure。所以：

```text
Breaking a cryptographic primitive
≠
Compromising cryptographic trust material
```

后者属于 SoulAuth 必须直接处理的现实 Threat。

## 5 · Threat Applicability

不是每个 Threat 都适用于每个 Deployment。有些几乎总是适用（Identity
Misattribution）；有些只有某项 Feature 启用以后才适用（Federation-specific
threat）；有些依赖 Topology（Cross-replica inconsistency）。因此：

> **Threat Applicability 必须结合 Current Feature Set 与 Deployment Topology 理解。**

某个 Deployment 当前不适用某个 Threat，不表示这个 Threat 应该从 SoulAuth 总体 Threat
Model 中删除。同样，本篇不为所有环境预先固定一个 Universal Risk Score —— 实际 Risk
还取决于 Exposure、Enabled Features、Deployed Controls 与 Impact。

## 6 · Threat Sources by Capability

| Threat Source | Typical Capability |
| --- | --- |
| **Remote Caller** | 向公开 Surface 提交任意输入、重复请求、异常 Protocol Artifact |
| **Authenticated Actor / Registered Client** | 在自己的合法 Identity 或 Protocol Context 中继续尝试越界 |
| **Credential / Artifact Holder** | 使用被盗或错误获得的 Authentication / Session / Protocol Capability |
| **Privileged Operator / Compromised Infrastructure** | Control Plane、Persistence、Runtime、Configuration、Key 或 Secret 级访问 |
| **External Provider** | 在自己的 Declared Trust Scope 中产生或影响外部 assertion / recovery / delivery fact |
| **Security-relevant Fault** | Drift、Defect、Clock、Replica、Upgrade、Recovery 等非恶意失败 |

这些 Source 可能彼此组合。关键始终是：**它当前真正拥有哪种 Capability。**

## 7 · Trust Boundaries 与 Attack Surfaces

Canonical Trust Boundaries 继承 [安全模型](./security-model)：

| Canonical Trust Boundary | Typical Attack Surfaces |
| --- | --- |
| **External Input** | Public protocol request、browser / request input、redirect / host input |
| **Identity & Authentication** | Credential、Verification Material、IdentityBinding、AuthSession |
| **Administrative & Infrastructure** | Control Plane、Persistence、Configuration、Runtime、Key / Secret custody |
| **External Provider** | Federation source、delivery / recovery provider |
| **Consumer / Integration** | Client、BFF、Resource Server、Soulseed Integration |

Attack Surface 是 Trust Boundary 中或跨 Boundary 的具体暴露位置，它不是新的
Canonical Architecture Layer。

## 8 · Threat Family 1：Identity Substitution & Misattribution

这是 Actor-native Identity 最核心的 Threat 之一。攻击目标是：

> **让系统建立了一个 Actor Context，但归因到了错误 ActorIdentity。**

可能的路径包括：Credential / Verification Material 绑定错误；IdentityBinding 错误；
External Identity Source confusion；subject reuse / namespace confusion；Client 被
错误提升成 Actor Context；Persistence 中的 identity relation 被篡改；
Soulseed-specific IdentityBinding 映射错误。

最终破坏的是 **Identity Attribution / Identity Integrity Property**。尤其必须保持：

```text
No Identity Resolution
≠
Identity Misattribution
```

没有解析出 Actor 通常意味着 Trust 没有建立；把 Actor A 错误解析成 Actor B 意味着系统
已经建立了错误 Trust。

## 9 · Threat Family 2：Credential Theft、Guessing 与 Binding Substitution

这一类 Threat 针对 Actor Authentication Capability 与 Verification Material Binding。
可能包括：Credential guessing / stuffing；authentication secret theft；recovery
capability theft；actor-held cryptographic material compromise（在当前 Authentication
Method 适用时）；Verification Material 被恶意替换；administrative / persistence
mutation 使攻击者控制的 material 绑定到 Victim Actor。

必须特别区分：

```text
Credential Theft
≠
Credential Binding Substitution
```

攻击者不一定需要偷到 Victim 原来的 Credential。如果攻击者能够让自己控制的
Verification Material 成为 Victim ActorIdentity 的可信 Verification Material，一样
可以造成 Impersonation。这是 SoulAuth 非常重要的 Threat Boundary。

## 10 · Threat Family 3：Client Impersonation 与 Client / Actor Confusion

这一类 Threat 针对 Client Protocol Context 与 ActorIdentity 之间的 Semantic
Boundary。可能包括：Client Authentication Material theft；Client impersonation；
public / confidential classification 错误；malicious registered Client；Client-only
context 被错误解释成 Actor Context。

```text
Client            ≠  Actor
OAuth `client_id` ≠  ActorIdentity
```

即使 Client Authentication 成功，也不能通过隐式 Mapping 把 software Client 升级成
authenticated Actor。这类 Threat 可能同时破坏 Protocol Integrity、Identity
Attribution 与 Authority Boundary。

## 11 · Threat Family 4：OAuth / OIDC Transaction Hijacking

当 Current Release 启用对应 OAuth / OIDC Profile 时，需要保护：

> **一个 Protocol Result 不能从 Transaction A 被错误接受成 Transaction B 的结果。**

Threat 可能出现在适用的 Redirect binding、request correlation、`state`、`nonce`、
PKCE、Authorization Code、Client binding、Issuer / response mix-up 等 Protocol 关系
中。

这里真正的 Threat 不是某一个 Parameter 名字，而是 **Transaction Binding 被破坏**。
因此核心问题始终是：来自哪个 Client、哪个 Request、哪个 Redirect、哪个 Issuer 或哪个
Transaction 的结果，是否被错误地接受到了另一个 Context 中？具体哪些 Protection
适用，由 Current Declared OAuth / OIDC Profile 决定。

## 12 · Threat Family 5：Session & Token Artifact Abuse

这一类 Threat 针对已经建立的 AuthSession、Access Token、ID Token 以及 Current
Profile 实际支持的其它 Protocol Artifact。可能包括：Session theft；Session fixation /
binding confusion；Access Token theft；wrong-resource token acceptance；ID Token /
Access Token confusion；expired or stale artifact acceptance；actor-bearing 与
client-only subject confusion；replay（在该 Artifact 的 Declared Contract 中 replay
具有安全意义时）。

如果 Current Profile 支持 Refresh Token，Refresh theft / reuse 同样属于这一类
Feature-dependent Threat。必须保持：

```text
Replay Threat
≠
Every Artifact Must Be Single-use
```

## 13 · Threat Family 6：Federation & IdentityBinding Hijacking

当 Federation 或 External IdentityBinding 启用时，需要防止一个 External Identity 在
错误 Source、错误 Namespace 或错误 Binding 下被解释成 SoulAuth ActorIdentity。可能
包括：Issuer / identity-source confusion；只使用 external subject string 而忽略
source；unsafe attribute-based linking；External Account takeover；malicious /
incorrect IdentityBinding；revoked relation 被错误恢复；Soulseed-specific
IdentityBinding hijacking。

```text
External Subject String Alone
≠
Federated Identity
```

一个 External Subject 必须在明确 External Identity Source / Issuer Context 中理解。

### Provider Compromise

即使 Provider Response 在 Protocol 层完全 valid，也只能证明 Declared Federation
Contract 允许它证明的事实。它不能证明 Provider 内部没有被 Compromise：

```text
Valid Provider Response
≠
Provider Proven Uncompromised
```

Provider Compromise 的 Blast Radius 由该 Provider 实际拥有的 Trust Scope 决定。

## 14 · Threat Family 7：Administrative & Privileged Control Abuse

这一类 Threat 针对可以改变 SoulAuth-owned Security State 的高权限 Capability：
Administrative credential compromise；privilege escalation；malicious authorized
operator；unauthorized Actor / Credential / Client / Binding mutation；
authority-assignment abuse；direct persistence manipulation；Configuration 或 Runtime
mutation；通过高权限路径违反 Domain Invariants。

```text
Privileged
≠
Unlimited
```

拥有一种高权限 Capability，不代表拥有所有其它 Capability。Database Operator 不应因为
能写 Persistence，就自动获得 Key Custody；Key Custodian 也不应自动获得 ActorIdentity
mutation authority。

## 15 · Threat Family 8：Key、Secret 与 Trust-material Compromise

这一类 Threat 针对 Current Release 实际启用的 key、secret 与 trust material：
Protocol signing material；Credential protection material；transport material；
operational secrets；其它 Current Security Profile 真正依赖的 secret / key material。

Threat 包括 theft、disclosure、malicious replacement、deletion、wrong version、stale
key material、unauthorized custody access、secret 进入 log / image / backup。必须
保持不同 Key Purpose 拥有不同 Blast Radius：

```text
Compromise of one key purpose
≠
Compromise of every trust domain
```

具体 Key Purpose 由 Security / Protocol Contract 定义。

## 16 · Cross-cutting Failure Mode：Current-state Manipulation

有些 Threat 不是新的攻击目标，它们描述的是**攻击者或故障怎样直接改变系统当前相信的
Security State**：Direct Persistence Mutation；Actor lifecycle tampering；
IdentityBinding replacement；Credential binding replacement；malicious
Configuration；Trust Anchor manipulation；Runtime Artifact replacement。

```text
Current trusted state
        ↓
altered
        ↓
system continues operating from the altered state
```

这种 Failure 可以由 Identity Threat、Administrative Abuse、Key Compromise、
Infrastructure Compromise 等多个 Threat Family 触发，因此它属于 **Cross-cutting
State Integrity Failure Mode**。

## 17 · Cross-cutting Failure Mode：Temporal / Replica / Recovery Reintroduction

另一类 Failure 不是直接改写现在，而是**让已经过期、撤销、不一致或历史上的 Security
State 重新进入当前 Trust Decision**：historical snapshot restore；revoked Credential
/ AuthSession resurrection；consumed one-time artifact resurrection；revoked
IdentityBinding resurrection；stale key state；Replica divergence；Clock skew；
unsupported mixed-version behavior；recovery sequencing error。

```text
historical / stale / divergent state
        ↓
re-enters current runtime
        ↓
is treated as current trusted state
```

```text
Current-state manipulation
≠
Temporal / recovery reintroduction
```

一个直接篡改 Current State，另一个让错误的旧 State 重新变成"现在"。

## 18 · Cross-cutting Threat：Availability & Resource Abuse

攻击者可能通过高频、高成本或蓄意状态消耗制造 Resource Pressure、lockout pressure、
expensive authentication work、protocol state exhaustion、dependency pressure。

SoulAuth 不承诺永远无法 DoS，但必须保持：

```text
Resource Pressure
≠
Permission to Authenticate Less Safely
```

Availability Pressure 不能成为关闭 Trust Validation、降低 Authentication
Requirement、忽略 Security Preconditions 的理由。

## 19 · Cross-cutting Threat：Privacy、Enumeration 与 Data Exposure

Security Failure 也可能发生在系统泄露了本不应该公开的 Identity 或 Security
Information。风险可以通过 Authentication / recovery error、timing、claim projection、
log / audit、diagnostic / debug、support artifact 等 Surface 出现。

Threat 包括 resource / account enumeration、unnecessary identity correlation、
sensitive metadata disclosure、secret or token leakage。因此 Data Minimization 与
Enumeration Resistance 属于 cross-cutting security discipline，具体 Protection 由
相应 Security Owner 定义。

## 20 · Cross-cutting Threat：Backup / Recovery Integrity

```text
Backup Available
≠
Trusted Recovery Point
```

Backup 可能泄露 Sensitive Historical State、被篡改、包含已经撤销的旧 Trust、在
Recovery 时复活不再可信的 Security State。具体 Recovery Procedure 由
[运维与恢复](../operate/operations-and-recovery) 定义。本篇只锁定：

> **Recovery Material 本身也是 Security-sensitive Trust Input。**

## 21 · Cross-cutting Threat：Audit Suppression 与 Misattribution

攻击者或故障可能阻止 required audit evidence 产生、删除历史、隐藏 Gap、伪造 Event，
或把 Operation 归因给错误 Principal 或 Actor：

```text
Audit Presence
≠
Correct Attribution
```

甚至，一套"看起来完整、但 Attribution 错误"的历史，可能比一个明确可见的 Gap 更危险，
因为它会建立**错误的 Accountability**。具体 Historical Integrity 由
[审计](../reference/audit) 定义。

## 22 · Feature-specific Lens：AIActor Authentication

SoulAuth 不会为 AIActor 建立第二套 Threat Model。AIActor 首先继承所有 Actor Threat：
Identity Misattribution；Credential compromise；Verification Material substitution；
session / artifact abuse；administrative mutation。

如果 Current Release 支持某种依赖 actor-held cryptographic material 的 AIActor
Authentication Method，对应 private material compromise 可能获得 Actor
Authentication Capability；如果该 Method 使用可重放的 authentication proof，其
Replay / Freshness 安全必须服从那个 Authentication Method 自己的 Declared Contract。

本篇不自行冻结 challenge、nonce、timestamp、canonicalization、algorithm —— 这些属于
[认证与会话](../reference/authentication-and-sessions) 中的 Exact Authentication
Contract。

## 23 · Feature-specific Lens：Soulseed Integration

当 Soulseed Integration 启用时，主要 Threat 仍然落回前面的 Family。

**Client-only context 被转换成 Actor AuthContext** 破坏 `Client ≠ Actor`。

**Soulseed-specific IdentityBinding 被劫持**，导致 SoulAuth ActorIdentity 被错误关联
到 Soulseed Canonical Actor，属于 Identity Misattribution。

**Forged AuthContext**：`AuthContext-shaped payload ≠ Trusted AuthContext`。

**Stale AuthContext**：上游 Security State 已变化，但 SoulseedOS 继续依赖过时
Context，属于 Trust Freshness / Continuity Threat。

**Adapter Authority Creep**：Adapter 从 Translation 扩张成 Runtime Authorization，
破坏 `Authentication ≠ Authority`。

这些 Threat 的 Canonical Integration Boundary 继续由
[Soulseed 接入](../integrate/soulseed) 定义。

## 24 · Foundational Trust Compromise

有些 Threat 破坏的不是某一个 Credential 或 Session，而是 **SoulAuth 安全模型依赖的
一项或多项 Foundational Trust Assumption** —— 例如攻击者同时获得 Runtime Artifact
modification、Persistence Write、Critical Key / Secret access、Configuration control、
Control Plane access。

```text
Foundational Trust Compromise
≠
Ordinary Authentication Failure
```

一个普通 Password Check 即使继续返回 success，也不能单独证明整个 System Trust 仍然
成立。进入这种状态后，需要 Containment、Incident Response、Trust Re-establishment、
Recovery、Downstream Revalidation —— 具体 Procedure 由
[运维与恢复](../operate/operations-and-recovery) 拥有。

## 25 · Model Limits

SoulAuth 不承诺：当所有 Foundational Trust Assumptions 都已经完全落入攻击者控制时，
仍然保持原有全部 Security Guarantee。

但这不等于简单说"Host compromise is out of scope"。Threat Model 仍然需要明确：哪一项
Assumption 被破坏；哪项 Security Property 不再成立；哪些 Trust Fact 不能继续被依赖；
什么时候必须进入 Incident / Recovery。这比简单标记"out of scope"更有工程意义。

## 26 · Consumer Misvalidation

End-to-end Security Failure 也可能发生在 Consumer Boundary。例如 Consumer 在没有必要
验证的情况下 decode structured token；忽略 Audience / Resource；把 ID Token 当
Access Token；把 OAuth `client_id` 错误解释成 ActorIdentity Context；把 Claims
扩大成未声明 Authority。

```text
Consumer Misvalidation
≠
SoulAuth Protocol Correctness
```

这句话不是说 SoulAuth 没有责任。SoulAuth 负责正确发行 Artifact、提供准确 Contract、
提供安全 Integration guidance；Consumer 负责按照 Contract 正确 Validation、执行自己的
Authorization。即使 SoulAuth 自身正确发行了 Artifact，Consumer 仍可能通过错误解释
破坏 end-to-end Security Property。

## 27 · Threat Composition

现实攻击通常不会停留在一个 Threat Family，它会形成 **Capability Acquisition
Chain**：

```text
Client authentication material compromised
        ↓
Client capability acquired
        ↓
Protocol transaction abused
        ↓
Resource-access artifact acquired
        ↓
Downstream resource misused
```

或者：

```text
Privileged credential compromised
        ↓
Administrative capability acquired
        ↓
Verification Material replaced
        ↓
Actor Authentication capability acquired
        ↓
Identity Misattribution
```

因此：

> **Attack Chain 中的每一步，通常代表新的 Capability Acquisition 或新的 Trust
> Boundary Crossing。**

Security Control 的重要价值之一，就是在这些 Capability Transition 处切断攻击链。

## 28 · Threat Family Summary

| Threat Family | Applies when | Main Security Property at Risk |
| --- | --- | --- |
| **Identity Substitution & Misattribution** | Core | Correct ActorIdentity attribution |
| **Credential Theft / Binding Substitution** | Core / method-dependent | Credential binding & Authentication integrity |
| **Client Impersonation / Client-Actor Confusion** | Client / protocol use | Client / Actor semantic separation |
| **OAuth / OIDC Transaction Hijacking** | Declared OAuth / OIDC profile | Transaction binding & protocol integrity |
| **Session / Token Artifact Abuse** | Relevant artifacts enabled | Artifact purpose, freshness, resource binding |
| **Federation / IdentityBinding Hijacking** | Federation / external binding enabled | Cross-domain identity integrity |
| **Administrative / Privileged Abuse** | Administrative / infrastructure access | Domain-scoped authority & state integrity |
| **Key / Secret / Trust-material Compromise** | Relevant trust material exists | Cryptographic / trust-material integrity |

跨越这些 Family 的两种重要 Failure Mode 是：

```text
Current-state manipulation
Historical / stale / divergent state reintroduced as current
```

## 29 · Threat Model at a glance

| Boundary | Meaning |
| --- | --- |
| **Threat ≠ Known Vulnerability** | 纳入 Threat Model 不代表 Current Implementation 已有漏洞 |
| **Threat Source ≠ Adversary** | 非恶意 Fault 也可能破坏 Security Property |
| **Actor Kind ≠ Trust Level** | Human / AIActor 不是安全等级 |
| **Authenticated ≠ Benign** | 身份成立不证明意图 |
| **Client ≠ Actor** | Client Context 不能隐式升级成 ActorIdentity |
| **No Identity Resolution ≠ Identity Misattribution** | 找不到与认错不是同一级别失败 |
| **Credential Theft ≠ Credential Binding Substitution** | 偷凭证与换绑定是不同攻击路径 |
| **External Subject alone ≠ Federated Identity** | External identity 必须包含 source context |
| **Privileged ≠ Unlimited** | 高权限仍然拥有 Domain Scope |
| **Valid Provider Response ≠ Provider Uncompromised** | 协议有效不证明上游 Trust Assumption 未被破坏 |
| **Backup available ≠ Trusted Recovery Point** | 可恢复文件不等于可信历史 |
| **Audit present ≠ Attribution correct** | 完整记录也可能记录错主体 |
| **Foundational Trust Compromise ≠ Authentication Failure** | 上游信任根失效不能用普通登录结果解释 |
| **Healthy-looking Runtime ≠ Correct Security State** | 系统正常响应仍可能已经相信错误关系 |

## Control Mapping

本篇定义 **Security Properties 可能怎样失败**，它不负责在这里展开所有 Control。
每一个重要 Threat 最终应能映射到：

```text
Threat
        ↓
Prevent / Mitigate
        ↓
Detect
        ↓
Contain / Recover
        ↓
Verify / Test
```

但不同 Threat 的 Control Owner 不同：Authentication-specific threats 见
[认证防护](./authentication-protection)；Deployment / Runtime threats 见
[部署](../operate/deployment) 与 [运维与恢复](../operate/operations-and-recovery)；
Administrative threats 见 [管理](../reference/administration)；Audit threats 见
[审计](../reference/audit)；Protocol threats 见
[OIDC 与 Client](../reference/oidc-and-clients) 与
[验证 Token](../integrate/verify-tokens)；Integration threats 见
[Soulseed 接入](../integrate/soulseed)。

## 最后一句

Threat Model 最危险的场景，并不一定是服务崩溃。很多更严重的 Security Failure 发生
时，系统仍然正常返回、正常 Authentication、正常签发 Artifact、正常解析
IdentityBinding、正常运行 Replica、正常显示 Audit —— 只是它相信的关系已经错了：

```text
wrong Actor            but authentication succeeds
wrong IdentityBinding  but mapping appears valid
wrong Resource         but token is accepted
compromised material   but verification still passes
stale state            but recovery looks healthy
software Client        but interpreted as Actor
```

因此本篇真正要留下的一句话是：

> **一个系统即使看起来仍在正常工作，也可能已经发生 Security Failure。真正危险的不只是
> 系统停摆，而是错误的 Identity、Credential Binding、Protocol Relationship、Trust
> Material 或 Historical State，继续被系统当成可信事实。**
