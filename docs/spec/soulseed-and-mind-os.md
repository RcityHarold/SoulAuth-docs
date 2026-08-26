# Soulseed & Mind OS

## Where SoulAuth sits in AGI infrastructure

SoulAuth is standalone **Actor-native identity and authentication infrastructure**. It
can run on its own, and it can enter the Soulseed system through an explicit integration
contract.

Understanding why both are true at once requires answering a larger architectural
question first:

> **Once AI stops being a single model call and starts existing as a persistent Actor,
> who is responsible for identity, mind, runtime and governance?**

When we built the Soulseed architecture at TRANTOR LABS, we did not compress those
responsibilities into one large "AI platform". We separated the sources of truth:

```text
SoulseedAGI  → Canonical Actor / Mind
SoulAuth     → ActorIdentity / Authentication
SoulseedOS   → Runtime / Governance
```

These systems compose deeply. Composing them does not dissolve their boundaries.

## 1 · LLMs, Mind OS and SoulseedOS

LLMs keep getting better at reasoning, generation, planning and tool use. But:

```text
Intelligence Capability
≠
System Order
```

A persistent Actor still needs identity, continuity, long-lived state, a runtime,
governance, a way to act externally, and accountability.

You can loosely read the LLM as the CPU of the intelligence era. It supplies the core
capability. It does not by itself decide who persists, which state belongs to whom, how
things run over time, or who may change what.

### Mind OS

**Mind OS** is the architectural concept we use to name that larger class of system
problems. It is not a bigger LLM, and it is not another word for an agent framework, a
memory system or a single application. It asks:

> **What system order does a persistent Actor and Mind need in order to exist, run, be
> governed, and enter reality over the long term?**

### SoulseedOS

**SoulseedOS** is the concrete system that carries runtime and governance
responsibilities inside Soulseed. Therefore:

```text
Mind OS  ≠  SoulseedOS
```

Mind OS is an architectural concept. SoulseedOS is a specific runtime/governance system.

Equally:

```text
Mind OS  ≠  Identity Provider
```

A persistent Actor needs stable identity — that does not mean identity and
authentication have to be reimplemented inside Mind OS. This is exactly where SoulAuth
sits:

> **SoulAuth provides an independent identity and authentication boundary.**

## 2 · Figure 1: Soulseed AGI infrastructure

<Figure1 locale="en" />

Figure 1 does not describe how SoulAuth works internally. It answers:

> **What larger system is SoulAuth part of?**

From SoulAuth's point of view, the important responsibility relations compress to:

| Component | Canonical responsibility |
| --- | --- |
| **SoulseedAGI** | Canonical Actor / Mind semantics |
| **SoulAuth** | ActorIdentity / Authentication |
| **SoulseedOS** | Runtime / Governance |
| **Soulseed Apps** | Application experience and app-specific interaction |
| **Public Reality Infrastructure** | Carrying shared, verifiable reality across subjects when required |

This is an **architecture relationship**. It is not a deployment topology, and it does
not mean that using SoulAuth requires deploying every component in the figure.

## 3 · Who owns which source of truth

What matters in this architecture is not the number of components but:

> **who owns the canonical meaning of which reality.**

### SoulseedAGI

SoulseedAGI defines the canonical Actor and Mind semantics of the Soulseed domain.

```text
SoulAuth does not define Soulseed Canonical Actor / Mind
```

SoulAuth can authenticate an Actor. Holding an ActorIdentity does not make it the source
of truth for that Actor's memory, judgment or mind state.

### SoulAuth

SoulAuth owns **ActorIdentity and authentication**. It answers who this Actor is within
SoulAuth, and whether the required identity has been proven according to the
authentication contract. It does not thereby acquire:

```text
Mind
Runtime Governance
Execution Authority
```

Which is why:

```text
ActorIdentity   ≠  Mind
Authentication  ≠  Runtime Governance
```

### SoulseedOS

SoulseedOS owns how a persistent Actor runs and how it is governed. It may consume
verified identity/authentication facts delivered through a supported integration
contract, then continue to run and constrain the Actor according to its own runtime
state, governance policy, authority and execution conditions.

```text
SoulAuth Authentication
≠
Soulseed Governance Authority
```

SoulAuth proves who. SoulseedOS decides how that Actor is run and governed in its own
domain.

### Soulseed Apps

Soulseed apps sit at the application layer and bring persistent Actors and Minds into
concrete use. An application's existence does not change the upstream source of truth:

```text
Application
≠
Canonical Mind Source of Truth
```

Different apps may hold their own app-specific state. None of them needs to re-create a
canonical Actor or Mind.

## 4 · Public Reality Infrastructure

Some reality only needs to exist inside one application or runtime. Other reality may
need to be verifiable across Actors, systems or organisations. **Public Reality
Infrastructure** addresses the second kind.

`Public` here does not mean everything must be disclosed to everyone. It means:

> **some reality must enter a shared boundary that is verifiable across subjects.**

```text
Public
≠
Unconditional Public Disclosure
```

Equally important:

```text
Public Reality Infrastructure
≠
Mandatory SoulAuth Request Path
```

An authentication, an ordinary application request or an internal state transition does
not have to pass through it merely because Soulseed has such infrastructure. Reality
enters that boundary only when its own contract genuinely requires cross-subject
verification.

## 5 · SoulAuth must be able to run standalone

SoulAuth is not an internal component that only becomes coherent once Soulseed is
present. It owns its own identity model, authentication boundary, protocol surface,
security boundary, and audit/attribution responsibility.

