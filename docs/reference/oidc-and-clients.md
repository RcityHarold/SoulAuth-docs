# OIDC & Clients

## How SoulAuth maps ActorIdentity and authentication into OAuth / OpenID Connect

Two more basic questions are already answered.
[Actors & Profiles](./actors-and-profiles) defines who an Actor is and how ActorIdentity
persists. [Authentication & Sessions](./authentication-and-sessions) defines how an Actor
is authenticated and how established authentication continues under bounded conditions.

This page does not redefine those facts. It covers:

> **how a Client participates in standard protocol transactions through OAuth/OpenID
> Connect, and how established identity and authentication facts are projected into the
> corresponding protocol contract.**

```text
OAuth / OIDC
≠
SoulAuth Actor Ontology
```

OAuth/OIDC own their protocol semantics. SoulAuth keeps its Actor-native identity
semantics. The two connect through an explicit mapping — they do not rewrite each other.

## 1 · A Client is a protocol participant, not an Actor

An OAuth Client is **the software entity participating in the OAuth protocol.** It
answers *which software is participating in this protocol transaction*, while
ActorIdentity answers *who the identity subject is*:

```text
Client
≠
Actor
```

One Actor may participate through different clients; one client may serve many Actors.
There is no one-to-one identity relation.

### `client_id` is not an Actor identifier

```text
OAuth `client_id`  ≠  ActorIdentity Resource ID
OAuth `client_id`  ≠  Internal Client Resource ID by definition
```

Even where an implementation's values coincide, a consumer must not read that equality
as long-term namespace equivalence without a formal contract.

### Client authentication is not Actor authentication

Client authentication proves **which client's authentication contract the caller
satisfied.** Actor authentication proves **who the authenticated Actor is.**

```text
Client Authentication
≠
Actor Authentication
```

A confidential client completing client authentication does not produce an Actor
authentication result. Conversely, an Actor authenticating does not prove the client met
its own client authentication requirement.

## 2 · A Client contract has several independent dimensions

A client is not a `client_id + secret` object. At minimum:

| Dimension | The question it answers |
| --- | --- |
| **Protocol registration / identifier** | Which client is participating? |
| **Confidentiality classification** | Can this client reliably hold client authentication material under the current profile? |
| **Integration profile** | Which application architecture does it live in? |
| **Protocol capabilities** | How may it participate under the declared profile? |

These relate; they do not substitute.

### Public / confidential is not an Actor Kind

`Public` and `confidential` are **client confidentiality classifications.** They do not
describe an Actor:

```text
Public Client        ≠  AIActor
Confidential Client  ≠  Human
Confidential Client  ≠  Trusted or benign by definition
```

They describe client authentication assumptions, nothing more.

### Confidentiality is separate from integration architecture

Browser, native, BFF and server-side application describe an
application/integration architecture:

```text
Public / Confidential
≠
Browser / Native / BFF
```

In some BFF architectures the browser does not hold OAuth client credentials at all — a
backend component takes the client role. Which integration profiles are in the current
supported surface is stated by the integration documents and
[Project Status](../project/status).

### Client authentication material is not an Actor credential

```text
Client Authentication Material
≠
Actor Credential
```

They have different subjects, lifecycles, security boundaries and audit meanings.
Rotating or revoking client authentication material does not change any Actor credential.

## 3 · An authorization request has several independent preconditions

An OAuth/OIDC authorization request is not "the client is valid, so the request
succeeds". It involves at least:

```text
Client Protocol Context
+ Applicable Actor Authentication
+ OAuth Authorization / Grant Semantics
```

```text
Valid Client         ≠  Valid Authorization Request
Valid AuthSession    ≠  Authorization Success
Authenticated Actor  ≠  OAuth Authorization Grant
```

Every layer must satisfy its own contract.

### Accepting a parameter is not enforcing it

```text
Parameter Accepted
≠
Parameter Semantics Enforced
```

A server that accepts a security-relevant parameter and silently ignores its meaning
lets clients build trust on a false premise. Therefore:

> **A security-relevant parameter the declared profile claims to support must actually
> enforce the protocol semantics it declares.**

Which authorization parameters the current release accepts is defined by the current
declared profile.

### `state`, `nonce` and AuthSession are different objects

```text
state  ≠  nonce  ≠  AuthSession identifier
```

Their exact generation, return, validation and applicability follow the external
specification and SoulAuth's declared profile. This page does not redefine them as
SoulAuth identity objects.

## 4 · An existing AuthSession only reuses authentication

