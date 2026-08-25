# 配置

## SoulAuth 怎样把配置输入转化为真正生效的 Runtime Contract

SoulAuth 的运行行为不会由某一个配置文件单独决定。一个 Deployment 可能从不同受支持的
Source 获得配置，也可能引用外部 Secret、Key、Provider 或其它动态 Runtime Material。

真正重要的不是**配置文件里写了什么**，而是：

> **当前 Runtime 实际采用了什么经过解析、验证和激活的 Configuration。**

因此首先保持：

```text
Configuration Input
≠
Effective Configuration
```

同样：

```text
Configuration  ≠  Administration
Configuration  ≠  Ontology
Configuration  ≠  Runtime Security State
```

Configuration 的职责是：**在 SoulAuth 已经定义好的语义与边界中，选择当前 Deployment
怎样运行。** 它不能重新定义 ActorIdentity、Credential、Client、Authority 或
Historical Identity。

## 1 · Exact Configuration Vocabulary 由 Config Registry 拥有

SoulAuth 的 Exact Configuration Contract 来自 **Machine-readable Config Registry**
—— 在本仓库中即 `contracts/configuration.yaml`，由符合性测试守卫。Config Registry
负责定义当前 Release 真正理解的：

- Canonical configuration key
- value type
- requiredness
- absence / default behavior
- allowed value
- supported source
- validation
- lifecycle
- sensitivity
- 其它 machine-readable per-key behavior

本篇的职责是**解释这些 Contract 怎样被理解和使用**。因此：

```text
Human Configuration Reference
≠
Second Configuration Vocabulary
```

Public Documentation 不会为了让页面显得完整，自行创造新的 Environment Variable、
Config Key、Enum 或 Default。

## 2 · Configuration 不重新定义 Ontology

Configuration 只能在 SoulAuth 已经正式支持的运行选择空间中选择行为：

```text
Configuration  ≠  Ontology
Configurable   ≠  Ontology-mutable
```

例如，Configuration 不能把 OAuth Client 重新定义成 ActorIdentity，也不能把 Actor
Kind 从 Identity Core 降级成普通可配置属性。它改变**系统怎样运行**，不是**系统中的
对象究竟是什么**。

## 3 · Configuration 与 Administration 分开

Administration 改变 **SoulAuth-owned domain state**；Configuration 定义 **Runtime
怎样被构造、连接和运行**。

```text
Administration
≠
Configuration
```

一个 Principal 可以拥有某类 Administrative Authority，却没有修改 Deployment
Configuration 的能力，反方向同样成立。Configuration access 也不会自动产生 SoulAuth
Administrative Authority。

## 4 · Configuration 与 Runtime Security State 分开

Security Configuration 定义 Security Policy 应该怎样运行；Runtime Security State
表示当前 Security Reality 已经发展到了什么状态。

```text
Security Policy       ≠  Security State
Configuration Reload  ≠  Security State Reset
Process Restart       ≠  Permission to Reset Durable Security State
```

Reload、Restart 或重新读取 Config，不能成为复活已撤销 Session、Credential、Authority
或其它 Trust State 的后门。这是本篇最重要的长期边界之一。

## 5 · 从 Source Input 到 Effective Configuration

```text
Admitted Source Input
        ↓
Resolution
        ↓
Typed Candidate
        ↓
Validation
        ↓
Activation
        ↓
Effective Configuration
```

这些是 **Configuration lifecycle semantics**，它们不自动意味着 SoulAuth 存在同名
Public Resource、Resource ID 或 CRUD Endpoint。

## 6 · Readable Source 不等于 Admitted Configuration Source

Runtime 能够读取一个 Source，不意味着这个 Source 自动有资格参与 Configuration
Resolution：

```text
Readable Input
≠
Admitted Configuration Source
```

Source 必须在声明的 configuration scope 与 purpose 下被允许参与 Resolution。同一个
Source 被允许提供某类 Config，也不意味着它拥有定义所有 Config 的 Universal
Authority。

## 7 · Source Precedence 不等于 Source Trust

多个 Source 都被允许参与 Configuration 时，仍然需要解决冲突时谁获胜。但：

```text
Source Precedence   ≠  Source Trust
Source admitted     ≠  Highest precedence
Highest precedence  ≠  Highest trust
```

一个 Source 优先级更高，只表示在声明的 Resolution Contract 下它的值优先，不表示这个
Source 天然拥有更高 Security Trust。这两个维度必须分别定义。

## 8 · Precedence 不等于 Merge Semantics

即使已经知道哪个 Source 优先，仍然需要知道多个 Source 的值究竟怎样组合：

```text
Source Precedence
≠
Merge Semantics
```

