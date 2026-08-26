# 故障排查

## 先证明问题在哪里，再改变系统

一个 Authentication、Protocol、Browser、Token、Runtime 或 Integration Flow 失败以后，
最自然的反应往往是：重试、Restart、清 Cookie、Rotate Key、修改 Configuration、放宽
Validation。

但 SoulAuth Troubleshooting 的第一目标不是**尽快让请求成功** —— 因为一个失败完全
可能说明 Security Boundary 正在正确工作。例如一个发给错误 Resource 的 Access Token
被拒绝：

```text
Wrong-resource Artifact → Rejected
```

这可能是正确行为。一个已经消费的一次性 Protocol Artifact 被再次使用而失败，也可能说明
Replay Protection 正在正常工作。因此首先保持：

```text
Diagnosis      ≠  Repair
Error Message  ≠  Root Cause
```

## 1 · Evidence before Mutation

故障出现以后，优先**观察和保存最小必要 Evidence**，再改变系统：

```text
Observe / Capture  before  Mutate / Restart
```

Restart、重新部署、Rotate Key、清理 Session 或修改 Persistence，都可能改变当前
Runtime State、local cache、loaded trust material、bounded protocol state、
clock-related evidence 与 correlation information。于是：

```text
Restart Success
≠
Root Cause Identified
```

## 2 · The Diagnostic Method

```text
1. Capture
        ↓
2. Scope
        ↓
3. Locate
        ↓
4. Verify
        ↓
5. Isolate / Reproduce Safely
        ↓
6. Correct or Escalate
        ↓
7. Positive + Negative Validation
```

**Capture** 记录当前故障发生时的最小必要 Context 与 Evidence。**Scope** 判断 Blast
Radius：谁受到影响？**Locate** 找到 Flow 从哪一步开始第一次失败，并确定对应 Canonical
Owner / Trust Boundary。**Verify** 优先使用 read-only evidence 验证假设。**Isolate /
Reproduce Safely** 尽可能使用 controlled test identity、test client、fresh
transaction、fresh test artifact —— 不要不断重放 Production 用户的 security-sensitive
state。**Correct or Escalate**：Trust 仍然可解释时进行最小合法 Correction；Trust 本身
已经不再可解释时，停止普通 Troubleshooting，进入
[运维与恢复](./operations-and-recovery)。**Validate** 不仅验证正确路径恢复，还要验证
应该失败的路径仍然正确失败。

## 3 · 先判断 Blast Radius

看到一个错误以后，第一问不应该是"Error Code 是什么"，而是**谁受到影响**：

| Blast Radius | First Places to Check |
| --- | --- |
| **几乎所有请求都失败** | Runtime、network / TLS、required persistence、trust material、clock、global configuration |
| **只有一个 Client 失败** | Client Contract、redirect、client authentication、applicable transaction-binding controls |
| **只有一个 ActorIdentity 失败** | ActorIdentity lifecycle、applicable Credential、Authentication Method、IdentityBinding where relevant |
| **只有一个 Runtime Instance 失败** | Artifact Identity、Configuration Identity、trust material、clock、required coordinated state、local cache |
| **只有一个 Feature 失败** | 对应 feature-specific dependency 和 integration boundary |

Feature-specific failure 首先应该停留在它自己的 Failure Domain。不要因为一个 optional
integration 失败，立刻宣布整个 SoulAuth Core 不可用。

## 4 · 再找 First Failing Stage

Blast Radius 告诉你谁受影响；First Failing Stage 告诉你**这条 Flow 从哪里开始第一次
偏离正常 Contract**。

例如：新 Authentication 失败，但已有合法 Access Token 仍然能被 Resource 接受 ——
优先看新 Authentication / transaction / issuance path，而不是先改 Resource Server。
相反：Artifact 成功签发，但所有目标 API 都拒绝 —— 优先检查 Token Contract /
Resource Validation Boundary。

```text
Blast Radius
+
First Failing Stage
=
Diagnostic Scope
```

## 5 · Find the Earliest Broken Boundary

发现多个错误时，不要从最下游症状开始调参数，应该沿 Trust Path 寻找**最早一个无法被
证明成立的 Boundary**：

