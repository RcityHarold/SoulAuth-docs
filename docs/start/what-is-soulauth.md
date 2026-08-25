# What is SoulAuth

SoulAuth is **Actor-native identity and authentication infrastructure**, built by TRANTOR
LABS. It starts from one question:

> **Who is being authenticated?**

Many application-centric identity systems take a human user or human account as their
long-term identity root. SoulAuth raises that layer into **ActorIdentity.**

In SoulAuth, Human and AIActor can both exist as Actor Kinds under the same ActorIdentity
canonical identity contract. What they share is **first-class identity standing** — not
the same credential, authentication method, lifecycle or authority.

```text
Human + AIActor
        ↓
    ActorIdentity
```

That is what SoulAuth calls **Actor-native identity.**

## 1 · What problem SoulAuth solves

The human-first identity model has worked well for a long time. The problem appears only
when a system starts needing a different kind of subject.

An AI system that is merely a capability an application calls does not necessarily need
its own ActorIdentity. But once it needs to hold identity continuity across time or
runtimes, be authenticated as itself, be clearly distinguished from humans, clients and
other Actors, and be independently attributed in the relevant security history, the
identity infrastructure must decide:

> **What is this AI, in the identity model?**

One approach is to keep folding it into existing semantics — a HumanAccount, a bot, a
service account, an OAuth client, some other machine-access abstraction. SoulAuth does not
require those concepts to disappear. It only refuses to assume they automatically equal an
AIActor.

So the real problem is not "how do we let AI log in?" It is:

> **how do different Actor Kinds enter one trustworthy identity and authentication
> infrastructure without disguising themselves as each other?**

## 2 · What Actor-native changes

It changes the **identity root.** A traditional human-first application organises its
model around `Human User`. SoulAuth puts the canonical actor identity anchor at
`ActorIdentity`. Several boundaries must therefore hold:

```text
ActorIdentity  ≠  HumanAccount
ActorIdentity  ≠  Credential
ActorIdentity  ≠  Client
```

HumanAccount is a human-specific identity extension. A credential answers how an Actor
proves itself under the applicable authentication contract. A client answers which
software participant is using the protocol or service. An IdentityBinding expresses a
controlled relation between representations in different identity domains.

These objects relate to one another. **None of them can substitute for ActorIdentity.**
That is the important difference between Actor-native identity and simply adding
`type = ai` to a traditional user model.

## 3 · What "unifying" Human and AIActor means

It does not mean:

```text
Human = AIActor
```

and it does not mean:

```text
same ActorIdentity standing = same implementation
```

What is unified is the **canonical identity contract** — neither Human nor AIActor has to
borrow the other's identity in order to be a first-class Actor in the SoulAuth identity
domain.

They may still use different credentials and authentication methods, hold different
lifecycle extensions, face different security policies, and receive entirely different
authority:

```text
First-class Identity Standing
≠
Equal Authority
```

SoulAuth unifies **who may be an Actor.** It does not force **how every Actor proves
itself.** That is also the relation between AI-native and Actor-native:

```text
AI-native     → asks for a more general identity model
Actor-native  → provides that architecture
```

## 4 · What SoulAuth is responsible for

This page does not maintain a feature matrix. It describes a **responsibility boundary.**

| Responsibility | The question SoulAuth answers |
| --- | --- |
| **Identity** | Which Actor is currently represented and referenced |
| **Authentication** | How this Actor establishes a trustworthy authentication result under the applicable contract |
| **Authentication continuity & bounded projection** | How an established authentication continues, or is consumed, within a declared lifecycle and consumer boundary |
| **Administrative control** | How SoulAuth's own identity/authentication domain is governed safely |
| **Security & historical accountability** | How SoulAuth-owned trust is protected and key facts stay traceable and attributable |

Authentication is the core step. But SoulAuth does not treat "login succeeded" as the
whole job of identity infrastructure. It must also keep identity, authentication and the
related trust facts semantically consistent within its own domain, with an interpretable
lifecycle, usable safely by consumers through declared contracts.

## 5 · What SoulAuth is not

A product boundary is defined as much by what it does not do.

### Not a Mind or memory system

SoulAuth does not define how an AIActor thinks, what its long-term memory is, or how a
personality or Mind forms. It owns identity and authentication — not the canonical Mind
ontology.

### Not an agent framework

Task planning, tool selection, workflow orchestration and agent reasoning are not
SoulAuth's responsibility. Who an Actor is, is an identity question. How that Actor
completes its next task is not.

### Not a universal authority engine

```text
Authentication
≠
Authority
```

SoulAuth may make necessary authorization decisions within its own administrative and
identity/authentication domain. A successful authentication never creates application
authority, Soulseed governance authority, or external/legal authority.

Identity answers **who?** Authority answers **why may this subject do this here?**

### Not an execution runtime

SoulAuth may establish an ActorIdentity, an authentication result and a declared
authentication context. It does not thereby pay on an Actor's behalf, modify files,
operate connectors or perform real-world actions:

```text
Authentication
≠
Execution
```

### Not a billing or entitlement system

Subscriptions, plans and commercial entitlements may affect how an application serves an
Actor. But:

```text
Commercial Entitlement
≠
ActorIdentity
```

Commercial rights do not define who the Actor is.

