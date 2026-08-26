---
layout: home

hero:
  name: SoulAuth
  text: Actor-native Identity & Authentication Infrastructure
  tagline: Human and AIActor enter the same first-class ActorIdentity contract. Built by TRANTOR LABS, Singapore.
  actions:
    - theme: brand
      text: What is SoulAuth
      link: /start/what-is-soulauth
    - theme: alt
      text: Quickstart
      link: /start/quickstart
    - theme: alt
      text: GitHub
      link: https://github.com/RcityHarold/SoulAuth

features:
  - title: WHO — ActorIdentity
    details: ActorIdentity is the canonical actor identity anchor. Human and AIActor are both Actor Kinds with first-class identity standing — the same identity contract, not the same implementation or authority.
    link: /concepts/actor-identity-model
    linkText: Actor Identity Model
  - title: WHERE — Define → Authenticate → Operate
    details: SoulseedAGI defines the canonical Actor and Mind, SoulAuth authenticates ActorIdentity, SoulseedOS operates and governs. SoulAuth runs standalone; Soulseed integration is optional.
    link: /concepts/soulseed-and-mind-os
    linkText: Soulseed & Mind OS
  - title: HOW — Logical responsibilities
    details: Protocol edge, identity domain, authentication core, bounded continuity and federation — with control, security and audit as cross-cutting planes over a persistence base.
    link: /concepts/architecture
    linkText: SoulAuth Architecture
  - title: Boundary — Authentication ≠ Authority
    details: A successful authentication creates no application authority, no Soulseed governance authority, and no right to act in the world. SoulAuth stops at the identity boundary.
    link: /concepts/identity-vs-authority
    linkText: Identity vs Authority
---

## SoulAuth

SoulAuth starts from one basic question:

> **Who is being authenticated?**

Many application-centric identity systems organise long-lived identity around a human user
or human account. Once an AIActor needs to be stably recognised, authenticated and
attributed *as itself*, a human-specific account model is no longer general enough to
serve as the root of the entire identity ontology.

SoulAuth therefore adopts **Actor First** — answer *who is the Actor?* before answering
*how does that Actor prove itself?*

> Which capabilities, protocol profiles, deployment surfaces and integrations the current
> release actually supports is stated by [Project Status](/project/status).

## WHO · An Actor-centred identity model

<Figure
  src="/figures/figure-2-actor-centred-identity-model.en.webp"
  alt="An Actor-centred identity model: Human and AIActor both entering one ActorIdentity through different credentials."
  title="Figure 2 · An Actor-centred identity model"
/>

Inside the SoulAuth identity domain, **ActorIdentity** is the canonical actor identity
anchor. Human and AIActor are both Actor Kinds sharing **first-class identity standing** —
both enter the ActorIdentity canonical identity contract as themselves.

That does not mean:

```text
Same identity standing = Same implementation
Same identity standing = Same authority
```

They may hold different credentials, authentication methods, lifecycles and
domain-scoped authority. Several boundaries therefore hold permanently:

```text
ActorIdentity  ≠  HumanAccount
ActorIdentity  ≠  Credential
ActorIdentity  ≠  Client
Client         ≠  Actor
```

Read further: [AI-native Identity](/concepts/ai-native-identity) ·
[Actor Identity Model](/concepts/actor-identity-model) ·
[Identity vs Authority](/concepts/identity-vs-authority)

## WHY · Why Actor First

SoulAuth is not "adding `type = ai` to a traditional user model". What it changes is the
**identity root.**

If an AIActor needs to be recognised and authenticated as itself, it should not first have
to disguise itself as a HumanAccount, a client, a credential or anything else that is not
equivalent.

```text
Actor First
=
Identify who the Actor is
before deciding how that Actor proves itself
```

rather than:

```text
Human implementation = Entire identity ontology
```

The fuller reasoning belongs to [AI-native Identity](/concepts/ai-native-identity).

## WHERE · SoulAuth in the Soulseed ecosystem

<Figure
  src="/figures/figure-1-soulseed-agi-infrastructure.en.webp"
  alt="Soulseed AGI infrastructure above the LLM, with SoulAuth as independent identity and authentication infrastructure."
  title="Figure 1 · Soulseed — AGI infrastructure above the LLM"
