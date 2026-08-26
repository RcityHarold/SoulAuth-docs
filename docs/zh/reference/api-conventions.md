# API 约定

## SoulAuth-owned HTTP Contract 的共同语法

从这一篇开始，SoulAuth 文档正式进入 **参考**。前面的概念、接入、运行与安全文档主要
回答：SoulAuth 是什么，为什么这样设计，以及怎样安全地使用它。参考开始回答另一类
问题：

> **当前 Release 对外承诺的 Exact Contract 到底是什么？**

因此，参考遵循比概念更严格的纪律：

```text
Concepts   may explain design space
Reference  describes supported contract
```

一个尚未进入当前正式 Contract 的 Path、Field、Header、Enum、Error、Pagination Model
或 Retry Behavior，**不能为了让文档显得完整而被写成 Public API。**

本篇也不是 Endpoint Catalog。它定义的是：**后续 SoulAuth-owned HTTP Reference 共同
遵守的表达与边界。**

## 1 · 本篇管什么，不管什么

SoulAuth 面对两类 fundamentally different 的 Wire Contract。

### External Protocol Contract

例如 OAuth / OpenID Connect。其 Protocol Term、Parameter Placement、Media Type、
Redirect Behavior、Error Semantics 与其它 Wire Requirement 由 **External
Specification + SoulAuth Declared Profile** 定义。因此：

```text
SoulAuth Common API Grammar
≠
OAuth / OIDC Wire Grammar
```

本篇不能为了"统一 API 风格"重新设计标准协议。

### SoulAuth-owned HTTP Contract

当一个 HTTP Surface 由 SoulAuth 自己定义时，它可以共享 Reference presentation、
identifier discipline、authentication / authority documentation、error boundary、
concurrency / retry semantics、compatibility rules 与 machine-readable contract
alignment。

具体 Path、Method、Field、Media Type 和 Response Schema，则由相应
**Machine-readable Contract** 和 Domain Reference 定义。

### Responsibility、Representation 与 Exposure 分开

一个接口至少存在三个不同维度：

```text
Contract Responsibility
≠
Wire Representation
≠
Trust-boundary Exposure
```

例如，一个 Administrative Operation 可能使用 JSON over HTTP，OIDC UserInfo 也可能
返回 JSON。这不会让它们成为同一种 Contract。同样：

```text
Publicly Documented
≠
Publicly Exposed
```

开源项目可以完整公开 Control Plane Reference，这并不意味着 Production Operator
应该把对应 Endpoint 无条件暴露给 Internet。

## 2 · Contract Ownership

| Contract Dimension | Canonical Owner |
| --- | --- |
| **OAuth / OIDC Protocol Semantics** | External Specification + SoulAuth Declared Profile |
| **SoulAuth-owned exact HTTP Wire** | Published Machine-readable Contract |
| **Actor-native Identity Semantics** | SoulAuth Canonical Semantic Contract |
| **Authentication / Session Semantics** | [认证与会话](./authentication-and-sessions) |
| **Actor / Profile Resource Semantics** | [Actor 与档案](./actors-and-profiles) |
| **OIDC / Client Profile** | [OIDC 与 Client](./oidc-and-clients) |
| **Administrative Semantics** | [管理](./administration) |
| **Audit Semantics** | [审计](./audit) |
| **Configuration Vocabulary** | Configuration Registry + [配置](./configuration) |
| **Current Product Support Status** | [项目状态](../project/status) |

Human-readable Reference 的职责是**准确解释这些 Contract**，它不是另一个平行 Wire
Source of Truth。同样：

```text
Runtime Behavior
≠
Contract Definition by Accident
```

如果 Runtime 与已经声明的 Contract 不一致，这是需要修正的 Drift / Release Defect，
而不是代码自动获得重新定义 Contract 的权力。

## 3 · Machine-readable Contract

对于 SoulAuth-owned HTTP Surface，Published OpenAPI Contract 拥有 Exact Wire：
Path、Method、Parameter、Media Type、Request / Response Schema、HTTP Response 与适用
Security Scheme。但：

```text
OpenAPI  ≠  OAuth / OIDC Specification
OpenAPI  ≠  Entire Actor-native Semantic Contract
```

OpenAPI 适合表达 Wire。它不会独自定义 Actor 与 Client 为什么不同、Credential
lifecycle 意味着什么、Authentication 为什么不等于 Authority，或 Audit 与 Recovery 的
全部语义。因此：

> **Machine-readable Contract 与 Human Reference 必须在重叠的 Wire Scope 中一致，但
> 两者不会因此拥有相同的 Semantic Ownership。**

在本仓库中，这些机器契约位于 `contracts/`，由符合性测试守卫 —— 手工改动导致的漂移会
让测试变红，而不是悄悄过期。

## 4 · Addressing 与 Trust Identity

