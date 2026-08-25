# 注册 Client

## 注册一个可以进入 SoulAuth Protocol Flow 的软件 Client

在 Human 或 AIActor 通过 Application 进行 Authentication 以前，SoulAuth 首先需要
知道：

> **哪个软件正在参与协议？**

在 OAuth / OpenID Connect 中，这个软件参与方称为 **Client**。因此首先保持：

```text
Client
≠
Actor
```

Actor 回答**谁正在被认证**；Client 回答**哪个软件正在与 SoulAuth 建立协议关系**。

所以，注册 Client 不会创建 Human、不会创建 AIActor、不会创建 ActorIdentity，也不会
自动完成任何 Actor Authentication。它只完成一件事：

> **让一个软件 Client 按照 Current Release 支持的协议与安全边界，准备好进入后续
> Flow。**

## Before you start

**1 · 你知道哪个软件才是真正的 Client。** Browser Application、BFF / Server
Application、Installed Application、Agent Application 中，哪一个组件真正与 SoulAuth
参与协议？不要因为一个 Application 服务 AIActor，就把 Application 本身当成 AIActor
—— AI / Agent 是一种应用场景，它不会创造新的 OAuth Client ontology。

**2 · 你知道 Client 实际运行在哪里。** 真正重要的问题不是"它服务 Human 还是
AIActor"，而是**这个软件运行在哪个 Trust Boundary 中，它是否能够可靠保护 Client
Authentication Material**。

```text
Client Security Boundary
≠
Actor Kind
```

**3 · 你知道它准备使用什么 Current Supported Protocol Path。** Client Configuration
必须与 Current Release 真正支持、并且这个 Application 实际需要的 Protocol Profile
一致。不要为了"以后可能会用"注册额外 capability。Exact OAuth / OIDC Profile 继续由
[OIDC 与 Client](../reference/oidc-and-clients) 定义。

**4 · 你已经知道 Redirect Boundary**（如果当前 Flow 需要 Redirect）——
Authentication / Authorization 完成后，协议结果应该安全返回到哪里。

**5 · 你拥有创建 Client 所需的 Administrative Authority。** Client Registration 属于
Administrative / Control Plane Operation，它不是普通 Actor Authentication 之后自动
获得的能力：

```text
Registered Actor
≠
Permission to Register Clients
```

Exact Permission / Role / Authority 由 [管理](../reference/administration) 与 Current
Permission Contract 定义。

## Step 1 · Identify the Client security model

| Runtime Boundary | 对长期 Client Authentication Material 的合理假设 |
| --- | --- |
| **Server-controlled runtime / BFF** | 可能建立可靠 Secret Custody Boundary |
| **Browser / user-controlled runtime** | 不应假设可以长期保守 confidential secret |
| **Installed / user-controlled runtime** | 不应仅因为"不是 Browser"就假设 secret 能够可靠保密 |
| **Agent runtime** | 取决于真实 Deployment Boundary |

这个表只是帮助你理解 Client security assumptions，它不意味着 SoulAuth API 中存在
`client_type = browser` 或 `client_type = agent` 之类 Canonical Enum。

Public / Confidential 等 Client classification 描述的是 **Protocol Security
Assumption**，不是 Actor Kind，也不是 Universal Trust Level。

## Step 2 · Prepare the Client configuration

Exact 字段名称、wire format 和 registration schema 由
[OIDC 与 Client](../reference/oidc-and-clients) + Current Machine-readable Contract
定义。从语义上，你通常需要确认以下几类信息。

### Client identity / metadata

首先回答：**哪个软件正在被注册？** Client Contract 需要建立这个 software participant
所需的 resource / protocol identity。但必须保持：

```text
OAuth `client_id`  ≠  ActorIdentity
OAuth `client_id`  ≠  Internal Client Resource ID by definition
```

是否同时存在内部 Client Resource Identifier 与 OAuth `client_id`，由 Current Client
Contract 定义。本篇不会通过"Client Identifier"这个模糊词把不同 Namespace 合并。

## Step 3 · Configure the Redirect Boundary（if applicable）

对于 redirect-based flow，需要明确：**SoulAuth 的 Protocol Response 允许返回到
哪里？**

```text
Redirect URI
≠
Arbitrary Application Return URL
```