/>

SoulAuth can run standalone. It does not need Soulseed to establish its own ActorIdentity
or its identity and authentication domain.

Within the Soulseed ecosystem, the responsibility boundary compresses to:

```text
SoulseedAGI  → Define
SoulAuth     → Authenticate
SoulseedOS   → Operate / Govern
```

**Define → Authenticate → Operate.** SoulseedAGI owns the definition of the Soulseed
canonical Actor and Mind. SoulAuth owns its own ActorIdentity and authentication.
SoulseedOS owns runtime and governance.

SoulAuth is therefore not part of SoulseedAGI, and not an internal identity module of
SoulseedOS. Soulseed integration is an optional ecosystem relationship — never a
precondition for adopting SoulAuth.

Read further: [Soulseed & Mind OS](/concepts/soulseed-and-mind-os) ·
[Soulseed Integration](/integrate/soulseed)

## HOW · The logical architecture

<Figure
  src="/figures/figure-3-soulauth-architecture.en.webp"
  alt="SoulAuth logical responsibility architecture, with ActorIdentity as the identity root."
  title="Figure 3 · SoulAuth — Actor-native identity infrastructure"
/>

SoulAuth's logical architecture has three parts. First, the main responsibility chain for
identity and authentication:

```text
Protocol / Edge
        ↓
Identity Domain
        ↓
Authentication Core
        ↓
bounded continuity / federation-facing responsibilities
```

These are **logical responsibilities.** Not every authentication has to pass through an
identical runtime sequence.

Second, three cross-cutting planes:

```text
Control Plane
Security Protection
Audit & Attribution
```

They act horizontally across the identity and authentication lifecycle. Beneath them sits
**persistence and infrastructure.**

So two boundaries must hold:

```text
Architecture Component  ≠  Deployment Unit
One Database            ≠  One Domain
```

Physical deployment may be simple. The logical domains must stay clear.

Read further: [SoulAuth Architecture](/concepts/architecture)

## Boundary · Where SoulAuth stops

SoulAuth is responsible for **identity and authentication**, plus the administrative
control, security protection and historical accountability those responsibilities require.

It does not expand authentication upward without limit:

```text
Authentication
≠
Authority
```

Identity answers **who?** Authority answers **why may this principal do this in this
domain?**

A successful authentication does not automatically create application authority, Soulseed
governance authority, or a right to act in the real world.

**SoulAuth does not define Mind.** How an AIActor thinks, what its long-term mind is, how
it forms memory, judgment or personality — none of that belongs to the SoulAuth identity
domain.

**SoulAuth does not orchestrate agents.** It does not decide which task to plan, which
tool to call or how to complete a workflow.

**SoulAuth does not execute downstream behaviour:**

```text
Authentication
≠
Execution
```

It can prove whether Actor authentication holds under its own contract. It will not modify
files, call external systems, make payments or perform other real-world actions on an
Actor's behalf.

Read further: [What is SoulAuth](/start/what-is-soulauth) ·
[Identity vs Authority](/concepts/identity-vs-authority)

## Standalone and Soulseed

SoulAuth's canonical identity and authentication responsibilities stand on their own:

```text
SoulAuth can operate standalone.
Soulseed Integration ≠ Soulseed Runtime Dependency
```

Whether the current release supports a particular standalone deployment, OIDC profile or
Soulseed integration surface is not announced here — see
[Project Status](/project/status).

## Security & trust

Security is not a layer added after deployment. In the architecture, **security
protection** and **audit & attribution** are cross-cutting responsibilities in their own
right.

This page maintains no security feature list. The complete boundaries live in:

- [Security Model](/security/security-model) — assets, trust boundaries, security
  properties
- [Threat Model](/security/threat-model) — adversaries, threats, failure scenarios
- [Authentication Protection](/security/authentication-protection) — the controls, their
  guarantees and their limits
- [Standards & Conformance](/security/standards-and-conformance) — standards and profile
  claims, and the evidence boundary

## Get started

You do not need to read all thirty documents in order.

**Understand** — if you first want to judge what SoulAuth is and where its
responsibilities end: [What is SoulAuth](/start/what-is-soulauth).

