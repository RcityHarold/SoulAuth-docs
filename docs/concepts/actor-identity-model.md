# Actor Identity Model

## How SoulAuth defines a stable Actor identity

[AI-native Identity](./ai-native-identity) explained why an identity model organised
around the human user has trouble accommodating an AIActor that persists and acts on
its own. This page answers the more basic question underneath it:

> **In SoulAuth, what actually represents "who this Actor is"?**

When we designed SoulAuth at TRANTOR LABS, we did not make HumanAccount, Credential,
Client or Session the root of every identity relationship. SoulAuth keeps them apart
and puts **ActorIdentity** at the centre of the Identity Domain.

```text
Human
   \
    → ActorIdentity
   /
AIActor
```

Human and AIActor can both be first-class Actors. They may use different credentials,
carry different extensions and run in different ways — none of that requires a second,
parallel identity model.

## 1 · ActorIdentity: the identity anchor

Inside the SoulAuth Identity Domain, **ActorIdentity is the only canonical Actor
identity anchor**. It answers:

> **Who is this Actor?**

What ActorIdentity carries first is identity continuity — not a login method, not an
account, not a session, not a protocol representation. So:

```text
ActorIdentity  ≠  HumanAccount
ActorIdentity  ≠  Credential
ActorIdentity  ≠  Client
ActorIdentity  ≠  AuthSession
```

ActorIdentity can be related to all of those objects, but a change in any of them does
not silently create a new Actor. This is one of the important differences between
SoulAuth and the traditional model that collects account, password, profile and session
state into a single `User` object.

### ActorIdentity is not a database schema

ActorIdentity is a semantic contract. It defines who holds the identity, which Actor
Kind it belongs to, how identity continuity is preserved, and which other objects may
form relationships around it.

It does not require the runtime to expose any particular field, table or JSON
structure. The exact resource representation, identifier and lifecycle contract for
ActorIdentity belong to the [Actors & Profiles](../reference/actors-and-profiles)
reference.

## 2 · Human and AIActor

The canonical Actor Kinds in SoulAuth are:

```text
Human
AIActor
```

Both enter the same ActorIdentity contract, which means:

> **Human and AIActor have the same first-class ActorIdentity standing.**

Equal identity standing does not force the other layers to be equal:

```text
Same first-class ActorIdentity standing
≠ Same credential
≠ Same account extension
≠ Same lifecycle details
≠ Same authority
```

A Human may have human-specific account capabilities. An AIActor does not have to
fabricate an email address, a username, a password or a HumanAccount in order to exist
in SoulAuth. Therefore:

```text
No HumanAccount
≠
Incomplete AIActor identity
```

An AIActor without a HumanAccount is still a complete ActorIdentity.

## 3 · Identity continuity: change around the Actor is not change of Actor

One of the core reasons ActorIdentity exists is so the system can distinguish

> *"this Actor changed"*

from

> *"this has become a different Actor".*

None of the following should automatically create a new ActorIdentity:

| Change | New ActorIdentity? |
| --- | ---: |
| Profile attribute changes | No |
| Credential rotation | No |
| A credential is added or revoked | No |
| An IdentityBinding changes | No |
| A different Client is used | No |
| An AuthSession is re-established | No |

```text
Credential change  ≠  Identity replacement
Profile change     ≠  Identity replacement
Session change     ≠  Identity replacement
```

What has to stay stable over the long term is **identity continuity**.

SoulAuth may use stable identity semantics internally to support that continuity, but
this does not by itself require a public `stable_subject_id`, a separate resource or a
fixed database column.

For the same reason, the OIDC `sub` is a downstream protocol subject projection. It is
not another name for the ActorIdentity resource ID, and it is not the internal
continuity foundation. Resource identifiers are defined by
[Actors & Profiles](../reference/actors-and-profiles); subject policy and subject
projection are defined by [OIDC & Clients](../reference/oidc-and-clients).

## 4 · IdentityBinding: connecting two identity domains

An Actor may also exist in another identity domain — a subject at an external identity
provider, an identity in an enterprise identity source, or a canonical Actor defined in
SoulseedAGI.

SoulAuth expresses that governed cross-domain relation with an **IdentityBinding**:

```text
External Identity
        ↕
IdentityBinding
        ↕
ActorIdentity
```

IdentityBinding answers:

> **Between two specific identity domains, does a controlled identity relation exist?**

It does not mean the two ends have merged into one identity namespace:

```text
IdentityBinding  ≠  ActorIdentity
IdentityBinding  ≠  Identity equivalence
IdentityBinding  ≠  Credential
```

### A binding is not an authentication

The existence of an IdentityBinding says only that an identity relation has been
established. It does not prove that the authentication assertion arriving *now* from
the external identity source is trustworthy.

Federated authentication must still verify the current external authentication reality.
Only once that verification holds may the IdentityBinding be used to resolve the
external subject to a SoulAuth ActorIdentity. The federation and authentication runtime
contract belongs to
[Authentication & Sessions](../reference/authentication-and-sessions) and
[OIDC & Clients](../reference/oidc-and-clients).

## 5 · Credential: proving an Actor, not defining one

A **Credential** is an authentication capability an Actor uses to prove itself. It
answers:

> **By what capability can this Actor prove who it is?**

```text
Credential
≠
ActorIdentity
```

One ActorIdentity may hold one or more credentials, and a credential has its own
lifecycle — it can be created, rotated, revoked or expired. None of that changes
ActorIdentity continuity:

```text
Credential lifecycle
≠
ActorIdentity lifecycle
```

