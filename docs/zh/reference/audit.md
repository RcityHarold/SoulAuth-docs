# 审计

## SoulAuth 如何记录、归因和解释已经发生的身份、安全与管理事实

SoulAuth 中的 Current State 会不断变化：ActorIdentity 可以进入不同 Lifecycle
State，Credential、IdentityBinding、Client、AuthSession 与 Administrative Authority
也都可以发生变化。这些 Domain 回答**现在是什么状态**。

Audit 回答另一个问题：

> **过去发生过什么，以及我们现在凭什么这样解释那段历史？**

```text
Audit  ≠  Current State
Audit  ≠  Authority
```

Audit 不会因为记录了一个事实，就创造当前 Authority。它承担的是 **Historical
Accountability**。

## 1 · Audit 是什么，不是什么

Audit 记录的是**需要长期保持 Accountability 的重要 Identity、Authentication、
Protocol、Security 与 Administrative 事实**。它不是所有 Runtime Event 的永久副本，
更不是普通日志的另一个名字。

| Surface | 主要回答的问题 |
| --- | --- |
| **Audit** | 哪些需要长期 Accountability 的事实发生过？ |
| **Operational Log** | Runtime 为什么这样运行？ |
| **Metric** | 系统整体运行状态怎样？ |
| **Trace** | 一次 Operation 怎样跨 Component 运行？ |
| **Security Event** | 什么具有 Security Significance 的事情发生或被检测？ |
| **Execution Receipt** | 某个下游 Action 是否真的执行？ |

```text
Audit           ≠  Operational Log  ≠  Metric  ≠  Trace
Security Event  ≠  Audit Event by definition
```

### Authentication Audit 不是 Execution Receipt

SoulAuth 可以证明 ActorIdentity A 在某一时间建立了 Authentication Result，也可能记录
某个 OAuth / OIDC Protocol Operation 已经发生。但这些事实不能推出 Actor A 后来真的
转了账、删除了文档，或者执行了某个 Soulseed Action：

```text
Authentication Audit  ≠  Application Execution Evidence
SoulAuth Audit        ≠  Execution Receipt
```

SoulAuth 只对自己实际拥有的 Identity、Authentication、Protocol 与 Administrative
事实负责。下游 Application Action 必须由下游自己的 Evidence / Receipt Contract
证明。

## 2 · Attempt、Decision、Effect 与 Outcome

Audit 不能只记录 `"something changed"`。一个历史 Operation 至少可能包含四种不同
事实：

```text
Attempt  ≠  Decision  ≠  Effect  ≠  Outcome
```

**Attempt** 表示某个 Operation 被请求、触发或尝试。Attempt 存在，不意味着 State
已经改变：

```text
Operation Attempt
≠
Domain Effect
```

**Decision** 表示某个正式安全或 Policy 判断已经发生 —— Authentication 判断、
Administrative Authorization 判断、Protocol Eligibility 判断。但是：

```text
Decision
≠
Effect
```

一个 Administrative Request 被 Allow，不意味着随后 State Transition 一定成功。

**Effect** 表示 **Canonical Domain State 真正发生了变化** —— 例如 ActorIdentity
lifecycle 真正发生 Transition，或者 Credential 真正进入 revoked state。

**Outcome** 回答**整个 Operation 最终发生了什么**：成功、拒绝、Conflict、Failure、
Unknown / Partial Outcome。但 Exact Outcome Vocabulary 属于真实 Audit / Runtime
Contract —— Public Reference 不从 Semantic Model 自行创造 Wire Enum。

## 3 · Attribution

Audit 最危险的错误之一，不是少记一条 Event，而是：

> **把错误的人、Client 或 Runtime Context 记成了真正的行动主体。**

因此 Audit 必须在语义上区分至少这些角色：

```text
Initiator
Runtime Origin
Target
Actor Context
Client Context
Claimed / Resolved / Authenticated Identity State
```

这些是 Attribution Dimensions。它们不是同一个字段，也不意味着 Public Wire 必须使用
这些 Exact Name。

### Initiator、Runtime Origin 与 Target 分开

- **Initiator** —— 谁或什么最初请求或触发了 Operation？
- **Runtime Origin** —— 哪个受信 Runtime Context 真正产生、提交或记录了对应 Effect？
- **Target** —— 谁或什么对象受到影响？

```text
Initiator  ≠  Runtime Origin  ≠  Target
```

