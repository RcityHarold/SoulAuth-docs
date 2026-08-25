# Soulseed 接入

## 将可信的 SoulAuth Authentication Facts 交给 SoulseedOS

当 Consumer 变成 SoulseedOS 时，SoulAuth 不会产生第二套 Identity System。它也不会
因为 Authentication 已经成立，就开始替 SoulseedOS 决定 Runtime Authority、
Governance 或 Execution。

Soulseed Integration 真正增加的是一条明确的交接边界：

> **怎样把 SoulAuth 已经建立的、在声明 Contract 范围内可信的 Actor Authentication
> Facts，以最小、受控的方式交给 SoulseedOS？**

整个 Integration 可以压缩成：

```text
Supported SoulAuth Authentication Source
        ↓
Applicable Trust Validation
        ↓
Bounded Trusted Authentication Facts
        ↓
Soulseed Adapter
        ↓
Minimal AuthContext
        ↓
SoulseedOS
```

其中：

```text
AuthContext
≠
Authority Decision
```

AuthContext 只是 SoulseedOS 开始自己 Runtime / Governance 判断以前的一组可信
Authentication Input。

## 1 · Ownership Boundary

| System | Canonical Responsibility |
| --- | --- |
| **SoulseedAGI** | Canonical Actor / Mind |
| **SoulAuth** | ActorIdentity / Authentication |
| **SoulseedOS** | Runtime / Governance |

> **SoulseedAGI 定义 Canonical Actor 与 Mind，SoulAuth 建立 ActorIdentity 与
> Authentication，SoulseedOS 运行并治理 Actor。**

不同系统可以引用彼此已经建立的事实。但：

```text
Reference
≠
Source-of-truth Ownership
```

## 2 · SoulAuth ActorIdentity 与 Soulseed Canonical Actor 分开

SoulAuth Identity Domain 中的身份锚点是 **ActorIdentity**；SoulseedAGI 拥有自己的
**Soulseed Canonical Actor**。两者不能合并：

```text
SoulAuth ActorIdentity  ≠  Soulseed Canonical Actor
ActorIdentity           ≠  Mind
```

SoulAuth 不会因为 Authentication 一个 Actor，就获得 Mind 的 Source-of-truth
Ownership；SoulseedAGI 也不会因为保存 SoulAuth Reference，就成为 SoulAuth Identity
Domain 的 Writer。

## 3 · IdentityBinding 连接两个 Domain，但不合并它们

```text
Soulseed Canonical Actor
        ↕
IdentityBinding
        ↕
SoulAuth ActorIdentity
```

IdentityBinding 表达**两个明确 Domain 中的 Identity Representation 之间存在一条受控
关系**，它不会让两边变成同一个 Resource：

```text
IdentityBinding  ≠  Soulseed Canonical Actor
IdentityBinding  ≠  Canonical Ownership Transfer
```

本篇只定义 Soulseed-specific specialization，通用契约见
[Actor 与档案](../reference/actors-and-profiles)。

### Adapter 可以投影 Binding，但不能创造 Binding

Adapter 只能消费已经根据正式 IdentityBinding Contract 建立并验证的 relation。它不能
根据 Email、Display Name、Client 或其它相似属性推断两个 Domain 中的 Identity 相等：

```text
Adapter Projection
≠
Identity Equivalence Inference
```

简单说：**Adapter 可以投影 Binding，不能发明 Binding。**

## 4 · 没有 Soulseed Binding，不等于 SoulAuth Actor 无效

必须分开两个问题：

```text
Does a verified Soulseed IdentityBinding exist?
Does this SoulseedOS consumer require one?
```

前者属于 Identity / Integration Fact；后者属于 SoulseedOS Runtime / Entry Policy。
因此：

```text
No Soulseed IdentityBinding
≠
Invalid SoulAuth ActorIdentity
```

一个 standalone ActorIdentity 可以完全合法地存在于 SoulAuth 中。某个 SoulseedOS
Runtime 是否要求同时拥有 Soulseed Canonical Actor Reference，由那个 Consumer Contract
决定。

## 5 · Trust Validation 与 Adapter Translation 是两种职责

**Trust Validation** 回答：

> **当前这些 SoulAuth Authentication Facts，在声明的 Contract 范围内是否可信？**

它可能基于已经建立的 trusted in-process context、受支持的 token / authentication
validation contract，或其它当前 Integration 正式支持的 Authentication Source。但
Trust Validation 建立的不是"整个 payload 全部可信"，它只建立 **Declared Scope 内的
bounded Trust Facts**。

**Adapter Translation** 回答：

