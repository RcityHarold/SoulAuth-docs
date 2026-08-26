# 身份与权限

## 身份成立，不等于拥有行动权

前一篇 [Actor 身份模型](/zh/concepts/actor-identity-model) 建立了 SoulAuth 的身份基础：
**ActorIdentity 回答"这个 Actor 是谁"。**

但知道是谁，只解决了 Identity 问题。即使 SoulAuth 已经成功 Authentication 一个
Actor，也不能继续自动推出：**这个 Actor 可以执行什么 Operation。**

我们在设计 SoulAuth 时，始终把这几个问题分开：

| Layer | 回答的问题 |
| --- | --- |
| **Identity** | 这个 Actor 是谁？ |
| **Authentication** | 要求的身份是否已经按照 Authentication Contract 得到证明？ |
| **Authority** | 当前 Principal 为什么在这个 Domain 中具备执行某类 Operation 的权能基础？ |
| **Authorization Decision** | 当前这一具体 Request 是否允许？ |
| **Effect / Outcome** | Operation 实际改变了什么，最终结果是什么？ |

它们彼此相关，但不能相互替代。

```text
Identity ≠ Authentication ≠ Authority ≠ Authorization Decision ≠ Effect / Outcome
```

实际 Runtime Decision 还可能考虑 Authentication Result、Assurance、Freshness、
Current Eligibility、Target State 和其它 Domain Preconditions。这些都是 Decision
Input。任何一个单独成立，都不等于最终结果已经成立。

## 1 · 知道"是谁"，不等于允许"做什么"

假设 SoulAuth 已经建立：

```text
ActorIdentity  = Alice
Authentication = successful
```

这意味着当前提供的 Authentication Evidence 已经按照声明的 Contract 证明了 Alice 的
身份。它不能继续自动推出：

```text
Alice may delete Project A
Alice may access every document
Alice may approve a payment
```

这些已经属于 Authority 和 Authorization。AIActor 也是一样：

```text
ActorIdentity  = Agent-17
Authentication = successful
```

只说明当前得到证明的 Actor 是 Agent-17。不能因此推出 Agent-17 可以代表某个 Human
使用所有 Tool，或者自动继承这个 Human 的全部行动权。

> **Authentication Result 可以成为 Authorization Decision 的可信输入，但它不是
> Authority，也不是 Authorization Decision。**

## 2 · Authority 是 Domain-scoped，而不是 Identity 属性

ActorIdentity 需要保持长期稳定。Authority 则不同，它回答的是：

> **为什么当前 Principal 在当前 Domain 与 Context 中拥有执行某类 Operation 的权能
> 基础？**

这里的 **Principal** 指当前 Request 或 Decision Context 中正在接受 Authority
Evaluation 的行动主体上下文。它不是新的 Identity Species，也不等于持久化的
ActorIdentity。同一个 ActorIdentity 在不同时间、不同 Client、不同 Resource 和不同
Authority State 下，可以进入完全不同的 Decision Context：

```text
Persistent ActorIdentity
≠
Runtime Principal Context
```

Authority 的具体来源由对应 Domain Contract 定义。SoulAuth Control Plane 可以拥有
自己的 Role、Permission 和 Authority Model；Application、Infrastructure 或
SoulseedOS 可以拥有完全不同的模型。SoulAuth 不定义一个跨所有系统通用的：

```text
universal_authority = true
```

例如，一个 Principal 可能可以读取 Project A，但不能删除 Project B；可以管理
SoulAuth Client，但不能审批某个 Application 中的财务操作；可以在 SoulAuth Control
Plane 拥有 Permission，但没有 Soulseed Governance Authority。

> **稳定 Identity 可以长期存在，Authority 必须保持 Domain-scoped。**

## 3 · Authentication 条件可以约束 Decision，但不会创造 Authority

Authentication 与 Authority 虽然必须分开，但它们并不是毫无关系。某些敏感 Operation
可以要求更高的 Authentication Assurance、更近的 Authentication Freshness，或重新
Authentication。这些条件可以成为 Authorization Decision 的前提。但：

```text
Higher Assurance      ≠  More Permission
Fresh Authentication  ≠  More Authority
Reauthentication      ≠  Privilege Escalation
```

一个没有某项 Permission 的 Principal，即使完成更强 Authentication，也不会因此自动
获得这项 Permission。反方向同样成立 —— Authority Data 也不能修复失败的
Authentication：

```text
Authority cannot repair Authentication failure
Authentication strength cannot repair missing Authority
```

这是 SoulAuth Runtime Decision 中非常重要的对称边界。

## 4 · Authenticated 不等于 Currently Eligible

Authentication 首先建立的是一个事实：某个 Actor 在某个时间按照 Authentication
Contract 成功证明了身份。这个历史事实不会因为当前状态改变而被重写。

```text
T1  Authentication succeeds
T2  Actor is suspended
```

在 T2 之后，T1 的 Authentication 仍然是成立过的历史事实。但是：

```text
Authenticated
≠
Currently Eligible
```

