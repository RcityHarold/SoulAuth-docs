# Actors & Profiles

## Who exists in SoulAuth, what describes them, and how identity persists

Every authentication in SoulAuth must return to one basic question:

> **Who is the Actor being authenticated?**

That question is answered by **ActorIdentity**.

`HumanAccount`, `Profile` and `IdentityBinding` form different relations around
ActorIdentity and carry their own responsibilities and lifecycles. But:

```text
ActorIdentity  ≠  HumanAccount  ≠  Profile  ≠  IdentityBinding
```

Ordinary changes to any of them must not redefine **who this Actor is**.

Credential and Client are also not ActorIdentity; their exact contracts belong to
[Authentication & Sessions](./authentication-and-sessions) and
[OIDC & Clients](./oidc-and-clients). This page covers ActorIdentity and the identity
resources immediately around it.

## 1 · ActorIdentity

### The identity anchor of the SoulAuth identity domain

ActorIdentity represents **an Actor's continuing identity within the SoulAuth identity
domain.** It provides a stable anchor for authentication, IdentityBinding, historical
attribution and any other domain that needs to reference an Actor.

```text
ActorIdentity  ≠  HumanAccount
ActorIdentity  ≠  Profile
ActorIdentity  ≠  Credential
ActorIdentity  ≠  Client
```

These objects may relate to an ActorIdentity. Relating does not make them one.

### Its authority scope is the SoulAuth identity domain

A SoulAuth ActorIdentity is not a universal global identity spanning every identity
system:

```text
SoulAuth ActorIdentity
≠
Universal Global Identity
```

Other identity domains hold their own subjects or identity references. When SoulAuth
needs an identity relation with another domain, it must be established through an
explicit, typed, controlled relation. An identical identifier string, an identical
email or an identical display name must never be enough to conclude that both sides
denote the same identity.

### Human and AIActor share the ActorIdentity contract

The canonical Actor Kinds are:

```text
Human
AIActor
```

Both can hold a complete ActorIdentity. An AIActor does not need a HumanAccount, a fake
email or an OAuth client identity to be an Actor in SoulAuth. But:

```text
Same first-class ActorIdentity standing
≠ Same Credential
≠ Same extension
≠ Same authority
```

Equal identity standing does not require every other domain to be equal.

### Actor Kind belongs to identity core

Actor Kind is not a presentation label on a profile:

```text
Actor Kind      ≠  Profile Attribute
Profile Update  ≠  Actor Kind Change
```

Within one ActorIdentity lifecycle, **ordinary resource mutation must not change the
Actor Kind.** The exact wire representation of Actor Kind is defined by the current
machine-readable resource contract; this page does not derive field names or enum values
from canonical semantics.

## 2 · ActorIdentity reference and identity continuity

### ActorIdentity resource ID

The ActorIdentity resource ID is used **to reference an ActorIdentity inside the
SoulAuth resource contract.** It belongs to SoulAuth's own resource namespace. It is not
a universal global ID, and it must not be merged with another protocol identifier — in
particular:

```text
ActorIdentity Resource ID
≠
OIDC `sub`
```

OIDC subject policy belongs to [OIDC & Clients](./oidc-and-clients). This page holds
only the namespace boundary.

### Identity continuity

ActorIdentity must sustain this long-term semantic: when credentials, profiles, sessions
or other peripheral state change normally, the same Actor does not silently become a
different Actor.

```text
Credential change    ≠  Actor replacement
Profile change       ≠  Actor replacement
AuthSession change   ≠  Actor replacement
```

What is genuinely stable is **identity continuity**.

### A stable subject foundation is a semantic primitive, not an API field

SoulAuth needs a stable foundation for identity continuity. However:

```text
Stable Subject Foundation  ≠  Automatically Public Identifier
Stable Subject Foundation  ≠  Automatically Public Resource Field
Stable Subject Foundation  ≠  Automatically Database Key
```