> **怎样把已经可信的 Authentication Facts 转换成 SoulseedOS 稳定消费的 AuthContext？**

```text
Trust Validation → establishes bounded trusted facts
Adapter          → translates those trusted facts
```

二者在具体实现中可以位于同一个 package 或 process，但语义上不能合并。

## 6 · 本篇不重新拥有 Authentication Verification

如果当前 Soulseed Integration 使用 OAuth Access Token 或其它 SoulAuth Protocol
Artifact，它的 Issuer、Audience、Signature、Token Profile 以及其它 Verification
Semantics 继续由 [验证 Token](./verify-tokens) 与
[OIDC 与 Client](../reference/oidc-and-clients) 定义。本篇只消费**完成适用验证以后
得到的 declared trusted facts**。因此：

```text
Soulseed Adapter
≠
SoulAuth Authentication Engine
```

Adapter 不能在 SoulseedOS 内部复制第二套 Credential verification、Token trust、
Identity resolution 或 Session authentication，然后形成另一个 Authentication Source
of Truth。

## 7 · AuthContext

Integration Boundary 的核心输出是 **AuthContext** —— **面向 SoulseedOS 的、最小、
bounded、具有明确 provenance 的 SoulAuth Authentication Projection**。它回答：

> **SoulseedOS 开始自己的 Runtime 与 Governance 判断以前，可以信任哪些当前
> Authentication Facts？**

它不是 ActorIdentity 的复制品，也不是把全部 Token Claims 原样倾倒给 SoulseedOS：

```text
AuthContext  ≠  ActorIdentity Source of Truth
AuthContext  ≠  Authentication Credential
AuthContext  ≠  Authority
AuthContext  ≠  Execution Context
```

### More Claims ≠ Better AuthContext

AuthContext 的目标不是携带尽可能多的信息，而是**只携带当前 SoulseedOS Integration
真正需要、并且属于 Authentication Boundary 的最小事实**：

```text
More Claims
≠
Better AuthContext
```

越少的不必要 cross-system identity data，意味着更低 coupling、更小 privacy
exposure、更少 stale state、更低 authority leakage 风险。

## 8 · AuthContext 的 Semantic Dimensions

下面描述的是 **AuthContext 可能需要表达的 semantic dimensions**，不是已经冻结的
JSON 字段名。

| Semantic Dimension | Meaning |
| --- | --- |
| **ActorIdentity Context** | 当前可信 Authentication 对应哪个 SoulAuth ActorIdentity |
| **Actor Kind** | 当 Consumer 确实需要时，表达 Actor 的 Canonical Kind |
| **Soulseed Canonical Actor Reference** | 当存在并且 Consumer 需要 verified IdentityBinding 时使用 |
| **Authentication Assurance / Freshness** | 上游正式 Authentication Contract 建立的 Authentication 属性 |
| **Source / Session / Client Context** | 仅在当前 Integration 真正需要时投影 |
| **Validity / Provenance Boundary** | Consumer 依据什么判断该 AuthContext 当前仍可被信任 |

Exact 字段、Optionality、Encoding 和 Version 由最终 Integration Wire Contract 定义。
本篇不会从这些 Semantic Dimensions 自行生成 Public Schema。

## 9 · ActorIdentity Context 必须具有明确 Namespace

AuthContext 需要表达当前被 Authentication 的 Actor 是谁，但不能通过一个没有
Namespace 的裸字符串暗示这是 Universe-wide Actor ID：

```text
Bare Subject String
≠
Global ActorIdentity
```

AuthContext 中的 ActorIdentity Context 必须由**明确、受信任的 SoulAuth Identity
Domain / Integration Contract** 建立。Exact carrier 可以由 Current Wire Contract
选择 —— 本篇不会假设它等于 ActorIdentity Resource ID、OIDC `sub`、Access-token
Subject 或 Stable Subject Foundation 中的任何一个。这些 Identifier Namespace 不能
未经正式 Mapping 互换。

## 10 · Stable Subject Foundation 不直接成为 AuthContext Subject

Identity Continuity 需要 Stable Subject Foundation。但：

```text
Stable Subject Foundation
≠
Automatically Public Integration Identifier
```

因此本篇不会从 Identity Continuity Semantics 自行创造 `actor_subject` 字段，更不会
假设 AuthContext subject 就是某个 internal stable identifier。Exact ActorIdentity
reference 由 Integration Contract 正式冻结。

## 11 · Client-only Context 不能成为 Actor AuthContext

这是 Actor-native Integration 最重要的边界之一：

