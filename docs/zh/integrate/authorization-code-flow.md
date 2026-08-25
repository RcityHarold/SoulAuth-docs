# 授权码流程

## 通过受支持的 Authorization Code + PKCE Profile 建立可信 OIDC Authentication Result

上一页已经完成 Client Registration。现在，一个已经注册并正确配置的 Client 可以进入
Current Release 支持的交互式 OAuth / OpenID Connect Flow。

本篇描述 **Authorization Code Flow with PKCE** 作为 SoulAuth 交互式 OIDC 集成路径。
它是一种 **Client-facing protocol flow**，不是所有 Actor 统一使用的 Authentication
Method。

这一页只解决一个问题：

> **一个已经注册的 Client，怎样建立并验证一条 Authorization Code Transaction，最终
> 获得可信的 OIDC Authentication Result？**

```text
Registered Client
        ↓
Load trusted protocol metadata
        ↓
Prepare transaction-bound state
        ↓
Authorization Request
        ↓
SoulAuth establishes / reuses applicable Actor authentication
        ↓
Authorization Response
        ↓
Validate transaction association
        ↓
Exchange Authorization Code
        ↓
Validate ID Token
        ↓
Establish issuer-scoped OIDC subject context
```

## Before you start

- Client 已经按照 [注册 Client](./register-a-client) 完成注册。
- Current Release 正式支持本页描述的 Authorization Code Profile。
- Client 已经预先配置并信任正确的 SoulAuth Issuer。
- Client 知道 Current Contract 允许使用的 registered redirect URI。
- Client 能够安全保存当前 Transaction 需要的本地 state。
- 如果 Current Client Profile 要求 Client Authentication，相应配置已经建立。
- PKCE、`state`、`nonce` 等 mechanism 究竟哪些为 Required，以 Current OIDC Profile
  为准。

Golden Path 描述**怎样正确使用一条已经声明的协议路径**，它不会反过来决定 Current
Release 支持什么。

## Step 1 · 从 Trusted Issuer 获取 Protocol Metadata

Client 不应该猜 Authorization Endpoint、Token Endpoint、Key Set Endpoint 或其它 OIDC
Endpoint。正确的 Trust 顺序是：

```text
Trusted Issuer
        ↓
OIDC Discovery / Metadata
        ↓
Declared Protocol Endpoints
```

而不是：

```text
Unknown Token / URL → discover an issuer → automatically trust it
```

> **Trust the Issuer first. Discover capabilities second.**

Discovery 回答**这个已经被 Client 信任的 Issuer 声明了哪些 Protocol Capability**，
它不回答**Client 应该信任谁**。因此：

```text
Discovery
≠
Trust Bootstrap from Arbitrary Input
```

Client 不能读取一个来源未知 Artifact 中的任意 `iss`，然后自动跟随它建立新的 Trust
Relationship。

## Step 2 · 为当前 Transaction 准备安全状态

Authorization Code Flow 里有几种经常被混淆的安全关系，它们解决不同问题：

| Mechanism | 它回答什么 |
| --- | --- |
| **`state`** | 返回的 Authorization Response 是否属于 Client 原本发起的 Transaction |
| **PKCE** | Code Exchange 是否与原始 Transaction 中的 verifier 建立正确关系 |
| **`nonce`** | 在当前 OIDC Profile 适用时，ID Token 是否与原 Authentication Request 正确关联 |
| **Client Authentication** | 当前参与 Token Exchange 的软件 Client 是谁 |
| **Actor Authentication** | 当前被 Authentication 的 Actor 是谁 |

```text
state ≠ PKCE ≠ nonce ≠ Client Authentication ≠ Actor Authentication
```

它们不能互相替代。

### `state`（where required by the Current Client Profile）

Client 为当前 Transaction 建立并保留 transaction-correlation state。当 Authorization
Response 返回时，Client 必须按照 Current Contract 确认 Response 确实属于它之前发起的
Transaction。如果 transaction association 不能建立：

```text
Reject Transaction
```

不要继续兑换 Authorization Code、不要信任返回的 identity information、不要猜测
"应该只是 state 丢了"。核心是：

```text
Authorization Response Received
≠
Trusted Transaction
```

### PKCE（where required by the Current Profile）

```text
code_verifier → derive → code_challenge
```