It is first a **canonical semantic primitive** supporting identity continuity. If the
runtime materialises it as an internal stable identifier, that identifier has its own
namespace and lifecycle contract.

The existence of the semantic requirement does not license publishing a field such as:

```json
{ "stable_subject_id": "..." }
```

### Stable identity is not permanent retention of all data

Identity continuity requires that the same Actor stays interpretable, that historical
attribution is not rewritten by a later Actor, and that a stable identifier used for
continuity is never wrongly reassigned inside its own namespace. It does not require
keeping everything:

```text
Identity Continuity          ≠  Full Record Retention
Logical Identity Continuity  ≠  Physical retention of every Actor-related field
```

Profile data, PII, communication data and other non-essential information may follow an
independent privacy/retention contract.

## 3 · HumanAccount

### A human-specific extension

HumanAccount covers human-specific account concerns only:

```text
HumanAccount
≠
ActorIdentity
```

A human may hold a HumanAccount in addition to an ActorIdentity. An AIActor does not
need one:

```text
AIActor without HumanAccount = valid ActorIdentity
```

HumanAccount must never re-emerge as a hidden "real user object" that forces every Actor
to fit a human account model.

### HumanAccount is not Profile

They belong to different responsibility domains. HumanAccount faces human-specific
account concerns; Profile faces **description and presentation.**

Exact HumanAccount fields, locators, communication metadata and other resource schema
come from the current machine-readable contract. This page does not invent public fields
such as `email`, `username`, `phone` or `recovery_state` without a real schema basis.

### HumanAccount is not Credential

```text
HumanAccount
≠
Credential
```

A HumanAccount may relate to credentials; it does not thereby become a password, a
secret or a credential store. Credential lifecycle and the authentication contract
belong to [Authentication & Sessions](./authentication-and-sessions).

### A login or communication attribute is not identity

Human-facing account data may participate in login, communication, verification,
recovery and federation. That does not promote the attribute into an ActorIdentity:

```text
Login Locator                   ≠  ActorIdentity
Verified Communication Channel  ≠  Cross-domain IdentityBinding
```

An identical email, phone number or other locator cannot on its own prove that subjects
in two identity domains are the same Actor.

## 4 · Profile

### Profile describes; it does not define identity

Profile answers *how is this Actor described or presented*, not *who is this Actor*:

```text
Profile           ≠  ActorIdentity
Profile Mutation  ≠  Identity Mutation
```

A profile may change while the ActorIdentity remains continuous.

### Existence is not readability

Profile data existing in a resource does not mean every caller who knows an
ActorIdentity ID can obtain it. Keep three things apart:

```text
Resource Existence  ≠  Dereferenceability  ≠  Read Authority
Stored Profile Data ≠  Caller-visible Representation
```

Which fields a caller ends up seeing is decided by the resource, authority, privacy and
projection contracts.

### Knowing an identifier grants no read authority

```text
Knowledge of ActorIdentity Resource ID
≠
Authority to read Actor data
```

Being able to *reference* an Actor does not mean being able to read its HumanAccount,
Profile, IdentityBinding or other state. This is exactly why **typed reference and data
disclosure must be designed separately.**

### Profile does not produce authority

```text
Profile Data
≠
Authority by itself
```

A descriptive field named something like `role` does not become a SoulAuth permission or
application authority. Authority is defined by the corresponding
authorization/administration contract.

### A profile field is not automatically an OIDC claim

```text
Profile Field Exists       ≠  Automatically Released as OIDC Claim
HumanAccount Field Exists  ≠  Automatically Released as OIDC Claim
```

Claim selection, scope, client policy and privacy disclosure are defined by
[OIDC & Clients](./oidc-and-clients). This page defines only that stored resource data
and protocol projection are different layers.

### No profile is not no Actor

```text
No Profile            ≠  No Actor
Profile Lifecycle     ≠  ActorIdentity Lifecycle
```

