# 部署

## 将 SoulAuth 放进现实运行环境，而不改变它的语义

前面的文档回答：SoulAuth 是什么；Application 怎样 Integration；ActorIdentity 怎样被
Authentication；Client、Token、AuthSession 和 Control Plane 各自拥有什么 Contract。
从这一篇开始，问题变成：

> **这些已经成立的语义，怎样被放进一个真实运行环境，并且在启动、重启、流量切换和
> 基础设施变化以后继续成立？**

Deployment 改变的是**物理运行方式**。它不重新定义 ActorIdentity、Credential、
Authentication、IdentityBinding、Client、Authority 或 Historical Fact：

```text
Deployment Topology
≠
Identity Ontology
```

一个 Runtime 可以换 Process、换 Container、换 Host，甚至在 Current Release 支持时
采用多个 Replica —— 这些变化不应该让 SoulAuth 突然变成另一套 Identity System。

## 1 · Deployment Boundary

一个常见的 Deployment 可以抽象为：

```text
External Client / Consumer
        ↓
Public Network / Protocol Boundary
        ↓
SoulAuth Runtime
        ↓
Durable Infrastructure / Dependencies
```

Control Plane 则拥有自己的受控 Exposure Boundary。

这只是 **Deployment Topology 示意**，它不是新的 Canonical Architecture Figure，也不
要求每个 Deployment 都使用独立 Reverse Proxy、独立 Key Service 或独立 Control Plane
Process。[SoulAuth 架构](../concepts/architecture) 定义 Logical Architecture；本篇
只说明这些 Logical Responsibility 怎样进入现实部署边界。

## 2 · Architecture Component 不等于 Deployment Unit

```text
Architecture Component  ≠  Deployment Unit
One Service             ≠  One Domain
```

即使 Identity、Authentication、AuthSession、Protocol 与 Control Plane 都由一个
Service Process 承载，它们的 Semantic Boundary 仍然存在。部署上的简单不等于 Domain
合并。

## 3 · Public Protocol Exposure 与 Control Plane Exposure 分开

```text
Public Protocol Exposure
≠
Control Plane Exposure
```

Public Authentication / Protocol Surface 可能需要被外部 Client 访问；Control Plane
则应按照 Administrative Authentication、Authorization、Network Boundary、Deployment
Policy 单独控制。

即使二者在同一个 Process、使用同一个 Host、甚至通过同一个 Ingress Infrastructure，
也不意味着**它们应该拥有相同的公网暴露策略**。

## 4 · Consumer Access 不等于 Infrastructure Access

Application、SoulseedOS 或其它 Consumer 应该通过 **SoulAuth 正式支持的 Interface**
使用 SoulAuth，而不是直接访问 Persistence、Key / Secret Infrastructure 或内部
Runtime State：

```text
Consumer Access          ≠  Infrastructure Access
Supported Administration ≠  Direct Persistence Mutation
```

Persistence 是内部基础设施，它不是绕过 SoulAuth Domain Contract 的第二个 Control
Plane。

## 5 · Deployment Topology Patterns

这些形态描述的是 Topology，不是不同 SoulAuth Product Edition。

### Local / Development

Development Deployment 的目标是快速启动、调试和验证 Integration。但：

```text
Development Deployment
≠
Production Security Baseline
```

开发环境为了便利允许的例外，不应该在没有明确 Production Review 的情况下直接复制到
Production。具体 Current Release 提供哪些 Development Artifact、Container、Compose
或 Local Configuration，由 Current Deployment Artifacts 与
[项目状态](../project/status) 定义 —— 本篇不自行创造。

### Single-runtime Deployment

一个 Production Deployment 不因为只有一个 SoulAuth Runtime 就天然不合法；同样，只有
一个 Runtime 也不会自动证明 Production-ready：

```text
Single-runtime Topology
≠
Production Readiness
```

Production Readiness 由 [生产环境检查表](./production-checklist) 正式判断。

### Replicated Deployment, where supported

如果 Current Release 正式支持 replicated topology，可以让多个 Runtime Instance 共同
服务流量。但：

```text
Replica Lifecycle
≠
ActorIdentity Lifecycle
```