```text
External protocol view wrong  → do not tune downstream resource policy first
Client contract wrong         → do not tune token consumer first
Actor authentication never established → do not tune Soulseed authority first
```

因为下游看到的错误，很可能只是上游 Trust 已经失败后的派生结果。

## 6 · Diagnostic Context

| Context | What to capture |
| --- | --- |
| **Release** | 当前 SoulAuth Release |
| **Artifact Identity** | 当前实际运行 Artifact 的稳定标识 |
| **Configuration Identity** | 当前 Configuration 的可重现标识 |
| **Protocol / Issuer Context** | 当前 Flow 适用时记录 |
| **Deployment Topology** | 当前真实 Topology |
| **Timestamp** | 故障发生时间 |
| **Last Known Good** | 最近一次明确正常的时间 |
| **Recent Material Change** | Release、Configuration、Key、Certificate、Proxy、Schema、Topology 等变化 |
| **Expected** | 正常应该发生什么 |
| **Actual** | 实际发生了什么 |
| **Affected Flow** | Authentication、Token、API、Browser、Federation、Integration 等 |
| **Client Context** | 如适用 |
| **ActorIdentity Context** | 仅在已经可信确定 ActorIdentity 以后记录 |
| **Runtime Instance** | 如适用 |
| **Correlation Reference** | 如 Current Runtime 提供 |

这里记录的是 **Diagnostic Context**，不是完整 request dump：

```text
Diagnostic Context
≠
Secret Dump
```

## 7 · Debugging 不解除 Secret Boundary

Troubleshooting 是最容易发生 credential leakage 的场景之一。raw credential、bearer
artifact、client authentication material、private credential material、recovery /
verification secret、session credential 都不应被复制到 ordinary issue tracker、chat、
email、screenshot、public forum 或 ordinary diagnostic bundle。

```text
Debugging
≠
Secret Disclosure
```

即使启用了更详细 diagnostic logging，也不会自动解除 Secret / Token Redaction
Boundary。

## 8 · Reproduction 不是无副作用动作

不要假设"我只是再试一次"。很多 Authentication / Protocol 操作会改变 state：

```text
Reproduction
≠
Side-effect Free
```

例如一个重新提交的 one-time artifact 可能被消费；重复失败也可能触发 abuse-control
state：

```text
Failure after repeated retries
≠
Original Failure Condition
```

需要重现问题时，优先使用 fresh transaction、controlled test actor、controlled test
client、fresh test artifact。

## 9 · Quick Routing by Failure Domain

| First Failing Domain | Primary Reference |
| --- | --- |
| **Network / external endpoint / proxy** | [部署](./deployment) |
| **Issuer / OAuth / OIDC / Client** | [OIDC 与 Client](../reference/oidc-and-clients) |
| **Actor Authentication / Credential / AuthSession** | [认证与会话](../reference/authentication-and-sessions) |
| **Browser / Application Session / BFF** | [浏览器与 BFF](../integrate/browser-and-bff) |
| **Access Token / Resource Validation** | [验证 Token](../integrate/verify-tokens) + [OIDC 与 Client](../reference/oidc-and-clients) |
| **Runtime / persistence / failover / recovery** | [部署](./deployment) + [运维与恢复](./operations-and-recovery) |
| **Federation / cross-domain identity** | [Actor 与档案](../reference/actors-and-profiles) + [OIDC 与 Client](../reference/oidc-and-clients) |
| **Soulseed AuthContext** | [Soulseed 接入](../integrate/soulseed) |
| **Historical accountability** | [审计](../reference/audit) |
| **Configuration** | [配置](../reference/configuration) |

本篇不重复这些 Reference 里的 Exact Contract，它只负责把 Reader 送到正确 Owner。

## 10 · Network / TLS / Proxy Diagnosis

典型症状包括 endpoint unreachable、TLS failure、issuer mismatch、internal access
works but external access fails、external scheme / host 与预期不同。

```text
DNS / Routing
        ↓
Transport Boundary
        ↓
Proxy / Ingress
        ↓
SoulAuth Runtime
        ↓
Declared External Protocol View
```