Authorization Request 携带 challenge；后续 Code Exchange 提交原始 verifier；SoulAuth
按照 Current PKCE Contract 验证二者之间的关系。因此：

```text
PKCE
≠
Client Authentication
```

PKCE 主要绑定 Code Exchange 与原始 Transaction；Client Authentication 验证 software
Client。即使二者在同一个 Flow 中同时使用也是如此。

Exact PKCE method（包括 Current Profile 是否要求 `S256`）由
[OIDC 与 Client](../reference/oidc-and-clients) 与 Current Metadata 定义，本 Guide
不自行扩大支持范围。

### `nonce`（where applicable）

如果 Current OIDC Request 使用 `nonce`，Client 应将它绑定到当前 Authentication
Transaction；ID Token Validation 时必须按照 Current OIDC Contract 验证对应 `nonce`。
如果不能建立匹配：

```text
Do not trust the OIDC authentication result
```

`nonce` 负责的是 OIDC Authentication Request 与 ID Token 之间的 transaction
relationship，它不替代 `state` 或 PKCE。

### Transaction State 不跨请求复用

无论 Current Profile 具体使用 `state`、`nonce`、PKCE verifier 还是其它
transaction-bound security state，都应保持：

```text
Transaction-bound State belongs to one Transaction
```

不能把同一固定值长期跨多个 Authentication Request 复用。

## Step 3 · 发送 Authorization Request

从 Trusted Metadata 取得 Authorization Endpoint 以后，Client 构造 Authorization
Request。一个**语义示例**可能包括：

```text
authorization_endpoint

client_id
registered redirect_uri
response_type=code
openid scope

transaction correlation state
PKCE challenge, where required
nonce, where applicable
```

这不是完整 Raw HTTP Contract。Exact parameter 的 requiredness、encoding、supported
scope、PKCE method、error semantics 统一由
[OIDC 与 Client](../reference/oidc-and-clients) 与适用 OAuth / OIDC 规范定义。

特别保持：

```text
OAuth `client_id`
≠
ActorIdentity
```

`client_id` 识别的是 Protocol Client，不是当前被 Authentication 的 Actor。

### Redirect URI 继续使用已注册的 Protocol Boundary

Authorization Request 中的 redirect 必须来自 Current Client Contract 已经允许的
registered redirect boundary：

```text
Redirect URI
≠
Arbitrary Application Return URL
```

Application 内部的 `return_to=/projects/123` 解决的是登录完成后的应用导航，它不能替代
OAuth / OIDC Redirect Contract。这一边界已经在 [注册 Client](./register-a-client) 中
完整定义，本篇不再重复 Redirect Matching Rules。

## Step 4 · SoulAuth 建立或复用适用的 Actor Authentication Context

Authorization Request 到达 SoulAuth，不意味着每一次都必须重新显示 Login UI。更准确的
问题是：

> **当前是否已经存在满足这次 Request 要求的 Authentication Context？**

如果已有 Authentication Context 符合 Current authentication policy、assurance、
freshness、client / protocol requirement，SoulAuth 可以按照自己的 Authentication
Contract 复用它；如果不满足，再使用 Current Release 支持的 Authentication Method
建立新的 Authentication Result。因此：

```text
Every Authorization Request
≠
Forced New Authentication
```

但 AuthSession / SSO reuse 的 Exact semantics 继续由
[认证与会话](../reference/authentication-and-sessions) 定义。本 Guide 不重新定义
Credential、Authentication Method 或 AuthSession。

### OAuth / OIDC Authorization 不创造 Cross-domain Authority

```text
OAuth / OIDC Protocol Authorization  ≠  Application Authority
OAuth / OIDC Protocol Authorization  ≠  Soulseed Governance Authority
OAuth / OIDC Protocol Authorization  ≠  Universal Execution Authority
```

这条 Flow 完成，不意味着 Actor 获得所有下游行动权。真正 Application 或 Soulseed
Authority 继续由对应 Domain 决定。

## Step 5 · 先验证 Authorization Response 属于原 Transaction

SoulAuth 完成适用 Authentication 与 Protocol Processing 以后，Browser 将
Authorization Response 带回 registered redirect boundary。但是：

> **Response 到达 Callback 不是 Trust 成立。**