```text
Client-only Authentication  ≠  Actor AuthContext
Client Context              ≠  ActorIdentity Context
```

如果验证结果只建立 OAuth Client / software client context，而没有建立 Actor
Context，Adapter 不能把 `client_id` 或其它 Client Identifier 静默升级成
ActorIdentity。SoulseedOS 如果要求 authenticated Actor，必须真正存在满足该 Contract
的 Actor Authentication Facts。

## 12 · Actor Kind 是可选的 Integration Fact，不是第二套接口

当 Consumer Contract 确实需要 Actor Kind 时，AuthContext 可以投影 ActorIdentity
Contract 已经建立的 Canonical Actor Kind（例如 Human 或 AIActor）。但是：

```text
Actor Kind
≠
Authentication Method
```

Human 与 AIActor 仍然共享同一套 Actor-level Integration Boundary。本篇不会因为 Actor
Kind 不同，再创造 Human AuthContext 与 AIActor AuthContext 两套身份接口。Exact wire
representation 由 Integration Contract 定义。

## 13 · Soulseed Canonical Actor Reference

如果当前 SoulAuth ActorIdentity 存在经过验证、且当前 Consumer 需要的 Soulseed
IdentityBinding，可以投影 **Soulseed Canonical Actor Reference**。但：

```text
Soulseed Canonical Actor Reference  ≠  Soulseed Canonical Actor Source of Truth
Soulseed Canonical Actor Reference  ≠  Authority
```

它只是一个跨 Domain typed reference。如果 Binding 不存在，Adapter 不能猜测或补造
Reference。

## 14 · Authentication Assurance 与 Freshness

AuthContext 可以在 Current Contract 需要时表达由 SoulAuth Authentication Runtime
真正建立的 Assurance 与 Freshness Information。但：

```text
Authentication Assurance  ≠  Authority Tier
Authentication Freshness  ≠  Soulseed Authority
```

SoulseedOS 可以把它们作为 Policy Input —— 例如某个高风险 Runtime Entry 可以要求特定
Authentication 条件。但最终 Authority / Governance Decision 仍然属于 SoulseedOS。

## 15 · AuthContext 是 bounded 的

ActorIdentity 可以长期存在，某一次 Authentication Context 不能永久有效：

```text
AuthContext Lifetime  ≠  ActorIdentity Lifetime
AuthContext Lifetime  ≠  Authority Lifetime
```

AuthContext 能够被复用多久，必须服从它真正来源的 Authentication / token / session
material，以及声明的 Integration validity / revalidation contract。不能简单：

```text
validate once → cache forever
```

### AuthContext 不能给自己续期

一个过期 AuthContext 不能：

```text
expired AuthContext → mint new AuthContext
```

然后把自己重新变成可信。需要新的 AuthContext 时，必须重新从 Current Integration
Contract 支持的可信 Authentication Source 建立。

## 16 · Upstream Effect 不等于 Downstream Freshness

Credential revocation、AuthSession revocation、Actor suspension 或 IdentityBinding
change 可以改变上游 Canonical State。但：

```text
Upstream Security Effect
≠
Instant Downstream Observation
```

不同 Integration Source 与 Validation Strategy 可能拥有不同 Freshness Guarantee，
因此 AuthContext 的可继续使用性必须服从其 declared revalidation / freshness
contract。本篇不会未经工程证据承诺所有上游 Security State 变化都会以相同、即时的
方式传播到 SoulseedOS。

## 17 · AuthContext 的形状不建立 Trust

一个 Payload 即使长得完全像 `ActorIdentity`、`Actor Kind`、`Assurance`、
`Canonical Reference`，也不意味着它可信：

```text
AuthContext-shaped Payload    ≠  Trusted AuthContext
Client-provided Actor Claims  ≠  Trusted AuthContext
```

Trust 来自**受支持的 Integration Boundary 与 Applicable Trust Validation**，不是字段
名称看起来正确。

### Transport / Envelope Validation 只建立声明范围内的 Trust

即使某个 Transport、Envelope 或 Token 已经通过验证，也只能让 Declared Contract 覆盖的
facts 成为 trusted facts。不能进一步推导所有附带 metadata 都自动可信，或所有
caller-supplied fields 都获得相同 trust level。Trust 必须保持 source、fact、scope、
purpose 与 validity 边界。

## 18 · AuthContext 需要 Provenance Boundary

SoulseedOS 必须能够知道当前 AuthContext 是否确实来自 Current Release 支持的 Soulseed
Integration Boundary。因此 AuthContext 需要拥有**明确的 provenance 与 validity
semantics**。

