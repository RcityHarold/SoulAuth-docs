# SoulAuth Architecture

## How SoulAuth is composed as Actor-native identity and authentication infrastructure

The preceding concept pages established the core semantics: ActorIdentity answers *who*,
authentication answers *whether it has been proven*, identity does not produce authority,
and SoulAuth itself occupies the identity and authentication boundary inside the larger
Soulseed / Mind OS system.

Now turn the camera back inside SoulAuth.

The simplest possible authentication service reads as:

```text
login
  ↓
verify
  ↓
issue result
```

SoulAuth has to handle more than one login over the long term. It must sustain a stable
ActorIdentity, authentication, authentication continuity, protocol projection,
administration, security, audit and a persistence boundary. So:

> **SoulAuth is not a set of login endpoints. It is Actor-native identity and
> authentication infrastructure built around ActorIdentity.**

This page does not define any specific authentication flow, and it does not freeze
endpoints, database schemas or deployment topology. It answers only:

> **Which long-lived logical responsibilities exist inside SoulAuth, and which
> boundaries must hold between them?**

## 1 · Figure 3: the logical responsibility architecture

Figure 3 is SoulAuth's own canonical architecture view. It answers **HOW: which logical
responsibilities is SoulAuth made of?**

It is not a runtime sequence diagram and not a deployment diagram:

```text
Figure 3               ≠  Mandatory Runtime Pipeline
Architecture Component ≠  Process ≠ Container ≠ Microservice
```

One SoulAuth process may carry several logical responsibilities. A responsibility may
later be split into its own runtime unit. Both remain valid as long as the architectural
boundary holds.

| Architecture responsibility | The question it answers |
| --- | --- |
| **Clients** | Which software participants interact with SoulAuth? |
| **Access & Protocol Edge** | How do external requests safely enter SoulAuth? |
| **Identity Domain** | Who is the current Actor? |
| **Authentication Core** | Has the required identity been proven? |
| **AuthSession** | How does an established authentication reality persist, bounded? |
| **Token & Federation** | How are identity and authentication facts projected outward through supported protocol contracts? |
| **Control Plane** | How is SoulAuth itself governed? |
| **Security Protection** | Which security constraints cut across the whole lifecycle? |
| **Audit & Attribution** | What happened, and to whom is it attributed? |
| **Persistence & Infrastructure** | How is domain state persisted and connected to external infrastructure? |

Of these, **Control Plane, Security Protection and Audit & Attribution are cross-cutting
planes.** They are not three modules bolted on after the main flow finishes.

## 2 · Clients and the Access & Protocol Edge

SoulAuth first faces external software participants, which interact with it through the
**Access & Protocol Edge**. One boundary has to hold from the start:

```text
Client
≠
Actor
```

ActorIdentity answers *who is being authenticated*. Client answers *which software is
participating in the current protocol context*. An AIActor may reach SoulAuth through an
agent application or another client; that does not make `AIActor = Client`.

### Access & Protocol Edge

The edge owns SoulAuth's supported external protocol boundary. Its core job is to
**accept external input, perform the applicable transport/protocol validation, and hand
a normalised request to the internal responsibility domains.**

It may carry different kinds of HTTP, browser or protocol interaction. The shape of a
protocol never decides the identity ontology in reverse:

```text
Protocol Shape
≠
Identity Model
```

New protocol surfaces may be added later. What ActorIdentity *is* must not change
because of that. Exact endpoints, parameters and wire contracts are defined by the
corresponding reference pages and by the machine-readable contracts.

## 3 · Identity Domain

The identity centre of SoulAuth Core is `ActorIdentity`. The identity domain answers:

> **Who is the current authentication actually about?**

It maintains SoulAuth's own ActorIdentity and its identity relations, and provides a
stable identity anchor for the authentication that follows. Therefore:

```text
Identity Domain
≠
Authentication Core
```

The identity domain determines **who**. The authentication core determines **proof**.

The full ontology of HumanAccount, Profile, IdentityBinding, Credential and their
relation to ActorIdentity is defined by
[Actor Identity Model](./actor-identity-model). This page does not redefine them. What
must hold here is:

```text
ActorIdentity  ≠  HumanAccount
ActorIdentity  ≠  Credential
Client         ≠  ActorIdentity
```

Ordinary lifecycle changes in the surrounding objects must not silently replace the
ActorIdentity, whatever the architectural implementation happens to be.

## 4 · Authentication Core

The authentication core answers:

> **Does the authentication evidence presented satisfy the declared authentication
> contract?**

It consumes identity context and applicable authentication evidence and establishes the
corresponding authentication result:

```text
Identity              ≠  Authentication
Authentication Result ≠  Authority
```

The authentication core does not redefine ActorIdentity, and a successful authentication
does not create application authority, SoulAuth administrative authority or Soulseed
governance authority for the Actor.

