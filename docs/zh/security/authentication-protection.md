# 认证防护

## SoulAuth 如何保护 Authentication

[安全模型](./security-model) 回答**哪些 Security Properties 必须保持成立**；
[威胁模型](./threat-model) 回答**这些 Security Properties 怎样失败**。本篇继续回答：

> **哪些 Control 负责阻止 Authentication Threat 变成被系统接受的可信事实，这些
> Control 由谁执行，它们保证什么，又在哪里停止？**

一个 Control 不能代表整个 Authentication Security：

```text
Password Protection              ≠  Online Abuse Protection
Additional Authentication Factor ≠  Phishing Resistance by definition
Transaction Protection           ≠  Client Authentication
Client Authentication            ≠  Actor Authentication
Token Validation                 ≠  Resource Authorization by itself
Detection                        ≠  Prevention
```

SoulAuth 采用的是 **Layered Authentication Protection**。

## 1 · 一个 Control 必须回答四个问题

每一个 Authentication Protection Control 都必须明确：

> **谁负责执行？保护哪条 Boundary？具体保证什么？明确不保证什么？**

因此，判断一个系统是否"安全"，不能简单计算有多少 Security Feature。真正需要判断：

> **不同 Control 是否共同覆盖了对应 Threat，而且没有把自己的 Guarantee 夸大到
> Contract 之外。**

## 2 · Protection 不只是 Prevention

**Prevent** —— 尽可能在错误事实进入 Trusted Authentication Context 以前阻止它：
Credential verification；Credential binding protection；applicable protocol transaction
protection；secret / key protection。

**Detect** —— 发现 SoulAuth 实际能够观察到的 Authentication Failure、replay / misuse
signal、abnormal credential lifecycle 及其它 security-relevant event。但：

```text
Security Control Present  ≠  Every Compromise Detectable
No Security Signal        ≠  Proof of No Compromise
```

**Contain** —— 当某个 Authentication Boundary 已经受到影响时，限制损害继续扩大。但
Containment 必须具有明确 Scope：Credential、AuthSession、Client 和 Actor lifecycle
不是同一个 Containment Domain。

**Recover** —— 重新建立可信 Authentication Capability。但 Recovery 必须恢复 Trust，
而不是绕过 Trust。具体 Incident 与 Recovery Procedure 继续由
[运维与恢复](../operate/operations-and-recovery) 定义；本篇只定义 Authentication 层的
安全要求。

## 3 · Authentication Protection 是 Shared Responsibility

OAuth、OIDC、Browser、Resource Server 和 Application Security 不可能完全由 SoulAuth
Server 单方面完成：

```text
Protocol Protection
≠
Server-only Protection
```

| Control Area | Primary Responsibility |
| --- | --- |
| **Actor Credential Protection** | SoulAuth 与 Declared Credential Contract |
| **Credential / ActorIdentity Binding Integrity** | SoulAuth Identity / Authentication Boundary |
| **Protocol Transaction Protection** | SoulAuth + Client，按 Current Declared Profile |
| **Client-side Correlation / Verifier Custody** | Client，where required |
| **AuthSession Protection** | SoulAuth |
| **Access Token Validation** | Resource Server |
| **Application Session Protection** | Application / BFF |
| **Key / Secret Custody** | 对应 Runtime / Deployment Boundary |

SoulAuth 可以实现正确 Protocol Contract，但它不能替一个 Consumer 跳过必要 Token
Validation、忽略 Audience / Resource、错误理解 Claims，然后仍然自动恢复 end-to-end
security。

## 4 · Identity Misattribution 需要组合式 Protection

ActorIdentity 被错误归因，通常不是单一 Control 失效造成的。它可能同时依赖
ActorIdentity continuity、Credential / Verification Material binding、Client / Actor
separation、Federation source + subject semantics、IdentityBinding integrity、token
subject semantics、integration provenance。

> **Protection 不能按"功能数量"衡量。**

真正的问题是：多个 Control 是否共同守住"这个 Authentication 确实属于正确
ActorIdentity"这一 Security Property。

## 5 · Credential Protection 不只是 Secret Protection

```text
Credential Material Protection
+
ActorIdentity Binding Integrity
+
Protected Credential Lifecycle
```

只把 Secret 存得很安全并不足够。如果攻击者能够把自己控制的 Verification Material
错误绑定到另一个 ActorIdentity，Authentication Security 仍然已经失败 —— 这正对应
Threat Model 中的：

```text
Credential Theft
≠
Credential Binding Substitution
```

