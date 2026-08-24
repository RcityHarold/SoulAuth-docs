# Actor Identity Model

Most identity systems keep account, credential, profile, session and role
information on one `User` object. For a system that only ever serves people,
that works. It stops working when humans, AI actors, external identity
providers and OAuth clients all need to coexist — because those concepts
answer completely different questions.

SoulAuth cuts the model apart along those questions:

| Object | Answers |
| --- | --- |
| **Actor Identity** | Who is this subject? |
| **Human Account** | How does a human manage their login account? |
| **Identity Binding** | How does an identity elsewhere prove it is the same subject? |
| **Credential** | What does this actor use to prove itself? |
| **Client** | Which software is requesting identity services? |

All five work on identity. None of them can substitute for Actor Identity.

## Actor Identity: the stable root

An Actor Identity answers the most basic question — *who is this subject that
can be authenticated?* — and nothing else.

Semantically it carries:

```text
Identity ID          internal reference
Stable Subject       the durable authentication subject
Actor Kind           human | ai_actor
Identity Provenance  local | soulseed | external
Identity Status      active | suspended | retired
```

### The stable subject

This is what keeps a subject continuous. A human may change their email,
username or display name; credentials rotate; MFA gets added or removed; the
same actor may arrive through different clients.

None of that means *"this is a different subject."*

> **Mutable attributes describe an actor. The stable subject identifies it.**

SoulAuth's OIDC `sub` is built on this contract — never on an email, a
username, a profile attribute or a credential id.

::: warning A retired subject is never reassigned
An identity can be retired, which stops future authentication. Its stable
subject is **not** handed to another actor afterwards.

Otherwise the same subject in historical claims, audit records and external
systems would point at different subjects at different times. This is an
identifier-integrity rule; it says nothing about whether you retain that
actor's personal data, which is a separate governance question.
:::

### Actor kind

Two kinds are recognised: `human` and `ai_actor`.

Adding a third — organization, device, application — is deliberately *not*
easy. A new actor kind requires an architecture decision, not just an extra
enum variant, because it means that thing now enters the same identity
contract as a person.

## Human Account: an account is not a subject

A human account is a **human-specific extension** of an actor identity.

```text
Actor Identity
      │
Human-specific extension
      │
Human Account
```

It carries email, username, email-verification state and similar
account-facing metadata. It does **not** carry the identity itself.

Changing an email does not change the actor. Changing a username does not
produce a new stable subject.

Two boundaries hold here:

```text
Human Account  ≠  Actor Identity
Account metadata  ≠  Authentication secret
```

Passwords, recovery secrets and verification tokens are credential material.
They do not move into the account object just because they happen to serve a
human.

**An AI actor needs none of this.** It holds its own actor identity without
inventing an email address, a username or a fake human account. That is the
first hard test of an actor-native model.

## Identity Binding: connects identities, never creates them

An actor may already exist somewhere else — a Google account, a GitHub
account, an enterprise directory, or in Soulseed, a canonical AI actor defined
by SoulseedAGI.

An identity binding expresses one thing:

> What **verified** correspondence exists between a subject in another
> identity source and this actor identity?

```text
External Identity
      │
Identity Binding
      ↓
Actor Identity
```

It is a relationship object in its own right, not a foreign-id column on the
actor.

::: danger Binding does not create the upstream subject
Google identities are defined by Google. Enterprise identities are defined by
the enterprise. Canonical AI actors are defined by SoulseedAGI.

SoulAuth verifies and maintains the binding. It never gains the authority to
redefine what it is bound to.
:::

### Binding is not credential

Federated login makes these easy to conflate. When a human signs in through an
external IdP, SoulAuth faces two separate questions:

1. **Which actor identity does this external subject correspond to?** → binding
2. **Is this particular authentication result from the IdP trustworthy?** → federated authentication

```text
Identity Binding  ≠  Authentication Credential
```

The password that human used at Google does not become a SoulAuth credential.
SoulAuth consumes a protocol-verified authentication *result*, then resolves
the external subject to an actor through the binding.

This is why social login and Soulseed canonical binding share one model rather
than growing two unrelated subsystems.

## Credential: proves the actor, is not the actor

A credential is material or capability SoulAuth accepts as proof of an actor
identity.

```text
Actor Identity
      │
      ├── Credential
      ├── Credential
      └── Credential
```

Humans use passwords, TOTP and recovery credentials. AI actors use
key-based credentials suited to machine subjects.

Credentials have their own lifecycle — register, rotate, revoke, expire — and
none of those events change the actor:

```text
Credential lifecycle  ≠  Identity lifecycle
```

