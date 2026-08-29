# Why SoulAuth

SoulAuth is an OpenID Connect provider written in Rust. It does one thing differently
from the alternatives, and that one thing is the only reason to pick it.

## The one thing it does differently

Every identity system can give a bot an account. Create a user, invent an email address,
set a password, put it in a group. It works.

It stops working the morning this shows up in your own audit log:

```
03:14:07  DELETE /v1/orders/8821   actor=ops-bot@internal
```

Who ran it? The password for `ops-bot@internal` was pasted into a Slack thread two years
ago. It now lives in three password managers and two CI runners. The log records which
credential was used; it cannot record who used it, because six parties share one.

SoulAuth gives a non-human actor its own `ActorIdentity`: an Ed25519 key pair, no email
column, no password, no human account behind it. It authenticates by signing a one-time
challenge — `POST /api/actors/challenge` to get the nonce, `POST /api/actors/authenticate`
to return the signature. Rotate the key and the actor is still the same actor, so last
month's audit rows still point somewhere. The conformance suite asserts this path never
touches a human account row.
<Status kind="tested" guard="conformance::a6" />

Everything else here is an ordinary OpenID Connect provider.

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