Credential lifecycle 本体继续由 [认证与会话](../reference/authentication-and-sessions)
定义，Administrative mutation 继续由 [管理](../reference/administration) 定义。本篇
只锁定：

> **Credential lifecycle 本身就是 Security Surface。**

## 6 · Raw Secret 不应成为 Readable Stored Credential

```text
Raw Secret
≠
Readable Stored Credential
```

以 Password 为例：Authentication 需要验证新输入是否满足既有 Credential Contract，
它不需要 SoulAuth 能够重新恢复原始 Password。同样，Raw authentication secret 不应
进入 Claims、Audit、ordinary logs 或其它不适当 projection surface。

## 7 · Password Protection 不等于 Online Abuse Protection

如果 Current Release 提供 password-based authentication，其 at-rest protection 只解决
其中一类 Threat：Credential store 泄露以后，降低 offline guessing 的可行性。但：

```text
Password Protection
≠
Online Guessing Protection
```

它不能替代 Rate limiting、abuse control、enumeration resistance、additional
authentication factor、recovery protection。

Current Release 到底使用哪一种 password protection algorithm 以及什么 parameter
profile，必须由 release-aligned implementation 与 Configuration Contract 证明。本篇
不自行宣布尚未完成工程对齐的 algorithm 或 parameter。

## 8 · Additional Authentication Factors 不自动产生 Authority

如果 Current Release 支持 additional authentication factor，它可以让某个
Authentication Flow 满足不同或更强的 Authentication Condition。但：

```text
Higher Authentication Assurance
≠
Greater Authority
```

Authentication Assurance 回答"当前对'这个主体是谁'的证明满足了什么条件"；Authority
回答"为什么当前主体可以执行这个 Action"。两者不能合并。

### Additional Factor 不等于 Phishing Resistance

```text
Additional Authentication Factor
≠
Phishing-resistant Authentication by definition
```

只有具体 Authentication Method 本身满足正式 phishing-resistance contract，才可以声明
这一性质。不能仅因为出现"MFA"这个标签，就自动扩大 Security Claim。

## 9 · Recovery 不能成为更弱的 Authentication 后门

Recovery 是 Authentication Protection 最危险的边界之一，因为它可能替换、恢复或重新
建立未来 Authentication Capability：

```text
Recovery
≠
Authentication Security Bypass
```

如果正常 Authentication 要求较高的 Trust，不能因为"用户已经无法 Authentication"，
就让 Recovery 变成明显更弱的旁路。同时，不同 Credential 或 Authentication Method
不必共享同一种 Recovery Contract。具体 Recovery Procedure 由
[运维与恢复](../operate/operations-and-recovery) 与当前 Credential Contract 共同
定义。

## 10 · Security-sensitive Artifact 必须 Purpose-bound

Authentication 系统中可能存在用于不同目的的短生命周期 artifact。即使两个 Artifact
在形式上都像"一次性 token"，也不能互换用途：

```text
Valid for Purpose A
≠
Valid for Purpose B
```

verification-purpose artifact、recovery-purpose artifact、protocol continuation
artifact 都应服从自己的 purpose、lifetime 和 replay semantics。本篇不把这些描述性
概念升级成新的 Canonical Resource Type。

## 11 · Enumeration Resistance

Public Authentication Flow 应减少不必要暴露 Actor / Account / Credential State 的
可观察差异：

```text
Operator Diagnostic Detail
≠
Public Authentication Detail
```

目标是**减少不必要的 identity / credential enumeration signal**。但本篇不做无法证明
的 absolute timing indistinguishability 承诺 —— 这是一个更准确、更可验证的 Security
Property。

## 12 · Actor-held Cryptographic Credential Protection（where supported）

如果 Current Release 支持某种依赖 actor-held private cryptographic material 的
Authentication Method，需要同时保护：

```text
Private Material Custody
+
Verification Material Integrity
+
ActorIdentity Binding Integrity
```

即使攻击者没有偷到 Actor 原来的 private material，只要它能够把攻击者控制的
Verification Material 错误绑定给 Victim ActorIdentity，仍然可能制造 Impersonation。

### Actor-held private material 不应变成 SoulAuth server-owned secret

如果某个 Declared Authentication Method 规定 private material 由 Actor 或其
authorized custody environment 持有：

```text
Actor-held Private Credential Material
≠
SoulAuth Server Secret
```

SoulAuth 按照该 Method 消费或保存的是适用的 verification information。但 Exact key
format、algorithm 或 proof protocol 由 Current Authentication Contract 定义 —— 本篇
不自行冻结。

