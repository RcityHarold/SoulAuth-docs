# AI-native Identity

## Why the AI era requires raising the subject of an identity system from User to Actor

What SoulAuth calls **AI-native identity** is not "adding an AI login method" to a
traditional identity system, and it is not:

```text
User + type = ai
```

The real problem happens earlier. Once an AI system needs to hold identity continuity over
a long time span, be authenticated as itself, be clearly distinguished in system records,
and be correctly attributed in the relevant security history, the identity infrastructure
must answer again:

> **Who may be a subject the identity system genuinely recognises?**

SoulAuth's answer is **Actor-native identity**:

```text
AI-native requirement
        ↓
Actor-native architecture
        ↓
Human + AIActor
        ↓
ActorIdentity
```

## 1 · AI-native is not a new authentication method

Digital systems already have plenty of mechanisms for non-human access: API keys, service
accounts, bots, OAuth clients, machine-oriented access patterns. None of them stops
working because AIActors exist. The issue is that **they are not all answering the same
question.**

An OAuth client answers *which software participant is in the protocol.* Access or
authentication material answers *what proof the caller supplied.* A service account may
carry a mature machine access identity. A bot may be only a product role or an interaction
label.

AI-native identity keeps asking:

> **Who is the Actor actually being authenticated?**

If an AI is merely a capability inside an application, the application may already be the
only identity context the system needs to model. But once that AI must be distinguished,
authenticated and attributed as itself over time, folding it entirely into the
application, a HumanAccount or a credential starts losing identity semantics.

```text
Client      ≠  Actor
Credential  ≠  Actor
```

External concepts such as API keys cannot be cast into a SoulAuth canonical credential by
name alone; how they map is decided by the integration contract.

## 2 · From User First to Actor First

Many application-centric identity systems naturally begin from a human user and a human
account. That was a reasonable historical starting point — for a long time, the subjects
most in need of long-term identity continuity were humans. Identity, account, credential,
session and business roles all clustered around `User`.

The problem is not that this implementation worked. It is that:

> **a successful human implementation is easily mistaken for the identity ontology
> itself.**

When an AIActor arrives, that assumption comes under pressure. If every identity must
first become a "human-like user", the AI ends up disguised as a human account, folded into
a service account, called a bot, or replaced in the identity model by the application
client that carries it.

SoulAuth raises the identity root one level:

```text
Human
   \
    → ActorIdentity
   /
AIActor
```

That is **Actor First.** It does not diminish humans, and it does not claim humans and AI
are the same in every sense. It only refuses to let **HumanAccount** — a human-specific
implementation — decide in advance what form every future identity subject must take:

```text
HumanAccount
≠
Entire Identity Ontology
```

HumanAccount continues to exist, as a human-specific identity extension — not as the
identity root.

## 3 · Figure 2: Actor-native identity

<Figure
  src="/figures/figure-2-actor-centred-identity-model.en.webp"
  alt="An Actor-centred identity model: Human and AIActor both entering one ActorIdentity, each through its own Credential, into the SoulAuth identity and authentication core, which projects authenticated identity and claims to any application or to SoulseedOS."
  title="Figure 2 · An Actor-centred identity model"
  caption="Human and AIActor are first-class identity subjects entering the same Actor-native identity core through different credentials."
/>

Figure 2 expresses one core relation:

```text
             ActorIdentity
             /           \
          Human         AIActor
```

Human and AIActor here are **Actor Kinds.** What they share is **first-class identity
standing** — both sit under the same ActorIdentity canonical identity contract. At the
same time:

```text
Same Identity Standing  ≠  Same Implementation
Same Identity Standing  ≠  Same Authority
```

First-class standing does not mean the same credential, the same authentication method,
the same lifecycle extension, the same authority or the same legal status. What is shared
is **the canonical identity semantics at the ActorIdentity layer.** How each proves
itself, which extensions it holds and how runtime continuity is maintained remain with
their own domain contracts.

## 4 · What first-class identity standing means

For an AIActor it means at least four things.

**1 · Representation.** An AIActor can hold its own ActorIdentity. It does not need to
borrow a HumanAccount, borrow an OAuth client, or let a credential serve as the identity.

