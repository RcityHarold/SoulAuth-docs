# Soulseed Integration

## Handing trusted SoulAuth authentication facts to SoulseedOS

When the consumer is SoulseedOS, SoulAuth does not grow a second identity system. Nor
does a successful authentication let it start deciding runtime authority, governance or
execution on SoulseedOS's behalf.

What Soulseed integration adds is one explicit handover boundary:

> **How are the Actor authentication facts SoulAuth has already established — trusted
> within a declared contract — handed to SoulseedOS in a minimal, controlled way?**

The whole integration compresses to:

```text
Supported SoulAuth Authentication Source
        ↓
Applicable Trust Validation
        ↓
Bounded Trusted Authentication Facts
        ↓
Soulseed Adapter
        ↓
Minimal AuthContext
        ↓
SoulseedOS
```

where:

```text
AuthContext
≠
Authority Decision
```

AuthContext is a set of trusted authentication inputs that SoulseedOS holds *before* it
begins its own runtime and governance judgment.

## 1 · Ownership boundary

| System | Canonical responsibility |
| --- | --- |
| **SoulseedAGI** | Canonical Actor / Mind |
| **SoulAuth** | ActorIdentity / Authentication |
| **SoulseedOS** | Runtime / Governance |

> **SoulseedAGI defines the canonical Actor and Mind, SoulAuth establishes ActorIdentity
> and authentication, SoulseedOS runs and governs the Actor.**

Systems may reference facts the others established. But:

```text
Reference
≠
Source-of-truth Ownership
```

## 2 · ActorIdentity and Soulseed Canonical Actor stay apart

SoulAuth's identity anchor is **ActorIdentity**. SoulseedAGI owns its **Soulseed
Canonical Actor**. They do not merge:

```text
SoulAuth ActorIdentity  ≠  Soulseed Canonical Actor
ActorIdentity           ≠  Mind
```

Authenticating an Actor does not give SoulAuth source-of-truth ownership of a Mind.
SoulseedAGI storing a SoulAuth reference does not make it a writer in the SoulAuth
identity domain.

## 3 · IdentityBinding connects two domains without merging them

```text
Soulseed Canonical Actor
        ↕
IdentityBinding
        ↕
SoulAuth ActorIdentity
```

IdentityBinding expresses **a controlled relation between identity representations in
two specific domains.** It does not make either side the same resource:

```text
IdentityBinding  ≠  Soulseed Canonical Actor
IdentityBinding  ≠  Canonical Ownership Transfer
```

This page defines only the Soulseed-specific specialisation; the generic contract is in
[Actors & Profiles](../reference/actors-and-profiles).

### An adapter may project a binding; it may not create one

An adapter may consume only a relation established and verified under the formal
IdentityBinding contract. It must not infer identity equality from an email, a display
name, a client or any similar attribute:

```text
Adapter Projection
≠
Identity Equivalence Inference
```

In short: **an adapter may project a binding; it may not invent one.**

## 4 · No Soulseed binding does not mean an invalid SoulAuth Actor

Two questions must stay apart:

```text
Does a verified Soulseed IdentityBinding exist?
Does this SoulseedOS consumer require one?
```

The first is an identity/integration fact; the second is SoulseedOS runtime/entry policy.

```text
No Soulseed IdentityBinding
≠
Invalid SoulAuth ActorIdentity
```

A standalone ActorIdentity may exist entirely legitimately in SoulAuth. Whether a given
SoulseedOS runtime also requires a Soulseed canonical Actor reference is decided by that
consumer's contract.

## 5 · Trust validation and adapter translation are two responsibilities

**Trust validation** answers:

> **Are these SoulAuth authentication facts trustworthy within the declared contract?**

It may rest on an established trusted in-process context, a supported
token/authentication validation contract, or another authentication source this
integration formally supports. What it establishes is never "the whole payload is
trusted" — only **bounded trusted facts within the declared scope.**

**Adapter translation** answers:

> **How are those already-trusted facts turned into an AuthContext SoulseedOS can consume
> stably?**

```text
Trust Validation → establishes bounded trusted facts
Adapter          → translates those trusted facts
```

They may live in the same package or process. Semantically they do not merge.

## 6 · This page does not own authentication verification

If the integration uses an OAuth access token or another SoulAuth protocol artifact, its
issuer, audience, signature, token profile and other verification semantics remain
defined by [Verify Tokens](./verify-tokens) and
[OIDC & Clients](../reference/oidc-and-clients). This page consumes only **the declared
trusted facts that remain after the applicable verification.**

```text
Soulseed Adapter
≠
SoulAuth Authentication Engine
```

An adapter must not reproduce a second credential verification, token trust, identity
resolution or session authentication inside SoulseedOS and thereby become another
authentication source of truth.