例如 Admin A 请求 Suspend Actor B，而后台 Worker 最终 Commit State Transition。正确的
历史解释仍然是：

```text
Initiator      = Admin A
Runtime Origin = trusted worker
Target         = Actor B
```

不能因为 Worker 最终写入 State，就把 Initiator 错误改成"system"。

### Client Context 不等于 Actor Attribution

一个 OAuth Client 可以为已认证 Actor 参与 Protocol。Audit 可以同时记录 Actor Context
与 Client Context，但：

```text
Client Context
≠
Actor Attribution
```

Client 是参与 Protocol 的软件实体，ActorIdentity 是 Identity Subject。两者必须保持
不同 Attribution Role。

## 4 · Claimed、Resolved 与 Authenticated Identity 必须分开

这是 Authentication Audit 最重要的 Boundary 之一。假设请求提交：

```text
alice@example.com  +  wrong credential evidence
```

即使这个 Locator 能够解析到 ActorIdentity A，系统仍然没有证明当前请求是 Actor A
发出的。所以：

```text
Claimed Identity                ≠  Authenticated Actor
Resolved Authentication Target  ≠  Authenticated Request Initiator
```

Audit 可以准确记录：请求 targeted / resolved to Actor A；verification failed；没有
建立 authenticated initiator。它不能错误记录"Actor A 执行了一次失败登录"。

### Claimed Client 同样不是 Authenticated Client

如果请求声称 `client_id = Client C` 但 Client Authentication 失败：

```text
claimed `client_id`
≠
authenticated Client
```

Audit 可以记录 Request claimed Client C，但不能记录 Authenticated Client C 执行了
Operation。

### 把 Actor 归因为 Authenticated Initiator 需要 Verified Context

如果 Audit 要说 **Actor A 是当前请求的 authenticated initiator**，必须存在适用的
verified authentication context。不能从 Email、Username、Display Name 或 arbitrary
request parameter 直接生成 Actor Attribution。

但这不妨碍一个 Administrative Operation 把 Actor B 作为 **Target** ——
Authenticated Initiator 与 Target Actor Reference 属于不同语义角色。

## 5 · Audit Attribution Reference 必须 Typed

Historical Attribution 不能依赖 Display Name、Current Profile、未限定 Source 的
External Subject，或 OIDC `sub` 的隐式转换：

```text
Audit Actor Attribution Reference  ≠  Display Name
Audit Actor Attribution Reference  ≠  OIDC `sub`（默认）
```

Audit 需要能够稳定指向 **event-time SoulAuth ActorIdentity semantics**。Exact
field、identifier carrier 或 wire representation 由真实 Audit Contract 定义；本篇不
提前创造新的 Public Identifier Namespace。

### Claimed Identity 不要求永久保存 Raw Locator

```text
Claimed Identity Context
≠
Requirement to retain raw locator
```

Audit 同样服从 Data Minimization、Privacy、Investigation Need 与 Enumeration Risk。
具体 representation 由 Current Audit Contract 决定。

## 6 · System-originated Event 仍然需要 Attribution

并不是每一个重要 Event 都有 Human 或 AIActor Initiator。自动 Expiration、scheduled
work、security automation 或 recovery activity 都可能属于 System-originated
Operation：

```text
No Actor Initiator
≠
No Attribution
```

这种 Event 仍然应该在适用 Contract 中说明 Runtime Origin、Cause / Trigger、Target、
Outcome，以及存在时的 upstream initiator。

## 7 · Historical Interpretation 不能使用 Current State 重算

Audit 真正的长期价值是**多年以后仍然按照当时成立的语义解释过去**。所以 Current
mutable state 不能成为 Historical Attribution Source。

### Current Profile 不能重写过去

```text
Current Profile
≠
Historical Attribution Source
```

一个 Actor 今天改名，不改变昨天的 Event 属于哪个 ActorIdentity。Current display
information 可以用于 UI 展示，Stable historical attribution 不能依赖当前 Display
Name。

### Current IdentityBinding 不能重新映射过去

```text
Current IdentityBinding
≠
Historical Authentication Attribution
```

如果 External Identity X 在 T1 绑定 Actor A，后来在 T2 改变 relation，T1 已经成立的
Authentication History 仍然属于当时解析出的 Actor A，不能根据今天的 Binding 重新
计算。

### Current Role / Permission 不能重写过去的 Administrative Authorization