**2 · Authentication.** Where an authentication contract applies to an AIActor, the Actor
context authentication establishes can point at that AIActor itself — rather than
authenticating a human first and then treating human and AI as one identity because the
human started the agent.

**3 · Identity continuity.** If the Actor itself has not changed, then credential change,
application client change, runtime restart and infrastructure replacement must not, on
their own, create a new ActorIdentity:

```text
Identity Continuity  ≠  Credential Continuity
Identity Continuity  ≠  Client Continuity
Identity Continuity  ≠  Runtime Continuity
```

**4 · Attribution.** When an AIActor participates in an authentication or
security-relevant context, the system should be able to point the Actor context at it.
That does not mean every audit event has only one attribution dimension — audit still
distinguishes initiator, runtime origin, target, Actor context and client context. What
matters is:

> **an AIActor should not have to hide permanently behind a human or an application to be
> recognised by the identity infrastructure.**

### First-class standing creates no authority

"First-class" is not unlimited permission, and it does not mean humans and AIActors have
the same right to act:

```text
First-class Identity Standing
≠
Equal Authority
```

Identity answers *who is this Actor.* Authority answers *why may this Actor do something
in this domain.* Different questions.

## 5 · Equal standing does not require equal implementation

Human and AIActor may share the ActorIdentity canonical identity contract without sharing
one credential type, one authentication method, one lifecycle or one extension.

```text
Who is the Actor?
```

and

```text
How does this Actor prove itself?
```

must stay apart. The first is answered by ActorIdentity; the second by the credential and
authentication contracts. What Actor-native identity unifies is **identity semantics** —
not every implementation detail.

## 6 · Why existing machine-identity concepts are not AIActors

Actor-native identity does not require discarding existing machine identity patterns. It
requires being clear about which question each concept answers.

| Concept / pattern | What it usually answers | Why it is not automatically an AIActor |
| --- | --- | --- |
| **Bot** | A product / interaction role | A bot label defines no canonical ActorIdentity |
| **Service account** | A machine access identity pattern | It may serve machine access well; its semantics are not a persistent AIActor |
| **OAuth / OIDC client** | Which software participant is in the protocol | A client does not say which Actor is authenticated |
| **Credential** | How an Actor supplies authentication capability | A credential is not an Actor |
| **AIActor** | An Actor Kind in Actor-native identity | It can exist as an independent ActorIdentity |

```text
Bot              ≠  AIActor by definition
Service Account  ≠  AIActor by definition
Client           ≠  AIActor
Credential       ≠  AIActor
```

These are not mutually exclusive. One AI scenario may legitimately contain all of:

```text
Application → Client
AIActor     → ActorIdentity
AIActor     → applicable Credential
```

each answering its own question.

## 7 · Modelling an AIActor is not a consciousness claim

Treating AIActor as an Actor Kind is an **identity architecture judgment.** It is not a
consciousness claim, a moral personhood claim or a legal personhood claim:

```text
AIActor as Identity Actor  ≠  Claim of Consciousness
AIActor as Identity Actor  ≠  Claim of Legal Personhood
```

SoulAuth does not need to settle whether an AI has subjective experience in order to
settle a separate engineering question: whether some AI system needs to be stably
distinguished, authenticated and attributed over a long period. Identity infrastructure
answers only the second.

## 8 · Actor-native does not require deploying AIActors today

Actor-native identity is not "every application adopting SoulAuth must support AI now". A
system with only humans today can still adopt:

```text
ActorIdentity
      ↓
HumanAccount
```

For end users the product experience may not visibly change. What changes is the internal
ontology: HumanAccount is no longer mistaken for the identity itself. That makes human
identity clearer too:

```text
Email changed               ≠  ActorIdentity changed
Credential changed          ≠  ActorIdentity changed
Application Client changed  ≠  ActorIdentity changed
```

> **Actor-native is an architectural generality, not an AI feature requirement.**

## 9 · Where AI-native identity stops

It settles one basic question:

> **Can the system recognise this AIActor as itself, and authenticate and attribute it
> under the applicable contract?**

