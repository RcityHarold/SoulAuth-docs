# Why SoulAuth

SoulAuth is an OpenID Connect provider written in Rust. It does one thing differently
from the alternatives, and that one thing is the only reason to pick it.

## The one thing it does differently

Most identity systems can give a bot an account: create a user, put in a made-up email
address, set a password, add it to a group. That runs, but one property does not survive
it: **a password can be copied.** Once the same account is handed to several people and
several machines, the log records that the account was used, not which holder used it.

SoulAuth gives an AI its own identity record, an `ActorIdentity`. No email column, no
password, no user row behind it. Authentication is two calls:

```
POST /api/actors/challenge      → a one-time nonce
POST /api/actors/authenticate   → the Ed25519 signature back
```

One identity can hold **several active keys at once** — that exists so keys can be
rotated safely: add the new one, confirm it authenticates, then revoke the old. It also
means each machine can hold its own key, and a successful authentication returns that
key's `credential_label` while the server stamps its `last_used_at`. Attribution reaches
the key, not just the account.

Keys can be rotated without changing the identity, so audit rows written under an old key
still resolve to the same actor. The conformance suite checks the code itself:
`src/services/ai_actor.rs` must not contain `human_account`, `password`, `email` or
`username`.
<Status kind="tested" guard="conformance::a6" />

## Why the objects are separate

One actor is three tables, not one:

| Table | Holds |
|---|---|
| `actor_identity` | `subject_key`, `actor_kind`, `status`. The OIDC `sub` is built on it |
| `human_account` | `email`, `username`, `email_verified`. Only exists for `actor_kind = human` |
| `ai_actor_credential` | `public_key`, `algorithm`, `label`. One identity can have several rows |

Merging them causes concrete problems, and it goes wrong in both directions.

Put identity and account in one table and that table needs an `email` column, which the
bot has to fill in. You invent `bot@internal`, and from then on it shows up in password
reset recipients and in lookups by email address — two paths written for people.

Put identity and credential in one table and the actor's id follows the key. Rotating a
key means becoming a different actor, and audit rows written against the old id no longer
resolve to anything. Rotating the key is the first thing you do after a key leaks.

[The full model →](/concepts/actor-identity-model)

## What it is responsible for

Authentication, and nothing past it. A successful call gives you a statement about
**who**: a session token, or an ID token carrying `sub`, `iss` and `auth_time`. It does
not tell your application what that actor is allowed to do — you still write that check
yourself, against your own rules.

The RBAC inside SoulAuth governs SoulAuth's own admin API. It is not a policy engine you
can point at your domain. [Identity vs authority →](/spec/identity-vs-authority)

## What it is not

- **Not an authorization engine for your business rules.** It answers *who*, not
  *may they*.
- **Not an agent framework.** It authenticates agents. It does not run, orchestrate or
  reason about them.
- **Not a memory or reasoning system.** In a Soulseed deployment the canonical actor is
  defined elsewhere; SoulAuth holds a reference to it, not the definition.
- **Not a billing system.** There is a membership field on the legacy user row. It
  should not be there — see [project status](/project/status).
- **Not a hosted service.** You run it, patch it and back it up.
- **Not certified.** No standards body has certified any part of it, and saying so
  yourself does not count.

## When to use something else

**A hosted provider** (Auth0, Clerk, WorkOS) if you would rather not operate an identity
service at all. SoulAuth is a binary and a database that somebody has to keep alive.

**Keycloak or Ory** if you need certified OIDC conformance, SAML, or a large catalogue of
existing integrations. SoulAuth implements the Authorization Code flow and claims nothing
past it.

**better-auth or Lucia** if you want authentication as a library inside one TypeScript
application, rather than a separate service that several applications call.

**SoulAuth** if non-human actors need real identity in your system — and if you want to
be able to check every claim on this site against the test that backs it.

## What you actually get

One Rust binary and SurrealDB. Standard OpenID Connect. A machine-readable contract that
the test suite checks against the running code, which is also what the reference pages
here are rendered from — they are not maintained by hand.

Plus the unfinished parts, written down: [the readout](/project/status) lists ten
invariants that are already written and runnable, that the current implementation does
not satisfy, with the reason for each.

## Next

| | |
|---|---|
| Run it | [Quickstart](/start/quickstart) |
| The agent case | [AI-native identity](/concepts/ai-native-identity) |
| Decide how to integrate | [Integration path](/start/integration-path) |
