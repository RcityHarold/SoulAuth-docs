# 浏览器与 BFF

## 在 Browser Runtime Boundary 中安全使用 SoulAuth

上一页已经建立 **Verified OIDC Authentication Result**。但 Protocol Transaction 验证
完成以后，Application 仍然必须回答另一组问题：

OAuth Token 由谁持有？Browser 长期持有什么？Application Login State 由谁维护？
SoulAuth AuthSession 与 Application Session 是什么关系？Cookie 承载的是什么？OIDC
Transaction 结束以后，Application Request 还需要什么 CSRF Defense？BFF 能够降低什么
风险，又解决不了什么？

所以首先保持：

```text
Protocol Correctness
≠
Browser Runtime Security
```

Browser Integration 真正的目标不是让 Browser 拥有尽可能多的 identity / token
state，而是：

> **把每一种敏感状态放进真正需要它，并且能够承担相应保护责任的 Trust Boundary。**

## 1 · Browser 改变了 Trust Boundary

Browser 是强大的 Application Runtime，但它不是受控 Server Environment：

```text
Browser-readable long-lived secret
≠
Confidential Client Credential
```

如果一份长期敏感材料能够被 Browser Application Code 直接读取，就不能继续把它按照
server-side confidential secret 的安全假设处理。

这并不意味着 Browser 永远不能持有 Access Token —— Browser-Based OAuth Client 本身就是
一种真实 Architecture。真正长期成立的原则是：

> **不要无必要扩大 OAuth Token 的 Browser Exposure Surface。**

## 2 · Choose the Browser Architecture

Browser OAuth 并不存在唯一 Architecture，本篇区分三种模式。

**Backend for Frontend（BFF）** —— OAuth Client、Token Custody 与 Resource Access
主要位于 Server Boundary。

**Token-Mediating Backend** —— Backend 完成部分 OAuth 职责，但 Access Token 仍被交给
Browser，由 Browser 直接访问 Resource。

**Browser-Based OAuth Client** —— Browser Application 自身承担 OAuth Client 职责，
OAuth Token 进入 Browser Security Boundary。

这些 Architecture Pattern 来自适用的 Browser OAuth 规范与安全最佳实践。但必须保持：

```text
External Architecture Pattern
≠
SoulAuth Current Supported Integration
```

Current SoulAuth Release 实际支持哪些 Client / Browser Profile，由
[OIDC 与 Client](../reference/oidc-and-clients) 与
[项目状态](../project/status) 定义。

## 3 · BFF Pattern

在 BFF Pattern 中，BFF 位于 Consumer Application Boundary，它不是 SoulAuth 组件：

```text
BFF  ≠  SoulAuth Runtime
BFF  ≠  Actor
```

BFF 通常承担 OAuth Client、OAuth Token Custody、Application Session、对明确 Resource
Boundary 的 Resource Access：

```text
Browser
   │
   │ Application Session
   ▼
BFF
   │
   ├── OAuth Client
   ├── OAuth Token Custody
   ├── Application Session
   └── Resource Proxy
   │
   ├──────────────▶ SoulAuth
   │
   └──────────────▶ Resource Server
```

BFF 与 Application Session 都属于 Consumer Application；SoulAuth 仍然负责自己拥有的
Identity / Authentication / Protocol Contract。

## 4 · BFF 不重新定义 Authorization Code Flow

BFF 采用 Authorization Code Flow 时，仍然继承
[授权码流程](./authorization-code-flow) 已经定义的 Protocol Transaction。区别只是
**Client 角色现在位于 BFF Server Boundary**。

因此 BFF 负责适用的 Authorization Transaction、Code Exchange、ID Token Validation、
OAuth Token Custody；Browser 不需要重新实现一套平行的 OIDC Transaction。

## 5 · BFF 的关键变化是 Token Custody

```text
Browser
   │
   │ Application Session
   ▼
BFF
   │
   │ Access Token
   ▼
Declared Resource Server
```

