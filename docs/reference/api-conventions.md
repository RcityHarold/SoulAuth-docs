# API Conventions

## The shared grammar of the SoulAuth-owned HTTP contract

From here the documentation enters **Reference**. The concept, integration, operations
and security pages mainly answer what SoulAuth is, why it is designed this way, and how
to use it safely. Reference answers a different question:

> **What exactly is the contract the current release promises?**

Reference therefore follows stricter discipline than Concepts:

```text
Concepts   may explain design space
Reference  describes supported contract
```

A path, field, header, enum, error, pagination model or retry behaviour that has not
entered the formal contract **must not be written up as public API just to make the
documentation look complete.**

This page is not an endpoint catalogue. It defines the shared expression and boundaries
that every SoulAuth-owned HTTP reference obeys.

## 1 · What this page governs

SoulAuth faces two fundamentally different kinds of wire contract.

### External protocol contract

OAuth and OpenID Connect, for instance. Their protocol terms, parameter placement, media
types, redirect behaviour, error semantics and other wire requirements are defined by
**the external specification plus SoulAuth's declared profile**:

```text
SoulAuth Common API Grammar
≠
OAuth / OIDC Wire Grammar
```

This page may not redesign a standard protocol in the name of "consistent API style".

### SoulAuth-owned HTTP contract

Where a surface is defined by SoulAuth itself, it can share reference presentation,
identifier discipline, authentication/authority documentation, error boundaries,
concurrency and retry semantics, compatibility rules and machine-contract alignment.

Exact paths, methods, fields, media types and response schemas come from the
corresponding **machine-readable contract** and domain reference.

### Responsibility, representation and exposure are separate

An interface has at least three independent dimensions:

```text
Contract Responsibility
≠
Wire Representation
≠
Trust-boundary Exposure
```

An administrative operation may use JSON over HTTP. OIDC UserInfo may also return JSON.
That does not make them the same kind of contract. Likewise:

```text
Publicly Documented
≠
Publicly Exposed
```

An open-source project can publish the complete control-plane reference. That does not
mean a production operator should expose those endpoints to the internet.

## 2 · Contract ownership

| Contract dimension | Canonical owner |
| --- | --- |
| **OAuth / OIDC protocol semantics** | External specification + SoulAuth declared profile |
| **SoulAuth-owned exact HTTP wire** | Published machine-readable contract |
| **Actor-native identity semantics** | SoulAuth canonical semantic contract |
| **Authentication / session semantics** | [Authentication & Sessions](./authentication-and-sessions) |
| **Actor / profile resource semantics** | [Actors & Profiles](./actors-and-profiles) |
| **OIDC / client profile** | [OIDC & Clients](./oidc-and-clients) |
| **Administrative semantics** | [Administration](./administration) |
| **Audit semantics** | [Audit](./audit) |
| **Configuration vocabulary** | Configuration registry + [Configuration](./configuration) |
| **Current product support status** | [Project Status](../project/status) |

The job of a human-readable reference is to **explain those contracts accurately.** It
is not a second, parallel wire source of truth. Similarly:

```text
Runtime Behavior
≠
Contract Definition by Accident
```

When the runtime disagrees with a declared contract, that is drift or a release defect
to be fixed — not code acquiring the right to redefine the contract.

## 3 · The machine-readable contract

For SoulAuth-owned HTTP surfaces, the published OpenAPI contract owns the exact wire:
path, method, parameters, media type, request/response schema, HTTP responses and the
applicable security scheme. But:

```text
OpenAPI  ≠  OAuth / OIDC Specification
OpenAPI  ≠  Entire Actor-native Semantic Contract
```

OpenAPI is good at expressing the wire. It does not define on its own why an Actor
differs from a Client, what a credential lifecycle means, why authentication is not
authority, or the full semantics of audit and recovery.

> **The machine-readable contract and the human reference must agree wherever their wire
> scope overlaps — which does not give them the same semantic ownership.**