A human who changes their password is the same human. An AI actor that rotates
its key is not suddenly a different AI actor.

One more boundary, easy to miss because both are called "credential":

```text
Authentication Credential  ≠  External Connector Credential
```

An actor may hold OAuth tokens or API keys for third-party services. Those say
*how this actor reaches another system*. A SoulAuth credential says *how this
actor proves itself to SoulAuth*. Different security domains.

## Client: which software is asking

A client is a web app, a mobile app, a backend, an existing OIDC application,
or the agent runtime hosting an AI actor. It holds a `client_id`, redirect
URIs, protocol metadata and possibly client authentication material.

All of that describes a **software-to-protocol relationship**, not a subject
being authenticated.

```text
Client  ≠  Actor
```

In an agent system, several things exist at once:

```text
AIActor              ← the subject being authenticated
   │
Actor Credential     ← how it proves itself
   │
Agent Application    ← the software running
   │
OIDC Client          ← how that software speaks to SoulAuth
   │
   ▼
SoulAuth
```

They must not be collapsed into one convenient "AI user."

Correspondingly:

```text
Client Authentication  ≠  Actor Authentication
Client Auth Material   ≠  Actor Credential
```

## What is not identity

Profiles, sessions, tokens, claims and audit events all revolve around actor
identity. None of them is an identity root.

**Profile** describes an actor — display name, avatar, locale. `Profile change
≠ Identity change`.

**AuthSession** is how an established authentication persists over time.
Sessions expire, get revoked and get re-established while the identity stays
continuous. It also never impersonates a Mind session, connector session or
execution session.

**Token** carries or references authenticated state, with its own issue,
expiry, rotation and revocation lifecycle. A revoked token is not a deleted
actor.

**Claims** are how SoulAuth expresses verified identity facts to consumers.
They are a protocol projection, not an identity writer.

**Audit** records what happened. It can reference identities, credentials,
clients and sessions, but it must never become a hidden identity writer.

## What never changes an identity

| Change | New actor identity? |
| --- | ---: |
| Email changed | **No** |
| Username changed | **No** |
| Display name changed | **No** |
| Password changed | **No** |
| Credential rotated | **No** |
| MFA added or removed | **No** |
| Binding added, updated or removed | **No** |
| Arrived through a different client | **No** |
| Session re-established | **No** |

Account recovery, identity merges and security incidents may need stricter
governance rules. The default principle is simply:

> **The lifecycle of objects around an identity must not silently rewrite the
> identity itself.**

## The relationship map

```text
External Identity
      │
Identity Binding
      │
      ▼
Actor Identity ◄──── Human Account
      │              (human-specific extension)
      │
      ├──────── Actor Credential
      │               │
      └───────┬───────┘
              ▼
       Authentication
              ▲
              │
     Client / Protocol Context
              │
              ▼
         AuthSession?
              │
              ▼
        Token / Claims
              │
              ▼
           Consumer
```

Read it as relationships, not as a mandatory runtime sequence. The invariants
that hold across all of them:

```text
Actor Identity  ≠  Human Account
Actor Identity  ≠  Credential
Actor Identity  ≠  Client
Actor Identity  ≠  Profile

Identity Binding  ≠  Actor Identity
Identity Binding  ≠  Credential

Actor Credential  ≠  Client Authentication Material

Credential / Binding change  ≠  Identity change

AuthSession  ≠  Identity
Token / Claims  ≠  Identity Source of Truth

Retired Subject  ≠  Reusable Subject
```

## Standalone and Soulseed

The same model serves both.

**Standalone** — SoulAuth maintains local actor identities in its own domain:

```text
Human / AIActor
      │
      ▼
Actor Identity
      │
      ▼
SoulAuth Authentication
```

**Soulseed** — the canonical AI actor is defined by SoulseedAGI, and SoulAuth
binds to it:

```text
SoulseedAGI
Canonical AIActor
      │
Identity Binding
      ▼
SoulAuth Actor Identity
```

Note it goes **through** identity binding — the same object used for social
login. There is no second binding ontology.

> **The binding does not give SoulAuth authority to define or modify the
> canonical actor, or its Mind.**

SoulseedAGI defines subjects. SoulAuth authenticates them. Two responsibilities
connected by a binding, never merged.

## Next steps

- [**Identity vs Authority**](./identity-vs-authority) — why knowing who someone is still does not say what they may do.
- [**Role in the Soulseed Ecosystem**](./soulseed-ecosystem) — where the boundary falls.
- [**Architecture**](./architecture) — how these objects are organised at runtime.