Browser 主要与 Application Session 交互；BFF 按照 Current Resource Contract 使用
Access Token。因此采用 BFF 的核心价值不是"系统里多了一层 Backend"，而是：

> **OAuth Token 不需要直接进入 Browser Application 可读取的状态空间。**

## 6 · BFF 不是任意 Token Forwarding Proxy

BFF 持有 Access Token 以后，就拥有一个非常重要的 Security Boundary。Browser 不能告诉
它"把我的 Token 发送到这个任意 URL"，否则 Browser-controlled destination +
BFF-held token 可能形成 Token Exfiltration 路径：

```text
BFF
≠
Unrestricted Outbound Proxy
```

BFF 只应该向 Application 预先定义并允许的 Resource Boundary 发送适用 Access Token。
具体允许哪些 Host、Path、Method、Resource，由 Consumer Application 自己的 BFF /
Resource Contract 控制。

## 7 · Browser-Based OAuth Client

如果 Application 没有可信 Server Boundary，并且 Current SoulAuth Profile 支持
Browser-Based OAuth Client，Browser Application 自身承担 OAuth Client 职责：

```text
Browser Application
        │  OAuth Client
        ▼
     SoulAuth
```

这种 Architecture 并不天然错误。真正变化的是 **OAuth Token 进入了 Browser
Application 的 Trust Boundary**，因此与 BFF 相比 direct token exposure surface
更大。这意味着 Browser Application 需要按照 Current OAuth / SoulAuth Browser
Contract 承担相应 Token Protection Responsibility。

## 8 · BFF 与 Browser-Based Client 的核心区别

| Question | BFF | Browser-Based OAuth Client |
| --- | --- | --- |
| **OAuth Client 在哪里运行** | Server / BFF | Browser |
| **Raw OAuth Token 是否进入 Browser JS Boundary** | 不应 | 会或可能会 |
| **Browser 主要持有什么** | Application Session Credential | OAuth Client / Token State |
| **Resource Access** | 通过 BFF | Browser 直接调用 Resource |
| **主要安全取舍** | 后端复杂度更高，直接 Token Exposure 更小 | Runtime 更直接，Browser Token Exposure 更大 |

这张表描述 Architecture Boundary，它不声明 Current SoulAuth Release 已经支持表中的
所有 Profile。

## 9 · Token-Mediating Backend 是不同 Architecture

如果 Backend 获得 Access Token 以后又把它交给 Browser，由 Browser 直接调用
Resource，它就不再是这里所说的 BFF Pattern：

```text
BFF
≠
Token-Mediating Backend
```

二者都可能包含 Backend，真正区别在于 Token 最终由谁持有，以及谁向 Resource Server
发起带 Token 的 Request。

## 10 · 必须分清六类 Runtime State

Browser Authentication 最容易出错的地方，是把所有东西统称为"Session"。

| State | Owner / Meaning |
| --- | --- |
| **OIDC Transaction State** | 单次 Authorization / Authentication Transaction |
| **SoulAuth AuthSession** | SoulAuth Authentication Continuity |
| **Application Session** | Consumer Application 自己的 Runtime Continuity |
| **Browser Cookie** | Browser 携带 Session Credential / Reference / protected state 的机制 |
| **ID Token** | OIDC Authentication Result 的协议表达 |
| **OAuth Token** | Current Resource / OAuth Contract 定义的 Access 或其它 Token State |

```text
OIDC Transaction State ≠ SoulAuth AuthSession ≠ Application Session
ID Token ≠ Application Session
Cookie   ≠ ActorIdentity
```

## 11 · OIDC Transaction State 不是 Application Login State

`state`、PKCE verifier、`nonce` 等适用的 transaction-bound state 服务于一条具体
Authorization Transaction，它们不能自然升级成长期 Application Login State：

```text
OIDC Transaction State
≠
Application Session
```

Transaction 结束以后 Application Session 仍然可以继续，两者 Lifecycle 不同。