Different Actors may use different credential types or authentication methods. Which
methods, credential types, assurance levels or federation profiles are formally
supported in the current product release is **not** decided by an architecture page —
that belongs to
[Authentication & Sessions](../reference/authentication-and-sessions),
[OIDC & Clients](../reference/oidc-and-clients) and
[Project Status](../project/status).

Architecture locks only this:

> **The authentication core owns proof — not the identity ontology, and not authority.**

## 5 · AuthSession

After a successful authentication, some interactions need authentication continuity for
a bounded period. That is the responsibility of **AuthSession**:

> **How does an established authentication reality stay usable within a controlled
> lifecycle?**

```text
AuthSession               ≠  ActorIdentity
Authentication Continuity ≠  Authority Continuity
```

ActorIdentity may persist for a long time while an AuthSession is created, expires or is
revoked. Authority may also change while the session still exists.

SoulAuth's AuthSession must also stay separate from other runtime session namespaces:

```text
AuthSession  ≠  Mind Session  ≠  ConnectorSession  ≠  ExecutionSession
```

The concrete session lifecycle and runtime contract are defined by
[Authentication & Sessions](../reference/authentication-and-sessions).

## 6 · Token & Federation

Once an authentication reality exists, consumers need a controlled way to obtain the
applicable identity/authentication facts. **Token & Federation** carries that protocol
responsibility:

> **How do established facts cross the SoulAuth boundary and get used by a consumer
> according to a declared contract?**

```text
Protocol Projection
≠
Upstream Identity Source of Truth
```

Tokens, claims and federation projections do not replace the canonical meaning held by
ActorIdentity or the authentication runtime. After correct validation, they may be
relied upon within their declared consumer scope, trust contract and validity boundary.

ID tokens, access tokens, refresh tokens, OIDC claims, `sub`, OAuth `scope` and the
federation profile are all defined by
[OIDC & Clients](../reference/oidc-and-clients) and the applicable external normative
specifications. This page does not redefine the protocol wire.

### On "Authenticated Identity / Claims" in the figure

Figure 3 may use `Authenticated Identity / Claims` to label the output area SoulAuth
offers to consumers. Read it precisely:

> **It is a figure-level output grouping, not a new canonical identity object.**

There is no `AuthenticatedIdentity` entity standing alongside ActorIdentity. What exists
at runtime is an authentication result, plus the claims/projections produced under a
specific protocol contract.

## 7 · Cross-cutting plane: Control Plane

SoulAuth is itself infrastructure that has to be governed, so it has its own **control
plane**, responsible for **performing controlled administrative operations on
SoulAuth-owned state.** But:

```text
Control Plane
≠
Unlimited Authority
```

Holding administrative capability does not let it bypass ActorIdentity, security,
lifecycle or audit invariants. And:

```text
SoulAuth Administrative Authority
≠ Application Authority
≠ Soulseed Governance Authority
```

The control plane governs SoulAuth's own domain only. Administrative principals, roles,
permissions, permission assignment, delegation and authorization decisions are defined
by the [Administration](../reference/administration) reference.

## 8 · Cross-cutting plane: Security Protection

Security protection is not a security module added after login works. It cuts across
identity, authentication, credentials, AuthSession, protocol, administration, audit and
infrastructure:

> **Security is a horizontal constraint over the whole identity and authentication
> lifecycle.**

Different domains may hold different security properties and key purposes; the
architecture does not require merging them into a single "security object". Concrete
threats, authentication protection, credential protection, replay protection, key
lifecycle and other controls are defined by the security documents. This page locks only:

```text
Security Protection
≠
Post-login Add-on
```

## 9 · Cross-cutting plane: Audit & Attribution

Audit and attribution answer:

> **What happened, and to whom should it be attributed?**

It cuts across identity, authentication, protocol, administration and security. SoulAuth
must be able to attribute important historical facts to the applicable Actor, principal,
client, request or target context.

SoulAuth's audit goal is:

```text
tamper-evident
```

not:

```text
tamper-proof
```

That is:

> **the system should be able to detect unauthorised modification of important
> historical records within the declared trust model — not claim that digital records
> can never be altered.**

Audit never becomes a new source of current state and never substitutes for an external
execution domain. The event model, integrity structure and historical accountability are
defined by the [Audit](../reference/audit) reference.

## 10 · Persistence: logical stores are not physical databases

Identity, credentials, AuthSession, OIDC, security and audit all need persistence.
Figure 3 freezes these canonical logical stores:

```text
Identity   Credential   AuthSession   OIDC   Security   Audit
```

They are **logical persistence boundaries**, not database deployment requirements:

```text
Logical Store  ≠  Physical Database
One Database   ≠  One Domain
```

Several logical stores may share one physical database. One logical domain may later use
different persistence infrastructure for engineering reasons. What has to be preserved
is semantic ownership, lifecycle boundary, access discipline, write discipline and
security requirements — not a database count.