一个 SoulAuth Deployment 中可能同时出现多个地址概念，它们不能被压成一个"服务 URL"：

```text
Issuer
≠
SoulAuth-owned API public address
≠
Internal listen address
```

**Issuer** 属于 Identity / Protocol Trust Contract。改变 Issuer 可能改变 Consumer
建立 Protocol Trust 的方式，因此不能把它理解成普通部署地址。

**Public API Address** 是 SoulAuth-owned HTTP API 自己的对外地址。它可能与 Issuer
共用 Host，也可能不共用 —— 不能从一个自动推导另一个。

**Internal Listen Address** 只说明 Runtime Process 在当前 Environment 中监听在哪里。
`0.0.0.0:<PORT>` 不会因此成为 SoulAuth 的 Public Trust Identity。

### Version Dimension 也不能混用

```text
Product Release Version
≠
Protocol Specification Version
≠
OpenAPI Format Version
```

如果 SoulAuth 未来正式拥有独立 API Contract Version，它也属于单独 Version
Dimension。一个 SoulAuth `2.x` Release 并不自动要求 `/v2` 这样的 Path Versioning。
Reference 只描述真实 Contract，它不从 Product Version 推导 URL Scheme。

## 5 · Identifier Discipline

SoulAuth 存在多个 Identifier Namespace。本篇不重新定义这些 Namespace，只规定共同
规则。

### Identifier 必须保留自己的 Namespace

```text
Same String
≠
Same Identity by definition
```

```text
ActorIdentity Resource ID  ≠  OIDC `sub`
OAuth `client_id`          ≠  ActorIdentity Resource ID
```

如果 SoulAuth 存在 Internal Client Resource ID，它也不能因为 Value 碰巧相同就被自动
视为 OAuth `client_id`。具体 Identifier Contract 由对应 Domain Reference 定义。

### Persistence Key 不是 Public Identifier

```text
Persistence Key
≠
Public API Identifier
```

Database Record Key、Table Namespace 或内部 Storage Address 不能仅仅因为当前实现
方便，就升级成长期 Public Contract。这样 Persistence migration 和 Adapter
replacement 才不会破坏 Consumer Contract。

### Identifier Format 不是 Identity Semantics

Consumer 不能依赖：

```text
if id starts with "ai_" → actor_kind = AIActor
```

除非具体 Public Contract 明确声明这种 Meaning。因此：

```text
Identifier Format
≠
Semantic Type
```

需要 Actor Kind，就读取正式 Actor Kind，不要从 ID 字符串猜。

### Opaque 不等于 Secret

```text
Opaque Identifier  ≠  Secret
Opaque             ≠  Confidential by definition
```

Opaque 只意味着 Consumer 不依赖 Identifier 内部结构。它不会因此获得 Authentication
Capability，其 Disclosure Policy 由自己的 Data / Security Contract 决定。

## 6 · Schema 与 Field Semantics

一个 Field 出现在 Schema 里，只说明这个 Field 属于声明的 Representation。它不会自动
说明 Caller 能怎样使用它：

```text
Field Presence
≠
Field Mutability
```

一个 Response Field 可能是 read-only；一个 Input Field 可能是 write-only。是否
mutable、immutable 或 write-once，由具体 Resource Contract 定义。

### Secret Input 不自动成为 Readable Resource Field

```text
Accepted Secret Input
≠
Readable Secret Field
```

一个 Operation 可能接受或产生 Sensitive Material，这不能推出后续读取 Resource 时会
再次返回 Raw Secret。Secret / Credential Material 的展示、一次性返回、持久化与
Custody 行为必须由对应 Domain Contract 明确说明。

### Security-relevant 未知值不能静默猜测

如果 Consumer 遇到一个自己不认识、而又具有 Security Meaning 的 Enum 或 State，不能
自动映射成"最接近"的已知值：

```text
Unknown Actor Kind
≠
Human by default
```

正确行为由具体 Compatibility Contract 定义，但共同原则是：**不要通过 Silent
Coercion 制造虚假的 Security Meaning。**

## 7 · Endpoint Security Context

一个受保护 Endpoint 不能只写 `Authentication required`。正式 Reference 在适用时至少
应回答四个不同问题：

```text
Caller Context
Authentication Requirement
Authority Requirement
Exposure Boundary
```

**Caller Context** 说明谁正在参与当前 Operation —— 可能涉及 Actor context、Client
context、Administrative principal context、Integration context。这些 Context 不能被
压成一个通用"用户"，尤其 `Client Authentication ≠ Actor Authentication`。

**Authentication** 说明当前 Operation 要求建立哪一种 Authentication Fact。

**Authority** 说明当前 Principal 为什么可以执行这个 Operation：
`Authenticated ≠ Authorized for this Operation`。