当新的 Request 到来时，系统仍然需要判断当前 Principal 是否还能参与这一次 Decision。
Actor lifecycle、Client status、revocation state 或其它 Security State 都可能影响
Current Eligibility。

> **过去成功 Authentication，不等于当前仍然可以继续进入所有 Authority Evaluation。**

## 5 · Authentication Continuity 不冻结 Authority

AuthSession 用于保持已经建立的 Authentication Reality 在有限时间内连续。因此：

```text
AuthSession               ≠  Authority
Authentication Continuity ≠  Authority Continuity
```

一个 AuthSession 仍然有效时，Authority 完全可能已经改变：

```text
T1  Actor authenticates
T2  Permission X exists
T3  Permission X is revoked
T4  the same AuthSession is presented
```

T4 不能因为 AuthSession 仍然存在，就继续冻结 T2 的 Authority。

同样，SSO 可以复用适用的 Authentication Context。它不会自动复用另一个 Application、
Client 或 Domain 中的 Authority。

## 6 · Claims 和 Token 只能在自己的 Contract 内被解释

Authentication 完成以后，身份或 Authentication facts 可能通过 Protocol Projection
提供给 Consumer。这些 Projection 可以成为后续 Decision 的输入，但它们不会因此获得
无限语义。

### Claims

经过正确验证的 Claims 可以在声明的 Consumer Contract 内被依赖。但：

```text
Claims
≠
Authority by themselves
```

一个 Claim 表明 `Actor Kind = AIActor`，不能推出所有 AIActor 都可以调用某个 Tool。
同样，某个 identity attribute 或 verified communication channel 也不会自动产生
Permission。

### Access Token

一个有效 Access Token 只能按照声明的 Token / Resource Contract 解释：

```text
Valid Access Token  ≠  Universal Authority
Valid Access Token  ≠  Every Resource Operation Is Allowed
```

Token validation 成功，只说明 Token 满足适用的验证 Contract。当前 Resource
Operation 是否允许，仍然可能受到 Authority、Resource policy、Current Eligibility、
Target State 及其它条件约束。

Access Token、ID Token、OAuth `scope` 和具体 Protocol Profile 的精确语义，由
[OIDC 与 Client](../reference/oidc-and-clients) 定义。

## 7 · Authority 成立，也不等于 Operation 一定可以执行

即使当前 Principal 拥有所需 Authority，也还存在另一个问题：

> **当前 Domain State 是否允许这个 Operation？**

例如，一个 Principal 可能拥有管理 Actor lifecycle 的 Permission，但当前 Target
已经处于某个不允许该 Transition 的状态。此时：

```text
Authority satisfied
≠
Domain Preconditions satisfied
```

反方向也成立 —— Domain Precondition 失败，并不意味着这个 Principal 从来没有对应
Authority：

```text
Authority Failure
≠
Domain Precondition Failure
```

只有把 Authority 与当前 Domain Preconditions 一起评估，才能形成这一 Request 的
Authorization Decision。

## 8 · Authorization Decision 也不等于现实已经改变

假设 `Authorization Decision = Allow`，接下来仍然可能发生 persistence failure、
dependency failure、concurrency conflict 或其它 Runtime failure。因此：

```text
Authorization Allow
≠
Operation Effect Succeeded
```

必须继续区分：

```text
Decision  ≠  Effect  ≠  Outcome
```

Authorization 回答"这次 Request 是否允许尝试执行"；Effect 回答"现实状态是否真的
发生改变"；Outcome 回答"整个 Operation 最终得到什么结果"。具体 Failure、Recovery
与 Historical Accountability 由对应 Operations 和 Audit Contract 继续定义。

## 9 · SoulAuth 仍然拥有自己的 Administrative Authorization

Identity 与 Authority 分开，不意味着 SoulAuth 完全不做 Authorization。SoulAuth 本身
是一套需要治理的 Identity Infrastructure，它自己的 Control Plane 仍然必须判断当前
Administrative Principal 是否可以执行某项管理 Operation。

因此 SoulAuth 拥有**有边界的 Administrative Authority**。但这项 Authority 只属于
SoulAuth 自己的 Domain：

```text
SoulAuth Administrative Authority  ≠  Application Authority
SoulAuth Administrative Authority  ≠  Soulseed Governance Authority
SoulAuth Administrative Authority  ≠  Execution Authority
```

例如，一个 Principal 可以拥有管理 SoulAuth Client 的 Permission。这不会让它自动成为
某个业务系统的 Administrator，更不会让它自动获得 SoulseedOS 中的 Governance /
Execution Authority。

SoulAuth 的 Role、Permission、Permission Assignment、Delegation 和 Administrative
Decision mechanics，由 [管理](../reference/administration) 定义。所以更准确的边界
是：

> **SoulAuth 负责自己的 Control Plane Authorization，但不试图成为所有 Consumer 的
> 通用 Authority Engine。**

## 10 · OAuth Authorization 不是 Universal Authority