Human and AIActor may use different credential types. Which credential types and
authentication methods the current release formally supports is stated by
[Authentication & Sessions](../reference/authentication-and-sessions) and
[Project Status](../project/status).

### Credential is not authentication evidence

A credential is a relatively long-lived authentication capability. The input or proof
actually verified during one specific authentication attempt is **authentication
evidence**:

```text
Credential
≠
Authentication Evidence
```

What a credential *is* sits on the identity/authentication boundary. How it is verified
and how it forms an authentication result belongs to the authentication runtime
contract.

### A SoulAuth credential is not an external access credential

An Actor may also hold API credentials, connector credentials or access tokens for
other systems. Those let the Actor *reach other systems*. A SoulAuth credential lets
the Actor *prove itself to SoulAuth*. They live in different trust domains and should
not be conflated just because both are called "credential".

## 6 · The other concepts that work around ActorIdentity

ActorIdentity is not the only important concept in the system — but every other concept
has its own job.

| Concept | Responsible for | Not |
| --- | --- | --- |
| **HumanAccount** | Human-specific account extension | ActorIdentity |
| **Profile** | Describing and presenting an Actor | An identity anchor |
| **Credential** | Providing authentication capability | An Actor |
| **IdentityBinding** | Connecting two identity domains | Identity equivalence |
| **Client** | An OAuth/OIDC protocol software participant | An Actor |
| **AuthSession** | Bounded authentication continuity | ActorIdentity |
| **Token / Claims** | Carrying bounded protocol facts | The upstream ActorIdentity |
| **Audit** | Historical behaviour and attribution evidence | Current identity state |

What matters in this table is not the number of objects but the boundaries between
their responsibilities.

### HumanAccount

HumanAccount is a human-specific extension. It can carry human-facing account concerns,
but `HumanAccount ≠ ActorIdentity`, and an AIActor does not need one. Its exact
resource and lifecycle are defined by
[Actors & Profiles](../reference/actors-and-profiles).

### Profile

A profile describes an Actor and is expected to change. `Profile ≠ ActorIdentity`:
changing a display name, an avatar or other presentation data does not replace the
ActorIdentity.

### Client

A Client is a protocol software participant. It answers *which software is talking to
SoulAuth*, while ActorIdentity answers *who is being authenticated*:

```text
Client                 ≠  Actor
Client Authentication  ≠  Actor Authentication
```

A single request can carry both an Actor context and a Client context, but the two must
not be merged into one "super identity". Client registration, `client_id`, protocol
metadata and the client authentication contract are defined by
[OIDC & Clients](../reference/oidc-and-clients).

### AuthSession

An AuthSession keeps an already-established authentication reality continuous for a
bounded period. `AuthSession ≠ ActorIdentity`: a session can expire or be revoked while
the ActorIdentity still exists.

### Tokens and claims

Tokens and claims can carry a verified identity or authentication projection to a
consumer. They do not replace the upstream ActorIdentity. After correct validation a
consumer may rely on the projection within the declared protocol scope and validity
boundary — that does not turn the projection into a new identity source.

### Audit

Audit records what happened. It may reference ActorIdentity, credentials, clients,
sessions and other runtime context. A historical record never becomes a new
ActorIdentity and never replaces current identity state.

## 7 · Standalone SoulAuth and Soulseed

The same Actor Identity Model applies to standalone SoulAuth and to Soulseed
integration.

### Standalone

SoulAuth does not need Soulseed in order to establish an ActorIdentity. Humans and
AIActors can both become first-class ActorIdentities directly. In particular:

> **A standalone AIActor does not have to be bound to a Soulseed canonical Actor
> before it can exist.**

### Soulseed

Within the Soulseed ecosystem, canonical Actor and Mind semantics are defined by
**SoulseedAGI**. SoulAuth can use an IdentityBinding to establish an explicit
cross-system relation between its own ActorIdentity and a Soulseed canonical Actor.
That relation changes neither side's ownership:

```text
SoulseedAGI  defines Canonical Actor / Mind
SoulAuth     authenticates ActorIdentity
```

So:

```text
IdentityBinding
≠
Permission to redefine Soulseed Canonical Actor
```

Creating a binding does not give SoulAuth the power to define or modify a Mind. The
full architectural relationship is in [Soulseed & Mind OS](./soulseed-and-mind-os);
the runtime integration is in [Soulseed Integration](../integrate/soulseed).

## 8 · The whole model, compressed into five boundaries

### 1. ActorIdentity is the identity anchor

```text
ActorIdentity answers "Who is this Actor?"
```

### 2. Human and AIActor share one identity model

```text
Human + AIActor → first-class ActorIdentity
```

An AIActor does not have to disguise itself as a HumanAccount, a bot, a service account
or an OAuth client.

### 3. The surrounding objects are not the Actor

HumanAccount, Credential, Client, Profile, AuthSession and Token all work *around*
ActorIdentity. None of them can stand in for it.

### 4. Relation and proof are separate

```text
IdentityBinding  → identity relation
Credential       → authentication capability
```

They solve different problems.

### 5. Identity continuity does not depend on the surroundings staying still

When a credential, profile, binding, client or session changes in the ordinary course
of operation, that must not silently create another Actor. That is what makes
ActorIdentity a stable identity anchor.

## Next

We now know how SoulAuth answers *who this Actor is*. That still does not answer:

> **Why may this Actor perform a given operation?**

A successful authentication does not make authority follow automatically.
[Identity vs Authority](./identity-vs-authority) takes up that boundary — why identity,
authentication and authority must always stay apart.