Registered Redirect URI 是 **Protocol Security Boundary**，它不应该变成任意
Application 页面跳转器。例如 Application 内部可能拥有 `return_to=/projects/123`，
这回答"登录完成以后 Application 内部希望去哪里"，它和 OAuth / OIDC Redirect Boundary
是两个不同问题。

Exact Redirect Matching Rule 不在本篇定义。不要自行增加 prefix matching、custom
normalization、wildcard 或其它 Current Contract 没有声明的行为。

## Step 4 · Select only the required protocol capabilities

Client Configuration 应该只包含当前 Application 真正使用，并且 Current Release 正式
支持的 Protocol Capability。例如某个 Current Profile 如果使用 Authorization Code、
PKCE、Client Authentication、特定 redirect model，则 Client 需要满足对应 Contract。

但本篇不重新定义 grant type、response type、OAuth `scope`、claim mapping、client
authentication method、PKCE applicability。

## Step 5 · Register through the supported administrative interface

Client 不能通过直接修改 SoulAuth private persistence 完成注册：

```text
Client Registration
≠
Direct Persistence Mutation
```

正确路径是使用 Current Release 正式支持的 Administrative / Control Plane Contract
创建 Client。这样 Client Registration 才能经过适用的 validation、administrative
authority、security policy、audit、lifecycle invariants。

### Initial provisioning（only if the Current Release provides it）

某些 Deployment 可能存在 initial provisioning / bootstrap path。如果 Current Release
确实提供这种能力，使用它自己的正式 Contract。但必须继续保持：

```text
Being the first registered Client
≠
Administrative Authority
```

Client 的创建顺序不会让这个 Client 自动成为 Administrator；同样，initial
provisioning 也不能成为绕过 Control Plane Domain Rules 的永久替代入口。本篇不假设
Current Release 一定拥有 Bootstrap 机制。

## Step 6 · Protect Client Authentication Material（if the method uses it）

某些 Client Contract 可能要求 Client Authentication Material。它究竟采用什么形式、
谁生成、是否一次性显示、怎样注册、怎样 rotate / replace，由 Current Client
Authentication Contract 定义。本篇只锁住几个长期不变的边界。

### Client Authentication Material 不等于 Actor Credential

```text
Client Authentication Material
≠
Actor Credential
```

Client Authentication Material 证明**哪个 software Client 正在参与协议**；Actor
Credential 证明**哪个 Actor 正在 Authentication**。即使二者出现在同一个 Flow 中，
仍然不能合并。

### Public Environment 不应该伪装成 Confidential Environment

如果某个 runtime 无法可靠保护长期 secret，不要因为协议配置方便，就把一个 long-lived
confidential secret 硬编码进去：

```text
Unable to protect Client Authentication Material
≠
Permission to embed it anyway
```

需要保密的 Client Authentication Material 不应进入 browser bundle、public
repository、ordinary logs 或无法建立适当 secret boundary 的 distributable client
artifact。具体应该采用什么 Client Authentication Method 由 Current Client Profile
决定。

### Client Authentication Material 拥有自己的 Lifecycle

```text
Client Authentication Material Lifecycle
≠
Actor Credential Lifecycle
```

改变 Client Authentication Material 不会自动改变任何 Human 或 AIActor Credential。
Exact Client Material lifecycle 操作继续由
[OIDC 与 Client](../reference/oidc-and-clients) 和
[管理](../reference/administration) 定义。

## Step 7 · Verify the registration

创建完成以后，真正要确认的不是"Database 里是不是多了一条 record"，而是：

> **这个 Client 是否已经按照预期 Security Boundary 与 Current Protocol Contract
> 准备好参与后续 Flow？**

- [ ] Registration 被 Current Administrative Contract 接受。
- [ ] Current Client Contract 要求的 resource / protocol identity 已经建立。
- [ ] Redirect Configuration 与真实 Application Boundary 一致，在适用时。
- [ ] Client Security Model 与真实 runtime 环境匹配。
- [ ] Requested Protocol Capabilities 都属于 Current Supported Surface。
- [ ] Client Authentication 配置已经正确建立，在适用时。
- [ ] 任何 Client Authentication Material 已经进入正确 Custody Boundary，在适用时。

验证可以使用 registration result，或 Current Release 提供的受支持 administrative
read / inspection surface（如果存在）。本篇不假设一定存在独立 Client Inspection
Endpoint。

## Expected result

> **Client is ready for protocol flow.**