An existing AuthSession may supply already-established Actor authentication context to a
new authorization transaction where protocol and policy allow. But:

```text
Authentication Reuse  ≠  Authorization Reuse
Existing AuthSession  ≠  Automatic Authorization Success
```

AuthSession answers *does Actor authentication need to be established again?* It does not
answer *is this client entitled to complete the whole authorization transaction?* The new
transaction has its own client, protocol, scope, security and authorization context.

### SSO does not create cross-client permission

```text
SSO
≠
Cross-client Permission Reuse
```

Client A having completed an authorization flow gives client B no scope, grant,
permission or application authority. SSO reuses authentication, not client authorization.

## 5 · Three time layers in an authorization transaction

```text
T_auth       Authentication established
T_authorize  OAuth authorization facts established
T_issue      Protocol artifact issued
```

```text
Authentication Time  ≠  Authorization Time  ≠  Token Issuance Time
```

They may be close together. Their meanings differ.

**Authentication-time facts** belong to the upstream authentication: ActorIdentity,
authentication time, method/composition, assurance/freshness. They must not be reinvented
later at issuance.

**Authorization-time facts** belong to the current OAuth transaction: client context,
redirect context, request context, granted scope, applicable transaction protection,
Actor resolution and the OAuth authorization result. They define **what this transaction
is.**

**Issuance-time projection** may, when a new protocol artifact is actually signed,
project applicable non-core data under the declared claim/token projection contract. But:

```text
Issuance-time projection
≠
Permission to rewrite authentication or authorization history
```

## 6 · Historical transaction facts are not rewritten by current state

An established authorization transaction must not be reinterpreted because the current
profile, client configuration or IdentityBinding changed later:

```text
Current Client Configuration
≠
Historical Authorization Transaction
```

### Actor resolution must not be swapped in a later exchange

This is one of the most important boundaries when Actor-native identity meets OAuth.
Suppose authorization-time Actor resolution established:

```text
External Identity → ActorIdentity A
```

and an outstanding transaction artifact exists. The IdentityBinding later changes. A
continuation may, based on current security eligibility, **reject** the transaction. It
must never reinterpret a transaction that belonged to Actor A as belonging to Actor B and
then succeed:

```text
Authorization-time Actor Resolution
≠
Re-resolved into another Actor from current binding state
```

This is **historical fact separated from current eligibility.**

## 7 · Transaction facts, current eligibility and projection state

**Transaction-defining facts** — once the transaction holds, later stages must not
quietly reinterpret them: client, Actor resolution, authentication time, granted scope,
transaction protection context.

**Current security eligibility** — a later continuation may still re-check whether the
artifact expired, was consumed, whether the client is still eligible, whether Actor
lifecycle allows it, whether current security state demands rejection. These checks may
produce a **reject**. They may not produce a **rewrite of history.**

**Issuance projection state** — a new artifact may use currently permitted non-core data
under the declared projection policy. Presentation data may change; current presentation
never changes a historical ActorIdentity, authentication time or granted scope.

That three-way split is one of this page's most important runtime boundaries.

## 8 · Authorization code

Where the declared profile uses an authorization code, it is **a short-lived,
transaction-bound protocol continuation artifact.**

```text
Authorization Code  ≠  AuthSession
Authorization Code  ≠  Token
Authorization Code  ≠  Actor Credential
```

A code continues an *authorization transaction*, not an *authentication session*.

### A code must keep its transaction binding

An authorization code must retain the bindings relevant to its transaction meaning:
client, redirect context, transaction protection, Actor resolution, granted authorization
context, authentication facts, lifetime/consumption semantics.

These are **semantic relations.** They do not require the runtime to persist fields of
the same names.

### Code consumption is separate from network outcome

For declared one-time code semantics:

```text
first valid exchange  → consumed
subsequent reuse      → rejected
```

and:

```text
Network Failure
≠
Authorization Code Was Not Consumed
```

If the server completed the state transition but the response was lost, the client must
not conclude from a timeout that the code is still usable.

## 9 · PKCE is authorization-transaction protection

PKCE does not define ActorIdentity. It protects the relation between a code and a
legitimate protocol continuation within the authorization transaction:

```text
PKCE
≠
Actor Authentication Method
```

A client submitting a PKCE-related parameter does not license SoulAuth to accept the
field and skip its security semantics.

Which authorization-code profiles require PKCE, which methods are supported, and the
exact request/validation/error semantics must be proven by the current declared profile,
the machine contract and [Project Status](../project/status). This page does not fill
those answers in from a semantic master.