不要一开始就 decode token、修改 Audience 或改 Credential。

### Reachable 不等于 Issuer 正确

```text
Public Endpoint Reachable  ≠  Issuer Configuration Correct
Internal Listen Address    ≠  Public Issuer
```

排查时需要比较：Runtime 实际 external view；metadata / discovery；Client 信任的
issuer；Resource 信任的 issuer。

### Forwarded Metadata 不自动可信

```text
Internet-supplied Forwarded Metadata
≠
Trusted External Request Context
```

不要通过信任所有 forwarded header 让 hostname / scheme 问题"消失"，正确做法是检查
Current Trusted Proxy Contract。

### 不要关闭 Validation 来排查

出现 issuer mismatch 时，不要把"关闭 issuer validation"当成修复。如果真正需要改变
issuer，那已经是 Trust Migration，而不是 Troubleshooting Shortcut。

## 11 · Client & Authorization Transaction Diagnosis

```text
Client Context
        ↓
Request Contract
        ↓
Redirect / Transaction Binding
        ↓
Actor Authentication
        ↓
Protocol Continuation
        ↓
Exchange
```

第一步始终确认：当前到底是不是预期 Client？并继续保持：

```text
Client Authentication Failure
≠
Actor Authentication Failure
```

### Redirect mismatch

按正式 Redirect Contract 比较 registered value 和实际 request，不要发明一套自定义
normalization 规则：

```text
Redirect Diagnosis
≠
Invent Custom URI Normalization
```

更不能允许任意 redirect 来消除错误。

### Transaction-binding controls

`state`、`nonce`、PKCE 等只在 Current Declared Profile 适用时检查，本篇不会把它们
重新定义成所有 Flow 的 Universal Requirement。如果其中一个 Control 失败，按
[OIDC 与 Client](../reference/oidc-and-clients) 的 Current Contract 确认 Client 侧和
SoulAuth 侧各自责任。

### Protocol Error Category 不等于 Root Cause

例如 `invalid_grant` 只能说明当前 request 属于某个 Protocol Error Category，它本身
不能告诉你究竟是 expiry、replay、client / redirect binding 还是 transaction
continuation 中的哪一个问题：

```text
Protocol Error Category
≠
Detailed Root Cause
```

## 12 · 一次性 Artifact 的第二次失败可能是正确行为

```text
first valid use  → succeeds
second use       → rejected
```

这个第二次失败很可能说明 Single-use Protection 正在工作：

```text
Expected Replay Rejection
≠
Server Instability
```

排查这种问题时使用 fresh transaction，不要反复重放 Production 一次性 Artifact。

## 13 · Actor Authentication Diagnosis

```text
ActorIdentity resolves?
        ↓
Current lifecycle eligible?
        ↓
Applicable Credential exists?
        ↓
Credential currently usable?
        ↓
Declared Authentication Method verifies?
```

```text
ActorIdentity
≠
Credential
```

Credential 失败不等于 ActorIdentity 不存在；某一种 Authentication Method 失败也不等于
ActorIdentity 本身失效。Exact Authentication Contract 继续由
[认证与会话](../reference/authentication-and-sessions) 定义。

## 14 · Operator Diagnostic Detail 不等于 Public Error Detail

Operator 在受控环境中可能看到更具体的 lifecycle / credential / runtime diagnosis，
但 Public Authentication Error 不应该因此泄漏 account existence、ActorIdentity
existence、credential configuration、internal lifecycle detail：

```text
Operator Diagnostic Detail
≠
Public Error Detail
```

Troubleshooting 不能成为解除 Enumeration Resistance 的理由。

## 15 · Actor Credential 与 Client Authentication Material 分开

先确认当前失败的是 Actor Credential authentication，还是 Client Authentication：

```text
Actor Credential
≠
Client Authentication Material
```

本篇不假设 Current AIActor 一定采用 public-key / signature method。如果 Current
Method 确实使用 actor-held private credential material，排障也不能要求将 raw private
material 上传给 Operator。Exact Method 继续由
[认证与会话](../reference/authentication-and-sessions) 定义。

## 16 · Browser / Session Diagnosis

Browser"登录失败"经常混合至少三层不同 State：