## 12 · SoulAuth AuthSession 不等于 Application Session

```text
SoulAuth AuthSession
≠
Application Session
```

SoulAuth AuthSession 属于 SoulAuth Authentication Boundary，表达 Authentication
Continuity；Application Session 属于 Consumer Application Boundary，表达 Application
Runtime Continuity。

如果现有 SoulAuth AuthSession 仍然满足 Current Authentication Contract，SoulAuth
可以按照 [认证与会话](../reference/authentication-and-sessions) 的规则复用
Authentication Context。但这不会自动创建、延长或删除某一个 Consumer 自己的
Application Session。

## 13 · Application Session 从 Verified OIDC Subject Context 开始

BFF 或 Application 完成 OIDC Validation 以后，可以建立自己的 Application Session，
身份起点应该是：

```text
Trusted SoulAuth Issuer
+
Validated `sub`
        ↓
Verified OIDC Subject Context
        ↓
Application-local Session / Mapping
```

不能把裸 `sub` 脱离 Issuer 以后当作全球 Actor Identifier；同样，Email、Display
Name、Username 及其它 mutable profile claim 也不能替代 OIDC Subject Identity。

## 14 · Application-local Identity 不等于 SoulAuth ActorIdentity

Application 当然可以拥有自己的 Account、Membership、Profile、Entitlement、Internal
User ID、Session。但必须保持：

```text
Application-local Identity / Account  ≠  SoulAuth ActorIdentity Resource
Application Session                   ≠  ActorIdentity Source of Truth
```

Consumer 可以保存 verified OIDC subject reference，它不能因此变成 SoulAuth Identity
Domain 的另一个 Canonical Owner。

## 15 · ID Token 不等于 Application Session

```text
ID Token
≠
Application Session
```

ID Token 表达一次 OIDC Authentication Result；Application Session 表达 Application
长期运行状态。所以长期保存一个 ID Token 不能自动替代正确的 Application Session
Model。

## 16 · Cookie 是 Carrier，不是 Identity

Cookie 可以根据具体 Session Contract 携带 Session Credential、Session Reference、
protected Session State 或其它受支持 representation，所以不能把
`Cookie = server-side session ID` 写成唯一模型。真正不变的是：

```text
Cookie
≠
ActorIdentity
```

以及 Cookie representation 不能重新定义它所承载的 Session 语义。

## 17 · Application Cookie 与 SoulAuth Cookie 属于不同 Owner

```text
Application Origin  → Application Session Cookie
SoulAuth Origin     → SoulAuth Authentication Cookie
```

```text
Application Cookie
≠
SoulAuth Cookie
```

它们的 Owner、Scope、Lifecycle、Security Meaning 都不同。不要因为二者都叫 Cookie，
就把 SoulAuth AuthSession 与 Application Session 合并。

## 18 · BFF Session Cookie 的安全基线

对于采用适用 Browser OAuth BFF Pattern 的 deployment，BFF session cookie 必须遵守
对应外部 Browser OAuth Security Contract：

```text
Secure
+
HttpOnly
```

其它属性（`SameSite`、`Path`、`Domain`、Cookie Prefix）必须继续结合当前 External
BCP、Site / Origin topology、Consumer Application Contract 配置。本篇不会为了"统一"
而把所有 Deployment 硬编码成同一 Cookie 值。

## 19 · SameSite 不是脱离 Topology 的万能 CSRF 答案

SameSite 很重要，但 Site 与 Origin 不是同一个概念，所以一个 SameSite 设计不会自动
覆盖所有 cross-origin request 风险：

```text
SameSite = Part of CSRF Defense
```

但不是：

```text
SameSite Enabled = CSRF Solved
```

## 20 · OIDC `state` 不等于 Application CSRF Protection

`state` 解决的是 OIDC Authorization Transaction correlation；Application Session
Cookie 面对的 CSRF 问题发生在后续 Application Request Boundary。因此：

```text
OIDC `state`
≠
General Application CSRF Protection
```