它不意味着 Human 已经 Authentication、AIActor 已经 Authentication、Client 获得
Administrative Authority、Application 拥有 Resource Authority。因此：

```text
Client Registration Success
≠
Actor Authentication Success
```

## If registration fails

不要从 Database 开始排查，先判断失败发生在哪个 Boundary。

| Failure | First place to check |
| --- | --- |
| **Administrative operation rejected** | Current caller authority / [管理](../reference/administration) |
| **Registration payload rejected** | Current Client Contract / machine-readable schema |
| **Redirect rejected** | Registered Redirect Contract |
| **Requested capability rejected** | Current Supported Protocol Profile |
| **Client Authentication configuration rejected** | Current Client Authentication Method |
| **Registration 成功但后续 protocol flow 失败** | [授权码流程](./authorization-code-flow) / [OIDC 与 Client](../reference/oidc-and-clients) / [故障排查](../operate/troubleshooting) |

## Client Registration 不创建 Administrative Authority

```text
Registered Client
≠
Administrative Authority
```

Client 是 software / protocol participant；Authority 是 domain-scoped governance
relationship。这两个概念没有因为 Client 成功注册而合并。

## Client Registration 也不改变 ActorIdentity Lifecycle

```text
Client Lifecycle
≠
ActorIdentity Lifecycle
```

Registration 只建立 Client lifecycle 的起点。一个 Application 被替换或停用，不意味着
曾经通过它 Authentication 的 ActorIdentity 应该被删除；一个新的 Agent Application 被
注册，也不会要求重新创建原 AIActor。Exact Client lifecycle 由
[OIDC 与 Client](../reference/oidc-and-clients) /
[管理](../reference/administration) 定义。

## Register a Client at a glance

| Boundary | Meaning |
| --- | --- |
| **Client ≠ Actor** | 软件参与协议，Actor 才是被 Authentication 的主体 |
| **Client Security Model ≠ Actor Kind** | Client 安全假设来自真实运行环境 |
| **Public / Confidential ≠ Trust Level** | 描述 Client Credential Custody 能力 |
| **OAuth `client_id` ≠ ActorIdentity** | Protocol Client identifier 不能冒充 Actor 身份 |
| **Client Authentication ≠ Actor Authentication** | 软件 Authentication 与主体 Authentication 分开 |
| **Client Authentication Material ≠ Actor Credential** | 两种 Credential 属于不同关系 |
| **Redirect URI ≠ arbitrary return URL** | Redirect 是 Protocol Security Boundary |
| **Client Registration ≠ Direct Persistence Mutation** | Client 必须通过 Supported Administrative Contract 创建 |
| **Registered Client ≠ Administrative Authority** | 软件被注册不会自动获得管理权 |
| **Client Lifecycle ≠ ActorIdentity Lifecycle** | Application 变化不会重建 Actor |
| **Registration Success ≠ Actor Authentication Success** | 本页结束时只是软件准备完成 |

整篇最终可以压缩成：

```text
Identify the software Client
        ↓
Identify its real runtime boundary
        ↓
Prepare Current Client configuration
        ↓
Register through supported administration
        ↓
Protect client-auth material if applicable
        ↓
Verify effective Client configuration
        ↓
Client ready for protocol flow
```

## 下一步

如果 Current Client Profile 使用受支持的 Authorization Code path，进入
[授权码流程](./authorization-code-flow)；如果当前 Application 运行在 Browser / BFF
边界，进入 [浏览器与 BFF](./browser-and-bff)；如果需要查看 Exact Client、Redirect、
OAuth / OIDC Protocol Contract，进入 [OIDC 与 Client](../reference/oidc-and-clients)；
如果需要进行 Client mutation、authority 或 lifecycle administration，进入
[管理](../reference/administration)。

## Exact Contract Source

本篇拥有 **Client Registration Procedure**。

它不自行定义 exact registration endpoint、CLI command、Admin API path、bootstrap
mechanism、Client resource schema、OAuth `client_id` generation、public /
confidential wire enum、Client Authentication Method、Client Secret issuance、PKCE
applicability、Redirect matching algorithm、inspection endpoint。这些 Exact 事实必须
来自 [OIDC 与 Client](../reference/oidc-and-clients)、OpenAPI / Machine-readable
Contract、[管理](../reference/administration)、[项目状态](../project/status)。因此：

> **Guide 里出现一个合理的 Client 模式，不代表 Current Release 已经 Support 它。**