```text
Cookie  ≠  SoulAuth AuthSession  ≠  Application Session
```

| Symptom | First Boundary |
| --- | --- |
| **Authentication 成功，但 Application 仍未登录** | callback → application session → cookie |
| **每次访问 SoulAuth 都重新 Authentication** | SoulAuth AuthSession → cookie / lifecycle |
| **App 登录成功，但 API 返回 401** | access token → resource validation |
| **Browser request 被阻止** | origin / cookie / CORS / CSRF / proxy |

Exact Browser Contract 继续由 [浏览器与 BFF](../integrate/browser-and-bff) 定义。

### CORS 不等于 Authentication

```text
CORS                          ≠  Authentication
OIDC Transaction Correlation  ≠  General Application CSRF Protection
```

不要通过关闭 CSRF、无限制开放 Origin、放宽 CORS 来证明"Authentication 终于正常"。

### Full BFF Architecture Drift

如果当前 Deployment 明确声明 **Full BFF**，而诊断发现 Browser Application 能够直接
取得 raw OAuth token，这已经不只是普通 Cookie Bug —— 它表示**实际 Implementation
偏离 Declared Architecture**，需要 Architecture / Configuration Correction 与
affected Production Gate revalidation。

## 17 · Token Diagnosis 从 Contract 开始

Token Troubleshooting 的第一步不是"先 Decode JWT 看看"，而是**当前到底是什么 Token
Contract**：

```text
Token Representation  ≠  Validation Strategy
Access Token          ≠  JWT by definition
```

## 18 · ID Token 与 Access Token 分开

```text
ID Token
≠
API Access Token
```

如果 OIDC Login 成功但 API 始终返回 401，第一批检查项之一就是：Application 交给
Resource Server 的到底是不是正确 Access Token。

## 19 · Decoded Token 不等于 Validated Token

一个 structured token 能够被 decode，只说明 Representation 可以被解析。它不能证明
issuer 可信、signature 成立、audience / resource 适用、time 有效、subject 语义成立：

```text
Decoded Token
≠
Validated Token
```

## 20 · Local 与 Online Validation 走不同路径

如果 Current Token Contract 使用 local validation，去
[验证 Token](../integrate/verify-tokens) 检查适用的 issuer、key、signature、
resource、time 等 Contract；如果使用 online validation，检查 trusted validation
endpoint、caller authentication、response semantics 和 resource applicability。

不要把 opaque / online validation failure 送进 JWKS debugging。本篇只负责路由，Exact
validation semantics 继续由 [验证 Token](../integrate/verify-tokens) /
[OIDC 与 Client](../reference/oidc-and-clients) 定义。

## 21 · 401 / 403 是 Hint，不是 Root Cause

```text
HTTP Status
≠
Complete Failure Semantics
```

通常 401 更接近尚未建立 Resource 可接受的 authentication / access context；403 更
接近已有某种 accepted context，但 Authorization Requirement 不满足。但最终仍然必须看
Resource Contract、protocol error information、safe server-side diagnostics。

## 22 · Wrong-resource Rejection 可能说明系统正常

```text
Artifact for Resource A → Resource B → Rejected
```

通常说明 Resource Boundary 正在工作：

```text
Wrong-resource Rejection
≠
System Failure
```

正确的问题是 **Client 为什么获得或者发送了不适用于这个 Resource 的 Artifact**，而不是
"怎么把 resource / audience validation 关掉"。

## 23 · Unknown Key Reference 不自动等于 Token Forged

当 Current Token Contract 使用 public-key-set local validation 时，unknown key
reference 可能来自 wrong issuer、wrong key source、stale validator state、legitimate
key lifecycle transition，或 unknown / distrusted key：

```text
Unknown Key Reference
≠
Automatically Forged Token
```

不能简单"refresh cache until it works"，更不能自动信任 Artifact 自己携带的未知 Key。
Exact Key Lifecycle 继续由对应 Protocol / Security Contract 定义。

## 24 · Time Failure 不应该靠扩大 Lifetime 掩盖