```text
Current Role / Permission State
≠
Historical Administrative Authorization
```

今天 Revoke Admin A 的 Permission，不会让昨天当时合法的 Operation 变成"从未被
授权"；今天新增 Permission，也不能 retroactively authorize 过去本来未被授权的
Operation。

## 8 · Historical Event 按照 Event-time Semantics 解释

历史记录不仅需要按照当时的 Identity、Authentication、Authority 解释，还需要知道
**当时的 Event Schema / Semantic Version 到底怎样定义这条记录**：

```text
Current Event Semantics  ≠  Automatic Interpretation of Historical Record
Vocabulary Evolution     ≠  Historical Record Rewrite
```

如果后来术语发生变化，可以通过 version-aware interpretation 解释旧历史。

### Current Audit Coverage 不等于 Historical Coverage

如果 Release A 没有要求 Audit 某类 Fact，而 Release B 后来开始要求：

```text
Current Audit Coverage
≠
Historical Audit Coverage
```

今天不能因为旧历史中没有某类新 Event，就反向证明那类事情过去从未发生。Historical
Completeness 必须按照**当时真正成立的 Audit Coverage Contract** 解释。

## 9 · Event Time 与 Record Time 分开

```text
Event Time
≠
Record Time
```

**Event Time** 表示被记录的 Domain Fact 在其业务或安全语义上何时发生；**Record
Time** 表示 Audit Runtime 何时正式接受或持久化对应 Historical Record。两者可能接近，
但不是同一个事实。

### Timestamp 不是 Global Total Order

在 Multi-replica 或 Distributed Runtime 中，`timestamp A < timestamp B` 不能自动证明
Event A 在所有业务与因果意义上都先于 Event B：

```text
Timestamp
≠
Global Total Order
```

如果需要表达 Cause，必须依赖声明的 causal / parent / correlation context，而不是仅靠
Wall-clock ordering。

## 10 · Historical Integrity Claim 的边界

只有当 Current Release 正式声明提供某种 tamper-evident audit capability 时，Public
Reference 才能进一步描述它的 Exact Integrity Profile。即使如此，也必须始终保持：

```text
Tamper-evident
≠
Tamper-proof
```

Tamper-evident 真正能表达的是：

> **在声明的 Integrity Scope、Representation、Trust 与 Verification Boundary 成立
> 时，某些未经授权的历史变化具有可检测性。**

它不能表达"任何人永远无法修改任何 Audit bit"。

### Integrity Validity、Coverage 与 Freshness 不是一回事

```text
Cryptographic / Integrity Validity
Coverage
Freshness / Continuity
```

一个 Proof 数学上 valid，不代表它覆盖全部 History；一个 Proof 覆盖某段 History，
不代表它一定代表最新可信历史：

```text
Valid Integrity Evidence  ≠  Complete History
Valid Old Evidence        ≠  Latest Trustworthy History
```

### Cryptographic Validity 不等于 Trust Validity

```text
Cryptographic Validity
≠
Trust Validity
```

某个 Signature 数学上有效，不代表对应 Key 在该时间范围仍处于可信状态。Integrity
Evidence 必须在声明的 Trust Model 中解释。

### Cryptographic Integrity 不等于 Semantic Truth

这是 Audit 最不能被过度宣传的一条边界：

```text
Cryptographic Integrity  ≠  Semantic Correctness
Attribution Correctness  ≠  Historical Storage Integrity
```

如果系统一开始就错误记录 Actor B 执行了某 Operation，完整性机制最多证明这条 Record
后来没有被静默改写，它不能反向证明最初 Attribution 一定正确。

### Integrity 不等于 Confidentiality

```text
Audit Integrity
≠
Audit Confidentiality
```

一条 Audit Record 能够被验证，不意味着任何 Caller 都可以读取完整 Payload。

## 11 · Committed History 不应被普通 Administration 静默改写

```text
Historical Audit Record   ≠  Ordinary Mutable Resource
Administrative Authority  ≠  Authority to Rewrite Audit History
```

如果 Current Audit Contract 允许 Correction、Annotation 或 Investigation
Conclusion，它们应保持原始 History 与后续解释之间的可区分性。原则始终是：

```text
Correction
≠
History Rewrite
```

## 12 · Audit Gap 不等于 No Activity

这是 Historical Evidence 最重要的解释原则之一：

```text
Audit Gap                 ≠  No Activity
No Matching Audit Record  ≠  Event Never Occurred
```