In this repository the machine contracts live in `contracts/` and are guarded by the
conformance suite, so a hand-edited registry that drifts from the runtime turns a test
red rather than quietly ageing.

## 4 · Addressing and trust identity

A deployment can carry several address concepts at once. They must not be flattened into
"the service URL":

```text
Issuer
≠
SoulAuth-owned API public address
≠
Internal listen address
```

**Issuer** belongs to the identity/protocol trust contract. Changing it can change how
consumers establish protocol trust, so it is not an ordinary deployment address.

**Public API address** is where the SoulAuth-owned HTTP API is reachable. It may or may
not share a host with the issuer; neither can be derived from the other.

**Internal listen address** only states where the runtime process listens in the current
environment. `0.0.0.0:<PORT>` does not thereby become SoulAuth's public trust identity.

### Version dimensions do not mix either

```text
Product Release Version
≠
Protocol Specification Version
≠
OpenAPI Format Version
```

If SoulAuth later owns an independent API contract version, that is another separate
dimension. A SoulAuth `2.x` release does not automatically require `/v2` path
versioning. Reference describes the real contract; it does not derive a URL scheme from
a product version.

## 5 · Identifier discipline

SoulAuth has several identifier namespaces. This page does not redefine them; it sets
the shared rules.

### An identifier keeps its namespace

```text
Same String
≠
Same Identity by definition
```

```text
ActorIdentity Resource ID  ≠  OIDC `sub`
OAuth `client_id`          ≠  ActorIdentity Resource ID
```

If SoulAuth holds an internal client resource ID, a coincidentally equal value does not
make it an OAuth `client_id`. Exact identifier contracts belong to the domain
references.

### A persistence key is not a public identifier

```text
Persistence Key
≠
Public API Identifier
```

A database record key, table namespace or internal storage address must not be promoted
into a long-lived public contract because the current implementation finds it
convenient. That is what lets persistence migration and adapter replacement happen
without breaking consumers.

### Identifier format is not identity semantics

A consumer must not do:

```text
if id starts with "ai_" → actor_kind = AIActor
```

unless a public contract explicitly declares that meaning.

```text
Identifier Format
≠
Semantic Type
```

If you need the Actor Kind, read the formal Actor Kind. Do not guess from an ID string.

### Opaque is not secret

```text
Opaque Identifier  ≠  Secret
Opaque             ≠  Confidential by definition
```

Opaque means only that a consumer does not depend on the identifier's internal
structure. It gains no authentication capability from being opaque, and its disclosure
policy comes from its own data/security contract.

## 6 · Schema and field semantics

A field appearing in a schema says only that the field belongs to the declared
representation. It does not say how a caller may use it:

```text
Field Presence
≠
Field Mutability
```

A response field may be read-only; an input field may be write-only. Whether something
is mutable, immutable or write-once is defined by the resource contract.

### Secret input does not become a readable field

```text
Accepted Secret Input
≠
Readable Secret Field
```

An operation may accept or produce sensitive material. It does not follow that reading
the resource later returns the raw secret. Display, one-time return, persistence and
custody behaviour for secret/credential material must be stated explicitly by the domain
contract.

### Never silently coerce a security-relevant unknown

When a consumer meets an enum or state it does not recognise but that carries security
meaning, it must not map it to the "closest" known value:

```text
Unknown Actor Kind
≠
Human by default
```

The correct behaviour comes from the compatibility contract. The shared principle is:
**do not manufacture false security meaning through silent coercion.**

## 7 · Endpoint security context

A protected endpoint documented as `Authentication required` is not documented. Where
applicable, a formal reference answers four distinct questions:

```text
Caller Context
Authentication Requirement
Authority Requirement
Exposure Boundary
```

**Caller context** states who participates — an Actor context, a client context, an
administrative principal context, an integration context. These must not be flattened
into a generic "user", and in particular
`Client Authentication ≠ Actor Authentication`.

**Authentication** states which authentication fact the operation requires.

**Authority** states why the current principal may perform it:
`Authenticated ≠ Authorized for this operation`.