It does not answer whether the AIActor may act on behalf of a human, may perform a
high-risk operation, holds an application permission, holds Soulseed governance authority,
or has any legal status:

```text
Identity  ≠  Authority  ≠  Legal Status
```

A successful authentication establishes only the authentication result the contract
declares. It creates no application, governance or legal authority.

## 10 · Standalone and Soulseed

SoulAuth can run standalone, with ActorIdentity belonging to the SoulAuth identity domain.
With Soulseed integration enabled, a SoulAuth ActorIdentity may form a controlled relation
with a Soulseed canonical Actor through an IdentityBinding:

```text
IdentityBinding
≠
Ontology Ownership Merge
```

Integration does not make SoulAuth the owner of a Soulseed canonical Actor, and SoulAuth
does not define or modify a Mind. Those ecosystem boundaries are defined by
[Soulseed & Mind OS](./soulseed-and-mind-os) and
[Soulseed Integration](../integrate/soulseed).

## AI-native identity at a glance

| Boundary | Meaning |
| --- | --- |
| **AI-native ≠ Another AI login method** | It challenges the human-only identity assumption first |
| **AI-native requirement ≠ Actor-native architecture** | One poses the problem; the other is the answer |
| **ActorIdentity ≠ HumanAccount** | HumanAccount is a human-specific extension |
| **Client ≠ Actor** | A software participant is not the authenticated subject |
| **Credential ≠ Actor** | An authentication capability is not an identity |
| **Bot ≠ AIActor by definition** | A product role is not a canonical Actor Kind |
| **Service account ≠ AIActor by definition** | Machine access identity is not a persistent AIActor |
| **First-class standing ≠ Same implementation** | Different credentials and methods are fine |
| **First-class standing ≠ Equal authority** | Identity standing creates no right to act |
| **Identity continuity ≠ Credential / client / runtime continuity** | Peripheral change creates no new Actor |
| **AIActor as identity Actor ≠ Consciousness claim** | An engineering category is not a judgment about mind |
| **AIActor as identity Actor ≠ Legal personhood** | Identity infrastructure does not adjudicate legal status |
| **Identity ≠ Authority ≠ Legal status** | This page stops at the identity boundary |

## SoulAuth's answer

```text
AI systems may increasingly need
stable identity, authentication, continuity and attribution
in their own right.
        ↓
A Human-only identity root is no longer general enough.
        ↓
SoulAuth adopts Actor-native Identity.
        ↓
ActorIdentity becomes the canonical identity anchor.
        ↓
Human and AIActor exist as Actor kinds
with first-class identity standing.
        ↓
Their Credential, Authentication Method, Lifecycle,
Authority and Legal Status may remain different.
```

> **AI-native identity poses the requirement: an identity system must be able to
> recognise an AIActor as an independent Actor when needed.**
>
> **Actor First gives the architectural principle: answer who the Actor is before
> answering how that Actor proves itself.**

## Next

To understand what ActorIdentity, HumanAccount, IdentityBinding, Credential and Client
each are, continue to [Actor Identity Model](./actor-identity-model). To understand why a
completed authentication still does not grant the right to act, continue to
[Identity vs Authority](./identity-vs-authority).

## Exact semantic ownership

This page owns the **AI-native problem framing, the Actor First motivation, the conceptual
boundary of first-class identity standing, and why Actor-native identity exists.**

It does not define the exact ActorIdentity or HumanAccount schema, AIActor or human
credential types, AIActor or human authentication methods, the claims schema, AuthSession
support, an AI-specific protocol flow, the AIActor wire representation or the current
supported feature set. Those come from
[Actor Identity Model](./actor-identity-model),
[Actors & Profiles](../reference/actors-and-profiles),
[Authentication & Sessions](../reference/authentication-and-sessions),
[OIDC & Clients](../reference/oidc-and-clients), the machine-readable contracts and
[Project Status](../project/status).

```text
Conceptual Possibility
≠
Current Supported Capability
```

This page explains why the ontology must leave a legitimate place for an AIActor to be an
Actor. It does not announce how an AIActor authenticates today.