### Valid Signature 不等于 Fresh Authentication Proof

```text
Valid Signature
≠
Fresh Authentication Proof
```

一个 Cryptographic Signature 通过验证，只证明声明范围内的 signature relationship
成立。它不会自动证明这份 proof 是为当前 Authentication Attempt 生成的、没有被
Replay、当前 Freshness 仍然满足。如果某个 Authentication Method 存在 replay risk，
Freshness / replay protection 必须由那个 Method 自己的 Declared Contract 定义。

## 13 · Actor Credential 不等于 Client Authentication Material

```text
Actor Credential
≠
Client Authentication Material
```

一个证明 ActorIdentity，另一个证明哪个 software Client 正在参与 Protocol。
Machine-to-machine 场景也不能消除这条语义边界。

## 14 · Client 与 Authorization Transaction Protection

OAuth / OIDC Protection 由 Client 与 SoulAuth 共同完成，但每个 Control 拥有不同
目的：

| Control | Protects | It does not establish |
| --- | --- | --- |
| **Client Authentication** | Client protocol context | ActorIdentity |
| **Registered Redirect Validation** | response destination | application authority |
| **PKCE，where required by profile** | authorization-code continuation binding | Client Authentication |
| **`state`，where applicable** | client-side transaction correlation | Actor Authentication |
| **`nonce`，where applicable** | OIDC response / authentication transaction binding | API authority |
| **One-time Authorization Code semantics** | code replay resistance | Access Token replay resistance |

Exact Parameter、Applicability、Validation 和 Error Semantics 继续由
[OIDC 与 Client](../reference/oidc-and-clients) 定义。本篇只解释这些 Control 分别
保护什么，以及它们不能代替什么。

## 15 · Artifact Protection 必须 Artifact-specific

Authorization Code、AuthSession、ID Token、Access Token 以及 Current Profile 实际
支持的其它 Artifact 拥有不同 Purpose、Lifetime 与 Threat，因此不能用一个统一的
"Token Security"模型吞掉所有 Artifact。不同保护机制也不是同一个东西：

```text
Single-use  ≠  Reuse Detection  ≠  Bearer Confidentiality  ≠  Method-specific Freshness
```

Replay Protection 必须 **Artifact-specific**。

## 16 · SoulAuth AuthSession 不等于 Application Session

```text
SoulAuth AuthSession
≠
Application Session
```

SoulAuth AuthSession 承担 Authentication continuity；Application / BFF Session 承担
Application 自身的 session semantics。SoulAuth 保护自己的 AuthSession，不意味着
Application Session 自动安全。具体 Browser / BFF Protection 继续由
[浏览器与 BFF](../integrate/browser-and-bff) 定义。

## 17 · Access Token Protection 服从真实 Token Contract

```text
Access Token
≠
JWT by definition
```

Access Token Protection 取决于 Current Profile 真正定义的 Representation、Resource /
Audience、Lifetime、Validation Strategy、bearer 或其它 proof semantics、Consumer
handling。不能因为某个实现使用 structured token，就把"Access Token = JWT"升级成产品
本体。

### Bearer Token 不天然具有 Replay Detection

如果 Current Access Token Profile 使用 Bearer semantics，持有 Artifact 本身就是使用
Capability 的重要组成部分：

```text
Bearer Access Token
≠
Necessarily Replay-detectable Artifact
```

一个被窃取但仍然有效的 Bearer Token，可能无法仅凭 Resource Request 本身被区分成
"攻击者 Replay"还是"合法 Holder 使用"。所以 Bearer protection 主要依赖 disclosure
prevention、bounded lifetime、correct resource restriction、correct consumer handling
以及 Current Profile 声明的其它 Control。

## 18 · ID Token 不等于 API Access Token

```text
ID Token
≠
API Access Token
```

ID Token 面向 OIDC Client 表达 Authentication Projection。它不能因为包含 Identity
Claims，就被 Resource Server 当成通用 API Credential。Exact Token Purpose 继续由
[OIDC 与 Client](../reference/oidc-and-clients) 定义。

## 19 · Upstream Revocation 不等于 Universal Instant Token Invalidation

Credential、AuthSession 或 Actor lifecycle 发生变化，可以改变上游 Canonical Security
State。但：

```text
Upstream Revocation / Lifecycle Effect
≠
Universal Immediate Downstream Artifact Invalidation
```

真正的 Freshness 取决于 Artifact lifetime、local / online validation、server-side
state、resource contract、declared revocation / freshness semantics。这也是为什么
Revocation Effect 与 Propagation Freshness 必须分开。