但本篇不冻结 in-process、internal transport、signed envelope 或其它具体实现 ——
这些属于 Current Engineering Contract。Public Reference 只要求：

> **AuthContext 的结构不能替代它的可信来源。**

## 19 · Adapter 只负责三件事

| Adapter 可以做 | Adapter 不能做 |
| --- | --- |
| 消费已经建立的 bounded trusted Authentication Facts | 重新实现第二套 Authentication |
| 投影 declared ActorIdentity / Binding context | 自行推断 Identity Equivalence |
| 构造 minimal AuthContext | 决定 Soulseed Authority / Governance / Execution |

```text
Adapter  ≠  Authentication Engine
Adapter  ≠  Authorization Engine
```

它是 **Integration Translator**，不是第三套 Identity 或 Policy System。

## 20 · Soulseed Integration 不直接耦合 SoulAuth 私有数据库

正确关系是：

```text
SoulseedOS
        ↓
Supported Integration Contract
        ↓
SoulAuth
```

而不是：

```text
SoulseedOS / Adapter
        ↓
SoulAuth private persistence
```

```text
Soulseed Integration
≠
Private Database Coupling
```

SoulAuth 可以改变 Storage Engine、Table Layout、Persistence Schema —— 只要它继续
履行公开 Integration Contract，SoulseedOS 就不应该因此需要理解 SoulAuth 内部
Persistence。

## 21 · ID Token 不是 SoulseedOS API Credential

```text
ID Token
≠
SoulseedOS API Access Credential
```

ID Token 面向 OIDC Client 表达 Authentication Projection。SoulseedOS 接受什么
Authentication Material，必须由它自己的 Current Integration / Resource Contract 明确
规定。本篇不会因为 ID Token 含有 Identity Claims，就把它升级成通用 Runtime API
Credential。

## 22 · AuthContext 是 SoulseedOS Decision Input，不是 Decision

AuthContext 建立以后，SoulAuth 与 Adapter 的 Authentication 职责基本完成。接下来
SoulseedOS 根据自己的 Runtime State、Authority、Governance、Current Context 作出
自己的 Decision：

```text
AuthContext
≠
Runtime Authorization Decision
```

SoulseedOS 可以信任 AuthContext 中的 declared Authentication Facts，但真正回答"当前
Actor 能不能进入这个 Runtime"、"能不能执行这个 Action"、"是否满足 Governance
Requirement"，仍然属于 SoulseedOS。

## 23 · Failure Boundary

**Trust Validation Failure** —— 当前 Authentication Source 无法按照 Declared Contract
建立可信 Facts。结果：**No trusted AuthContext**。

**Actor Context Projection Failure** —— 上游 Trust 已经成立，但无法形成满足 Current
Consumer Contract 的明确 Actor Context。例如：当前 Material 只建立 Client-only
context；ActorIdentity semantics 无法唯一确定；Consumer 要求 Soulseed Canonical Actor
Reference，但没有适用的 verified IdentityBinding；Identity context 存在歧义。

```text
Ambiguous Identity Context
≠
Best-effort Actor Mapping
```

身份不明确时，不能"挑一个最像的 Actor"。

**Downstream Runtime Denial** —— 如果 AuthContext 已经可信建立，而 SoulseedOS 自己的
Authority / Governance Decision 拒绝 Action，这不是 Authentication Failure。

```text
Trust Validation Failure
≠ Actor Context Projection Failure
≠ Downstream Runtime Denial
```

## 24 · 无法建立可信 Actor AuthContext 时，不能伪造已认证 Actor

如果一个 SoulseedOS Entry 明确要求 authenticated Actor Context，而 Integration
Boundary 无法建立可信 Actor AuthContext：

```text
Unable to establish trusted Actor AuthContext
≠
Permission to treat the request as an authenticated Actor
```

这不意味着所有请求都必须采用同一个 HTTP 错误 —— Consumer 可以拥有 explicit
unauthenticated path、failure path 或其它 declared behavior。但不能**把无法建立
Trust 降级成一个假的 authenticated Actor**。这就是 Integration 层准确的 Fail Closed
语义。

## 25 · Authentication Audit 不等于 Execution Receipt

SoulAuth、SoulseedOS 与 Execution Layer 记录不同事实：

```text
Authentication Audit
≠
Execution Receipt
```

SoulAuth Authentication 成功，不能证明 SoulseedOS 最终授权了某个 Action；SoulseedOS
授权，也不能单独证明外部 Action 真正完成。跨系统 Correlation 可以存在，但：

```text
Audit Correlation
≠
Raw Authentication Material Propagation
```