**Exposure** states which trust boundary the operation is expected to live in. Exposure
describes a security boundary, not a physical network topology.

The full semantics belong to
[Identity vs Authority](../concepts/identity-vs-authority) and
[Administration](./administration); this page only requires that endpoint references
state them.

## 8 · Errors and diagnostics

SoulAuth-owned HTTP APIs may share error conventions. But:

```text
SoulAuth-owned API Error
≠
OAuth / OIDC Protocol Error
```

Protocol endpoints keep the error semantics their external specification requires. A
standard error must not be renamed into a SoulAuth-specific error for the sake of one
internal JSON envelope.

### HTTP status is not complete security meaning

```text
HTTP Status
≠
Complete Error Semantics
```

One status can cover several different domain failures, and a sensitive resource may
deliberately restrict existence disclosure to reduce enumeration. Exact error codes,
status mapping and disclosure behaviour come from the endpoint contract. This page does
not unify them in advance.

### Public errors and operator diagnostics are separate

A public caller needs enough information to understand a contract failure. An operator
inside a controlled boundary may need more:

```text
Public API Detail
≠
Operator Diagnostic Detail
```

A public error must not expose raw secrets, internal persistence detail, stack traces,
key material or unnecessary identity-existence information because it would make
debugging easier.

### Correlation is not attribution

```text
Correlation                    ≠  Authentication Credential
Caller-supplied Correlation    ≠  Trusted Security Attribution
```

A caller-supplied value can help observation or linking. Real security attribution must
come from a trusted principal, client, server-side or audit context.

## 9 · Collections

This page does not mandate cursor, offset or any other pagination mechanism. Exact
semantics must come from the real resource contract. The only shared principle:

> **A collection API must not leak the persistence query model as a public API
> contract.**

```text
Public Filter Contract
≠
Database Query Language
```

Ordering, filtering, pagination and concurrent-mutation visibility must be stated
accurately by the resource reference wherever a collection API genuinely exists. If the
current contract has no pagination capability, reference does not invent one for the
sake of "modern API style".

## 10 · Concurrency and retry

A mutation contract must state not only what happens on success, but — where applicable
— what concurrency, timeouts, indeterminate outcomes and retries mean.

### Concurrency is not retry

```text
Concurrency Semantics
≠
Retry Semantics
```

Concurrency answers what happens when operations compete. Retry answers what happens
when the same operation is submitted again after an uncertain result.

### Network failure is not "the operation did not happen"

```text
server commits state → response is lost → client observes timeout
```

```text
Network Failure
≠
Operation Did Not Happen
```

A caller cannot conclude from a transport failure that no server-side effect exists.

### A retryable transport condition is not a safe retry

```text
Retryable Transport Condition
≠
Safe Operation Retry
```

Whether an endpoint is safe to retry, one-time, idempotent, capable of an unknown
outcome, or in need of reconciliation is defined by the operation contract. This page
does not add an unimplemented `Idempotency-Key` feature.

### Idempotency is not `Idempotency-Key`

```text
Idempotency Semantics
≠
Idempotency-Key Support
```

An operation can have an idempotency contract with no wire feature by that name.
Reference documents only mechanisms that exist.

### The same final state is not "no additional effects"

```text
Same Final Resource State
≠
No Additional Observable Effects
```

A repeated operation may still produce audit entries, notifications, downstream side
effects or a different outcome. Any "idempotent" claim must state the scope it actually
covers.

## 11 · Compatibility

API compatibility is not "the JSON still parses". Separate three layers:

```text
Syntactic Compatibility
Semantic Compatibility
Security Compatibility
```

**Syntactic** — the field still exists and its type still parses.

**Semantic** — the field is still a string, but the identifier namespace it represents
has changed. The JSON did not change; the contract did.

**Security** — an authentication requirement, authority, exposure, freshness, retry or
audit effect changed.

```text
Schema-compatible  ≠  Semantically Compatible  ≠  Security Compatible
Same JSON Shape    ≠  Same API Contract
```