**Run** — if you want the fastest verifiable success on the current release:
[Quickstart](/start/quickstart). It uses the release's real golden path and does not
invent features the release does not have.

**Integrate** — if you are designing a web, backend/API, OIDC, AI/agent or Soulseed
integration boundary: [Choose an Integration Path](/start/integration-path).

**Deploy** — [Deployment](/operate/deployment) answers *how is the system deployed.*
[Production Checklist](/operate/production-checklist) answers *does this specific
deployment meet production sign-off.*

## Current release

This page describes **SoulAuth's canonical product and architecture.** It does not answer
which features are supported today, which remain unsupported, which are deprecated, which
standards claims have evidence, which artifact corresponds to which source revision, or
which compatibility paths are formally promised.

All of that belongs to **[Project Status](/project/status)**.

```text
README Product Summary   ≠  Release Support Manifest
Architecture Possibility ≠  Current Supported Capability
```

This documentation does not use badges like `OIDC ✅` / `MFA ✅` / `SSO ✅` in place of real
release status — a badge carries no scope, no release, no evidence subject and no snapshot
time.

## Documentation

The public documentation consists of thirty canonical documents:

| Module | Documents |
| --- | --- |
| **Entry** | This page |
| **Start** | [What is SoulAuth](/start/what-is-soulauth) · [Quickstart](/start/quickstart) · [Choose an Integration Path](/start/integration-path) |
| **Concepts** | [AI-native Identity](/concepts/ai-native-identity) · [Actor Identity Model](/concepts/actor-identity-model) · [Identity vs Authority](/concepts/identity-vs-authority) · [Soulseed & Mind OS](/concepts/soulseed-and-mind-os) · [SoulAuth Architecture](/concepts/architecture) |
| **Integrate** | [Register a Client](/integrate/register-a-client) · [Authorization Code Flow](/integrate/authorization-code-flow) · [Browser & BFF](/integrate/browser-and-bff) · [Verify Tokens](/integrate/verify-tokens) · [Soulseed Integration](/integrate/soulseed) |
| **Operate** | [Deployment](/operate/deployment) · [Production Checklist](/operate/production-checklist) · [Operations & Recovery](/operate/operations-and-recovery) · [Troubleshooting](/operate/troubleshooting) |
| **Security & Trust** | [Security Model](/security/security-model) · [Threat Model](/security/threat-model) · [Authentication Protection](/security/authentication-protection) · [Standards & Conformance](/security/standards-and-conformance) |
| **Reference** | [API Conventions](/reference/api-conventions) · [Authentication & Sessions](/reference/authentication-and-sessions) · [Actors & Profiles](/reference/actors-and-profiles) · [OIDC & Clients](/reference/oidc-and-clients) · [Administration](/reference/administration) · [Audit](/reference/audit) · [Configuration](/reference/configuration) |
| **Project** | [Project Status](/project/status) |

## At a glance

```text
WHO
→ ActorIdentity
→ Human + AIActor
→ first-class identity standing

WHERE
→ SoulseedAGI defines
→ SoulAuth authenticates
→ SoulseedOS operates / governs

HOW
→ Identity / Authentication responsibilities
→ Control / Security / Accountability
→ Infrastructure base

BOUNDARY
→ Authentication ≠ Authority
→ SoulAuth ≠ Mind owner
→ Authentication ≠ Execution

START
→ What is SoulAuth
→ Quickstart
→ Choose an Integration Path

PRODUCTION
→ Deployment
→ Production Checklist

CURRENT REALITY
→ Project Status
```

## Canonical invariants

```text
ActorIdentity  ≠  HumanAccount
ActorIdentity  ≠  Credential
ActorIdentity  ≠  Client
Client         ≠  Actor

Same first-class identity standing  ≠  Same implementation

Authentication  ≠  Authority
SoulAuth        ≠  Mind owner
Authentication  ≠  Execution

Architecture Component  ≠  Deployment Unit
One Database            ≠  One Domain
```

Fuller definitions belong to each canonical owner. This page is not a second invariant
registry.

## About

SoulAuth is built by **TRANTOR LABS, Singapore.**

The lab's research method compresses to one sentence:

> **Philosophy defines the question; engineering verifies the answer.**

That expresses the research method behind the project. It is not part of SoulAuth's
technical contract.