当错误涉及 time-bound semantics 时，检查 SoulAuth、Consumer 以及适用 Runtime 之间的
clock consistency。不要通过无限扩大 artifact lifetime 掩盖 Clock Failure，真正需要
确认的是当前 system time 与 Declared Protocol Skew 是否成立。

## 25 · Client Context 不能被本地猜成 ActorIdentity

如果 Artifact 已经完成可信 validation，但 Consumer 仍然无法回答当前 Context 代表
Actor 还是只有 Client，那是 **Contract 问题**：

```text
Client
≠
Actor
```

不能在 Troubleshooting 里做 `OAuth client_id → treated as ActorIdentity` 这种 local
fallback。如果 Subject / Principal Semantics 本身不明确，停止猜测，回到
[OIDC 与 Client](../reference/oidc-and-clients)、
[身份与权限](../spec/identity-vs-authority)、
[Soulseed 接入](../integrate/soulseed) 的正式 Contract。

## 26 · Runtime / Persistence Diagnosis

典型 Runtime 症状包括 readiness failure、persistence error、intermittent
authentication、retry 后成功、session continuity 异常、不同 Runtime 出现不同结果。

第一批比较：

```text
Artifact Identity
Configuration Identity
Relevant Trust-material State
System Time
Required Coordinated State
Instance-local Cache
```

不要只比较"版本字符串一样"。同一个 version label 不证明两个 Instance 使用同一个实际
Artifact 或相同 Effective Configuration。

## 27 · Replicated Diagnosis（where the topology is supported）

如果问题只在部分 Replica 出现，先确认 Current Release 是否正式支持这套 replicated
topology。如果不同 Replica 运行不同版本：

```text
Replicated Deployment
≠
Mixed-version Compatibility
```

必须先检查 Current Release Compatibility Contract 是否允许这个 mixed-version serving
window。

### Sticky Routing 是诊断信号，不是最终修复

```text
normal routing  → intermittent failure
sticky routing  → works
```

这是很有价值的 Evidence，它可能说明本应跨 Runtime 成立的 continuity 或 security state
被错误绑定到单个 Instance。但：

```text
Sticky Session Workaround
≠
Protocol Continuity
```

Sticky Routing 可以帮助定位问题，它不能自动证明 Architecture 已经修复。

## 28 · Diagnostic Health Detail 不等于 Public Infrastructure Inventory

Operator 需要足够内部 detail 定位 persistence、required trust material、
initialization、configuration 及其它 readiness dependency。但：

```text
Diagnostic Health Detail
≠
Public Infrastructure Inventory
```

公开 Health Surface 不应为了排障方便而暴露 internal topology、sensitive references、
secret detail。Health Endpoint 也不是 Admin API。

## 29 · Persistence Failure 不允许 Implicit Allow

如果 SoulAuth 无法建立某个新的 security-critical identity / authentication fact：

```text
Cannot Establish Required Security Fact
≠
Allow in Degraded Mode
```

不能 `persistence unavailable → temporarily accept everyone`。但反方向也必须保持：
SoulAuth persistence failure 不代表所有以前合法签发的 Artifact 在所有 Consumer 上
立即失效，其继续 Validation 仍然服从对应 Artifact 的 Current Freshness / Validation
Contract。

如果已经需要 restore 或 trust reconciliation，则停止普通 Troubleshooting，进入
[运维与恢复](./operations-and-recovery)。

## 30 · Required Trust Material 不可用时，不要临时创造新 Trust

如果某个 Operation 失败是因为当前 required key / secret / trust material 不可获得，
第一步先确定当前 Operation 实际依赖什么 material。不要为了"看看能不能跑"临时生成一个
随机 replacement key —— 那不是 Troubleshooting，那是在**创造新的 Trust State**。具体
Recovery 进入 [运维与恢复](./operations-and-recovery)。

## 31 · Optional Integration Diagnosis（only when enabled）

### Federation

首先建立完整 External Identity Context：

```text
Trusted External Identity Source + External Subject
```

```text
External Subject String Alone  ≠  Federated Identity
Provider Authentication        ≠  SoulAuth IdentityBinding
```