```text
receive response
        ↓
validate transaction association
        ↓
trusted transaction?
       / \
     no   yes
     ↓     ↓
 reject  process result
```

```text
Authorization Response Received
≠
Trusted Transaction
```

无论 Response 表示 success 还是 protocol error，如果 Current Request 使用了
transaction-correlation control，Client 都必须先完成对应验证。否则：不兑换 Code；
不消费 identity result；不把返回的 error context 当作自己原始 Transaction 的可信
结果。

## Step 6 · 处理 Authorization Code

```text
Authorization Code  ≠  Access Token
Authorization Code  ≠  Actor Credential
Authorization Code  ≠  AuthSession
```

Authorization Code 只是**当前 Protocol Transaction 中的 bounded continuation
artifact**，它不是 Resource Credential，也不代表 ActorIdentity。

按照 Authorization Code Contract，已经成功消费、expired 或 invalid 的 Code 不能被
继续当成新的合法 Exchange Input。因此：

```text
Expected Second-use Rejection
≠
Server Instability
```

如果第一次合法使用成功、第二次失败，这可能正是 single-use protection 正常工作。

Authorization Code 以及 transaction verifier 等敏感协议材料，不应进入普通 Log、Audit
或公开 debug output。

## Step 7 · Exchange the Authorization Code

只有当前 Transaction 已经可信关联以后，Client 才进入 Token Exchange。语义上，Current
Authorization Code Profile 可能需要：

```text
grant_type = authorization_code
authorization code
registered redirect context
PKCE verifier, where required
Client Authentication, where required
```

Exact wire representation 由 Current Token Endpoint Contract 定义。再次保持：

```text
PKCE                  → transaction continuation binding
Client Authentication → software Client authentication
Actor Authentication  → Actor authentication
```

### Token Endpoint Success 不等于 Verified Identity

Token Endpoint 返回成功，只说明当前 Protocol Exchange 产生了一份 Current Contract
定义的 Token Response：

```text
Token Response Success
≠
Verified OIDC Authentication Result
```

Client 还必须按照 Current OIDC Contract 完整验证 ID Token。

### ID Token 与 Access Token 分开

```text
ID Token      ≠  Access Token
Access Token  ≠  JWT by definition
```

ID Token 承担 OIDC Authentication Result；Access Token 承担当前 Protected Resource
Contract 定义的访问能力。不要把 ID Token 拿去调用普通 Resource API。Access Token
如何验证见 [验证 Token](./verify-tokens)。

## Step 8 · 完整验证 ID Token

Client 应该使用已经预先信任的 SoulAuth Issuer、该 Issuer 声明的 metadata / key
information、成熟且受维护的 OIDC Client Library，完成 Current Profile 要求的 ID Token
Validation。不能：

```text
base64 decode → read claims → trust identity
```

```text
ID Token Decoded
≠
ID Token Validated
```

### 代表性的 Validation Requirements

完整要求由适用 OIDC 规范与 Current SoulAuth OIDC Profile 共同决定。常见关键验证包括
适用的：

```text
signature / allowed key and algorithm
issuer
audience
expiration / time semantics
nonce, when used
other required OIDC context
```

任何 security-critical validation 失败，当前 ID Token 不能形成可信 OIDC
Authentication Result。而且：

```text
Valid Signature
≠
Valid OIDC Authentication Result
```

一个 signature 验证成功，不足以证明 Issuer 正确、Audience 正确、Artifact 仍然有效，
也不足以证明它属于当前 Authentication Transaction。

## Step 9 · 建立 Issuer-scoped OIDC Subject Context

ID Token 完成验证以后，Client 才开始消费经过验证的 OIDC Claims。其中 `sub` 表达的是
**OIDC Subject Identifier**，但它必须始终在**对应 Issuer / Subject Policy
Namespace** 中理解：

```text
Trusted Issuer Context
+
Validated `sub`
        ↓
OIDC Subject Context
```

而不是：

```text
bare `sub` → global Actor ID
```

### OIDC `sub` 不等于 ActorIdentity Resource ID

```text
OIDC `sub`
≠
ActorIdentity Resource ID
```

ActorIdentity Resource ID 属于 SoulAuth Identity Domain resource namespace；OIDC
`sub` 属于 OIDC subject namespace。它们即使在某个实现中存在 mapping，也不能未经
Contract 直接 cast。