Exact behavior 可能针对 single value、structured value、collection 存在不同 Contract。
具体是 replace、merge 还是其它行为，必须由 Config Registry 明确，而不能由 Runtime 或
Operator 自行猜测。

## 9 · Source Encoding 不等于 Typed Configuration Value

Environment、file 或其它 Source 可能以不同 Representation 提供值。Source 层的
`"false"`、`"0"`、`"60"` 本身并不能定义 Runtime Type：

```text
Source Encoding
≠
Canonical Typed Configuration Value
```

Boolean、Integer、Duration、URI、Enum、Collection 或 Structured Value 怎样解析，由
Config Registry 定义。Runtime 不能依赖 Programming Language 的隐式 truthiness 或模糊
转换规则。

## 10 · Absent、Empty、Null 与 Default 不自动等价

```text
Absent
≠ Explicit Empty
≠ Explicit Null, where representable
≠ Default
```

具体某个 Key 是否允许这些状态，以及它们是否在特定 Contract 中等价，由这个 Key 自己的
Config Contract 定义。尤其：

```text
Explicit Invalid Value  ≠  Declared Absence
Default                 ≠  Fallback for Invalid Explicit Value
```

如果 Operator 明确提供了一个非法 Security Value，Runtime 不能静默忽略它，再退回一个
更宽松 Default。

## 11 · Parsed 不等于 Valid，也不等于 Activated

```text
Parsed  ≠  Valid  ≠  Activated
```

- **Type Validation** —— Value 是否符合声明的 Canonical Type。
- **Semantic Validation** —— 单个值是否在当前 Security / Protocol / Runtime Contract
  下具有合法 Meaning。
- **Cross-field Validation** —— 多个单独合法的值组合以后，整体 Configuration 是否仍然
  成立。

```text
Individually Valid Fields
≠
Valid Configuration Set
```

## 12 · Validation 必须先于 Activation

Runtime 不能先部分应用一组新 Configuration，然后在中途发现剩余配置非法，留下无法解释
的 Mixed State。对任何支持 runtime activation 的 Configuration Change，正确语义都是：

```text
Resolved Candidate
        ↓
Complete Validation
        ↓
Activation
        ↓
New Effective Configuration
```

```text
Configuration Activation
≠
Unvalidated Incremental Mutation
```

对于 startup-only 配置，同样必须在进入正常 Runtime 以前完成适用 Validation。

## 13 · Invalid Security Configuration 不能静默变宽

```text
Invalid Security Configuration
≠
Permission to Fall Back to a More Permissive Policy
```

```text
Unknown Security-relevant Value
≠
Nearest Known Value
```

一个未理解、非法或无法验证的 Security-critical Setting，不能通过 Silent Coercion
制造"看起来成功"的配置状态。这是 Configuration 层的 Fail Closed 原则。

## 14 · Unknown Configuration Key 的行为也是 Contract

一个 Unknown Key 被 Parser 读到，不意味着它对应的 Security Semantics 已经生效：

```text
Configuration Text Accepted
≠
Configuration Semantics Applied
```

Current Release 究竟 reject、warn、ignore 还是 preserve，必须由 Config Registry
明确 —— Public Documentation 不会自行决定。

## 15 · Effective Configuration 不等于 Runtime Capability

一组 Configuration 已经成功生效，仍然不证明其依赖一定 Healthy 或 Capability 一定
可用：

```text
Effective Configuration  ≠  Effective Runtime Capability
Configured               ≠  Operational
```

例如某个 External Dependency 已经配置但当前不可达；或者某个 Key Reference 有效，但
Referenced Key 当前不可使用。

所以 Configuration 回答"Runtime 被要求怎样运行"；Operations / Readiness 继续回答
"当前 Runtime 实际上能不能正常提供能力"。

## 16 · Enabled Configuration 不等于 Supported Capability

Configuration 不能创造产品能力：

```text
Configuration Enabled  ≠  Feature Implemented
Configuration Enabled  ≠  Feature Supported
Configured Capability  ≠  Advertisable Capability
```

一项 Capability 只有在 Current Release 正式支持、Runtime 真正实现、Configuration
有效、必要 Dependency 可用、applicable evidence 与 protocol claim 成立的 Scope 内，
才能被 Metadata 或 Public Documentation 声明。

## 17 · Configuration Reference 不等于 Referenced Runtime Material

Configuration 经常不直接保存动态 Secret 或 Key Material。更重要的长期边界是：

```text
Configuration Reference
≠
Referenced Runtime Material State
```

```text
Secret Reference  ≠  Secret Value
Key Reference     ≠  Current Active Key State
```

一个 stable reference 没有变化，不意味着它背后的 Secret 或 Key Material 没有变化。
因此：

```text
Effective Configuration
≠
Complete Runtime Security State
```