### Additive is not automatically non-breaking

Adding an optional field may be compatible. Adding a security-relevant enum value, or
changing what a field means, may not be:

```text
Additive Schema Change
≠
Automatically Non-breaking Contract Change
```

Compatibility is judged against the real consumer contract, not a schema diff.

### Versioning and deprecation

This page does not invent `/v1`, `/v2`, fixed compatibility windows or fixed migration
windows for a versioning or deprecation policy that has not been frozen. What the
current release actually promises comes from the formal versioning/release contract.

## 12 · Reference examples

A wire example in a reference is not an architecture sketch. It must reflect the current
real contract:

```text
Reference Example → current Release Contract
```

Paths, methods, fields, enums, headers and statuses must not remain "imagined API".
Sensitive material uses clear typed placeholders that cannot be mistaken for real
values. Where applicable, an example should be verifiable against the machine-readable
contract.

## 13 · Endpoint reference template

SoulAuth-owned HTTP endpoints may adopt a shared presentation grammar. This unifies
**reference presentation**, not the wire format of every endpoint.

| Section | The question it answers |
| --- | --- |
| **Endpoint** | Exact method and path? |
| **Purpose** | What does this operation really do? |
| **Contract source** | SoulAuth-owned, or external protocol? |
| **Caller context** | Who participates in this call? |
| **Authentication** | Which authentication fact must be established? |
| **Authority** | Why may the current principal perform it? |
| **Exposure** | Which trust boundary is expected? |
| **Request** | Exact parameters, headers, media type, body? |
| **Response** | Exact status, headers, schema? |
| **Errors** | Machine/protocol errors and disclosure behaviour? |
| **State & effects** | What does the operation change? |
| **Concurrency / preconditions** | How do concurrency and target state affect it? |
| **Retry / outcome** | Is retry safe? Can the outcome be unknown? |
| **Audit / security effects** | Which significant security or audit effects occur? |
| **Example** | A verifiable example consistent with the current release |

Not every endpoint must mechanically carry every section. The principle:

> **Show only what is necessary to understand the contract — but never omit a condition
> that is security- or semantically significant.**

## 14 · API conventions at a glance

| Boundary | Meaning |
| --- | --- |
| **External protocol wire ≠ SoulAuth common HTTP grammar** | Generic API rules do not rewrite a standard protocol |
| **Published machine contract owns the exact SoulAuth wire** | The human reference explains; it does not compete for wire ownership |
| **Issuer ≠ public API address ≠ listen address** | Trust identity is separate from deployment address |
| **Persistence key ≠ public identifier** | Storage implementation does not become an API contract |
| **Identifier format ≠ semantic type** | Consumers must not infer identity semantics from an ID's shape |
| **Opaque ≠ secret** | Not depending on internal format is not confidentiality |
| **Authentication ≠ endpoint authority** | Proving the caller is not permitting the operation |
| **Generic API error ≠ protocol error** | OAuth/OIDC keep their own error semantics |
| **Correlation ≠ security attribution** | A linking signal cannot substitute for trusted attribution |
| **Network failure ≠ no effect** | A transport failure does not prove the operation did not run |
| **Retryable condition ≠ safe retry** | Retry is decided by the operation contract |
| **Same JSON shape ≠ same API contract** | Compatibility includes semantics and security |

Compressed:

> **This page defines a shared language; it does not invent specific APIs.**
>
> **The exact wire comes from the machine-readable contract; exact domain meaning comes
> from the canonical owner.**
>
> **The reference's job is to hand both to the developer, accurately and clearly.**

## Next

Reference now enters the domain pages. In public reading order you can continue through
authentication, actors, OIDC, administration, audit and configuration.

By canonical dependency, the next page to read is
[Actors & Profiles](./actors-and-profiles) — the exact resource contract for the Actor
resource, HumanAccount, Profile, IdentityBinding and the ActorIdentity lifecycle, which
the authentication, OIDC, administration and audit references all build on.