即使 OIDC Login 已经结束并且 `state` 完全正确，Cookie-authenticated Application
Request 仍然需要适用的 CSRF Defense。

## 21 · CORS 不是 Authentication 或 Authorization

```text
CORS  ≠  Authentication
CORS  ≠  Authorization
```

CORS 表达 Browser Origin Access Policy，它不能 Authentication Actor、建立
ActorIdentity 或决定 Application Authority。

在明确的 request / origin model 下，严格 CORS / preflight policy 可以成为 CSRF
Defense 的一部分。但是：

```text
CORS Enabled
≠
CSRF Automatically Solved
```

Exact CSRF 机制继续属于 Consumer Application 的 Browser Security Contract。

## 22 · BFF 不等于 XSS Immunity

BFF 的一个重要价值是 Raw OAuth Token 不直接进入 Browser JavaScript，这能够缩小
direct token exfiltration surface。但是：

```text
BFF
≠
XSS Immunity
```

如果恶意 JavaScript 已经运行在合法 Application Origin，它即使读不到 HttpOnly Session
Cookie 或 OAuth Token，也仍可能借助当前有效 Application Session 调用 BFF 允许的业务
操作。因此：

> **BFF 主要改变 Token Exposure Boundary，不会自动消除 malicious browser code 造成的
> 全部风险。**

## 23 · 建立 Authenticated Application Session 时防止 Session Fixation

Authentication 以前 Application 可能已经存在 unauthenticated session state；
Authentication 以后，不能把攻击者能够预先控制的 session credential 无条件升级成
authenticated application session。因此：

> **Authenticated Application Session establishment 必须防止 Session Fixation。**

Exact session establishment / rotation mechanism 由 Consumer Application 自己的
Security Contract 实现。

## 24 · Token Custody：BFF Pattern

```text
Browser → Application Session
BFF     → OAuth Token Custody
```

真正需要保持的 Architecture Invariant 是：**BFF 管理的 Raw OAuth Token 不进入
Browser Application 可读取的状态空间。**

这并不要求本篇规定 BFF 内部必须使用哪一个 database、必须使用 server-side token
store、必须采用哪种 session persistence —— Token Custody Boundary 不等于具体 Storage
Implementation。

## 25 · Token Custody：Browser-Based Client

如果 Current SoulAuth Profile 支持 Browser-Based OAuth Client，OAuth Token 进入
Browser Application Boundary，无法获得 BFF 同样的 server-side token isolation。必须
继续遵守 least privilege、minimized exposure、bounded lifetime、Current OAuth /
SoulAuth Client Contract。

但是 localStorage、sessionStorage、IndexedDB、memory-only 都不应该被宣传成"只要选这个
Storage 就安全"。如果攻击者已经能够在 Application Origin 执行恶意 code，单纯改变
Browser Storage Location 并不会消除所有 Token Abuse Risk。

## 26 · Refresh Token（only if supported and issued）

本篇不假设 Current SoulAuth Browser Profile 一定签发 Refresh Token。如果 Current
Profile 确实支持并签发，它必须继续遵守 Current SoulAuth Token Contract 以及适用的
OAuth Security Requirements。尤其对于 Public Client，长期 continuation artifact 不能
被当成无限期、不受 Replay Protection 约束的 bearer secret。

Exact rotation、sender-constraining、lifetime、inactivity semantics 继续由
[OIDC 与 Client](../reference/oidc-and-clients)、
[认证防护](../security/authentication-protection) 以及适用 External Specification
拥有。

## 27 · ID Token 不用于普通 Resource API

无论采用哪一种 Browser Architecture：

```text
ID Token
≠
API Access Token
```

ID Token 表达 OIDC Authentication Result；Access Token 表达对某个 declared Protected
Resource 的 access contract。如果 Resource Server 需要验证 Access Token，进入
[验证 Token](./verify-tokens)。

## 28 · Logout 不是一个单一状态变化

