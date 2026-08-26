# Choose an Integration Path

## Choosing where to enter SoulAuth

You do not need to decide "which kind of SoulAuth application is my product". Three
questions are more useful:

> **Who needs to be authenticated?**
>
> **Where does authentication enter your system?**
>
> **Which consumer finally uses the trusted result authentication establishes?**

Those decide which set of documents to start from.

```text
Integration Path  ≠  Actor Type
Integration Path  ≠  Whole-system Classification
Integration Path  ≠  Deployment Topology
Integration Path  ≠  Current Support Claim
```

An integration path is an **engineering and documentation entry point.** It is not new
SoulAuth ontology. Which client profiles, protocol flows, authentication methods and
integration surfaces the release actually supports comes from the corresponding references
and [Project Status](../project/status).

## 1 · A 60-second choice

| If your main problem is | Start from |
| --- | --- |
| **You own the browser authentication boundary** | **Web application** |
| **You mainly protect a backend/API and must validate incoming requests** | **Backend / API** |
| **An existing application already supports the OIDC profile this release declares** | **OIDC client** |
| **An AIActor itself needs an independent identity and to be authenticated as itself** | **AI / agent system** |
| **SoulseedOS needs to consume the authentication context SoulAuth establishes** | **SoulseedOS** |

These five are not mutually exclusive product types. A real system may pick
`Web Application + Backend / API`, or
`Web Application + AI / Agent System + Backend / API`.

## 2 · Web application

### When you own the browser authentication boundary

The test is not "my product has web pages". It is:

> **Has the browser entered an authentication boundary you are responsible for?**

That is, you handle redirects, browser sessions, application sessions, cookies, CSRF,
OAuth token exposure, BFF and similar browser runtime problems yourself.

**Start here**, usually in this order of responsibility:

```text
Register a Client
        ↓
Authorization Code Flow
        ↓
Browser & BFF
```

This documentation path does not announce that the release supports every browser profile.
Current support for authorization code, PKCE, BFF or a browser-based OAuth client is
defined by the protocol references and [Project Status](../project/status).

If the web application also has backend APIs to protect, combine the **Backend / API**
path.

## 3 · Backend / API

### When you own the resource server boundary

If your core problem is not "how do I complete a browser login" but:

> **how can an API decide trustworthily whether the access context in this request may be
> accepted?**

start from **Backend / API.** This path covers how a resource server validates a request
under a declared token contract, how it confirms resource applicability, and how it hands
a validated token context to application authorization.

```text
Token Appearance  ≠  Validation Contract
Access Token      ≠  JWT by definition
```

A backend must not read SoulAuth's private persistence to determine identity, and must not
guess a token's semantics from what it looks like.

**Start here:** [Verify Tokens](../integrate/verify-tokens).

If permissions or business authority follow token validation, use the application's own
authorization model. A valid token is not an authorized action.

## 4 · OIDC client

### When an existing application already speaks OIDC

If your application can already integrate with an identity provider using the OIDC profile
this release declares, prefer **reusing the public protocol contract.** Do not design a
SoulAuth-specific private identity integration just because you are adopting SoulAuth:

```text
Existing supported OIDC integration  → Prefer declared public protocol
Existing supported OIDC integration  → Read SoulAuth private persistence   ← no
```

**Start here:** [Register a Client](../integrate/register-a-client), then
[OIDC & Clients](../reference/oidc-and-clients). If the profile uses the authorization
code flow, continue to
[Authorization Code Flow](../integrate/authorization-code-flow). If you also own a browser
runtime boundary, read [Browser & BFF](../integrate/browser-and-bff).

This page does not decide which OIDC flows are currently supported.

## 5 · AI / agent system

### When the AIActor itself must be an identity subject

Using AI, an LLM or an agent framework does not automatically require this path. The real
test is:

> **Does this AIActor itself need to be stably represented, authenticated and attributed
> as itself?**

If the AI is only a capability inside an application, you may not need an independent
AIActor identity at all. If the AIActor must hold its own ActorIdentity, identity
continuity and authentication context, choose **AI / agent system.**

### Keep Client and AIActor separate

An agent application may be a client. An AIActor remains an Actor Kind:

```text
Client
≠
AIActor
```

An agent application working on behalf of an AI does not make its OAuth client identity
the AIActor identity. Which AIActor authentication methods the release supports is defined
by [Authentication & Sessions](../reference/authentication-and-sessions) and
[Project Status](../project/status). **The path existing does not mean an AI machine-auth
protocol is currently supported.**

**Start here:**

```text
AI-native Identity
        ↓
Actor Identity Model
        ↓
Authentication & Sessions
```

If the AIActor is ultimately consumed through a backend/API, combine the **Backend / API**
path.

## 6 · SoulseedOS

### When SoulseedOS consumes a SoulAuth authentication context

The question is not "how does SoulseedOS become part of SoulAuth" but:

> **how does SoulseedOS safely consume the bounded authentication context SoulAuth has
> established?**

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

SoulAuth proves whether Actor authentication holds under its contract. SoulseedOS goes on
to decide what that Actor may do in its own runtime and governance domain.

**Start here:** [Soulseed Integration](../integrate/soulseed). To understand why the three
systems divide responsibility this way, see
[Soulseed & Mind OS](../spec/soulseed-and-mind-os). To understand why authentication
cannot produce authority directly, see
[Identity vs Authority](../spec/identity-vs-authority).

This page does not use a linear model like
`Canonical Actor → SoulAuth → Authenticated Identity → SoulseedOS`, which blurs ontology
ownership.

## 7 · Paths compose

Do not ask "which single type does my system belong to". Ask:

> **which distinct integration boundaries does my system have?**

**Web SaaS** may need `Web Application + Backend / API` — the browser owns user interaction
and the application session boundary; the backend owns the resource server boundary.

**A human + AIActor product** may need
`Web Application + AI / Agent System + Backend / API`, because humans enter through a
browser, the AIActor needs its own ActorIdentity, and the backend must consume a validated
request context.

```text
Integration Path
≠
Whole-system Classification
```

## 8 · Quick decision tree

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

These are not mutually exclusive `if / else` branches. **Select all that apply.**

## Choose an integration path at a glance

| Boundary | Meaning |
| --- | --- |
| **Path ≠ Actor type** | An engineering entry point is not identity ontology |
| **Path ≠ Whole-system classification** | One system may combine several paths |
| **Path ≠ Current support claim** | Documentation existing is not a release capability |
| **Client ≠ Actor** | A software participant is not the authenticated subject |
| **AI-enabled product ≠ AIActor identity requirement** | Using AI does not require an independent AIActor |
| **OIDC-capable application → prefer the public contract** | Avoid private coupling where a standard exists |
| **Authentication ≠ Application authority** | An authentication result is not a business right |
| **Authentication ≠ Soulseed governance authority** | SoulseedOS keeps its own decision |

## Documented path and current support are separate

```text
Documented Integration Path
≠
Current Supported Surface
```

A path tells you **where to read if you face this class of integration problem.**
[Project Status](../project/status) tells you **what the release supports today.**

The documentation can have an AI / agent system path because AIActor identity is a real
architectural problem — that does not prove the release supports a specific AI
cryptographic authentication method today. A web application path existing does not prove
BFF, browser-based OAuth clients or refresh tokens are all currently supported.

## Next

If you just want to get the current release running and obtain a first verifiable result,
go to [Quickstart](./quickstart). If your integration boundary is already clear, go
straight to the matching path above.

This page asks you to settle only three things:

> **Who needs to be authenticated? Where does authentication enter? Who consumes the
> trusted result?**

## Exact semantic ownership

This page owns the **integration decision logic, path labels, path composition and
document routing.**

It does not define the browser protocol profile, authorization code support, PKCE
requirements, BFF support, browser-based client support, access token representation, the
OIDC client profile, AIActor authentication methods, the Soulseed AuthContext schema or
current feature support. Those belong to the integration guides,
[Authentication & Sessions](../reference/authentication-and-sessions),
[OIDC & Clients](../reference/oidc-and-clients), the machine-readable contracts and
[Project Status](../project/status).

```text
Path Selection  ≠  Protocol Definition
Path Selection  ≠  Release Capability Declaration
```