## 20 · Rate Limiting、Lockout 与 Enumeration Resistance 分开

这三个 Control 经常被混成"登录保护"。但：

```text
Rate Limiting  ≠  Lockout  ≠  Enumeration Resistance
```

### Rate Limiting

限制某类请求或高成本 Operation 的速率。它可以使用 source signal、client context、
identifier-related signal、endpoint 或其它 abuse context —— 但这些只是
**Abuse-control Signals**，它们不是 ActorIdentity：

```text
IP Address
≠
ActorIdentity
```

不能把一个 shared IP 或 network address 升级成唯一攻击者 Identity。

### Lockout

限制某种 Authentication Capability 被继续尝试或使用。但是：

```text
More Aggressive Lockout
≠
Always More Secure
```

因为攻击者也可能利用 Lockout 制造 DoS。同样：

```text
Lockout  ≠  Credential Revocation
Lockout  ≠  Actor Suspension
```

三者属于不同 State 与 Lifecycle Scope。

### Enumeration Resistance

关注 Public Flow 不必要泄露了多少 identity / credential state。它既不等于 rate
limiting，也不等于 lockout。具体 Error 与 Public Disclosure Contract 继续由各
Endpoint 定义。

## 21 · Cross-replica Security Correctness 不等于 One Shared Store

在多 Replica Deployment 中，真正需要保证的是：Security Control 切换 Replica 以后仍然
保持 Declared Security Semantics。因此：

```text
Cross-replica Security Correctness
≠
Every Security Control Uses One Shared Store
```

不同 Control 可以采用不同一致性机制。本篇不创建新的 Canonical
`SecurityStateStore`，也不规定 Redis、SurrealDB 或其它具体 Infrastructure。真正必须由
Engineering Contract 回答的是：当前 Control 需要什么 consistency、atomicity、
freshness 或 single-use guarantee。

## 22 · Detection 拥有 Visibility Boundary

SoulAuth 只能 Detection 自己实际能够观察的 Security Event。例如某种 failure 发生在
Resource Server 内部、Consumer Runtime 内部或 Compromised External Provider 内部，
SoulAuth 可能完全没有直接 Signal。因此：

```text
No Security Signal
≠
Proof of No Compromise
```

Detection 是 Shared Responsibility。Current Release 到底能够 observe 哪些 Event，由
实际 Runtime 与 Audit Contract 说明。

## 23 · Detection 不等于 Secret Logging

```text
Detection
≠
Secret Logging
```

Security Investigation 需要足够 Context，但 Raw authentication secret、raw token、
private credential material 不应因为"安全检测需要更多信息"就进入不适当的 log /
event / trace surface。Exact Audit Event Contract 继续由 [审计](../reference/audit)
定义。

## 24 · Containment 必须有明确 Scope

```text
Credential Containment
≠ AuthSession Containment
≠ Client Containment
≠ Actor Lifecycle Action
```

一个 Containment Operation 不能被解释成"全系统立即失效所有相关对象"，它只拥有自己
Contract 明确声明的 Effect。

### Containment 不等于 Actor Retirement

```text
Containment
≠
Actor Retirement
```

为了控制一个 Security Incident 暂时限制某个 Capability，不意味着必须永久终止
ActorIdentity lifecycle。这是非常重要的 Blast Radius 纪律。

## 25 · Integration 不得把 Authentication Protection 扩大成 Authority

当 SoulAuth 把 Authentication Facts 交给 SoulseedOS 时，Authentication Protection
仍然只保护 Authentication Boundary：

```text
AuthContext
≠
Authority
```

Adapter 不能因为 Integration 便利，把 trusted Authentication Facts 扩张成 Runtime
Governance。Exact Soulseed Protection Boundary 继续由
[Soulseed 接入](../integrate/soulseed) 定义。

## 26 · Key / Secret Purpose Separation

不同 enabled security function 使用的 key / secret material 必须保持 purpose
separation。一个 Purpose 下的 Key Compromise，不自动等于所有其它 Trust Domain 同时
Compromised。具体 Current Release 到底有哪些 Key Purpose，由当前 Security /
Protocol / Runtime Contract 定义 —— 本篇不通过 Protection 文档自行创造未实现的 Audit
Key 或其它 Key Domain。

### Planned Rotation 不等于 Compromise Response

```text
Planned Rotation
≠
Compromise Response
```

正常 lifecycle transition 可以保持受控 verification continuity；Compromise 则意味着
原有 Trust Assumption 可能已经失效。因此不能把"换了新 Key"自动解释成"Compromise
已经完全处理"。

