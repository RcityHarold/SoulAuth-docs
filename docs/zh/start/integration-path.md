# 选择接入路径

## 选择你的 SoulAuth 接入入口

你不需要先判断"我的产品属于哪一种 SoulAuth 应用"。更有用的是先回答三个问题：

> **谁需要被 Authentication？**
>
> **Authentication 从哪里进入你的系统？**
>
> **Authentication 建立的可信结果最终由哪个 Consumer 使用？**

这三个问题决定你应该从哪一组 SoulAuth 文档开始。因此首先保持：

```text
Integration Path  ≠  Actor Type
Integration Path  ≠  Whole-system Classification
Integration Path  ≠  Deployment Topology
Integration Path  ≠  Current Support Claim
```

Integration Path 只是**工程与文档入口**，它不是新的 SoulAuth Ontology。Current
Release 真正支持哪些 Client Profile、Protocol Flow、Authentication Method 与
Integration Surface，继续以对应 Reference 和 [项目状态](../project/status) 为准。

## 1 · 60 秒选择入口

| 如果你的主要问题是 | 从这里开始 |
| --- | --- |
| **你自己负责 Browser Authentication Boundary** | **Web Application** |
| **你主要保护 Backend / API，并需要验证调用请求** | **Backend / API** |
| **现有 Application 已经支持 Current SoulAuth Release 声明的 OIDC Profile** | **OIDC Client** |
| **AIActor 本身需要拥有独立 Identity 并作为自己被 Authentication** | **AI / Agent System** |
| **SoulseedOS 需要消费 SoulAuth 建立的 Authentication Context** | **SoulseedOS** |

这五条 Path 不是五种互斥产品类型。一个真实系统可能同时选择
`Web Application + Backend / API`，也可能同时选择
`Web Application + AI / Agent System + Backend / API`。

## 2 · Web Application

### 当你自己负责 Browser Authentication Boundary

选择这条 Path 的真正判断标准不是"我的产品有网页"，而是：

> **Browser 是否进入了你自己负责的 Authentication Boundary？**

例如你需要自己处理 Redirect、Browser Session、Application Session、Cookie、CSRF、
OAuth Token Exposure、BFF 等 Browser Runtime 问题。

**Start here** —— 通常按下面的职责顺序阅读：

```text
Register a Client
        ↓
Authorization Code Flow
        ↓
Browser & BFF
```

但必须保持：这条文档路径不自动宣布 Current Release 支持所有 Browser Profile。
Authorization Code、PKCE、BFF 或 Browser-Based OAuth Client 的 Current Support，由
对应 Protocol Reference 与 [项目状态](../project/status) 定义。

如果你的 Web Application 同时拥有需要保护的 Backend API，再组合 **Backend / API**
Path。

## 3 · Backend / API

### 当你主要负责 Resource Server Boundary

如果你的核心问题不是"怎样完成 Browser Login"，而是：

> **一个 API 怎样可信判断当前 Request 携带的 Access Context 是否可以被接受？**

从 **Backend / API** 开始。这条 Path 关注：Resource Server 怎样按照声明的 Token
Contract 验证请求；怎样确认 Resource Applicability；怎样把 Validated Token Context
交给 Application Authorization。

```text
Token Appearance  ≠  Validation Contract
Access Token      ≠  JWT by definition
```

Backend 不应该为了确认身份而读取 SoulAuth private persistence，也不应该根据 Token
"看起来像什么"自行猜测它的语义。

**Start here：** [验证 Token](../integrate/verify-tokens)。

如果 Token 验证以后还要建立 Application 自己的 Permission / Business Authority，继续
使用 Application 自己的 Authorization Model —— Valid Token 不自动等于 Authorized
Action。

## 4 · OIDC Client

### 当现有 Application 已经会说 OIDC

如果你的 Application 已经能够按照 Current SoulAuth Release 正式声明的 OIDC Profile
与 Identity Provider 集成，那么优先**复用 Public Protocol Contract**。不要因为接入
SoulAuth，就先设计一套 SoulAuth-specific private identity integration：

```text
Existing supported OIDC integration  → Prefer declared public protocol
Existing supported OIDC integration  → Read SoulAuth private persistence   ← 错
```

**Start here：** 首先 [注册 Client](../integrate/register-a-client)，然后
[OIDC 与 Client](../reference/oidc-and-clients)。如果 Current SoulAuth OIDC Profile
采用 Authorization Code Flow，进入
[授权码流程](../integrate/authorization-code-flow)；如果你同时自己承担 Browser
Runtime Boundary，再阅读 [浏览器与 BFF](../integrate/browser-and-bff)。

本篇不自行决定哪一种 OIDC Flow 当前 Supported。

## 5 · AI / Agent System

### 当 AIActor 本身需要成为 Identity Subject

产品使用了 AI、LLM 或 Agent Framework，不自动意味着需要这条 Path。真正的判断问题
是：

> **这个 AIActor 本身是否需要作为自己被稳定表示、Authentication 和 Attribution？**

如果 AI 只是 Application 内部的一项能力，你可能完全不需要独立 AIActor Identity；
如果 AIActor 必须拥有自己的 ActorIdentity、Identity Continuity、Authentication
Context，那么选择 **AI / Agent System**。

### 保持 Client 与 AIActor 分离

Agent Application 可以是 Client；AIActor 仍然是 Actor Kind。因此：

```text
Client
≠
AIActor
```

也不能因为一个 Agent Application 代表 AI 工作，就把 OAuth Client identity 当成
AIActor Identity。Current Release 到底支持哪些 AIActor Authentication Method，由
[认证与会话](../reference/authentication-and-sessions) 与
[项目状态](../project/status) 定义 —— **Path 存在不等于某个 AI machine-auth protocol
已经 Current Supported。**