不应为了"方便关联"跨系统传播 raw Credential 或其它不必要的 Authentication Secret。

## 26 · Soulseed Integration at a glance

| Boundary | Meaning |
| --- | --- |
| **SoulAuth ActorIdentity ≠ Soulseed Canonical Actor** | 两个 Domain 分别拥有自己的 Canonical Representation |
| **IdentityBinding ≠ Ownership Transfer** | Relation 不会转移 Source-of-truth |
| **No Soulseed Binding ≠ invalid SoulAuth ActorIdentity** | 是否要求 Binding 由 Consumer Contract 决定 |
| **Trust Validation ≠ Adapter Translation** | 一个建立 bounded trust，一个翻译已可信 facts |
| **Client Context ≠ Actor Context** | software client 不能冒充 Actor |
| **Client-only Authentication ≠ Actor AuthContext** | 没有 Actor Fact 就不能生成 Actor Context |
| **AuthContext ≠ ActorIdentity Source of Truth** | AuthContext 只是 bounded projection |
| **AuthContext ≠ Credential / Authority / Execution Context** | Authentication input 不会偷偷扩大成行动权 |
| **AuthContext shape ≠ trusted AuthContext** | Trust 来自受支持 provenance 与 validation |
| **Adapter ≠ Authentication / Authorization Engine** | Adapter 只翻译，不重新认证或决定 Authority |
| **Integration ≠ Private Database Coupling** | 集成依赖公开 Contract，不依赖内部 Persistence |
| **Assurance / Freshness ≠ Authority** | 更强、更近的 Authentication 不会自动增加 Authority |
| **Upstream Effect ≠ Instant Downstream Freshness** | State 变化与 Consumer 观察时间分开 |
| **Authentication Audit ≠ Execution Receipt** | 身份事实不能证明最终 Action 已执行 |

整个 Soulseed Integration 最终可以压缩成：

```text
Supported SoulAuth Authentication Source
        ↓
Applicable Trust Validation
        ↓
Bounded Trusted Authentication Facts
        ↓
Adapter Translation
        ↓
Minimal AuthContext
        ↓
SoulseedOS Runtime / Governance
```

真正的边界是：

> **SoulAuth 建立"当前是谁，以及当前哪些 Authentication Facts 可信"。**
>
> **Adapter 只负责把这些最小 Facts 翻译过去。**
>
> **SoulseedOS 从这里开始回答"这个 Actor 现在为什么可以做什么"。**

## Exact Contract Source

本篇定义 **Soulseed-specific IdentityBinding、Trust Validation / Adapter
Responsibility、AuthContext Semantics、Freshness Boundary 以及 Integration Failure
Boundary 的 Human-readable Contract**。

它不自行创造 AuthContext JSON field names、ActorIdentity carrier、token type、
transport mechanism、signature format、lifetime、version、revalidation interval、
revocation propagation guarantee。这些 Exact Contract 必须来自 Current Soulseed
Integration Wire Contract + SoulAuth Authentication / Token Contract + Runtime
implementation。

Token verification semantics 由 [验证 Token](./verify-tokens) /
[OIDC 与 Client](../reference/oidc-and-clients) 拥有；ActorIdentity /
IdentityBinding semantics 由 [Actor 与档案](../reference/actors-and-profiles) 拥有；
Authentication Result / AuthSession 由
[认证与会话](../reference/authentication-and-sessions) 拥有；SoulseedOS Authority /
Governance 由 SoulseedOS 拥有。因此：

> **Integration Semantic Concept 存在，不意味着 Current Release 已经存在同名 Field、
> Token、Endpoint 或 Transport。**

## 下一步

到这里，Soulseed Integration 已经真正完成边界交接：Soulseed Canonical Actor 与
SoulAuth ActorIdentity 不会被合并；IdentityBinding 只建立 Relation，不转移
Ownership；Authentication Material 先经过适用 Trust Validation；Adapter 只消费
bounded trusted facts；AuthContext 保持 minimal、bounded 并具有明确 provenance；
Client-only context 不能伪装成 Actor；Assurance 与 Freshness 不能扩大成 Authority；
SoulseedOS 保留自己的 Runtime / Governance Decision 权。

如果下一步需要部署这条 Integration，进入 [部署](../operate/deployment)；需要
Authentication / AuthSession Exact Semantics，进入
[认证与会话](../reference/authentication-and-sessions)；需要 Token / Client
Protocol，进入 [OIDC 与 Client](../reference/oidc-and-clients)；需要 Trust
Boundary，进入 [安全模型](../security/security-model)。