## 7 · AuthContext

The core output of the integration boundary is **AuthContext**: a **minimal, bounded
SoulAuth authentication projection with explicit provenance, aimed at SoulseedOS.** It
answers:

> **Which current authentication facts may SoulseedOS trust before it starts its own
> runtime and governance judgment?**

It is not a copy of ActorIdentity, and not a dump of every token claim:

```text
AuthContext  ≠  ActorIdentity Source of Truth
AuthContext  ≠  Authentication Credential
AuthContext  ≠  Authority
AuthContext  ≠  Execution Context
```

### More claims is not a better AuthContext

The goal is not to carry as much information as possible. It is to carry **only the
minimal facts this integration genuinely needs and that belong to the authentication
boundary**:

```text
More Claims
≠
Better AuthContext
```

Less unnecessary cross-system identity data means lower coupling, smaller privacy
exposure, less stale state and lower authority-leakage risk.

## 8 · AuthContext semantic dimensions

The following are **semantic dimensions AuthContext may need to express** — not frozen
JSON field names.

| Semantic dimension | Meaning |
| --- | --- |
| **ActorIdentity context** | Which SoulAuth ActorIdentity the trusted authentication corresponds to |
| **Actor Kind** | The Actor's canonical kind, where the consumer genuinely needs it |
| **Soulseed canonical Actor reference** | Where a verified IdentityBinding exists and the consumer needs it |
| **Authentication assurance / freshness** | Authentication properties established by the upstream contract |
| **Source / session / client context** | Projected only where this integration truly needs it |
| **Validity / provenance boundary** | On what basis the consumer judges this AuthContext still trustworthy |

Exact fields, optionality, encoding and version come from the final integration wire
contract. This page does not generate a public schema from these dimensions.

## 9 · ActorIdentity context needs an explicit namespace

AuthContext must express who the authenticated Actor is — without implying, through a
bare namespace-less string, that this is a universe-wide Actor ID:

```text
Bare Subject String
≠
Global ActorIdentity
```

The ActorIdentity context must be established by an **explicit, trusted SoulAuth identity
domain / integration contract.** The exact carrier is chosen by the wire contract. This
page does not assume it equals the ActorIdentity resource ID, the OIDC `sub`, an
access-token subject or a stable subject foundation — those namespaces are not
interchangeable without a formal mapping.

## 10 · A stable subject foundation is not the AuthContext subject

Identity continuity needs a stable subject foundation. But:

```text
Stable Subject Foundation
≠
Automatically Public Integration Identifier
```

This page therefore does not invent an `actor_subject` field from continuity semantics,
and does not assume the AuthContext subject is some internal stable identifier. The exact
reference is frozen by the integration contract.

## 11 · A client-only context cannot become an Actor AuthContext

One of the most important boundaries in Actor-native integration:

```text
Client-only Authentication  ≠  Actor AuthContext
Client Context              ≠  ActorIdentity Context
```

If validation established only an OAuth client / software client context and no Actor
context, the adapter must not silently promote `client_id` or another client identifier
into an ActorIdentity. If SoulseedOS requires an authenticated Actor, Actor
authentication facts satisfying that contract must genuinely exist.

## 12 · Actor Kind is an optional integration fact, not a second interface

Where the consumer contract needs it, AuthContext may project the canonical Actor Kind
the ActorIdentity contract already established — Human or AIActor. But:

```text
Actor Kind
≠
Authentication Method
```

Human and AIActor still share one Actor-level integration boundary. A different Actor
Kind does not create two identity interfaces — a "Human AuthContext" and an "AIActor
AuthContext". The exact wire representation is defined by the integration contract.

## 13 · Soulseed canonical Actor reference

Where a verified Soulseed IdentityBinding exists for the current ActorIdentity and the
consumer needs it, AuthContext may project a **Soulseed canonical Actor reference.**
But:

```text
Soulseed Canonical Actor Reference  ≠  Soulseed Canonical Actor Source of Truth
Soulseed Canonical Actor Reference  ≠  Authority
```

It is a cross-domain typed reference, nothing more. If no binding exists, the adapter
must not guess or manufacture one.

## 14 · Authentication assurance and freshness

Where the contract requires it, AuthContext may express the assurance and freshness the
SoulAuth authentication runtime genuinely established. But:

```text
Authentication Assurance  ≠  Authority Tier
Authentication Freshness  ≠  Soulseed Authority
```

SoulseedOS may use them as policy input — a high-risk runtime entry may require specific
authentication conditions. The final authority/governance decision remains SoulseedOS's.

## 15 · AuthContext is bounded

An ActorIdentity may persist for a long time; one authentication context may not be
valid forever:

```text
AuthContext Lifetime  ≠  ActorIdentity Lifetime
AuthContext Lifetime  ≠  Authority Lifetime
```