**Exposure** 说明这个 Operation 预期处于哪个 Trust Boundary。Exposure 描述 Security
Boundary，它不等于 Physical Network Topology。

这些 Concept 的完整语义由 [身份与权限](../spec/identity-vs-authority) 与
[管理](./administration) 定义；本篇只要求 Endpoint Reference 把它们写清楚。

## 8 · Errors 与 Diagnostics

SoulAuth-owned HTTP API 可以共享 Error Convention。但：

```text
SoulAuth-owned API Error
≠
OAuth / OIDC Protocol Error
```

Protocol Endpoint 必须保留 External Specification 规定的 Error Semantics，不能为了
统一 Internal JSON Envelope，把标准 Error 改名成 SoulAuth 自定义 Error。

### HTTP Status 不是完整 Security Meaning

```text
HTTP Status
≠
Complete Error Semantics
```

同一个 HTTP Status 可以覆盖多个不同 Domain Failure；Sensitive Resource 还可能为了
减少 Enumeration 而限制存在性 Disclosure。所以 Exact Error Code、Status Mapping 与
Disclosure Behavior 由具体 Endpoint Contract 定义，本篇不提前替所有 Endpoint 统一
这些行为。

### Public Error 与 Operator Diagnostics 分离

```text
Public API Detail
≠
Operator Diagnostic Detail
```

Public Error 不应因为"更方便排障"而自动暴露 raw secret、internal persistence
detail、stack trace、key material 或不必要的 identity existence information。

### Correlation 不等于 Attribution

```text
Correlation                  ≠  Authentication Credential
Caller-supplied Correlation  ≠  Trusted Security Attribution
```

Caller 提供的值可以帮助 Observation 或 Linking，真正 Security Attribution 必须来自
受信任的 Principal / Client / Server-side / Audit Context。

## 9 · Collections

本篇不规定 SoulAuth 一定采用 Cursor、Offset 或其它 Pagination 机制，这些 Exact
Semantics 必须来自真实 Resource Contract。共同原则只有一条：

> **Collection API 不能把 Persistence Query Model 直接泄漏成 Public API Contract。**

```text
Public Filter Contract
≠
Database Query Language
```

同样，Ordering、Filtering、Pagination 与 Concurrent Mutation Visibility 必须在真正
提供 Collection API 时由对应 Resource Reference 准确说明。如果当前 Contract 没有
某种 Pagination Capability，Reference 不会为了"现代 API 风格"自行加入它。

## 10 · Concurrency 与 Retry

Mutation Contract 不仅需要说明请求成功时发生什么，还需要在适用时说明并发、超时、
不确定 Outcome 和 Retry 意味着什么。

### Concurrency 不等于 Retry

```text
Concurrency Semantics
≠
Retry Semantics
```

Concurrency 回答多个 Operation 同时竞争时发生什么；Retry 回答同一个 Operation 在
结果不确定以后再次提交会发生什么。

### Network Failure 不等于 Operation 未发生

```text
server commits state → response is lost → client observes timeout
```

```text
Network Failure
≠
Operation Did Not Happen
```

Caller 不能仅根据 Transport Failure 判断 Server-side Effect 不存在。

### Retryable Transport Failure 不等于 Safe Retry

```text
Retryable Transport Condition
≠
Safe Operation Retry
```

一个 Endpoint 是否 safe to retry、one-time、idempotent、可能产生 unknown outcome、
需要 reconciliation，由具体 Operation Contract 定义。本篇不自行添加未实现的
`Idempotency-Key` Feature。

### Idempotency 不等于 Idempotency-Key

```text
Idempotency Semantics
≠
Idempotency-Key Support
```

Operation 可以拥有某种 Idempotency Contract，却完全没有一个名为 `Idempotency-Key`
的 Wire Feature。Reference 只能写真实存在的机制。

### Final State 相同，不等于整个 Operation 没有额外 Effect

```text
Same Final Resource State
≠
No Additional Observable Effects
```

重复 Operation 即使最终 Resource State 相同，也可能产生 Audit、Notification、
downstream side effect 或不同 Outcome。因此任何"idempotent" Claim 都必须说明它覆盖的
实际 Scope。

## 11 · Compatibility

API Compatibility 不只是"JSON 还能解析"。至少要分开三个层次：

```text
Syntactic Compatibility
Semantic Compatibility
Security Compatibility
```

**Syntactic** —— Field 仍然存在，Type 仍可解析。

**Semantic** —— Field 仍是 string，但它所代表的 Identifier Namespace 发生了变化。
JSON 没有变，Contract 已经变了。

**Security** —— Authentication Requirement、Authority、Exposure、Freshness、Retry 或
Audit Effect 发生变化。

```text
Schema-compatible  ≠  Semantically Compatible  ≠  Security Compatible
Same JSON Shape    ≠  Same API Contract
```