## 27 · Control Guarantee & Limitation

| Control | 它主要保护什么 | 它不自动保证什么 |
| --- | --- | --- |
| **Credential material protection** | 降低 credential disclosure / offline compromise 风险 | online abuse prevention |
| **Credential binding protection** | material 属于正确 ActorIdentity | credential 不会被盗 |
| **Additional authentication factor** | 满足额外 Authentication Condition | phishing resistance by definition |
| **Higher Authentication Assurance** | 更强的 Authentication 条件 | greater Authority |
| **Recovery protection** | 受控重新建立 Authentication Capability | security bypass |
| **Client Authentication** | Client protocol identity / context | ActorIdentity |
| **Protocol transaction protection** | request / transaction continuation binding | business authority |
| **Token signature / validation** | 声明范围内的 artifact authenticity / validity | resource authorization by itself |
| **Rate Limiting** | abuse rate control | ActorIdentity |
| **Lockout** | 限制某类 Authentication attempt / capability | Credential revocation 或 Actor suspension |
| **Audit / Detection** | 提供可见 Security Signal | every compromise detectable |
| **Revocation** | 改变对应 source-domain state | instant universal downstream invalidation |
| **Signature verification** | signature validity | proof freshness by itself |
| **Key Rotation** | controlled key lifecycle transition | compromise fully remediated |

这张表体现本篇真正的 Security Discipline：

> **只有 Guarantee 与 Limitation 都被说清楚，一个 Control 才真正可解释。**

## 28 · Authentication Protection at a glance

| Boundary | Meaning |
| --- | --- |
| **Authentication Protection ≠ Prevention Only** | Protection 还包括 Detection、Containment 和受控 Recovery |
| **Protocol Protection ≠ Server-only Protection** | Client、Resource Server、Application 也有责任 |
| **Credential Security ≠ Secret Confidentiality Only** | 还需要 Binding 与 Lifecycle Integrity |
| **Password Protection ≠ Online Abuse Protection** | at-rest 与 online threat 不同 |
| **Additional Factor ≠ Phishing Resistance** | 更强 Authentication 不自动代表抗钓鱼 |
| **Assurance ≠ Authority** | 认证更强不会创造行动权 |
| **Recovery ≠ Security Bypass** | 恢复不能成为更弱后门 |
| **Actor Credential ≠ Client Authentication Material** | Actor 与 software Client 继续分离 |
| **Valid Signature ≠ Fresh Proof** | cryptographic validity 不自动提供 freshness |
| **AuthSession ≠ Application Session** | 两层 continuity contract 分离 |
| **Access Token ≠ Assumed JWT** | representation 由 Current Token Profile 定义 |
| **Bearer Token ≠ inherently replay-detectable** | bearer semantics 主要依赖 possession protection |
| **Rate Limiting ≠ Lockout ≠ Enumeration Resistance** | 三种 abuse protection 不能混用 |
| **Revocation ≠ instant universal invalidation** | effect 与 freshness 分开 |
| **No Security Signal ≠ No Compromise** | Detection 有可见性边界 |
| **Containment ≠ Actor Retirement** | 控制损害不等于终止身份生命周期 |

## Exact Contract Source

本篇定义 **Authentication Protection 的 Control Ownership、Guarantee、Limitation、
Shared Responsibility、Abuse Protection、Detection Visibility 与 Containment
Boundary**。

它不自行定义 password hashing algorithm、MFA method、TOTP parameters、recovery
artifact representation、AIActor proof protocol、client-secret storage representation、
PKCE applicability、refresh-token lifecycle、cross-replica state technology。这些
Exact 事实分别来自 [认证与会话](../reference/authentication-and-sessions)、
[OIDC 与 Client](../reference/oidc-and-clients)、Config Registry、Runtime
Implementation 与 [项目状态](../project/status)。因此：

> **某个 Control 在 Security Architecture 中有价值，不意味着 Current Release 已经
> 实现这个 Control。**

## 下一步

到这里，安全三篇已经形成完整闭环：

```text
安全模型    What must remain true?
威胁模型    How can it fail?
认证防护    Which controls protect it, who owns them, and where do they stop?
```

下一步如果需要查看 Standards Claim，进入
[标准与符合性](./standards-and-conformance)；如果需要实际部署与安全运行，进入
[部署](../operate/deployment) / [生产环境检查表](../operate/production-checklist) /
[运维与恢复](../operate/operations-and-recovery)。