这是本篇与 [安全模型](../security/security-model)、
[认证防护](../security/authentication-protection)、
[运维与恢复](../operate/operations-and-recovery) 之间最重要的接口之一。

## 18 · Accepted Secret Input 不等于 Readable Configuration Field

```text
Accepted Secret Input       ≠  Readable Configuration Field
Configuration Inspection    ≠  Secret Export
Configuration Observability ≠  Secret Logging
```

Secret 曾经被输入，不意味着以后能从 Configuration Inspection 中再次读回。配置可
观察性不能成为 Secret 泄漏通道。

## 19 · Effective Configuration 与 Caller-visible Projection 分开

```text
Effective Configuration
≠
Caller-visible Configuration Projection
```

Caller Projection 可以根据 Authority 与 Sensitivity redact、mask、omit。但 Projection
差异不会重新定义 Runtime 实际上采用的 Configuration。

## 20 · Key / Secret Lifecycle 与 Configuration Lifecycle 分开

```text
Key Rotation          ≠  Configuration Rewrite
Secret Rotation       ≠  Configuration Rewrite
Key Reference Change  ≠  Successful Key Rotation
```

Configuration 只能表达 Runtime 应该引用什么。真正 Material Lifecycle、Activation、
Trust 和 Revocation 属于对应 Key / Secret Runtime Contract。

## 21 · Configured Dependency 不等于 Current Dependency State

```text
Configured Dependency
≠
Current Dependency State
```

例如：External Identity Provider 配置不变，其 Metadata 或 Keys 仍可能变化；
Persistence 配置正确，当前服务仍可能不可用；Key source 已配置，所需 Key 仍可能不可
使用。因此：

```text
Effective Configuration
≠
Complete Effective Runtime State
```

本篇不为每一种 Adapter 重新建立 Ontology，Adapter configuration 也不会反向成为
Domain Semantic Owner。

## 22 · 某些 Configuration Change 是 Trust Change

不是所有 Configuration Change 都具有相同风险。一个 Setting 技术上可以修改，不意味着
它只是普通 Operational Adjustment：

```text
Reloadability   ≠  Security / Trust Impact
Hot-reloadable  ≠  Low-risk Change
```

例如 Issuer、Subject Policy 或 Trust Source 一类设置，如果发生变化，可能进入 Trust
Migration，而不是普通 runtime tuning。Exact per-key Change Impact 仍由 Config
Registry 定义。

## 23 · Current Configuration 不重写 Historical Contract

```text
Current Configuration
≠
Historical Runtime Contract
```

今天修改 Authentication、Protocol 或 Security Policy，不会让昨天按照旧 Contract 合法
产生的历史事实"从未发生"。Current Configuration 可以改变今天是否还接受某个旧
Artifact、当前是否允许某种 Continuation、当前 Security Eligibility。但：

```text
Historical Configuration Semantics
≠
Current Security Eligibility
```

旧 Artifact 当初是什么、怎样产生，仍然按照 event-time contract 解释。

## 24 · Source Change 不等于 Activation

```text
Configuration Source Changed
≠
Effective Configuration Changed
```

真正改变 Runtime 行为的是：经过 Resolution、Validation 并成功 Activation 以后建立的
新的 effective configuration。

## 25 · Configuration Effect 不等于 Propagation Freshness

在多 Runtime 或多 Replica Deployment 中，一个新的 Configuration 已经在某处生效，不
意味着所有参与者已经同时采用：

```text
Configuration Effect
≠
Configuration Propagation Freshness
```

同一个 Product Release 也不自动意味着所有 Runtime 当前使用完全相同的 effective
configuration。但：

```text
Configuration Convergence
≠
Byte-for-byte Equality
```

合法的 replica-local 差异不应该被误报成 Semantic Drift。真正应该比较的是
**Config Registry 声明的 consistency scope**。

## 26 · Configuration Rollback 不等于 Safe Recovery

一个历史 Revision 过去曾经合法，不意味着今天恢复它仍然安全：

```text
Configuration Rollback  ≠  Safe Recovery
Configuration Restore   ≠  Trust Restore
Configuration Rollback  ≠  Trust Resurrection
```

因为 Config 之外的 Current Reality 可能已经变化：Key 被 Compromised；External Source
不再 Trusted；Algorithm 被禁用；Security Policy 因 Incident 改变。Rollback 不能只恢复
旧文本，然后把已经撤销的 Trust 一起复活。

### Product Rollback 与 Configuration Rollback 分开

```text
Product Release Rollback
≠
Configuration Rollback
```

旧 Software 不一定理解当前 Configuration Contract；当前 Config 也不一定兼容旧
Software。所以 Rollback 必须经过 Release / Config Contract compatibility validation。
具体 Recovery Procedure 由 [运维与恢复](../operate/operations-and-recovery) 定义。