Browser 世界里"Logout"经常把多个不同 Lifecycle 混在一起，至少要分清：

```text
Browser Cookie
Application Session
SoulAuth AuthSession
OAuth Artifact Lifecycle
```

```text
Clear Browser Cookie
≠
Invalidate Application Session
```

如果 Application 采用 server-managed session，删除 Browser 中的 cookie 不自动证明
server-side session 已经失效。

## 29 · Application Logout 不等于 SoulAuth Logout

```text
Application Logout  ≠  SoulAuth Logout
Application Session ≠  SoulAuth AuthSession
```

Application Logout 作用于 Consumer 自己的 Application Session；SoulAuth Logout 如果
Current Protocol Profile 支持，作用于 SoulAuth Authentication / SSO Continuity。不能
通过删除 Application Cookie 推导 SoulAuth AuthSession 已经结束。

## 30 · Session 与 Token 是不同状态空间，但可以需要协调

```text
Different State Spaces
≠
Unrelated Security Lifecycles
```

Application Session、SoulAuth AuthSession 以及 Current OAuth Artifact 拥有不同
Semantic Owner。但 Consumer Application 仍然可以按照明确 Contract 决定：当 underlying
access capability 已经无法继续建立时，Application Session 是否必须重新 Authentication
或结束。具体协调逻辑由 Current Browser / Token Contract 决定，本篇不自行创建
Universal Logout Algorithm。

## 31 · Architecture Drift：Declared BFF 却暴露 Raw Token

如果 Application 明确声明采用 BFF Pattern，但实际发现 Raw Access Token 或其它本应由
BFF 持有的 OAuth Token 出现在 Browser JavaScript、URL、HTML 或 ordinary diagnostic
output，那么这不是普通数据展示问题，而是 **Architecture / Security Drift**：

```text
Declared BFF + Raw OAuth Token exposed to Browser JS
→
Architecture Drift
```

## 32 · Architecture Drift：BFF 可以把 Token 发往任意地址

```text
BFF-held Token + Browser-controlled Arbitrary Destination
→
Unsafe Resource Proxy Boundary
```

如果这件事成立，BFF 已经偏离它应该拥有的 Resource Boundary，不能通过"这是一个方便的
generic proxy"来解释。

## 33 · Architecture Drift：Application 自己重新发明 ActorIdentity

如果 Application 完成 OIDC Authentication 以后不使用 verified issuer + `sub`
context，反而使用 Email、Display Name、Username 或裸 `sub` 跨 Issuer 比较重新创造
"稳定 Actor ID"，这已经是 Identity Mapping Drift：

```text
Application-local Mapping
≠
Permission to redefine ActorIdentity
```

## 34 · Architecture Drift：Application Session 被当成 Identity Source of Truth

Application Session 可以保存对 verified OIDC subject 的引用。但：

```text
Application Session
≠
ActorIdentity Source of Truth
```

如果 Session 内部 state 开始反向决定"SoulAuth 中的 Actor 是谁"，而不是消费 SoulAuth
已经建立的 Authentication Contract，Consumer Boundary 已经发生语义漂移。

## 35 · Browser Integration Pattern

```text
                    SoulAuth
                       │
                OIDC Authentication
                       │
                       ▼
                  ┌─────────┐
                  │   BFF   │
                  │         │
                  │ OAuth   │
                  │ Client  │
                  │         │
                  │ Token   │
                  │ Custody │
                  │         │
                  │ App     │
                  │ Session │
                  │         │
                  │ Resource│
                  │ Proxy   │
                  └────┬────┘
                       │
             Application Session
                 Credential
                       │
                       ▼
                    Browser
```

BFF 与 Application Session 都属于 Consumer Application Boundary。这是一张 **Browser
Integration Pattern Diagram**，不是新的 SoulAuth Canonical Architecture Figure。

## Browser & BFF at a glance