How long an AuthContext may be reused follows the authentication, token or session
material it really came from, plus the declared integration validity/revalidation
contract. Never simply:

```text
validate once → cache forever
```

### An AuthContext cannot renew itself

```text
expired AuthContext
→ mint new AuthContext
```

is not permitted. A new AuthContext must be established again from a trusted
authentication source the current integration contract supports.

## 16 · Upstream effect is not downstream freshness

Credential revocation, AuthSession revocation, Actor suspension and IdentityBinding
changes all change upstream canonical state. But:

```text
Upstream Security Effect
≠
Instant Downstream Observation
```

Different integration sources and validation strategies may carry different freshness
guarantees, so an AuthContext's continued usability must follow its declared
revalidation/freshness contract. This page does not promise, without engineering
evidence, that every upstream security change propagates to SoulseedOS identically and
instantly.

## 17 · The shape of an AuthContext does not establish trust

A payload that looks exactly like `ActorIdentity`, `Actor Kind`, `Assurance`,
`Canonical Reference` is not therefore trustworthy:

```text
AuthContext-shaped Payload    ≠  Trusted AuthContext
Client-provided Actor Claims  ≠  Trusted AuthContext
```

Trust comes from **a supported integration boundary and the applicable trust
validation** — not from field names looking right.

### Transport/envelope validation establishes only declared trust

Even a verified transport, envelope or token makes trusted only the facts its declared
contract covers. It does not follow that all accompanying metadata is trusted, or that
caller-supplied fields inherit the same trust level. Trust keeps its source, fact, scope,
purpose and validity boundaries.

## 18 · AuthContext needs a provenance boundary

SoulseedOS must be able to tell whether an AuthContext really came from a Soulseed
integration boundary the current release supports. AuthContext therefore needs **explicit
provenance and validity semantics.**

This page does not freeze whether that is in-process, an internal transport, a signed
envelope or something else — those belong to the current engineering contract. Public
reference requires only:

> **The structure of an AuthContext must not substitute for its trusted origin.**

## 19 · An adapter does exactly three things

| An adapter may | An adapter may not |
| --- | --- |
| Consume established bounded trusted authentication facts | Reimplement a second authentication |
| Project declared ActorIdentity / binding context | Infer identity equivalence on its own |
| Construct a minimal AuthContext | Decide Soulseed authority, governance or execution |

```text
Adapter  ≠  Authentication Engine
Adapter  ≠  Authorization Engine
```

It is an **integration translator** — not a third identity or policy system.

## 20 · Integration does not couple to SoulAuth's private database

```text
SoulseedOS
        ↓
Supported Integration Contract
        ↓
SoulAuth
```

not:

```text
SoulseedOS / Adapter
        ↓
SoulAuth private persistence
```

```text
Soulseed Integration
≠
Private Database Coupling
```

SoulAuth may change its storage engine, table layout or persistence schema. As long as it
continues to honour the public integration contract, SoulseedOS should never need to
understand SoulAuth's internal persistence.

## 21 · An ID token is not a SoulseedOS API credential

```text
ID Token
≠
SoulseedOS API Access Credential
```

An ID token expresses an authentication projection to an OIDC client. What authentication
material SoulseedOS accepts must be specified by its own integration/resource contract.
Containing identity claims does not promote an ID token into a general runtime API
credential.

## 22 · AuthContext is a decision input, not a decision

Once AuthContext exists, SoulAuth's and the adapter's authentication responsibility is
essentially complete. SoulseedOS then decides from its own runtime state, authority,
governance and current context:

```text
AuthContext
≠
Runtime Authorization Decision
```

SoulseedOS may trust the declared authentication facts inside an AuthContext. Whether the
Actor may enter this runtime, perform this action, or satisfies a governance requirement
remains SoulseedOS's to answer.

## 23 · Failure boundary

Three layers must stay distinct.

**Trust validation failure** — the authentication source cannot establish trusted facts
under the declared contract. Result: **no trusted AuthContext.**

**Actor context projection failure** — upstream trust holds, but no explicit Actor
context satisfying the consumer contract can be formed: the material established only a
client-only context; ActorIdentity semantics cannot be uniquely determined; the consumer
requires a Soulseed canonical Actor reference but no verified binding applies; the
identity context is ambiguous.

```text
Ambiguous Identity Context
≠
Best-effort Actor Mapping
```

When identity is unclear, do not "pick the closest-looking Actor".

**Downstream runtime denial** — the AuthContext was established and trusted, and
SoulseedOS's own authority/governance decision rejected the action. That is not an
authentication failure.

```text
Trust Validation Failure
≠ Actor Context Projection Failure
≠ Downstream Runtime Denial
```

## 24 · When no trusted Actor AuthContext can be established, do not fabricate one