一个 Provider Authentication 成功，不能单独证明 SoulAuth 应该把它映射到哪个
ActorIdentity。诊断顺序应该停留在：provider trust；source-qualified external
identity；IdentityBinding；ActorIdentity resolution。不能通过 email / display name 做
临时 identity matching。

## 32 · No Identity Resolution 与 Identity Misattribution 是不同等级

**No Identity Resolution** —— 没有建立唯一 ActorIdentity。如果 Trust 仍然明确，可以
继续普通 Troubleshooting。

**Identity Misattribution** —— 系统已经建立了一个 ActorIdentity，但它是错误的
ActorIdentity。

```text
No Identity Resolution
≠
Identity Misattribution
```

前者通常是 Trust 没有成功建立；后者是**错误 Trust 已经建立**。如果发现 Identity
Misattribution：

```text
STOP ordinary troubleshooting
        ↓
Operations & Recovery / Incident Response
```

不要继续"多试几个 Mapping 看看"。

## 33 · Mail Flow State 不等于 Delivery State

如果用户没有收到邮件，不代表 SoulAuth Flow 一定没有建立：

```text
Flow State
≠
Mail Delivery State
```

可以依次确认 SoulAuth flow、adapter invocation、provider acceptance、delivery
result。但 Operator 看到的 detail 不能原样暴露给 Public Caller，否则可能破坏
Enumeration Resistance。

## 34 · Soulseed Diagnosis（when enabled）

直接复用 [Soulseed 接入](../integrate/soulseed) 已经冻结的三层 Failure Model：

```text
Trust Validation Failure
Actor Context Projection Failure
Downstream Runtime Denial
```

**Trust Validation Failure** —— 无法建立声明范围内可信的 SoulAuth Authentication
Facts。**Actor Context Projection Failure** —— Trust 已经成立，但无法形成符合 Current
Soulseed Integration Contract 的唯一 Actor Context。**Downstream Runtime Denial** ——
AuthContext 可信成立，SoulseedOS 仍然基于自己的 Runtime / Governance Policy 拒绝 ——
这不是 SoulAuth Authentication Failure。

### Wrong Actor attribution 必须立即升级

AuthContext 无法建立可以继续排障；但如果 AuthContext 已经建立却被归因到错误
ActorIdentity，那已经是 Identity Misattribution，必须立即进入
[运维与恢复](./operations-and-recovery)。

### Binding Absent 不等于 Actor Absent

```text
Soulseed IdentityBinding Absent
≠
ActorIdentity Absent
```

如果 Current Soulseed Consumer 根本不要求 Soulseed Canonical Actor Reference，缺少
对应 Binding 可以完全合法。先确认 Consumer Contract，不要看到"没有 Binding"就宣布
Identity 损坏。

## 35 · Runtime Denial 不等于 SoulAuth Failure

```text
Trusted AuthContext + Runtime Denial
≠
SoulAuth Authentication Failure
```

不要为了让 Action 成功而伪造 Assurance、伪造 IdentityBinding、修改 Actor Kind 或把
Client 当 Actor。

## 36 · Troubleshooting 不授予削弱 Trust Boundary 的许可

```text
Troubleshooting
≠
Permission to Weaken Trust Validation
```

不要通过以下方式"修复"：关闭 issuer / resource validation；关闭 TLS verification；
接受任意 redirect 或任意 forwarded request context；无限制放宽 browser origin /
security policy；把 Client 解释成 ActorIdentity；根据 email / name 自行制造
IdentityBinding；把 raw credential / token / private material 暴露到 debug surface；
直接修改 Production Persistence；临时生成新的 trust material 来绕过 key 问题；修改
Historical Audit 来隐藏 Gap。

一个 error 只有在拆掉 Security Boundary 以后才消失，不是修好了。

## 37 · 什么时候必须停止普通 Troubleshooting

出现以下情况时，问题已经不再是"哪个配置错了"，而变成**我们现在还能相信什么**。

**Identity Misattribution** —— 错误 ActorIdentity 被建立；Identity ownership 出现
无法解释的 collision / reuse / wrong binding。

**Trust Material Uncertainty** —— required credential / key / secret provenance 无法
解释；某项 trust material 可能已 compromised；downstream 仍接受应该被 distrust 的
material。