**Start here：**

```text
AI-native Identity
        ↓
Actor Identity Model
        ↓
Authentication & Sessions
```

如果 AIActor 最终通过 Backend / API 被 Consumer 使用，再组合 **Backend / API**
Path。

## 6 · SoulseedOS

### 当 SoulseedOS 需要消费 SoulAuth Authentication Context

这条 Path 真正的问题不是"SoulseedOS 怎样成为 SoulAuth 的一部分"，而是：

> **SoulseedOS 怎样安全消费 SoulAuth 已经建立的 bounded Authentication Context？**

整个 Ecosystem Boundary 保持：

```text
SoulseedAGI  → Define
SoulAuth     → Authenticate
SoulseedOS   → Operate / Govern
```

```text
Authentication
≠
Soulseed Runtime Authority
```

SoulAuth 证明 Actor Authentication 是否按照自己的 Contract 成立；SoulseedOS 继续判断
这个 Actor 在自己的 Runtime / Governance Domain 中能做什么。

**Start here：** [Soulseed 接入](../integrate/soulseed)。如果你希望先理解三个系统
之间为什么这样分工，进入 [Soulseed 与 Mind OS](../spec/soulseed-and-mind-os)；
如果你想理解为什么 Authentication 不能直接产生 Authority，进入
[身份与权限](../spec/identity-vs-authority)。

本篇不再使用
`Canonical Actor → SoulAuth → Authenticated Identity → SoulseedOS`
这种会混淆 Ontology Ownership 的线性模型。

## 7 · Integration Path 可以组合

选择 Path 时，不要问"我的系统最终只能属于哪一种"，更好的问题是：

> **我的系统有哪些不同 Integration Boundary？**

**Web SaaS** 可能同时需要 `Web Application + Backend / API` —— Browser 负责用户交互与
Application Session Boundary，Backend 负责 Resource Server / API Boundary。

**Human + AIActor Product** 可能同时需要
`Web Application + AI / Agent System + Backend / API` —— 因为 Human 通过 Browser
进入，AIActor 需要自己的 ActorIdentity，Backend 还需要消费经过验证的 request
context。

```text
Integration Path
≠
Whole-system Classification
```

## 8 · Quick Decision Tree

```text
Does an existing application already support a Current SoulAuth OIDC profile?
        └── Yes → OIDC Client

Do you own the Browser Authentication Runtime Boundary?
        └── Yes → Web Application

Are you primarily protecting a Backend / Resource Server?
        └── Yes → Backend / API

Does the AIActor itself need independent identity and authentication?
        └── Yes → AI / Agent System

Does SoulseedOS need to consume SoulAuth Authentication Context?
        └── Yes → SoulseedOS
```

这些不是 mutually exclusive `if / else`，而是 **Select all that apply**。

## Choose an Integration Path at a glance

| Boundary | Meaning |
| --- | --- |
| **Integration Path ≠ Actor Type** | 工程入口不是身份本体 |
| **Integration Path ≠ Whole-system Classification** | 一个系统可以组合多条 Path |
| **Integration Path ≠ Current Support Claim** | 文档存在不代表 Current Release 已实现全部能力 |
| **Client ≠ Actor** | Software participant 不是被 Authentication 的主体 |
| **AI-enabled Product ≠ AIActor Identity Requirement** | 使用 AI 不自动需要独立 AIActor |
| **OIDC-capable Application → Prefer Public Contract** | 已有标准能力时避免 private coupling |
| **Authentication ≠ Application Authority** | Authentication Result 不是业务行动权 |
| **Authentication ≠ Soulseed Governance Authority** | SoulseedOS 拥有自己的 Runtime / Governance Decision |

## Documented Path 与 Current Support 分开

```text
Documented Integration Path
≠
Current Supported Surface
```

Path 告诉你**如果你面临这类 Integration Problem，应该去哪里阅读**；
[项目状态](../project/status) 告诉你 **Current Release 今天到底支持哪些具体能力**。

例如，文档体系可以有 AI / Agent System Path，因为 AIActor Identity 是真实
Architecture 问题 —— 但这不会自动证明 Current Release 今天已经支持某一种特定 AI
cryptographic Authentication Method。同样，Web Application Path 存在，也不自动证明
BFF、Browser-Based OAuth Client、Refresh Token 等所有 Browser Profile 当前全部
Supported。

## 下一步

如果你只想尽快把 Current Release 跑起来、先获得第一个可验证结果，进入
[快速开始](./quickstart)；如果你已经明确自己的 Integration Boundary，直接进入上面
对应的 Path。

最终，这一页只要求你把三件事情说清楚：

> **谁需要被 Authentication？Authentication 从哪里进入？Authentication 建立的可信
> 结果由谁消费？**

## Exact Semantic Ownership

本篇拥有 **Integration Decision Logic、Path Labels、Path Composition 与 Document
Routing**。

它不自行定义 Browser protocol profile、Authorization Code support、PKCE
requirements、BFF support、Browser-Based Client support、Access Token
representation、OIDC Client profile、AIActor Authentication Method、Soulseed
AuthContext schema、current feature support。这些 Exact 事实分别由接入指南、
[认证与会话](../reference/authentication-and-sessions)、
[OIDC 与 Client](../reference/oidc-and-clients)、Machine-readable Contracts、
[项目状态](../project/status) 拥有。因此：

```text
Path Selection  ≠  Protocol Definition
Path Selection  ≠  Release Capability Declaration
```
