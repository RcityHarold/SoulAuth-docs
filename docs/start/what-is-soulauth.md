# Why SoulAuth

There is no shortage of identity providers. Here is the specific reason this one exists,
and the specific reasons you might not want it.

## The one thing it does differently

Every identity system can give a bot an account. Create a user, invent an email address,
set a password, drop it in a group. It works.

It stops working when someone asks a question the system cannot answer:

> This action was taken at 03:14. Who took it?

The honest answer is usually *a service account somebody created two years ago, whose
password is in a Slack thread.* Not a subject — a shared secret with a row attached.

SoulAuth makes a non-human actor a subject in its own right. It gets its own
`ActorIdentity`, holds its own key, and proves itself by signing a challenge. **No email,
no password, no human account behind it** — and the conformance suite asserts that the
authentication path never touches one.
<Status kind="tested" guard="conformance::a6" />

That is the whole differentiator. Everything else here is a competent, unremarkable
OpenID Connect provider, which is exactly what it should be.

## Why the objects are separate

The bot-with-an-account pattern fails because it merges things that need to move
independently:

| | |
|---|---|
| **Identity** | who this is, durably |
| **Account** | how a *person* manages their login |
| **Credential** | what can prove it right now |

Merge identity into account, and a non-human actor must fake human attributes to exist.
Merge identity into credential, and rotating a key produces a new subject — attribution
breaks exactly when you need it most.

[The full model →](/concepts/actor-identity-model)

## What it is responsible for

Authentication, and stopping there. A successful authentication produces a statement
about **who**. It grants no application permission, no governance standing, no right to
act.

That boundary is not a limitation to be lifted later; it is what makes the answer
trustworthy. [Identity vs authority →](/spec/identity-vs-authority)

## What it is not

- **Not an authorization engine for your business rules.** It answers *who*, not
  *may they*. It has RBAC for its own control plane, not for yours.
- **Not an agent framework.** It authenticates agents. It does not run, orchestrate or
  reason about them.
- **Not a memory or reasoning system.** In a Soulseed deployment the canonical actor is
  defined elsewhere; SoulAuth holds a reference, not the definition.
- **Not a billing system.** There is a membership field on the legacy user row, and it
  should not be there — see [project status](/project/status).
- **Not a hosted service.** You run it.
- **Not certified.** No standards organisation has certified any part of it, and
  self-declaration does not create certification.

## When to use something else

Being specific about this is more useful than a feature list:

**Use a hosted provider** (Auth0, Clerk, WorkOS) if you do not want to operate an
identity service. This one is a binary and a database that you keep running, patch and
back up.

**Use Keycloak or Ory** if you need certified OIDC conformance, SAML, or an ecosystem of
existing integrations. SoulAuth implements the Authorization Code flow carefully and
claims nothing beyond it.

**Use better-auth or Lucia** if you want authentication as a library inside one
TypeScript application, rather than a separate service several applications talk to.

**Use SoulAuth** if non-human actors need first-class identity in your system, and you
want every claim in the documentation to name the test that backs it.

## What you actually get

One Rust binary and SurrealDB. Standard OpenID Connect. A machine-readable contract that
a test suite holds against the running code, so the reference pages on this site are
rendered from it rather than written by hand.

And an honest account of what is not finished —
[the readout](/project/status) shows ten written, runnable invariants that the current
implementation does not yet satisfy, each with the reason.

## Next

| | |
|---|---|
| Run it | [Quickstart](/start/quickstart) |
| The agent case | [AI-native identity](/concepts/ai-native-identity) |
| Decide how to integrate | [Integration path](/start/integration-path) |