一个 Replica 可以 restart、replace、disappear。ActorIdentity、Credential、
AuthSession、Client 以及 Historical Fact 不应因为某一个 Replica 消失而重新定义。

Current Release 是否正式支持多 Replica，以及支持到什么范围，必须由
[项目状态](../project/status) 与 Runtime Evidence 确认。本篇不通过 Architecture
Possibility 自动产生 Support Claim。

## 6 · Ephemeral Runtime 不应成为 Durable Fact 的唯一 Source

真正的 Deployment 分界之一是：**哪些状态可以只存在于当前 Process，哪些事实必须跨
Process 生命周期保持。**

任何需要跨 Request、Restart、Failover、适用的 Replica 切换继续成立的 Canonical Fact
或 Security State，都不能只依赖某个 ephemeral instance-local memory 作为唯一 Source
of Truth：

```text
Ephemeral Runtime
≠
Durable Source of Truth
```

但是：

```text
Must survive instance loss
≠
Must live in one database
```

某个 Contract 可以通过 durable state、coordinated state、cryptographically protected
artifact 或其它受支持机制维持语义。Deployment 只要求**必要的 continuity 不能随着临时
Runtime 一起消失**。

## 7 · Durability 不等于 Permanent Retention

```text
Durability
≠
Permanent Retention
```

不同 Domain 拥有不同 Lifetime、Expiry、Retention、Deletion Contract。例如一个短生命
周期 Protocol State 可以需要在有限时间内 durable —— 这不会把它变成长久 Historical
Record。

## 8 · Persistence 不定义 Ontology

```text
Persistence Infrastructure  ≠  Identity Ontology
One Database                ≠  One Domain
```

一个 Database schema 不能反向成为 ActorIdentity、Credential 或 IdentityBinding 语义
的 Source of Truth。即使多个 Domain 共享同一个 physical database，它们仍然拥有不同
Canonical Contract。具体 Current Release 支持什么 Persistence 实现，属于 Current
Deployment / Runtime Contract，而不是本篇的长期 Semantic 定义。

## 9 · Operational Log 不等于 Audit

Deployment 通常会有 logs、metrics、traces、monitoring。但：

```text
Operational Log  ≠  Audit Record
Container Log    ≠  Durable Audit History
```

Operational Observability 主要支持 diagnosis、performance、runtime investigation；
Audit 承担 Historical Accountability。任何 Current Audit Integrity Capability 继续由
[审计](../reference/audit) 与 [项目状态](../project/status) 定义。

### Observability 不能成为 Secret Exfiltration Channel

```text
Observability
≠
Secret Exfiltration Channel
```

集中采集 Logs、Metrics 或 Trace，不会解除 Secret 与 Token Protection Boundary。
Deployment 方便性不能成为将 raw credential、token 或其它 sensitive material 写进普通
telemetry 的理由。

## 10 · Key / Secret Lifecycle 不跟随 Replica Lifecycle

```text
Key / Secret Lifecycle
≠
Container / Replica Lifecycle
```

需要跨 Restart 维持 Trust Continuity 的 material，不能因为 Pod 或 Process 重新创建
就毫无 Contract 地重新生成。反方向也一样：Key 可以 rotate、retire、revoke、replace，
但这些行为应该由 **declared key / secret lifecycle** 决定，而不是"Container 刚好
重启了"。

## 11 · Configuration 不等于 Secret Material

```text
Configuration
≠
Secret Material
```

Configuration 决定 Runtime 怎样运行、引用什么 dependency、使用什么 policy；Secret /
key material 则拥有自己的 confidentiality、custody、lifecycle。具体 Configuration
Source 与 Key / Secret Reference Semantics 由 [配置](../reference/configuration)
定义，本篇只负责在 Deployment 中保持两者的边界。

## 12 · Runtime Image 不是 Secret Store

```text
Runtime Image
≠
Secret Store
```

长期 Runtime Secret 不应仅仅因为部署方便就被烘焙进广泛分发的软件 Artifact。Software
Artifact 与 Runtime Secret 应拥有不同生命周期和访问边界。

## 13 · Actor-held Credential Material 与 Server Secret 分开

如果 Current Authentication Method 使用 actor-held private credential material：

```text
Actor-held Private Credential Material
≠
SoulAuth Server Secret
```