## 10 · The token endpoint continues a transaction; it does not log an Actor in

The token endpoint handles how an established OAuth/OIDC continuation converts into the
corresponding token artifact:

```text
Token Endpoint Client Authentication  ≠  Actor Authentication
Authorization Code Exchange           ≠  New Actor Authentication
```

Actor authentication was established upstream. The token endpoint validates whether the
continuation still satisfies the declared contract and current security eligibility.

### A browser AuthSession is not a universal exchange requirement

```text
Browser AuthSession Present
≠
Universal Token Exchange Requirement
```

Token exchange is governed by its own protocol contract. If an Actor or session security
event must invalidate an outstanding transaction, that should be expressed through an
explicit lifecycle/eligibility contract — not by whether a browser cookie happens to
exist.

## 11 · A protocol artifact is not automatically an administrative resource

Authorization codes, ID tokens, access tokens and other artifacts in the declared profile
belong to the protocol layer:

```text
Protocol Artifact  ≠  Automatically Administrative Resource
Wire Artifact      ≠  Server-side State
```

The server holding some protocol state does not oblige SoulAuth to expose raw-artifact
CRUD. The two layers carry different security and lifecycle contracts.

## 12 · ID token

An ID token expresses **an authentication projection to a client/relying party under the
OIDC contract.**

```text
ID Token  ≠  Access Token
ID Token  ≠  ActorIdentity Resource
```

### Issuance time is not authentication time

```text
Token Issuance Time
≠
Authentication Time
```

An ID token issued today does not mean the Actor re-authenticated at that moment.
Authentication-related claims must faithfully reflect the authentication facts actually
established upstream.

### `sub` is not the ActorIdentity resource ID

```text
OIDC `sub`
≠
ActorIdentity Resource ID
```

The OIDC subject's exact namespace and mapping come from the current declared subject
policy. If different client contexts use different subject projections, the
ActorIdentity is still the same Actor. A protocol projection never redefines
ActorIdentity in reverse.

### `sub` is not automatically the access-token subject

```text
OIDC `sub`
≠
Access-token Subject by definition
```

The subject in an ID token or UserInfo serves the OIDC client/RP contract; a subject in
an access token, if present, serves the resource/access-token contract. Both may derive
from the same ActorIdentity — whether the wire identifiers match must be declared by each
profile.

### An issued ID token is not a live profile view

```text
Issued ID Token
≠
Live Profile View
```

Once issued, its claims are not rewritten because the current profile changed. Whether a
new artifact may project new non-core presentation data is decided by the declared claim
projection policy.

## 13 · Access token

An access token serves **resource access.** It is not an ID token, an ActorIdentity
resource, a universal Actor credential or universal authority:

```text
Access Token  ≠  ID Token
Access Token  ≠  JWT by definition
```

Its real representation must be stated by the current declared access token profile. You
cannot derive "JWT" from the word "OAuth".

### An access token profile must define its own subject contract

An access token may express an Actor-bearing context, a client-only context, or another
resource subject model the profile defines. So:

```text
Client-only Token  ≠  Actor Authentication Context
OAuth `client_id`  ≠  Access-token Actor Subject
```

A resource server must never promote a software client into an ActorIdentity through an
implicit `actor = client_id`. Which access-token subject model the current release
supports must be confirmed by the exact profile and
[Project Status](../project/status).

### OIDC subject and resource subject are separate

```text
ActorIdentity
   ├─ OIDC Subject Projection
   └─ Resource Subject Projection
```

```text
OIDC Subject Projection
≠
Resource Subject Projection
```

Both may map from the same ActorIdentity without requiring the same wire identifier.
Soulseed AuthContext projection belongs to
[Soulseed Integration](../integrate/soulseed).

### Audience/resource is separate from `scope`

Audience/resource answers *which resource consumer was this token issued for.* OAuth
`scope` answers *what bounded capability the grant/token declares within the applicable
resource context.*

```text
OAuth `scope`
≠
Audience / Resource
```

A token carrying `scope = read` is not automatically valid at another resource just
because that resource also understands the string `read`.

### Granted `scope` is not the final authorization

```text
Granted OAuth `scope`
≠
Final Resource Authorization Decision
```

A resource server still forms its own decision from the token contract,
audience/resource, applicable scope, current resource policy and other decision context.
OAuth `scope` is not universal Actor authority.

## 14 · Refresh token

A refresh token has protocol meaning only where the declared profile includes that
continuation capability. It serves **token/grant continuation.**