### No canonical control store

Figure 3 does not invent a `Control Store` as another canonical logical store for the
sake of visual symmetry. State managed by the control plane is carried by the
corresponding domain and repository contracts.

```text
No Canonical Control Store
```

This is not an omission. It avoids letting an architecture diagram create new domain
ontology for the sake of graphical completeness.

## 11 · Infrastructure implements domains; it does not define them

Beyond persistence, SoulAuth may connect to different infrastructure capabilities —
persistence adapters, key management adapters, external identity provider adapters,
delivery adapters. Conceptually:

```text
Canonical Domain Contract
        ↓
Infrastructure Contract
        ↓
Adapter
        ↓
Concrete Implementation
```

Therefore:

```text
Adapter
≠
Domain Semantic Owner
```

Replacing a database, a key manager, an external identity provider or any other
infrastructure implementation must not change the canonical meaning of ActorIdentity,
authentication, credentials or audit. Which is why:

```text
Persistence Schema
≠
Canonical Ontology
```

Engineering carries the domain contract. It does not earn the right to redefine the
domain because the current implementation finds it convenient.

## 12 · Architectural responsibility is not code layout

Figure 3 does not prescribe how the repository is organised:

```text
Architecture Responsibility
≠
Code Module by definition
```

One responsibility may be implemented across several internal modules; one module may
serve several internal concerns, as long as dependencies and boundaries stay clear.
Likewise `Architecture Component ≠ Deployment Unit`. You should not read out of Figure 3
a mandatory deployment such as:

```text
Identity Domain     → identity-service
Authentication Core → auth-service
Audit               → audit-service
```

Those are engineering and deployment decisions, not architecture ontology.

## 13 · Architecture contracts keep the system evolvable

What matters in a modular architecture is not the number of boxes, directories, crates,
services or databases. It is:

> **which contracts the responsibilities cooperate through, and which meanings a
> downstream implementation may never modify in reverse.**

```text
Protocol Layer  cannot redefine  ActorIdentity
Adapter         cannot redefine  Domain Ontology
Persistence     cannot redefine  Lifecycle Meaning
```

The output side works the same way. Consumers should consume SoulAuth's
identity/authentication facts through supported contracts, not by reading SoulAuth's
private persistence:

```text
Supported Integration
≠
Private Database Coupling
```

SoulAuth's internals may keep evolving. As long as the public contracts a consumer
depends on continue to hold, that consumer never needs to know how SoulAuth stores data
or organises code.

## 14 · Architecture relationship is not release capability

Figure 3 describes which logical responsibilities SoulAuth **should have**. It does not
prove the current product release implements every possible authentication method,
protocol profile, adapter or integration mode:

```text
Architecture Responsibility
≠
Current Supported Capability
```

For what the release actually supports, rely on
[Authentication & Sessions](../reference/authentication-and-sessions),
[OIDC & Clients](../reference/oidc-and-clients),
[Configuration](../reference/configuration),
[Project Status](../project/status) and the applicable machine-readable contracts.

Architecture stays stable. Release status stays honest. Neither impersonates the other.

## 15 · Architecture at a glance

| Architecture boundary | Meaning |
| --- | --- |
| **Figure 3 ≠ Runtime pipeline** | Logical responsibilities do not prescribe one call order |
| **Architecture component ≠ Deployment unit** | A box is not a process, container or microservice |
| **Identity Domain ≠ Authentication Core** | *Who* and *proof* stay separate |
| **Client ≠ Actor** | A software participant is not an identity subject |
| **AuthSession ≠ ActorIdentity** | Authentication continuity is not identity |
| **Cross-cutting plane ≠ Post-login add-on** | Control, security and audit span the lifecycle |
| **Logical store ≠ Physical database** | A persistence boundary does not fix database topology |
| **One database ≠ One domain** | Physical consolidation does not erase logical boundaries |
| **Adapter ≠ Semantic owner** | Infrastructure cannot define ontology |
| **Supported integration ≠ Private DB coupling** | Consumers integrate through contracts |

Compressed, this is SoulAuth's core engineering discipline:

```text
Stable Semantic Responsibilities
        ↓
Explicit Contracts
        ↓
Flexible Implementation
```

That is:

> **Architecture locks responsibilities and boundaries — not code, databases or
> deployment shapes.**

## Next

The **Concepts** module is now closed. You know why SoulAuth is Actor-native, what
ActorIdentity is, why identity is not authority, where SoulAuth sits in Soulseed /
Mind OS, and which logical responsibilities SoulAuth is made of.

To use SoulAuth, continue into **Integrate**, starting from
[Register a Client](../integrate/register-a-client).

To keep reading the horizontal contract that most other pages depend on, go to
[Security Model](../security/security-model) — it is upstream of deployment,
operations, threat modelling and most of the reference section.