| Boundary | Meaning |
| --- | --- |
| **Protocol Correctness ≠ Browser Runtime Security** | OIDC 正确不等于 Web 边界已经正确 |
| **Browser-readable long-lived secret ≠ Confidential Client Credential** | Browser-readable material 不能假装 Server Secret |
| **External Browser Pattern ≠ SoulAuth Current Support** | 规范定义 Pattern 不等于当前产品已支持 |
| **BFF ≠ SoulAuth Runtime** | BFF 属于 Consumer Application |
| **BFF ≠ Actor** | Application 组件不是 Authentication 主体 |
| **BFF ≠ Token-Mediating Backend** | Token 最终是否进入 Browser 是关键差异 |
| **OIDC Transaction State ≠ Application Session** | 一次 Protocol Transaction 不是长期登录状态 |
| **Application Session ≠ SoulAuth AuthSession** | Consumer continuity 与 authentication continuity 分离 |
| **Application Session ≠ ActorIdentity Source of Truth** | Consumer Session 不能重定义 SoulAuth identity |
| **Cookie ≠ ActorIdentity** | Cookie 只是承载 Session State 的机制 |
| **Application Cookie ≠ SoulAuth Cookie** | Owner、scope 与 lifecycle 不同 |
| **OIDC `state` ≠ Application CSRF Protection** | Protocol correlation 不替代 Application request security |
| **CORS ≠ Authentication / Authorization** | Origin policy 不是 Identity 或 Authority |
| **BFF ≠ XSS Immunity** | BFF 减少 token exfiltration，不消灭 malicious browser code |
| **BFF ≠ Unrestricted Outbound Proxy** | Token 只能进入 declared Resource Boundary |
| **ID Token ≠ API Access Token** | Authentication Result 与 Resource Access 分离 |
| **Clear Cookie ≠ Application Session Invalidation** | Browser state 变化不证明 server session 失效 |
| **Application Logout ≠ SoulAuth Logout** | 两个不同 Lifecycle，后者仅在支持时适用 |

整篇最终可以压缩成：

```text
Choose the Browser Architecture
        ↓
Place the OAuth Client
        ↓
Place Token Custody
        ↓
Separate Transaction / AuthSession / Application Session
        ↓
Map verified issuer + sub into Application-local state
        ↓
Protect Cookie / CSRF boundary
        ↓
Protect Resource Proxy boundary
        ↓
Detect Architecture Drift
```

## 下一步

如果 Backend / Resource Server 下一步需要判断 Access Token 是否可信，进入
[验证 Token](./verify-tokens)；如果需要理解 SoulAuth 自己的 Authentication 与
AuthSession，进入 [认证与会话](../reference/authentication-and-sessions)；如果需要
查看 Exact Client、Token、Subject、Logout 或 OAuth / OIDC Profile，进入
[OIDC 与 Client](../reference/oidc-and-clients)；如果遇到 Redirect、Cookie、
Session、Token Exposure、Login Loop 或 Replica-related Browser Flow 等问题，进入
[故障排查](../operate/troubleshooting)。

## Exact Contract Source

本篇拥有 **Browser Runtime Trust Boundary 与 Browser / BFF Integration Pattern
Guide**。

它不自行定义 whether BFF is currently supported、whether Browser-Based OAuth Client
is supported、whether Token-Mediating Backend is supported、whether Authorization Code
+ PKCE is supported for each browser profile、whether Refresh Token is issued、whether
SoulAuth logout is supported、exact Client Authentication Method、exact cookie values
for every topology、exact CSRF implementation、exact browser token storage。

这些 Exact 事实分别来自 External Browser OAuth / OAuth Security Specifications、
[OIDC 与 Client](../reference/oidc-and-clients)、
[认证与会话](../reference/authentication-and-sessions)、
[认证防护](../security/authentication-protection)、[项目状态](../project/status)，
以及 Consumer Application 自己的 Browser Security Contract。必须保持：

```text
External BCP Requirement   ≠  SoulAuth Support Claim
SoulAuth Protocol Contract ≠  Consumer Application Session Contract
```