### Additive 不自动 Non-breaking

新增 Optional Field 可能是兼容变化，但新增一个 Security-relevant Enum Value 或改变
一个 Field Meaning，不一定兼容：

```text
Additive Schema Change
≠
Automatically Non-breaking Contract Change
```

Compatibility 必须按照真实 Consumer Contract 判断，不能只看 Schema Diff。

### Versioning 与 Deprecation

本篇不为尚未冻结的 Versioning 或 Deprecation Policy 发明 `/v1`、`/v2`、固定兼容期限
或固定 Migration Window。当前 Release 真正承诺什么，以正式 Versioning / Release
Contract 为准。

## 12 · Reference Example

Reference 里的 Wire Example 不是 Architecture 示意图，它必须**反映当前真实
Contract**：

```text
Reference Example → current Release Contract
```

Path、Method、Field、Enum、Header 与 Status 不能在 Reference 里继续使用"假想 API"。
Sensitive Material 使用清楚、不可误认为真实值的 typed placeholder。并且在适用时，
Example 应该能够与 Machine-readable Contract 进行验证。

## 13 · Endpoint Reference Template

从后续 Reference 开始，SoulAuth-owned HTTP Endpoint 可以在适用时采用统一
Presentation Grammar。这统一的是 **Reference Presentation**，不是所有 Endpoint 的
Wire Format。

| Section | 应回答的问题 |
| --- | --- |
| **Endpoint** | Exact Method + Exact Path 是什么？ |
| **Purpose** | 这个 Operation 真正做什么？ |
| **Contract Source** | SoulAuth-owned contract 还是 External Protocol contract？ |
| **Caller Context** | 谁参与当前调用？ |
| **Authentication** | 需要建立什么 Authentication Fact？ |
| **Authority** | 为什么当前 Principal 可以执行？ |
| **Exposure** | 预期 Trust Boundary 是什么？ |
| **Request** | Exact Parameter / Header / Media Type / Body 是什么？ |
| **Response** | Exact Status / Header / Schema 是什么？ |
| **Errors** | Machine / Protocol Error 与 Disclosure 如何表达？ |
| **State & Effects** | Operation 改变什么？ |
| **Concurrency / Preconditions** | 并发和 Target State 如何影响 Operation？ |
| **Retry / Outcome** | 是否安全 Retry，是否可能产生 Unknown Outcome？ |
| **Audit / Security Effects** | 在适用时产生哪些重要 Security 或 Audit Effect？ |
| **Example** | 与当前 Release 一致的可验证示例 |

不是每一个 Endpoint 都必须机械出现所有小节。原则是：

> **只展示对理解这个 Contract 必要的内容，但不能省掉安全或语义上重要的条件。**

## 14 · API Conventions at a glance

| Boundary | Meaning |
| --- | --- |
| **External Protocol Wire ≠ SoulAuth Common HTTP Grammar** | 标准协议不被 Generic API 规则改写 |
| **Published Machine Contract owns exact SoulAuth HTTP wire** | Human Reference 解释，不与 Machine Contract 竞争 Exact Wire Ownership |
| **Issuer ≠ Public API Address ≠ Listen Address** | Trust Identity 与 Deployment Address 分离 |
| **Persistence Key ≠ Public Identifier** | Storage 实现不会自动成为 API Contract |
| **Identifier Format ≠ Semantic Type** | Consumer 不能从 ID 格式猜身份语义 |
| **Opaque ≠ Secret** | 不依赖内部格式不等于保密 |
| **Authentication ≠ Endpoint Authority** | 证明 Caller 不等于允许 Operation |
| **Generic API Error ≠ Protocol Error** | OAuth / OIDC 保留自己的错误语义 |
| **Correlation ≠ Security Attribution** | Linking Signal 不能替代可信归因 |
| **Network Failure ≠ No Effect** | Transport Failure 不能证明 Operation 未执行 |
| **Retryable Condition ≠ Safe Retry** | Retry 由 Operation Contract 决定 |
| **Same JSON Shape ≠ Same API Contract** | Compatibility 还包括 Semantic 与 Security |

把它继续压缩：

> **本篇定义共同语言，不发明具体 API。**
>
> **Exact Wire 来自 Machine-readable Contract；Exact Domain Meaning 来自对应
> Canonical Owner。**
>
> **Reference 的任务，是把两者准确、清楚地交给开发者。**

## 下一步

从这里开始，文档真正进入 Domain Reference。按照阅读顺序，可以继续进入认证、Actor、
OIDC、管理、审计与配置。

但按照 Canonical Dependency，下一份先进入 [Actor 与档案](./actors-and-profiles) ——
因为 Actor Resource、HumanAccount、Profile、IdentityBinding 以及 ActorIdentity
lifecycle 的 Exact Resource Contract，是后续 Reference 需要依赖的基础。