If a SoulseedOS entry explicitly requires an authenticated Actor context and the
integration boundary cannot establish a trusted Actor AuthContext:

```text
Unable to establish trusted Actor AuthContext
≠
Permission to treat the request as an authenticated Actor
```

This does not mean every request must return the same HTTP error. A consumer may have an
explicit unauthenticated path, a failure path or other declared behaviour. What it must
never do is **downgrade "cannot establish trust" into a fake authenticated Actor.** That
is fail-closed at the integration layer.

## 25 · Authentication audit is not an execution receipt

SoulAuth, SoulseedOS and the execution layer record different facts:

```text
Authentication Audit
≠
Execution Receipt
```

A successful SoulAuth authentication does not prove SoulseedOS finally authorised an
action; SoulseedOS authorising does not on its own prove an external action completed.
Cross-system correlation may exist, but:

```text
Audit Correlation
≠
Raw Authentication Material Propagation
```

Raw credentials and unnecessary authentication secrets must not be propagated across
systems for the convenience of correlation.

## 26 · Soulseed integration at a glance

| Boundary | Meaning |
| --- | --- |
| **SoulAuth ActorIdentity ≠ Soulseed Canonical Actor** | Each domain owns its own canonical representation |
| **IdentityBinding ≠ Ownership transfer** | A relation does not move the source of truth |
| **No Soulseed binding ≠ Invalid ActorIdentity** | Whether a binding is required is a consumer decision |
| **Trust validation ≠ Adapter translation** | One establishes bounded trust; one translates trusted facts |
| **Client context ≠ Actor context** | A software client cannot impersonate an Actor |
| **Client-only authentication ≠ Actor AuthContext** | No Actor fact, no Actor context |
| **AuthContext ≠ ActorIdentity source of truth** | AuthContext is a bounded projection |
| **AuthContext ≠ Credential / authority / execution context** | An authentication input does not widen into a right to act |
| **AuthContext shape ≠ Trusted AuthContext** | Trust comes from provenance and validation |
| **Adapter ≠ Authentication / authorization engine** | An adapter translates; it does not re-authenticate or decide |
| **Integration ≠ Private database coupling** | Integration depends on a public contract |
| **Assurance / freshness ≠ Authority** | Stronger or fresher authentication adds no authority |
| **Upstream effect ≠ Instant downstream freshness** | State change and consumer observation are separate |
| **Authentication audit ≠ Execution receipt** | An identity fact does not prove an action ran |

Compressed:

```text
Supported SoulAuth Authentication Source
        ↓
Applicable Trust Validation
        ↓
Bounded Trusted Authentication Facts
        ↓
Adapter Translation
        ↓
Minimal AuthContext
        ↓
SoulseedOS Runtime / Governance
```

The real boundary:

> **SoulAuth establishes who this is and which authentication facts are trustworthy.**
>
> **The adapter only translates those minimal facts across.**
>
> **SoulseedOS takes over from there to answer why this Actor may do what.**

## Exact contract source

This page defines the human-readable contract for Soulseed-specific IdentityBinding, the
trust-validation/adapter responsibility split, AuthContext semantics, the freshness
boundary and the integration failure boundary.

It does not invent AuthContext JSON field names, an ActorIdentity carrier, a token type,
a transport mechanism, a signature format, lifetimes, versions, revalidation intervals or
revocation propagation guarantees. Those must come from the current Soulseed integration
wire contract, the SoulAuth authentication/token contract and the runtime implementation.

Token verification semantics belong to [Verify Tokens](./verify-tokens) and
[OIDC & Clients](../reference/oidc-and-clients); ActorIdentity and IdentityBinding
semantics to [Actors & Profiles](../reference/actors-and-profiles); authentication result
and AuthSession to [Authentication & Sessions](../reference/authentication-and-sessions);
SoulseedOS authority and governance to SoulseedOS.

> **An integration semantic concept existing does not mean the current release has a
> field, token, endpoint or transport of the same name.**

## Next

The handover boundary is complete: Soulseed canonical Actor and SoulAuth ActorIdentity do
not merge; IdentityBinding establishes a relation without transferring ownership;
authentication material passes trust validation first; the adapter consumes only bounded
trusted facts; AuthContext stays minimal, bounded and provenance-bearing; a client-only
context cannot masquerade as an Actor; assurance and freshness do not widen into
authority; and SoulseedOS keeps its own runtime and governance decision.

To deploy this integration, continue to [Deployment](../operate/deployment). For exact
authentication and AuthSession semantics, see
[Authentication & Sessions](../reference/authentication-and-sessions). For the token and
client protocol, see [OIDC & Clients](../reference/oidc-and-clients). For trust
boundaries, see [Security Model](../security/security-model).