它的 custody boundary 不应因为 SoulAuth 部署方式变化，就被重新收进 SoulAuth server
secret store。具体 Current AIActor Authentication Method 及 Verification Material 由
[认证与会话](../reference/authentication-and-sessions) 与 Current Release 定义 ——
本篇不通过 Deployment 文档创建新的 Authentication Method。

## 14 · Internal Listen Address 与 Public Issuer 分开

Runtime 监听地址回答"Process 在本地 Network 上从哪里接收 Traffic"；Public Issuer
回答"外部 Protocol Consumer 把哪个 Identity / Trust Domain 当作正式 Issuer"。因此：

```text
Internal Listen Address
≠
Public Issuer
```

一个 Runtime 可以内部监听私有地址，外部 Client 看到的可以是完全不同的 public
origin。两者不能因为 Deployment 配置方便而混成一个概念。

### Deployment 不能形成 Split-brain Protocol View

如果 Current Protocol Profile 使用 Public Issuer，Public endpoint、proxy
reconstruction、metadata 和 Runtime 实际签发行为必须对外形成一致的 Declared Protocol
View。不能出现"外部访问一个 public origin，但 artifact 却宣称另一个不相关 issuer"
而仍然假设 Consumer 能够正确建立 Trust。Issuer 的 Exact Protocol Semantics 继续由
[OIDC 与 Client](../reference/oidc-and-clients) 定义。

### Issuer Change 可能是 Trust Migration

```text
Issuer Change
≠
Ordinary Hostname Edit
```

如果一个 Deployment 变更会改变 Declared Issuer，它可能改变下游 Trust 与 subject
semantics，因此不能仅仅按照 ordinary network rename 处理。具体 Migration Procedure
进入 [运维与恢复](./operations-and-recovery)、
[OIDC 与 Client](../reference/oidc-and-clients) 与
[配置](../reference/configuration)。

## 15 · External Production Boundary 需要适用的 Transport Protection

面向真实 Production Authentication / Protocol Traffic 的 external boundary，应满足
当前 Security Baseline 要求的 transport protection。对于典型 public deployment，
这意味着受保护的 HTTPS boundary。

但 Deployment 是否已经满足所有 Production 上线条件，继续由
[生产环境检查表](./production-checklist) 判断。本篇只锁：

> **生产外部身份协议边界不能把 transport protection 当成无关优化。**

## 16 · Forwarded Metadata 不自动可信

在 Reverse Proxy / Ingress 部署中，SoulAuth 可能需要使用 proxy 提供的外部 request
context。但是：

```text
Internet-supplied Forwarded Metadata
≠
Trusted External Request Context
```

启用了 Proxy Support，不意味着任何 Internet Caller 提交的 Host / forwarded
information 都可以被 SoulAuth 当成可信。只有声明的 **Trusted Proxy Boundary** 才能
建立这类 external request context。Exact header 与 proxy configuration 由 Current
Deployment / Configuration Contract 定义。

## 17 · Process Started 不等于 Runtime Ready

```text
Process Started
≠
Runtime Ready
```

Runtime 在接受它承诺的 Traffic 以前，必须满足适用的关键 Dependency 与
initialization requirement。

## 18 · Reliable System Time 是 Security Dependency

大量 Authentication / Protocol Semantics 拥有 time boundary：expiry、freshness、key
lifecycle、time-bound security state。因此：

> **合理可信的 system time 是 time-bound Authentication / Protocol Security 的运行
> 依赖。**

如果多个 Runtime 对时间产生显著不一致，同一个 Artifact 可能得到不一致 Security
Decision。本篇不规定具体 time synchronization technology 或 allowed clock skew ——
这些由具体 Security / Protocol Contract 定义。

## 19 · Liveness 与 Readiness 分开

```text
Liveness
≠
Readiness
```

**Liveness** 回答"当前 Process 是否仍处于可以继续运行的基本状态"；**Readiness**
回答"当前 Instance 是否满足安全接受其声明 Traffic 所需的条件"。

一个 Instance 可以 still alive 但 temporarily not ready。同样，一个
feature-specific dependency 失败不必机械触发整个 Runtime crash。

## 20 · Core Dependency 与 Feature-specific Dependency 分开