**Persistence / Current-state Integrity Uncertainty** —— Production state 疑似被
未授权修改；出现无法解释的 historical rollback。

**Administrative Compromise** —— unauthorized privileged mutation；unknown
administrative initiator；administrative credential 可能已泄露。

**Historical Accountability Failure** —— 未知 Audit Gap；history 疑似被删除、伪造或
重写；Current Audit Integrity Verification 失败（如果该 Profile 正式存在）。

**Security Material Compromise** —— raw credential、session credential、token 或其它
security-sensitive artifact 可能已经泄露。

```text
STOP ordinary troubleshooting
        ↓
Operations & Recovery / Incident Response
```

## 38 · Troubleshooting 不等于 Direct Persistence Mutation

```text
Troubleshooting
≠
Direct Persistence Mutation
```

不要因为"只改一条 record 应该就好了"而绕过 Domain Contract、Audit、Authority、
Lifecycle。正常 Correction 应该优先通过 Supported Control Plane、Current
Configuration Contract、formal migration / maintenance mechanism。如果真正需要底层
State Repair，那已经进入受控 Recovery。

## 39 · Resolution Validation

错误消失不是唯一成功条件。真正完成 Troubleshooting 至少需要回答：**正确路径恢复了
吗？错误路径仍然正确失败吗？我们有没有为了让请求成功而削弱 Trust Boundary？**

**Positive Validation** —— 原失败 Flow 现在按照正式 Contract 成功；上下游 trust
relationship 仍然正确；ActorIdentity attribution 正确；Runtime / topology 行为符合
Current Contract。

**Negative Validation** —— 根据 Failure Domain 和 Enabled Feature Set 选择真正适用的
negative test：wrong issuer 仍然被拒绝；wrong resource 仍然被拒绝；invalid / expired
artifact 仍然失败；invalid transaction binding 仍然失败；Client-only context 仍然不能
成为 ActorIdentity；untrusted IdentityBinding 仍然不会被接受。

```text
Success after Weakening Validation
≠
Successful Troubleshooting
```

## 40 · Correction 以后往哪里走

**Local Correction** —— 问题只是局部、非 Trust-affecting 错误（test client 使用错误
configuration、application 发送到错误 resource、feature-local non-trust configuration
错误）。完成适用 Validation 即可。

**Material / Trust-affecting Change** —— 如果 Correction 改变 issuer、trust
material、persistence / schema、control-plane exposure、token contract、deployment
topology、browser architecture、Soulseed Integration Contract 或其它上次 Production
Sign-off 依赖的 assumption，则**重新执行 [生产环境检查表](./production-checklist)
中的受影响 Production Gates**。

**Recovery / Incident Operation** —— 如果问题涉及 historical restore、identity
misattribution、trust-material compromise、emergency containment、IdentityBinding
correction、historical-accountability recovery，则进入
[运维与恢复](./operations-and-recovery)。

## 41 · Quick Symptom Routing Matrix

| Symptom | First Boundary | Do Not Assume |
| --- | --- | --- |
| **Endpoint unreachable** | DNS / TLS / Proxy / Runtime | "Token 有问题" |
| **Issuer mismatch** | external protocol view / issuer / proxy | "关闭 issuer validation 就好了" |
| **Redirect mismatch** | Client / redirect contract | "需要更宽松的 redirect" |
| **Protocol exchange error** | transaction lifecycle / binding | Error category 就是 root cause |
| **Authentication 成功，App 仍未登录** | callback / app session / cookie | Actor authentication 一定失败 |
| **App 登录成功，API 401** | access token / resource validation | Password 一定错了 |
| **API 403** | resource / application / governance authority | Authentication 一定失败 |
| **Token 可以 decode 但 API 拒绝** | token validation contract | decode 等于 validated |
| **Wrong-resource Artifact 被拒绝** | resource boundary | 系统坏了 |
| **只在某个 Runtime 失败** | artifact / config / trust material / clock / state | retry 成功等于修复 |
| **Federated login 成功但无 ActorIdentity** | external source + subject / IdentityBinding | provider auth 等于 SoulAuth binding |
| **错误 ActorIdentity 被解析** | Identity integrity | 普通 mapping bug，可以继续试 |
| **Mail 未收到** | flow / provider / delivery | Flow 一定没建立 |
| **Soulseed trusted AuthContext 被拒绝** | downstream runtime / governance | SoulAuth authentication 一定失败 |

