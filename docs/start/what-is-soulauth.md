# Why SoulAuth

SoulAuth is an OpenID Connect provider written in Rust. It does one thing differently
from the alternatives, and that one thing is the only reason to pick it.

## The one thing it does differently

Most identity systems can give a bot an account: create a user, put in a made-up email
address, set a password, add it to a group. That runs fine. The trouble shows up later,
when you need to know who did something.

Here is a line out of an audit log:

```
03:14:07  DELETE /v1/orders/8821   actor=ops-bot@internal
```

The password for that account went out on Slack two years ago. It now sits in three
people's password managers and in the environment of two CI runners. The log tells you
which account was used. It cannot tell you which of half a dozen holders used it.

SoulAuth gives an AI its own identity record, an `ActorIdentity`, with an Ed25519 key
pair. No email column, no password, no user row behind it. Authentication is two calls:
`POST /api/actors/challenge` returns a one-time nonce, and
`POST /api/actors/authenticate` takes the signature back.

Keys can be rotated without changing the identity, so audit rows written under an old key
still resolve to the same actor. The conformance suite checks the code itself:
`src/services/ai_actor.rs` must not contain `human_account`, `password`, `email` or
`username`.
<Status kind="tested" guard="conformance::a6" />

The rest is a standard OpenID Connect provider.

## Why the objects are separate

The bot-with-an-account pattern breaks because it merges three things that change on
different schedules:

| | |
|---|---|
| **Identity** | who this is, durably |
| **Account** | how a *person* manages their login |
| **Credential** | what can prove it right now |

Merge identity into the account and the bot needs an `email` column, so you invent
`bot@internal` — and now it can be sent a password reset. Merge identity into the
credential and rotating a key creates a new subject, so every audit row written before
the rotation points at an actor that no longer exists.

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