## 27 · Configuration Provenance 不等于 Human Attribution

Runtime 可能知道某个 Value 来自哪个 Source、某个新的 effective configuration 什么时候
被观察或激活。但：

```text
Configuration Source Provenance
≠
Human Operator Attribution
```

例如 Infrastructure Platform 修改了 mounted configuration，SoulAuth 可以可信地说
"Runtime 观察到了 Source 变化"；如果没有额外 Evidence，它不能虚构是哪一个具体 Human
Operator 进行了修改。这与 [审计](./audit) 中的 Initiator / Runtime Origin 分离保持
一致。

## 28 · Configuration Contract Evolution

Configuration Contract 本身也会随 Release 演进：

```text
Current Configuration Contract
≠
Automatic Interpretation of Historical Configuration
```

```text
Configuration Syntax Compatibility
≠
Configuration Semantic Compatibility
```

两个 Release 都能解析同一个字符串，不代表该字符串在两个 Release 中的 Meaning 完全
相同。所以 Config Contract evolution 不能通过"parser 还能读"替代真正的 Semantic
Compatibility 判断。

## 29 · Configuration at a glance

| Boundary | Meaning |
| --- | --- |
| **Configuration ≠ Administration / Ontology / Security State** | Config 选择运行方式，不重新定义 Domain |
| **Readable input ≠ admitted source** | 能读取不等于有资格参与 Resolution |
| **Precedence ≠ trust** | 谁覆盖谁与谁更可信是两个问题 |
| **Precedence ≠ merge semantics** | 优先级不会自动定义结构怎样合并 |
| **Source encoding ≠ typed value** | 原始字符串不自动成为 Runtime Type |
| **Absent / empty / null / default 不能未经 Contract 互换** | 缺省语义属于 per-key contract |
| **Invalid explicit value ≠ declared absence** | 非法值不能被 Default 静默吞掉 |
| **Parsed ≠ Valid ≠ Activated** | 读懂配置不等于合法或已生效 |
| **Effective Configuration ≠ Runtime Capability** | 配好不等于 Dependency 正常、能力可用 |
| **Configuration enabled ≠ feature supported** | Config 不会创造产品 Capability |
| **Reference ≠ referenced secret / key material** | Stable config 与 dynamic security material 分离 |
| **Config inspection ≠ secret export** | 可观察性不创造 Secret 读取权 |
| **Reloadability ≠ security impact** | 能热更新不等于低风险 |
| **Source change ≠ activation** | 修改源不代表 Runtime 已经采用 |
| **Effect ≠ propagation freshness** | 生效与所有 Replica 看到分离 |
| **Rollback ≠ trust restoration** | 旧 Config 不能复活已撤销 Trust |
| **Current Configuration ≠ Historical Runtime Contract** | 今天的 Policy 不重写昨天的事实 |

整个 Configuration lifecycle 最终可以压缩成：

```text
Admitted Source Input
        ↓
Resolution + Typed Parsing
        ↓
Complete Validation
        ↓
Activation
        ↓
Effective Configuration
```

然后还必须继续分别观察 `Referenced Runtime Material` 与 `Effective Runtime
Capability`，因为：

> **Config 说了什么、Runtime 采用了什么、依赖现在是什么状态，是三个不同问题。**

## Exact Contract Source

本篇定义 **Configuration Source、Resolution、Typing、Validation、Activation、
Effective State、Referenced Material、Lifecycle 与 Historical Semantics 的
Human-readable Contract**。

Exact Configuration vocabulary 由 **Machine-readable Config Registry** 拥有，它负责
当前 Release 真正存在的 key、type、requiredness、default、source、scope、
validation、lifecycle、sensitivity 以及其它 per-key exact behavior。

Public Documentation 不得自行创造 Key、改变 Default、推导 Precedence、添加 Reload
能力或扩大 Supported Configuration Surface。Current Product Support 仍由
[项目状态](../project/status) 负责；Runtime Readiness 与 Recovery 由运行文档负责。

## 下一步

到这里，Configuration 层已经建立起完整边界：Configuration 不能修改 Ontology；
Source Input 不能直接等同 Effective Runtime；Resolution、Typing、Validation、
Activation 必须分层；Secret / Key Reference 与实际 Material 必须分开；Configured
Capability 不能冒充 Supported / Operational Capability；Reloadability 不能降低
Security Impact；Rollback 不能复活已经失效的 Trust；Current Configuration 不能重新
解释 Historical Identity、Authentication、Protocol 或 Audit Fact。

按照已经冻结的 Dependency-first 顺序，下一份正式进入
[Soulseed 接入](../integrate/soulseed)。