### OIDC `sub` 不等于 Stable Subject Foundation

```text
OIDC `sub`
≠
Stable Subject Foundation
```

Stable Subject Foundation 是 ActorIdentity continuity 的 semantic primitive，它不自动
成为 Public OIDC Field、Public Resource Identifier 或 Persistence Key。因此本篇不声明
"OIDC `sub` 建立在 Stable Subject Contract 上"，也不使用 `sub → stable Actor subject`
这样的表达。

### OIDC Subject 至少需要 Issuer Context

```text
OIDC Subject = Issuer Context + `sub`
```

```text
Issuer A, sub = "123"
Issuer B, sub = "123"
```

不能只因为字符串相同就自动解释成同一个 Identity。

### `sub` 的稳定性只在它自己的 Subject Contract 中理解

"Stable"不能被解释成：同一个 Actor 面对所有 Client、所有 Consumer、所有 Issuer 永远
暴露同一个公共 Identifier。Current OIDC Profile 可能具有自己的 public / pairwise、
consumer / sector、privacy、reuse semantics。因此：

> **`sub` 的稳定性与可复用范围只由 Current OIDC Subject Contract 定义。**

### Mutable Profile Claim 不替代 Subject Identity

```text
Mutable Profile Attribute
≠
OIDC Subject Identity
```

Email、Username、Display Name 及其它 mutable profile attribute，不应该被 Client 自行
拿来替代 OIDC subject identity。

### ID Token Validation 不创建 ActorIdentity

Client 完成 ID Token Validation，不会在 Client 侧创建新的 SoulAuth ActorIdentity。
它完成的是：**Client 现在可以信任 SoulAuth 在这个 Issuer-scoped OIDC Subject
Contract 中的 Authentication Result。** ActorIdentity 本身继续属于 SoulAuth Identity
Domain。

## Failure Semantics

所有失败可以压缩成三个 Stage。

**1 · Transaction Association Failure** —— Current Response 不能可信关联到原始
Authorization Transaction。结果：`Reject Transaction`，不要进入 Code Exchange。

**2 · Exchange Failure** —— 当前 Contract 要求的 Code lifecycle、Client binding、
redirect binding、PKCE、Client Authentication 没有成立。结果：`Reject Exchange`。
Exact OAuth Error 由 [OIDC 与 Client](../reference/oidc-and-clients) 定义。

**3 · OIDC Authentication-result Validation Failure** —— ID Token 无法完成 Current
OIDC Profile 要求的 validation。结果：`Do Not Trust the Authentication Result`。

### Fail Closed 只针对当前不可信 Transaction

```text
Required Trust Condition Failed
        ↓
Current Transaction must not continue as trusted success
```

这不意味着一个 Transaction 失败就停止整个 SoulAuth Service。Fail Closed 的意思是：
**当前 Transaction 建立 Trust 所需的 security-critical condition 失败时，不能把
Unknown / Failed State 降级成 success。**

## Expected Result

Authorization Code Flow 完成以后，Client 能够说的是：

> **我已经验证了这个 Authorization Transaction，并按照受信任 Issuer 与 Current OIDC
> Contract 获得了一份 Verified OIDC Authentication Result。**

```text
Trusted Issuer
        + Validated Transaction
        + Valid Code Exchange
        + Validated ID Token
        + Issuer-scoped `sub`
        ↓
Verified OIDC Authentication Result
```

它不是 ActorIdentity Resource 本身，也不是 Universal Authority。

## Complete Flow

```text
Client                    Browser                   SoulAuth
  │                          │                         │
  │ prepare applicable       │                         │
  │ transaction state        │                         │
  │                          │                         │
  │──── Authorization ──────▶│──── Authorization ─────▶│
  │                          │                         │
  │                          │◀─ establish / reuse ───▶│
  │                          │   actor authentication  │
  │                          │                         │
  │◀──── response / code ────│◀──── Redirect ──────────│
  │                          │                         │
  │ validate transaction     │                         │
  │                          │                         │
  │──── code exchange + applicable transaction ───────▶│
  │     / client-auth inputs │                         │
  │                          │                         │
  │◀──────────── Token Response ───────────────────────│
  │                          │                         │
  │ validate ID Token        │                         │
  │ establish issuer + sub   │                         │
  ▼
Verified OIDC Authentication Result
```