## 6 · Which systems suit SoulAuth

It does not require you to have AIActors today.

**Human applications.** A web or SaaS application serving only humans can still adopt
Actor-native identity, so HumanAccount is not mistakenly written as the identity ontology
itself. Whether other Actor Kinds arrive later need not be decided now.

**Backend / API systems.** If a backend consumes authentication and token context
established through public contracts — rather than reading SoulAuth's private persistence
to guess identity — Actor-native identity offers a clearer boundary.

**AI / agent systems.** If a system must distinguish AIActor, application client, human
and credential over time, SoulAuth provides an architecture where an AIActor need not
first be forced into a HumanAccount, a bot label, a service account or an OAuth client.

**Soulseed ecosystem.** Inside Soulseed, SoulAuth plays the authentication infrastructure
role while SoulseedAGI and SoulseedOS keep their own canonical responsibilities.

> **Actor-native is an architectural generality, not an AI feature requirement.**

## 7 · Standalone and Soulseed

SoulAuth's identity and authentication boundary does not depend on Soulseed:

> **SoulAuth can operate standalone.**

Standalone does not change its canonical responsibility — ActorIdentity still belongs to
the SoulAuth identity domain, authentication is still established by SoulAuth, and
consumers use those capabilities through the public contracts the release declares.

### Soulseed integration is optional

```text
SoulseedAGI  Defines Canonical Actor / Mind
        ↓
SoulAuth     Authenticates
        ↓
SoulseedOS   Operates / Governs
```

**Define → Authenticate → Operate.** More strictly: SoulseedAGI owns the Soulseed
canonical Actor and Mind; SoulAuth owns its own ActorIdentity and authentication domain;
the two identity domains may form a controlled relation through IdentityBinding;
SoulseedOS consumes the authentication context formed under a declared contract and
continues with its own runtime and governance decisions.

```text
IdentityBinding
≠
Ontology Ownership Merge
```

Integration does not let SoulAuth take over Mind, and consuming an authentication context
does not let SoulseedOS take over SoulAuth's private identity persistence.

## SoulAuth at a glance

| Boundary | Meaning |
| --- | --- |
| **SoulAuth = Actor-native identity and authentication infrastructure** | The canonical product position |
| **ActorIdentity ≠ HumanAccount** | HumanAccount is not the identity root |
| **ActorIdentity ≠ Credential** | An authentication capability is not an identity |
| **ActorIdentity ≠ Client** | A software participant is not an ActorIdentity |
| **Human / AIActor share first-class standing** | Both enter one canonical identity contract |
| **First-class standing ≠ Same implementation** | Different credentials, methods and lifecycles are fine |
| **Authentication ≠ Authority** | Proof of identity creates no right to act |
| **Authentication ≠ Execution** | SoulAuth performs no real-world action for an Actor |
| **Commercial entitlement ≠ ActorIdentity** | Commercial rights do not define identity |
| **SoulAuth ≠ Mind system** | Mind is not SoulAuth's canonical responsibility |
| **SoulAuth ≠ Agent framework** | Reasoning and orchestration are not identity |
| **Standalone ≠ Soulseed-dependent** | SoulAuth runs on its own |
| **IdentityBinding ≠ Ownership merge** | Integration does not merge two ontologies |

## SoulAuth in one sentence

> **SoulAuth is Actor-native identity and authentication infrastructure. It no longer
> assumes the human user is the only possible root of the identity world; it uses
> ActorIdentity as the canonical actor identity anchor so that Human and AIActor can both
> be represented and authenticated as themselves — while authority, Mind, execution and
> other upper-layer relationships stay explicitly outside the identity boundary.**
>
> **Whether a human or an AIActor enters the system, we should first be able to know
> reliably: who is it?**

## Current release and product definition are separate

This page defines **what SoulAuth is.** It does not announce current deployment modes, the
current OIDC profile, current authentication methods, MFA or SSO support, AuthSession
capabilities, token representation, administrative surfaces or conformance status.

```text
Product Definition       ≠  Current Feature Matrix
Architecture Responsibility ≠ Current Supported Capability
```

Current support comes from [Project Status](../project/status) and the corresponding
references, machine contracts, runtime and evidence.

## Next

To start running SoulAuth: [Quickstart](./quickstart). If you do not yet know where your
web, backend, AI/agent or Soulseed integration should enter:
[Choose an Integration Path](./integration-path). To understand why the AI era pushes
User First towards Actor First: [AI-native Identity](../concepts/ai-native-identity). For
the canonical relations between ActorIdentity, HumanAccount, IdentityBinding, Credential
and Client: [Actor Identity Model](../concepts/actor-identity-model). For why
authentication still does not confer the right to act:
[Identity vs Authority](../concepts/identity-vs-authority).

## Exact semantic ownership

This page owns the **product definition, the Actor-native differentiation, the top-level
responsibility boundary and non-goals, standalone viability, and the optional Soulseed
integration boundary.**

It does not define the ActorIdentity or HumanAccount schema, credential types,
authentication methods, the AuthSession contract, token representation, the OIDC profile,
MFA or SSO support, the administration API, the permission/role vocabulary, deployment
topology, conformance status or release support status. Those belong to the canonical
references, the machine-readable contracts, the runtime, verification evidence and
[Project Status](../project/status).