An ActorIdentity does not vanish because its profile is absent, reduced or minimised for
privacy.

## 5 · IdentityBinding

### A controlled cross-domain relation

IdentityBinding expresses **a formal relation between two specific identity domains.**
It is not an Actor, a credential or an authentication result:

```text
IdentityBinding  ≠  ActorIdentity
IdentityBinding  ≠  Credential
IdentityBinding  ≠  Authentication Result
```

### A binding is not universal identity equivalence

This is its most important boundary:

```text
IdentityBinding
≠
Universal Identity Equivalence
```

A binding has meaning only within its declared source domain, purpose, trust contract
and applicable lifecycle context. It cannot turn an external identity, a SoulAuth
ActorIdentity and another domain's identity into one universal identity with no
namespace or context differences.

### Core semantic dimensions

An IdentityBinding must at minimum be able to express:

```text
Source Identity Domain
Source Subject / Typed Reference
Target SoulAuth ActorIdentity
Binding Purpose
```

These are **semantic dimensions**. They do not declare exact field names in the machine
contract. Status, provenance, timestamps and other metadata are public wire only when
the current resource contract defines them.

### Binding purpose is part of the relation's meaning

Two bindings with a similar structure do not necessarily carry the same trust meaning:

```text
Same Relation Shape
≠
Same Binding Purpose
```

Binding purpose must let a consumer understand **what this relation is actually allowed
to be used for.** It must not be guessed from the object's shape.

### A binding does not establish source trust

IdentityBinding describes what relation exists between a source identity and a SoulAuth
ActorIdentity. It does not prove the source itself is trustworthy:

```text
IdentityBinding
≠
Source Trust Establishment
```

Trust in an external or integration source is established by the corresponding
federation/integration contract.

### A binding existing is not an authentication succeeding

```text
IdentityBinding Exists
≠
Authentication Accepted
```

The current authentication must still verify, under its own runtime contract, whether
the source is trusted, the evidence is valid, the relation applies, and the Actor is
eligible. A binding is a relation fact, not an authentication decision.

### An external identity must carry source context

A bare subject string is not an external identity:

```text
External Subject String Alone
≠
External Identity
```

A cross-domain reference must at minimum determine **which source identity domain it
belongs to**:

```text
same subject string across two identity sources
≠
same external identity by definition
```

## 6 · Binding resolution

### No binding, wrong binding and ambiguous binding are different

| Situation | Meaning |
| --- | --- |
| **No binding** | The declared cross-domain relation has not been established |
| **Wrong binding** | A source identity is attributed to the wrong ActorIdentity |
| **Ambiguous binding** | The resolution context cannot uniquely determine the applicable ActorIdentity |

```text
No Binding
≠
Wrong Binding
```

A wrong binding is **identity misattribution** — a security-critical failure.

### An ambiguous binding must never be resolved by guessing

Within an explicit source, purpose, trust contract and resolution context, binding
resolution must yield **at most one applicable ActorIdentity.** On ambiguity:

```text
Ambiguous Binding
→
do not resolve ActorIdentity
```

Do not pick "the most likely Actor", and do not depend on which row the database
happened to return first. Uniqueness enforcement, transaction and concurrency mechanisms
belong to the implementation and administrative contracts. This page freezes only:

> **An ambiguous identity relation must not be downgraded into a successful Actor
> resolution.**

### The current binding does not rewrite historical attribution

Bindings change over time:

```text
Current Binding
≠
Historical Authentication Attribution
```

Changing a relation today does not make yesterday's authentication event belong to
another Actor. Historical attribution is interpreted by **event-time identity
resolution**:

```text
Current Binding Change
≠
Historical Attribution Rewrite
```

### Changing a binding target is not an ordinary profile update

An operation that changes cross-domain identity attribution is not a descriptive
mutation:

```text
Binding target change
≠
Profile update
```