只有在能够同时建立适用的 Historical Audit Coverage、Retention Coverage、Gap /
Continuity 状态与 Query Completeness 等条件时，缺少 Record 才能支持更强的历史推断。

## 13 · Audit Outage 不能在事后被伪装成连续历史

```text
Audit Outage
≠
Permission to fabricate continuous history later
```

恢复以后可以真实记录出现过 Gap、进行了 Recovery、某些事实后来得到 Reconciliation，
但不能假装当时所有 Event 都实时、连续、按原始顺序被完整记录。

## 14 · Recovery 不能把 Recovered State 宣称成 Uninterrupted History

```text
Recovered Audit State
≠
Uninterrupted Audit History by assertion
```

如果过去存在更晚、已经被可信 Observer 看到的 Historical Evidence，恢复到更旧状态不能
让那些 Evidence"从未存在"。因此：

> **Recovery 后的 Historical Confidence 可能具有 Scope、Range 与 Boundary。**

不能只用一个不加限定的 `audit history = trusted` 覆盖所有 Gap 与 Uncertainty。具体
Recovery Procedure 由 [运维与恢复](../operate/operations-and-recovery) 定义。

## 15 · Retention 不能成为 Silent Historical Rewrite

```text
Audit Retention       ≠  Ad-hoc Administrative Deletion
Authorized Retention  ≠  Silent Historical Rewrite
Retention Expiry      ≠  Historical Event Never Existed
```

Audit Retention 与 Actor / Profile Retention 也属于不同 Contract。

## 16 · Audit Data 是 Sensitive Security Data

Audit 不是 Public Log。它可能包含 Actor activity、Authentication context、Client
context、Administrative operation、Identity reference、Security state 以及时间与关联
信息：

```text
Audit Data
≠
Public Data
```

### Audit Read Authority 不等于 General Admin Authority

```text
Audit Read Authority
≠
General Administrative Mutation Authority
```

一个可以 Suspend Actor 的 Principal，不必因此获得全量 Audit Read Authority；反过来，
某个受控 Audit Reader 也不需要拥有 Actor 或 Credential Mutation Authority。

### Audit Read 不等于 Unlimited PII Access

```text
Audit Read Authority
≠
Unlimited Identity / PII Visibility
```

Audit Access 仍然服从 Caller Context、Authority、Purpose、Data Minimization 与
Projection。

## 17 · Canonical Audit Record 与 Caller-visible Projection 分开

```text
Canonical Audit Record
≠
Caller-visible Audit Projection
```

Caller Projection 可以按照适用 Policy redact、mask、minimize、omit。但：

```text
Projection Redaction
≠
Canonical Historical Mutation
```

Current display projection 改变，不应重新改写 Canonical History。

### Projection 不自动等于 Integrity Payload

如果 Current Release 提供某种 Canonical Integrity Verification：

```text
Caller-visible Projection
≠
Canonical Integrity Payload
```

一个 redacted query response，不能仅因为它来自 Audit API，就自动被解释成 Canonical
Record 本身。具体 verifiable projection 如果未来成为 Current Supported Contract，
必须拥有独立 Exact Proof Semantics —— 本篇不会预先创造该 Feature。

## 18 · Audit Detail 不等于 Secret Capture

Audit 为了 Accountability 可以记录什么 Credential 或 Token-related Event 发生、哪个
Resource 受到影响、什么结果成立。但：

```text
Audit Detail       ≠  Secret Capture
Token Correlation  ≠  Raw Token Logging
```

Raw authentication、session、client 或 token secret material 不应因为"方便审计"进入
Historical Audit Payload。如果 Current Contract 需要 token correlation，应使用不会
重新构成可使用 Secret 的受控 Reference / representation。Exact mechanism 由工程
Contract 决定。

## 19 · Query Result 不等于 Historical Completeness

如果 Current Release 提供 Audit Query Surface，需要守住一个非常重要的 Evidence
Boundary：

```text
Audit Query Result
≠
Proof of Complete Audit History
```

查询返回 10 条 Record，只证明当前 Query Contract 返回了这些结果，它不会自动证明不
存在第 11 条相关 Record：

```text
Verified Audit Record  ≠  Verified Query Completeness
No Matching Result     ≠  Event Never Occurred
```

Exact Query、Filter、Pagination 与 Ordering 继续服从 [API 约定](./api-conventions)
和 Published Machine-readable Contract。

