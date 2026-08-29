# Actor identity model

Five objects, kept separate. Under each one below is what merging it into its neighbour
would actually cost you.

## The anchor

`ActorIdentity` answers one question — **who is this, durably** — and nothing else.

| Field | Meaning |
|---|---|
| `subject_key` | The stable subject. Generated, never derived from email or username. |
| `actor_kind` | `human` or `ai_actor` |
| `identity_source` | `local`, `external`, or `soulseed` — how this identity entered |
| `canonical_actor_ref` | Soulseed deployments only: a reference to an actor defined elsewhere |
| `status` | `active`, `suspended`, `retired` |

Two design decisions in that table are worth spelling out.

**`subject_key` is generated, not derived.** If it were derived from the email address,
then the day someone changes their address you get one of two outcomes. Either the
subject changes with it — every audit row written before the change now points at an
identifier nothing resolves, and every downstream application that keyed users on `sub`
sees a stranger. Or it does not change, in which case the value was never a derivation,
just a stored string with a misleading name.

**Only `active` can authenticate**, and an unrecognised status value is treated as
suspended rather than active. A typo in the status column should stop authentication,
not silently permit it.

::: tip Resource ID ≠ subject
`ActorIdentity` has a record ID *and* a `subject_key`. They are different namespaces.
An implementation may give them the same value; that is a choice, not an equivalence,
and no API contract should assume it.
:::

## What surrounds it

<Figure2 locale="en" />

### HumanAccount — how a person manages their login

`email`, `username`, `username_normalized`, `email_verified`.

Changing an email address changes this row. It does not change the actor. That
separation is the reason an AI agent can exist without any of these fields —
[AI-native identity](/concepts/ai-native-identity).

::: warning Not yet fully separated
<Status kind="planned" /> Password and TOTP still live on the legacy `user` table rather
than behind a credential object. The `HumanAccount` split is real; the credential
consolidation behind it is not finished. See
[Project status](/project/status).
:::

### Credential — what can prove the actor right now

For AI actors this is a real, separate table: `ai_actor_credential`, holding
`public_key`, `algorithm`, `label`, `status`, `last_used_at`. SoulAuth stores only public
keys there, so reading that table grants nobody the ability to impersonate anyone.

**An identity outlives any credential it holds.** Rotating a key, losing a key, revoking
a key: none of these produce a new actor, so audit rows written under the old key still
resolve to the same one.

### IdentityBinding — which external subject is the same actor

`provider`, `provider_subject`, `binding_type`, `verification_state`, `revoked_at`.

A binding resolves *correspondence*: "the GitHub user `4001` is this actor". It is not a
credential and it is not an authentication.

::: details Why matching on the external subject alone is a real vulnerability
`(provider, provider_subject)` must be matched as a pair. Matching on the subject alone
means a GitHub account with numeric id `4001` resolves to the same actor as a Google
account whose `sub` is the string `"4001"` — a cross-provider account takeover with no
exploit code required.
:::

### Client — which application is asking

Registered OIDC clients. A client is a party in the protocol, never the subject of the
authentication.

## How the pieces fail apart if merged

This is the argument for the whole model, compressed:

| If you merge… | You lose |
|---|---|
| Identity into account | The ability for a non-human actor to exist without fake human attributes |
| Identity into credential | Stable attribution across a key rotation |
| Credential into binding | The distinction between "same person, another IdP" and "copied their secret" |
| Profile into identity | Immutability — a display-name change becomes an identity change |
| Client into subject | The ability to give one integration a narrower view than another |

## Continuity

An actor stays the same actor while everything around it moves: email changes, username
changes, keys rotate, MFA is enabled and disabled, sign-ins arrive through different
clients. None of that is an identity change.

The one direction that is *not* reversible: a retired subject is never reassigned. An
identity can stop authenticating; its identifier is not handed to somebody else
afterwards. This is why retirement does not delete the row — the record staying put is
what keeps the unique index blocking reuse.

::: warning What `sub` is stable across, today
<Status kind="planned" /> The OIDC `sub` currently carries the legacy `user` row key,
not the identity root. So it is stable for the lifetime of that row — weaker than the
"never reassigned" guarantee the model describes. If you need a subject identifier
that survives account rebuilds, `sub` does not give it to you yet. Recorded in the
[standards registry](/security/standards-and-conformance) as a named caveat.
:::

## Standalone and Soulseed

Standalone is the default: SoulAuth is the whole identity domain, `identity_source` is
`local`, and `canonical_actor_ref` is empty.

In a Soulseed deployment the canonical actor is defined by SoulseedAGI, and
`canonical_actor_ref` holds a reference to it. SoulAuth authenticates that actor; it does
not gain the ability to define or modify it. The reference is a controlled integration
claim and is not exposed to third-party OIDC clients by default.
[Soulseed & Mind OS →](/spec/soulseed-and-mind-os)

## Next

| | |
|---|---|
| The agent case end to end | [AI-native identity](/concepts/ai-native-identity) |
| What a successful authentication does *not* grant | [Identity vs authority](/spec/identity-vs-authority) |
| Why these objects exist at all | [Specification](/spec/) |