```text
SoulAuth
├── Standalone
└── Soulseed Integration
```

Standalone and Soulseed integration are not two SoulAuths, and not two ActorIdentity
ontologies. They are:

> **the same SoulAuth architecture used in two different system relationships.**

So:

> **Soulseed integration is never a precondition for running SoulAuth standalone.**

An ordinary application can use SoulAuth alone. Soulseed can compose SoulAuth through a
formal contract. Both hold at the same time.

## 6 · Soulseed Canonical Actor and SoulAuth ActorIdentity

This is the pair most easily confused across the integration boundary:

```text
Soulseed Canonical Actor
        ↕
   IdentityBinding
        ↕
SoulAuth ActorIdentity
```

Both ends involve an Actor. They belong to different domains.

**Soulseed Canonical Actor** is defined by SoulseedAGI and belongs to Soulseed's
Actor/Mind ontology. **SoulAuth ActorIdentity** is maintained by the SoulAuth identity
domain and carries stable identity continuity once an Actor has entered SoulAuth's
identity and authentication system.

```text
Soulseed Canonical Actor
≠
SoulAuth ActorIdentity
```

An IdentityBinding means only that a controlled relation exists between two specific
domains. It does not merge the two ontologies, and it does not transfer source-of-truth
ownership from one system to the other:

```text
IdentityBinding
≠
Ontology Merge
```

And, once more:

> **A standalone AIActor does not have to be bound to a Soulseed canonical Actor before
> it can be a complete SoulAuth ActorIdentity.**

A Soulseed binding is an optional cross-system relation, not a precondition for an
AIActor to exist legitimately in SoulAuth.

## 7 · Reference is not ownership

A common failure in cross-system architecture: one system stores an ID or reference
belonging to another system, and gradually starts treating that reference as a right to
define the other side. SoulAuth explicitly avoids this.

```text
Reference
≠
Ownership
```

SoulAuth may maintain a controlled reference to a Soulseed canonical Actor. That does
not mean SoulAuth may redefine that canonical Actor. Symmetrically, SoulseedOS may
consume identity/authentication facts from SoulAuth. That does not make SoulseedOS the
source of truth for ActorIdentity.

A cross-system reference solves *how to connect two domains reliably*. It never changes
*who owns which domain*.

## 8 · Cooperate through contracts, not shared private implementation

Clear boundaries do not mean isolated systems — quite the opposite. Stable composition
depends on explicit, supported public contracts, not on reading another system's private
database.

```text
SoulseedOS
does not read
SoulAuth private persistence
to redefine ActorIdentity
```

SoulAuth exposes the necessary identity/authentication facts through a formal
integration surface. SoulseedOS validates those inputs and continues with its own
runtime and governance. That preserves both properties at once:

```text
Independent Source of Truth
+
Composable Integration
```

How IdentityBinding is represented, how a canonical Actor reference is carried, how
authentication facts form an AuthContext and how a consumer validates it are all defined
by [Soulseed Integration](../integrate/soulseed). This page freezes only:

> **Integration happens at a contract boundary, not through private implementation
> coupling.**

## 9 · Architecture relationship is not release capability

This page describes the architectural relationship between SoulAuth and Soulseed. It
does not prove that the current product release supports any specific adapter, endpoint
or integration mode:

```text
Architecture Relationship
≠
Release Capability Status
```

For what is actually usable today, see
[Choose an Integration Path](../start/integration-path),
[Soulseed Integration](../integrate/soulseed) and
[Project Status](../project/status).

That split lets the architecture stay stable while the release describes honestly what
has really been implemented and verified.

## 10 · Boundary at a glance

| Boundary | Meaning |
| --- | --- |
| **LLM ≠ Mind OS** | Intelligence capability is not the full system order a persistent Actor needs |
| **Mind OS ≠ SoulseedOS** | An architectural concept is not a specific runtime/governance system |
| **ActorIdentity ≠ Mind** | Identity continuity is not cognitive or mind state |
| **SoulAuth ≠ SoulseedAGI** | Authentication infrastructure does not own canonical Actor/Mind semantics |
| **SoulAuth ≠ SoulseedOS** | Authentication does not own runtime or governance |
| **IdentityBinding ≠ Ownership transfer** | A cross-domain relation does not move the source of truth |
| **Reference ≠ Ownership** | Storing or resolving a reference creates no right to define |
| **Integration contract ≠ Private DB sharing** | Systems compose through stable contracts |
| **Standalone ≠ Soulseed-dependent** | Soulseed is not a precondition for SoulAuth |
| **Public Reality Infrastructure ≠ mandatory auth path** | Shared verifiable infrastructure participates on demand |

Compressed further:

```text
SoulseedAGI  defines Actor / Mind
SoulAuth     establishes Identity / Authentication
SoulseedOS   runs / governs
Contracts    connect the domains without merging them
```

## Next

We now know **where SoulAuth is**.

To understand SoulAuth's own internals, continue to
[SoulAuth Architecture](/concepts/architecture) — how the identity domain, authentication,
AuthSession, protocol, control plane, security, audit and persistence responsibilities
are organised inside an Actor-native identity and authentication infrastructure.

If your goal is to connect SoulAuth to SoulseedOS, go to
[Soulseed Integration](../integrate/soulseed) for the concrete integration boundary and
AuthContext contract.

The relationship compresses to one sentence:

> **SoulAuth keeps an independent identity and authentication boundary, and composes
> with Soulseed through explicit contracts, without becoming the Mind, the runtime or
> the governance itself.**