## 20 · Display Order 不等于 Business Causality

即使 Audit UI 或 Query Result 按某个时间、sequence 或 storage order 展示：

```text
Display Order
≠
Business Causal Order by definition
```

如果系统需要表达一个 Event 由另一个 Event 导致，应使用明确的 causal context，不能
仅凭排序位置猜测因果关系。

## 21 · Audit at a glance

| Boundary | Meaning |
| --- | --- |
| **Audit ≠ Current State** | Audit 解释过去，不定义现在 |
| **Audit ≠ Authority** | Historical record 不会创造当前权能 |
| **Audit ≠ Log / Metric / Trace** | Accountability 与 Observability 分离 |
| **Authentication Audit ≠ Execution Receipt** | Authentication evidence 不能证明下游 Action 已执行 |
| **Attempt ≠ Decision ≠ Effect ≠ Outcome** | 请求、判断、现实变化和最终结果分离 |
| **Initiator ≠ Runtime Origin ≠ Target** | 谁请求、谁执行、谁受影响分别归因 |
| **Claimed / Resolved Identity ≠ Authenticated Initiator** | Target 或输入身份不能冒充 Verified Actor |
| **Current Profile / Binding / Role ≠ Historical Attribution Source** | 今天的状态不能重算昨天 |
| **Event Time ≠ Record Time** | 事情发生与记录进入 Audit 不是同一时间 |
| **Timestamp ≠ Global Total Order** | Wall-clock ordering 不是普遍因果顺序 |
| **Tamper-evident ≠ Tamper-proof** | 可检测篡改不是绝对不可修改 |
| **Cryptographic Integrity ≠ Semantic Truth** | 完整性不能证明最初记录一定正确 |
| **Query Result ≠ History Completeness** | 返回记录不能自动证明全集 |
| **No Audit Record ≠ Event Never Occurred** | Gap、Coverage 和 Retention 决定证据强度 |
| **Audit Data ≠ Public Data** | Historical accountability data 仍是敏感数据 |
| **Administrative Authority ≠ Audit Rewrite Authority** | 高权限 Admin 也不能普通重写历史 |

SoulAuth Audit 最终可以压缩成：

```text
Something happens
        ↓
Attempt / Decision / Effect / Outcome
        ↓
Attribution
        ↓
Event-time Context
        ↓
Historical Audit Record
```

然后再分别判断 Coverage、Integrity、Retention、Gap / Recovery、Projection —— 这些
维度不会重新定义事件当时究竟发生了什么。

## Exact Contract Source

本篇定义 **Audit Event 的 Historical Semantics、Attribution、Temporal
Interpretation、Historical Integrity Claim Boundary、Gap / Completeness 以及 Access /
Projection 的 Human-readable Contract**。

它不自行创造 event_type values、event schema fields、audit resource IDs、checkpoint
format、hash algorithm、integrity key、query endpoint、retention duration。Exact
HTTP / Query Wire 由 **Published Machine-readable Contract** 拥有；Current Release
到底 Support 哪些 Audit Event、Query、Integrity 或 Verification Capability 由
[项目状态](../project/status) 负责发布；Recovery Procedure 由
[运维与恢复](../operate/operations-and-recovery) 负责；Security / Key Trust 由
[安全模型](../security/security-model) 与
[认证防护](../security/authentication-protection) 负责。因此：

> **Audit Semantic Concept 存在，不意味着 Current Release 已经拥有同名 Resource、
> Endpoint 或 Cryptographic Feature。**

## 下一步

到这里，我们已经建立了 SoulAuth 历史层真正需要守住的边界：Current State 与
Historical Fact 分开；Attempt、Decision、Effect、Outcome 分开；Initiator、Runtime
Origin、Target 分开；Claimed / Resolved Identity 与 Authenticated Initiator 分开；
今天的 Profile、Binding、Role 和 Schema 不重写过去；Integrity evidence 不被夸大成
Semantic Truth；Missing Record 不被夸大成"No Activity"。

下一份正式进入 [配置](./configuration)，它将回答：哪些 Runtime 行为通过
Configuration 发生变化；Configuration Vocabulary、Value、Source、Effective State 与
Observed State 怎样保持边界；Secret 与普通 Config 怎样分离；Configuration change
又怎样与 Runtime Effect、Rollback、Audit 和 Release Contract 对齐。