Any supported create, revoke or rebind operation must obey the current formal
administration and resource contracts. This page does not invent endpoints or current
support status from semantics.

## 7 · A cross-domain reference does not transfer ownership

IdentityBinding can connect a SoulAuth ActorIdentity to a typed reference in another
identity domain. But:

```text
IdentityBinding
≠
Source-of-truth Ownership Transfer
```

Storing an external reference does not give SoulAuth the power to define another
identity domain. Symmetrically, another system storing a SoulAuth ActorIdentity
reference does not make it a writer in the SoulAuth identity domain.

Soulseed-specific canonical Actor binding, AuthContext and integration behaviour are
defined by [Soulseed Integration](../integrate/soulseed). This page keeps the generic
IdentityBinding contract.

## 8 · ActorIdentity lifecycle

ActorIdentity is not a static resource that never changes state after creation. Its
canonical lifecycle semantics are:

```text
Suspend
Reactivate
Retire
```

These words describe lifecycle *meaning*. Whether the current release exposes those
transitions through a given endpoint, method or wire enum is defined jointly by
[Administration](./administration), the machine-readable contract and
[Project Status](../project/status).

**Suspend** means the ActorIdentity continues to exist while ordinary active
participation is restricted. Suspension does not create a new Actor.

**Reactivate** means the same ActorIdentity again satisfies the applicable active
eligibility conditions:

```text
Reactivation
≠
New Actor Creation
```

**Retire** means the ActorIdentity leaves the ordinary active lifecycle while the
necessary identity continuity and historical attribution are preserved:

```text
Retirement
≠
Identity History Erasure
```

Retiring does not turn the past into "this Actor never existed".

### Suspend is not retire

```text
Suspension
≠
Retirement
```

They carry different lifecycle meanings and must not be merged into one generic
"inactive" state because both affect current participation.

### Actor lifecycle is not credential status

```text
ActorIdentity Lifecycle
≠
Credential Lifecycle
```

Suspending an Actor does not automatically revoke every credential; revoking a
credential does not automatically retire an ActorIdentity. Cross-domain propagation must
be defined by the applicable exact contract — this page does not derive implicit
coupling from lifecycle ontology.

### Actor lifecycle does not produce authority

```text
Actor Active
≠
Actor Authorized for every operation
```

Lifecycle expresses the ActorIdentity's current identity eligibility state. Authority
belongs to another decision domain.

## 9 · Lifecycle and historical identity

Lifecycle changes current state; it cannot rewrite what already happened:

```text
Current Actor State
≠
Historical Actor Fact
```

After retirement, historical authentications, bindings and audit records must still
resolve stably to the ActorIdentity they pointed at, at event time.

### Data minimisation is not identity-history erasure

A privacy or retention contract may allow reducing profiles, communication data, PII and
other non-essential metadata. But:

```text
Data Minimization  ≠  Actor Never Existed
Actor Retired      ≠  All descriptive data must remain forever
```

What must be preserved is **the minimum set of facts required for identity continuity,
non-reassignment and historical attribution** — not the full Actor aggregate, forever.

## 10 · Visibility, dereferenceability and read authority

An ActorIdentity existing does not mean anyone who knows its identifier can read the
full Actor data:

```text
Visibility  ≠  Dereferenceability  ≠  Read Authority
```

- **Visibility** — whether an identifier or representation appears on a given surface.
- **Dereferenceability** — whether a supported method exists to resolve a reference into
  a resource or representation.
- **Read authority** — whether the current principal may read the specific data.

```text
ActorIdentity ID knowledge
≠
Profile read authority
```

The same Actor may yield different bounded representations in different caller contexts.
That is not identity instability — it is **data minimisation and least privilege.**

## 11 · Identity resources do not carry authentication secrets

```text
ActorIdentity Resource  ≠  Credential Resource
Profile                 ≠  Credential Store
IdentityBinding         ≠  External Credential Store
```