```text
Refresh Token  ≠  Access Token
Refresh Token  ≠  AuthSession
Refresh Token  ≠  Authorization Code
```

### Refresh is not reauthentication

```text
Refresh Token Exchange
≠
Actor Reauthentication
```

A client using a refresh token has not resubmitted authentication evidence:

```text
Authentication Time  ≠  Refresh Time  ≠  New Token Issuance Time
```

A new token may have a new issuance time. It may not forge a new authentication time.

### Wire artifact and server state are separate

```text
Refresh Token Wire Artifact
≠
Server-side Continuation State
```

How SoulAuth stores, rotates or validates continuation state belongs to implementation
and security contracts. Internal state existing does not produce a raw refresh-token
administrative resource. Whether the current release issues refresh tokens, and the exact
rotation/reuse semantics, must be confirmed by the declared profile and
[Project Status](../project/status).

## 15 · Scopes, claims and claim projection

An OIDC claim is not Actor resource JSON:

```text
OIDC Claims             ≠  Actor Resource Serialization
Profile Field Exists    ≠  Automatically Released Claim
```

Stored Actor, HumanAccount, Profile and IdentityBinding data do not become claims by
existing.

### Requested scope is not a guaranteed claim set

```text
Requested `scope`  ≠  Granted `scope`  ≠  Guaranteed Claim Set
```

Claim release follows the declared claim projection contract, which may be constrained by
protocol requirements, established authentication facts, permitted actor/account data,
client policy and privacy policy. This page does not compress that into a universal claim
formula — the exact claim set belongs to the current declared OIDC profile.

### A claim is a purpose-bound projection

Claims express bounded facts the current protocol consumer may rely on. They are not a
database copy of the whole Actor aggregate:

```text
Claim Projection
≠
Data Dump
```

## 16 · UserInfo

Where the declared profile includes UserInfo, it carries **a protected OIDC claim
projection.**

```text
UserInfo  ≠  Actor Administrative API
UserInfo  ≠  Profile Resource Dump
```

### A UserInfo access token is not a universal SoulAuth API token

```text
UserInfo Access Token
≠
Universal SoulAuth API Token
```

Being able to reach UserInfo does not mean the same token reaches arbitrary SoulAuth
application or administrative surfaces. It remains bound by its own resource, audience,
scope and token profile.

### UserInfo keeps the OIDC subject contract

Within one OIDC subject context, the ID token and UserInfo must not disagree — one using
a pairwise or declared OIDC subject while the other suddenly leaks the ActorIdentity
resource ID:

```text
UserInfo `sub` = declared OIDC subject for that subject context
```

The equality means the subject contract must be consistent. It does not mean every token
and every resource uses the same identifier.

## 17 · Metadata is a machine-readable capability claim

Protocol metadata is not documentation decoration. It tells clients **what protocol
capability this deployment actually provides.** Therefore:

> **Metadata advertising must not exceed the real implemented, supported and evidenced
> surface.**

It must not be written as `Advertised = Implemented = Supported = Tested`, because those
are different states. The accurate principle:

> **An advertised capability must be inside the current formal support scope and
> consistent with the real runtime and applicable evidence.**

That is the conformance claim constitution from
[Standards & Conformance](../security/standards-and-conformance) landing here.

### Internal capability is not protocol capability

SoulAuth being able to create a client through its control plane does not mean SoulAuth
implements standardised dynamic client registration:

```text
Internal Capability
≠
Corresponding Protocol Extension
```

Metadata must not advertise a standard endpoint that is not formally implemented merely
because a similar internal action exists.

## 18 · JWKS

JWKS provides **the public verification material required by the declared protocol
signing/verification profile.**

```text
JWKS
≠
SoulAuth Key Store
```

It never exposes private signing keys, credential protection keys, audit integrity keys
or any key material outside the current protocol verification purpose.

### `kid` is not a global trust anchor

```text
`kid`  ≠  Global Key Identity
`kid`  ≠  Trust Anchor by itself
```

Trusting a signing key requires a trusted issuer, the declared metadata/JWKS
relationship, algorithm policy and the applicable verification contract. A `kid` string
alone does not license looking a key up from an arbitrary source and trusting it.

### A JWK does not own algorithm policy

```text
JWK metadata
≠
Protocol algorithm policy
```

Key material may declare properties. Which algorithms are actually allowed is decided by
the declared protocol profile.

## 19 · Logout

OIDC protocol logout and the SoulAuth local session lifecycle are different contracts:

```text
OIDC Protocol Logout  ≠  SoulAuth Local Logout
Logout                ≠  Universal Access Token Revocation
```

A protocol logout operation must not be inflated, without a token contract, into every
token failing instantly at every resource server. The current logout profile, parameters,
redirect and session scope must be confirmed by the declared profile and
[Project Status](../project/status).

## 20 · Protocol errors

OAuth/OIDC endpoints keep their own error contract:

```text
Protocol Error
≠
Generic SoulAuth API Error
```

[API Conventions](./api-conventions) defines the SoulAuth-owned HTTP grammar. It does not
rename error semantics an external protocol requires.

### The redirect context must be trusted first

Where a flow returns a protocol result or error by redirect, the destination itself must
first satisfy the current client and redirect contract:

```text
Untrusted Redirect
→
do not send sensitive protocol response there
```

In particular:

```text
`state` present
≠
Redirect trusted
```

A caller supplying a `state` value does not turn an unvalidated URI into a trusted
destination.

## 21 · Current client configuration does not rewrite past transactions

Client configuration may change:

```text
Current Client Configuration
≠
Historical Authorization Transaction
```

Updating a client today does not reinterpret yesterday's client, redirect, Actor
resolution or granted scope. Likewise:

```text
Lifecycle Effect
≠
Propagation Freshness
```

If a client lifecycle change must affect new authorizations, outstanding transactions or
token continuation, its effect and its runtime observation freshness must each be stated
by the current exact contract. Nothing may promise, without implementation evidence, that
all artifacts fail instantly for all consumers.

## 22 · OIDC & clients at a glance

| Boundary | Meaning |
| --- | --- |
| **Client ≠ Actor** | A software protocol participant is not an ActorIdentity |
| **Client authentication ≠ Actor authentication** | Client proof and Actor proof are separate |
| **OAuth authorization ≠ Application / Soulseed authority** | Protocol authorization is not a universal right to act |
| **Valid AuthSession ≠ Authorization success** | Reusing authentication does not complete the transaction |
| **Parameter accepted ≠ Semantics enforced** | A supported security parameter must really be enforced |
| **Authentication ≠ Authorization ≠ Issuance time** | Three distinct fact layers |
| **Historical transaction ≠ Current mutable state** | Current binding/profile/config cannot rewrite the past |
| **Authorization code ≠ AuthSession / token** | Transaction continuation is separate from session and token |
| **OIDC `sub` ≠ ActorIdentity resource ID** | Protocol subject and resource identifier are separate |
| **OIDC subject ≠ Access-token subject by definition** | Two consumer domains, two subject contracts |
| **ID token ≠ Access token** | Authentication projection is not a resource-access artifact |
| **`scope` ≠ Audience/resource ≠ Final authorization** | Capability vocabulary, target and decision are separate |
| **Claims ≠ Actor resource serialization** | Claims are a purpose-bound projection |
| **Metadata advertising ≤ real supported capability** | Machine-readable metadata must tell the truth |
| **Wire artifact ≠ Server state** | Protocol representation is not internal persistence |

Compressed:

```text
Actor Authentication
        + Client Protocol Context
        ↓
Authorization Transaction
        ↓
Protocol Continuation / Artifact
        ↓
Declared Subject / Claim / Resource Projection
        ↓
Consumer trusts only its declared contract
```

OAuth/OIDC exist to establish **interoperability** — not to redefine ActorIdentity.

## Exact contract source

This page defines the human-readable protocol semantics of Client, authorization
transaction, OIDC subject, token purpose, scope/audience/claims, metadata, JWKS, logout
and protocol errors.

External OAuth/OIDC normative semantics remain owned by the corresponding external
specification. Which of those behaviours SoulAuth chooses is defined by the **declared
SoulAuth profile.** Which profiles and features the current release formally supports is
published by [Project Status](../project/status). Machine-readable protocol metadata and
the related wire surface must agree with the runtime and the declared profile.

> **A feature existing in an external standard does not mean SoulAuth supports it.**
>
> **A profile being permitted by the semantic model does not mean the current release has
> implemented it.**

## Next

We now know how Client stays separate from Actor, how existing authentication enters an
OAuth/OIDC transaction, how a transaction preserves its historical facts, how OIDC
subject, access-token subject, scope, audience and claims keep their namespaces and
purposes, and why metadata must reflect real capability.

[Administration](./administration) is next: how SoulAuth's own control plane defines
administrative principals, roles, permissions, assignment and controlled mutation — what
an administrator can change, and what it must never bypass.