这只是 Authorization Code Flow 的 local explanatory diagram，不是新的 Canonical
Architecture Figure。它也不定义 Browser Token Storage、Cookie、Application Session、
CSRF、BFF Architecture —— 这些进入 [浏览器与 BFF](./browser-and-bff)。

## Authorization Code Flow at a glance

| Boundary | Meaning |
| --- | --- |
| **Authorization Code ≠ Access Token** | Code 只延续 Protocol Transaction |
| **Authorization Code ≠ Actor Credential** | Code 不证明 Actor 身份 |
| **Authorization Code ≠ AuthSession** | Protocol continuation 与 Authentication continuity 分离 |
| **PKCE ≠ Client Authentication** | Transaction binding 与 Client identity 不同 |
| **Client Authentication ≠ Actor Authentication** | 软件与 Actor 的 Authentication 分离 |
| **Authorization Response Received ≠ Trusted Transaction** | Callback arrival 不建立 Trust |
| **Token Response Success ≠ Verified Authentication Result** | Exchange 成功后仍需 ID Token Validation |
| **ID Token Decoded ≠ ID Token Validated** | 可解析不等于可信 |
| **Valid Signature ≠ Valid OIDC Authentication Result** | Signature 只是完整 Validation 的一部分 |
| **ID Token ≠ Access Token** | Authentication Result 与 Resource Access 分离 |
| **Access Token ≠ JWT by definition** | Representation 由 Token Contract 定义 |
| **OIDC `sub` ≠ ActorIdentity Resource ID** | 两个 Identifier Namespace 不能隐式 cast |
| **OIDC `sub` ≠ Stable Subject Foundation** | Continuity primitive 不是 OIDC public identifier |
| **Mutable Profile Attribute ≠ OIDC Subject Identity** | Email / display name 不能替代 subject |
| **OAuth / OIDC Authorization ≠ Cross-domain Authority** | Protocol 完成不会产生 Universal Authority |

整个 Flow 最终可以压缩成：

```text
Trust the Issuer
        ↓
Prepare transaction state
        ↓
Send authorization request
        ↓
Establish / reuse Actor authentication
        ↓
Validate authorization response
        ↓
Exchange authorization code
        ↓
Validate ID Token
        ↓
Interpret `sub` inside the trusted Issuer namespace
        ↓
Verified OIDC Authentication Result
```

## If the Flow fails

| Stage | First place to look |
| --- | --- |
| **Cannot establish transaction association** | Client transaction state / Current OAuth profile |
| **Authorization request rejected** | Client / redirect / request contract |
| **Actor authentication cannot be established** | [认证与会话](../reference/authentication-and-sessions) |
| **Code exchange rejected** | transaction / code / client / PKCE contract |
| **ID Token validation fails** | [OIDC 与 Client](../reference/oidc-and-clients) / trusted issuer / validation profile |
| **Authentication 成功但 API 失败** | [验证 Token](./verify-tokens) / Resource Contract |

进一步诊断见 [故障排查](../operate/troubleshooting)。

## 下一步

如果 Browser 进入你的 Application Security Boundary，进入
[浏览器与 BFF](./browser-and-bff)；如果 Backend / Resource Server 需要验证 Access
Token，进入 [验证 Token](./verify-tokens)；如果需要查看完整 Client、Metadata、
Scope、Subject、Token 或 PKCE Exact Contract，进入
[OIDC 与 Client](../reference/oidc-and-clients)。

## Exact Contract Source

本篇拥有 **Authorization Code + PKCE Procedure**。

它不自行定义 whether this profile is currently supported、whether state is mandatory、
whether nonce is mandatory、which PKCE methods are supported、whether S256 is
required、exact authorization endpoint、exact token endpoint、exact HTTP request
encoding、exact Client Authentication Method、exact Token Response fields、Refresh
Token support、ID Token algorithm profile、OIDC subject policy、UserInfo support。

这些 Exact 事实必须来自 External OAuth / OIDC Normative Specifications、
[OIDC 与 Client](../reference/oidc-and-clients)、Machine-readable Protocol Contract、
[项目状态](../project/status)。Guide 只说明**怎样正确使用 Current Declared
Profile**。