## 42 · Troubleshooting at a glance

| Boundary | Meaning |
| --- | --- |
| **Diagnosis ≠ Repair** | 找到原因以后才改变系统 |
| **Error Message ≠ Root Cause** | Error category 只是 Evidence |
| **Evidence before Mutation** | Restart / retry 可能改变现场 |
| **Diagnostic Context ≠ Secret Dump** | 排障 Context 不能变成 secret 泄漏 |
| **Reproduction ≠ Side-effect Free** | 再试一次可能改变 security state |
| **Blast Radius + First Failing Stage → Diagnostic Scope** | 先确定谁受影响、从哪里开始失败 |
| **Earliest Broken Boundary comes first** | 不先修上游，调下游通常没有意义 |
| **ActorIdentity ≠ Credential** | Credential failure 不证明 identity 不存在 |
| **Decoded ≠ Validated** | 能解析不代表 Trust 成立 |
| **HTTP Status ≠ Complete Failure Semantics** | 401 / 403 只是诊断 hint |
| **No Identity Resolution ≠ Identity Misattribution** | 找不到与认错是不同等级 |
| **Wrong-boundary Rejection ≠ System Failure** | 正确拒绝可能说明 Security 正常 |
| **Retry Success ≠ Root Cause Resolved** | 重试可能只是改变了现场 |
| **Troubleshooting ≠ Weaken Trust Validation** | 关闭验证不是修复 |
| **Troubleshooting ≠ Direct Persistence Mutation** | 排障不能绕过 Domain Contract |
| **Trust Uncertain → Stop and Escalate** | Trust 本身无法解释时进入 Recovery |
| **Positive Success ≠ Enough** | Negative path 也必须继续失败 |

## 43 · The Troubleshooting Flow

```text
What failed?
        ↓
Who is affected?
        ↓
Where does the flow first fail?
        ↓
Which contract / trust boundary owns it?
        ↓
What read-only evidence proves the hypothesis?
        ↓
Can it be reproduced safely?
        ↓
Is trust still explainable?
        │
        ├── Yes
        │     ↓  smallest valid correction
        │     ↓  positive + negative validation
        │
        └── No
              ↓  Operations & Recovery / Incident Response
```

所以，SoulAuth Troubleshooting 最重要的纪律不是**让 Authentication 尽快成功**，而是：

> **先证明问题在哪里，再改变系统。**

## Exact Contract Source

本篇拥有 **Safe Triage、Diagnostic Context、Blast Radius、First Failing Stage、
Earliest Broken Boundary、Domain Routing、Escalation Boundary 以及 Resolution
Validation**。

它不自行定义 which OAuth flows are supported、whether PKCE is mandatory、whether MFA
exists、whether TOTP exists、whether Refresh Token exists、whether replicated topology
is supported、whether Configuration Revision exists、which AIActor authentication
method exists、whether Audit Integrity is supported。这些必须首先来自
[项目状态](../project/status)、
[认证与会话](../reference/authentication-and-sessions)、
[OIDC 与 Client](../reference/oidc-and-clients)、
[验证 Token](../integrate/verify-tokens)、[部署](./deployment)、
[配置](../reference/configuration)、[审计](../reference/audit)、
[Soulseed 接入](../integrate/soulseed)。

> **Troubleshooting 只能诊断一个已经存在的 Contract 为什么没有被正确履行，它不能在
> 排障过程中创造一个新的 Contract。**

## 下一步

到这里，**运行** 模块真正闭环：

```text
部署          Place SoulAuth into a real runtime environment
        ↓
生产环境检查表  Prove this exact deployment is ready for production
        ↓
运维与恢复     Maintain and recover production trust over time
        ↓
故障排查       Locate the earliest broken boundary without weakening trust
```

如需进一步理解这些诊断边界背后的 Security Properties，进入
[安全模型](../security/security-model)。