```text
Core Runtime Dependency
≠
Feature-specific Dependency
```

一个可选 Integration 暂时失败，不一定意味着整个 SoulAuth 不能继续承担其它已经 Ready
的 Capability。Readiness 应该根据"当前 Instance 承诺提供什么 Capability"和"哪些
Dependency 是这些 Capability 必需的"作出判断，不能简单规定"任何 Adapter 失败 → 整个
Identity Service Down"。

## 21 · Elapsed Time 不等于 Dependency Readiness

启动顺序不能靠以下方式替代真实状态判断：

```text
start dependency
sleep N seconds
start SoulAuth
```

因为：

```text
Elapsed Time
≠
Dependency Readiness
```

真正需要的是：

```text
Required Dependency Ready
        ↓
SoulAuth Initialization
        ↓
SoulAuth Ready
        ↓
Traffic Accepted
```

具体 mechanism 由 Current Runtime / Deployment Contract 定义。

## 22 · Replicated Deployment（where supported）

如果 Current Release 正式支持多个 SoulAuth Runtime 共同承担流量，Routing / Failover
不能改变 Identity、Protocol 与 Security Semantics。例如一个请求在 Instance A 开始、
后续请求在 Instance B 继续，不应该仅仅因为 Runtime 不同就破坏 Declared Protocol
Contract。

### Protocol Continuity 不等于 One Shared Database

```text
Protocol Continuity
≠
Mandatory Shared Database
```

某种跨 Request / Replica semantics 可以由 durable state、coordinated state、
protected artifact 或其它声明机制维持。本篇只要求 **failover 以后 Contract 仍然
成立**，不规定所有 State 必须共享一个 Database 或某一种 Storage Technology。

### Runtime Replica 不成为 ActorIdentity Source of Truth

```text
Runtime Replica
≠
ActorIdentity Source of Truth
```

Instance-local cache 可以存在，但不应该成为唯一、不可恢复的 ActorIdentity 事实。
Replica replacement 不能改变"这个 Actor 是谁"。

### 不同 Security State 拥有自己的 Consistency Requirement

不是所有 Security State 都要求同一种 consistency model。真正要求是：**每一种
stateful protection 满足自己声明的 atomicity、consistency 与 freshness
requirement。**

```text
Cross-replica Security Correctness
≠
One Universal Shared Store
```

本篇不定义 `SecurityStateStore`，也不指定 Redis、SurrealDB 或其它 Infrastructure。

### Replicated 不等于 Stateless

```text
Replicated
≠
Stateless
```

多个 Runtime 并不意味着 SoulAuth 没有 State。真正应该达到的是：**关键 Identity /
Security / Protocol semantics 不依赖某一个短命 Instance 作为唯一持有者。**

## 23 · Optional Dependency 不等于 Core Dependency

```text
Optional Integration  ≠  Core Deployment Dependency
Standalone SoulAuth   ≠  Soulseed Deployment Dependency
```

Soulseed Integration 存在，不会让 Standalone SoulAuth 失去独立成立的能力。某个
optional integration 故障应优先影响真正依赖该 Integration 的 Feature，而不是无条件
扩大成整个 Identity Service Failure。

## 24 · Deployment 不自动保证 Zero-downtime Upgrade

```text
Multi-replica Support
≠
Zero-downtime Upgrade Guarantee
```

Upgrade 是否可以不中断完成，还取决于 release compatibility、persistence
compatibility、configuration compatibility、protocol / session compatibility、key
lifecycle、mixed-version behavior。具体 Migration 与 Upgrade Procedure 由
[运维与恢复](./operations-and-recovery) 定义 —— 本篇不从"有多个 Replica"推导"任何
Release 都能 Rolling Upgrade"。

## 25 · Deployment Health

本篇最终只回答：

> **这个 Deployment 现在能否按照它声明的 Contract 正确运行？**

一个健康 Deployment 至少需要能够回答：

- **Runtime** —— Runtime 是否正在运行并完成必要 Initialization？
- **Durable Dependencies** —— 当前承诺 Capability 依赖的必要 durable infrastructure
  是否可用？
- **Security Dependencies** —— 当前需要的 key / secret / time dependency 是否处于
  可用状态？