SoulAuth 还实现 OAuth / OIDC 相关 Protocol。其中的 Authorization Request、
Authorization Code、OAuth `scope`、Access Token 属于明确的 Protocol / Resource
Authorization Context。这些概念具有真实的 Authorization 语义，但它们的 Meaning 被
限制在适用的 Protocol Contract 内：

```text
OAuth Authorization  ≠  SoulAuth Administrative Authority
OAuth `scope`        ≠  SoulAuth Permission
OAuth Grant          ≠  Universal Authority
```

具体 OAuth / OIDC 行为继续由 [OIDC 与 Client](../reference/oidc-and-clients) 和
适用的 External Normative Specifications 定义。本篇只守住边界：**Protocol
Authorization 不能被扩大成其它 Domain 中的通用行动权。**

## 11 · Delegation 不会替换 Identity

Human 与 AIActor 同时进入系统以后，这条边界尤其重要。假设 Alice 创建或操作
Agent-17，不能继续推出：

```text
Agent-17 = Alice
Agent-17 inherits all of Alice's Authority
```

Alice 与 Agent-17 仍然是两个不同 Actor。如果一个 Actor 需要代表另一个 Actor 执行
某项行为，必须存在明确、受控的 Authority Relationship：

```text
Delegation  ≠  Impersonation  ≠  Identity Transfer
```

Delegation 可以改变一个 Principal 在特定 Scope 中可以做什么，它不会改变这个
Principal 到底是谁。同样，Creator relationship、Operator relationship 或 Client
relationship 都不能自动产生完整 Representation。

如果未来系统支持 on-behalf-of 等能力，它仍然必须保留真实 Actor、Acting Principal、
Authority Basis 与 Attribution，而不能通过"代替某人行动"抹掉 Identity Boundary。

## 12 · AIActor：长期 Identity 不等于长期 Authority

一个 AIActor 可能长期运行、跨多个 AuthSession 工作、与多个 Application、Tool 和
Resource 交互。我们希望它能够拥有稳定的 ActorIdentity。但：

> **稳定而长期的 ActorIdentity，不意味着永久而无限的 Authority。**

```text
Long-lived Identity
≠
Long-lived Authority
```

系统可以保持"Agent-17 仍然是同一个 Actor"，同时继续撤销某项 Permission、缩小某个
Resource Scope、终止 Delegation、要求新的 Authentication，或对新的 Operation 重新
执行 Authorization Decision。

这正是 Actor-native Identity 与安全 Agent Governance 能够同时成立的基础。

## 13 · Soulseed Boundary

在 Soulseed 生态中，这条边界继续成立。整体职责保持：

```text
SoulseedAGI  defines Canonical Actor / Mind
SoulAuth     authenticates ActorIdentity
SoulseedOS   owns Governance / Execution
```

SoulAuth 建立的 Authentication Reality 可以通过正式 Integration Contract 成为
SoulseedOS 的可信输入。但：

```text
SoulAuth Authentication  ≠  Soulseed Governance Authority
Valid AuthContext        ≠  Execution Authority
```

SoulAuth 到这里停止。

> **SoulAuth 可以告诉 SoulseedOS"当前得到证明的是谁，以及适用的 Authentication
> Context 是什么"；它不会替 SoulseedOS 决定这个 Actor 最终可以如何被治理或执行。**

Soulseed 整体关系由 [Soulseed 与 Mind OS](./soulseed-and-mind-os) 继续解释；具体
AuthContext 与 Integration Boundary 由 [Soulseed 接入](../integrate/soulseed) 定义。

## 14 · Boundary at a glance

| 已经成立的事实 | 不能自动推出 |
| --- | --- |
| ActorIdentity exists | Actor 拥有 Authority |
| Identity resolved | Caller 已经被 Authentication |
| Authentication succeeded | 当前 Request 被允许 |
| Higher Assurance / Freshness | 更多 Permission |
| Valid AuthSession | Authority 保持不变 |
| Valid Claims / Token | Universal Authority |
| Permission / Role exists | 当前 Request 一定 Allow |
| Authority satisfied | Domain Preconditions 一定满足 |
| Authorization = Allow | Effect 一定成功 |
| SoulAuth Admin Authority | Application / Soulseed Authority |
| Delegation exists | Identity 发生转移 |

整套边界最终可以压缩成：

```text
Who  ≠  Proof  ≠  Power  ≠  Decision  ≠  Reality
```

在 SoulAuth 中：

- **ActorIdentity** establishes who.
- **Authentication** establishes proof.
- **Authority** provides a domain-scoped basis to act.
- **Authorization** decides this request.
- **Effect / Outcome** tells us what actually happened.

## 下一步

到这里，SoulAuth 自身最重要的 Identity / Authority Boundary 已经建立。我们知道：
**可靠地知道一个 Actor 是谁，是行动治理的前提，但从来不是行动权本身。**

下一篇 [Soulseed 与 Mind OS](./soulseed-and-mind-os) 将把视角继续向外展开：SoulAuth
在 SoulseedAGI、SoulseedOS、Soulseed Apps 与更大的 AGI Infrastructure 中究竟处于
什么位置，这些系统分别拥有哪一部分职责，又为什么必须通过明确 Contract 协同。