Actor, HumanAccount, Profile and binding resources must not be used as transport for raw
authentication secrets. Credential and secret contracts belong to
[Authentication & Sessions](./authentication-and-sessions) and
[Authentication Protection](../security/authentication-protection).

## 12 · Current representation does not rewrite historical attribution

```text
Current Profile          ≠  Historical Attribution Source
Current IdentityBinding  ≠  Historical Authentication Attribution
```

An Actor changing its display name today must not make yesterday's audit event read as
performed by "a different person defined by the current display name". A binding
changing today must not reinterpret an Actor resolution established yesterday.

Historical attribution depends on an **event-time stable identity reference** and the
applicable audit contract. Exact audit representation is defined by
[Audit](./audit).

## 13 · Resources this page owns

| Resource / concept | Core semantics owned here | What it is not |
| --- | --- | --- |
| **ActorIdentity** | The continuing Actor identity anchor in the SoulAuth identity domain | HumanAccount, Profile, Credential or Client |
| **HumanAccount** | A human-specific account extension | ActorIdentity or Credential |
| **Profile** | Actor description / presentation | An identity anchor or authority source |
| **IdentityBinding** | A scoped, purpose-bound cross-domain identity relation | An Actor, an authentication result or identity equivalence |
| **ActorIdentity lifecycle** | Suspend / reactivate / retire, and identity continuity | Credential status or authority |

Credential contracts remain with
[Authentication & Sessions](./authentication-and-sessions); Client and OIDC subject
remain with [OIDC & Clients](./oidc-and-clients); Soulseed-specific binding remains with
[Soulseed Integration](../integrate/soulseed).

## 14 · Actors & profiles at a glance

| Boundary | Meaning |
| --- | --- |
| **ActorIdentity ≠ HumanAccount / Profile** | Who the Actor is stays separate from its extensions |
| **ActorIdentity resource ID ≠ OIDC `sub`** | Resource namespace and protocol subject namespace are separate |
| **Stable subject foundation ≠ automatically public identifier** | A continuity primitive does not become an API field |
| **Profile ≠ identity / authority** | Descriptive data defines neither the Actor nor the right to act |
| **Visibility ≠ dereferenceability ≠ read authority** | A reference existing does not open the data |
| **IdentityBinding ≠ identity equivalence** | A relation has an explicit source, purpose and trust boundary |
| **Binding exists ≠ authentication succeeds** | A relation fact is not an authentication decision |
| **Ambiguous binding ≠ successful resolution** | Identity resolution must never guess |
| **Suspend ≠ retire** | Lifecycle meanings do not merge |
| **Current profile / binding ≠ historical attribution** | Present data does not rewrite event-time identity |

Compressed, four questions matter:

```text
Who exists?                              → ActorIdentity
What describes that actor?               → HumanAccount / Profile
How is another identity domain related?  → IdentityBinding
How does identity persist over time?     → Lifecycle + Historical Continuity
```

## Exact contract source

This page defines the **human-readable resource semantics** of ActorIdentity,
HumanAccount, Profile, IdentityBinding and the ActorIdentity lifecycle.

The exact SoulAuth-owned HTTP wire — path, method, field name, schema, enum wire value,
response, error — is owned by the published machine-readable contract.
[Administration](./administration) owns the authority and mutation contract for
management operations. [Project Status](../project/status) owns which resource surfaces
and lifecycle operations the current release actually supports.

> **A semantic concept existing does not mean a field, endpoint or public resource of
> the same name exists.**

## Next

We now know who exists as an Actor, and how account, profile, binding and lifecycle keep
their boundaries around it.

[Authentication & Sessions](./authentication-and-sessions) continues: how a credential
becomes an authentication capability, how authentication evidence forms an
authentication result, how an AuthSession maintains bounded continuity, and how the
authentication runtime actually works once an ActorIdentity holds.