- **Network / Protocol Boundary** —— 当前 external exposure、proxy 与 public protocol
  view 是否与 Declared Contract 一致？
- **Readiness** —— 当前 Instance 是否真的适合接受它声明能够处理的 Traffic？

Exact image、port、health endpoint、readiness endpoint、persistence product、proxy
key、configuration key 都必须来自 Current Deployment / Configuration Contract ——
本篇不自行创造。

## 26 · Healthy Deployment 不等于 Production-ready Deployment

```text
Healthy Deployment
≠
Production-ready Deployment
```

本篇完成以后，我们只能说明 SoulAuth 能够在当前 Environment 中按照声明 Contract 运行。
它不能单独证明 Backup 已经演练、Recovery 已经验证、monitoring 达到 Production 要求、
operational ownership 已经明确、production security gate 已经通过 —— 这些由
[生产环境检查表](./production-checklist) 正式判断。

## 27 · Deployment at a glance

| Boundary | Meaning |
| --- | --- |
| **Deployment Topology ≠ Identity Ontology** | Runtime 形态不会重新定义 ActorIdentity |
| **Architecture Component ≠ Deployment Unit** | Logical responsibility 不要求独立进程 |
| **One Service ≠ One Domain** | 同进程不会合并 Semantic Domain |
| **One Database ≠ One Domain** | 共享 Persistence 不会合并 Ontology |
| **Public Protocol Exposure ≠ Control Plane Exposure** | 公网 Protocol 与管理面必须独立控制 Exposure |
| **Consumer Access ≠ Infrastructure Access** | Consumer 通过 Supported Contract 使用 SoulAuth |
| **Ephemeral Runtime ≠ Durable Source of Truth** | 需要跨 Restart 持续的事实不能只在临时内存 |
| **Durability ≠ Permanent Retention** | 可恢复不等于永久保存 |
| **Key / Secret Lifecycle ≠ Replica Lifecycle** | Trust material 不能跟着 Pod 偶然生命周期走 |
| **Runtime Image ≠ Secret Store** | 软件 Artifact 与长期 Secret 分离 |
| **Internal Listen Address ≠ Public Issuer** | internal network address 与 protocol identity 分离 |
| **Forwarded Metadata ≠ Trusted Request Context** | 只有 Trusted Proxy Boundary 才能建立 proxy trust |
| **Process Started ≠ Runtime Ready** | 启动成功不等于可安全接流量 |
| **Liveness ≠ Readiness** | 存活与服务条件分离 |
| **Elapsed Time ≠ Dependency Readiness** | 固定等待不是 readiness proof |
| **Protocol Continuity ≠ One Shared Database** | 语义连续性不要求单一 storage implementation |
| **Replicated ≠ Stateless** | 横向扩展不消除 Identity / Security State |
| **Healthy Deployment ≠ Production-ready Deployment** | 能运行不等于已过生产上线 Gate |

整个 Deployment 可以最终压缩成：

```text
Declared Architecture Semantics
        ↓
Deployment Topology
        ↓
Runtime + Required Dependencies
        ↓
Network / Exposure Boundary
        ↓
Durable Continuity
        ↓
Readiness
```

核心原则只有一句：

> **Deployment 可以改变 SoulAuth 运行在哪里、运行几个 Instance、怎样接入基础设施，
> 但不能反过来改变 SoulAuth 认为什么是 ActorIdentity、Authentication、Authority 或
> 可信历史。**

## Exact Contract Source

本篇定义 **Deployment Boundary、Topology Pattern、Runtime / Durable State
Separation、Network Exposure、Key / Secret Lifecycle Boundary、Health / Readiness
以及 Replicated Topology 语义要求**。

它不自行定义 official container image、runtime port、health endpoint、readiness
endpoint、persistence implementation、multi-replica support status、proxy header
configuration、deployment configuration keys、migration command、upgrade procedure。
这些 Exact 事实必须来自 Current Deployment Artifacts、Config Registry、Runtime
Implementation 与 [项目状态](../project/status)。

> **Multi-replica 只是 Architecture / Deployment Pattern 时，不等于 Current Release
> 正式 Supported。**

## 下一步

下一份正式进入 [生产环境检查表](./production-checklist)：判断这个明确 Deployment
是否达到 Production Sign-off 要求。
