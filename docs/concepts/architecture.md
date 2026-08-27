# Architecture

One Rust binary, one database, and a set of boundaries that are enforced rather than
recommended.

## The shape

<Figure3 locale="en" />

That figure maps **logical responsibilities**. It is not a call sequence and not a
deployment diagram — everything in it runs inside a single process today.

## What each part refuses to do

The interesting part of an architecture is usually the restrictions, so:

### Protocol edge

HTTP handlers for the OIDC endpoints, the client APIs and the admin API. It converts
wire formats into domain calls and back.

It does not make authentication decisions. A handler that decided "this looks fine" would
put an authentication rule somewhere no test is looking for it.

### Identity domain

`ActorIdentity` and the objects around it —
[the model](/concepts/actor-identity-model).

It does not verify credentials. Resolving *who an actor is* and verifying *that a claim
of being them holds right now* are two questions; the object that answers the first must
not be able to answer the second, or every read path becomes a potential authentication
bypass.

### Authentication core

Password verification, TOTP, the AI actor challenge–response, federated callbacks,
account lockout.

It does not grant authority. What comes out is a statement about identity, full stop —
[identity vs authority](/spec/identity-vs-authority).

### Sessions and tokens

Session issuance and revocation; OIDC authorization codes, access tokens, refresh tokens
with rotation and reuse detection.

Session state is **derived, not stored**: there is no `status` column. Active and expired
come from `expires_at`; revoked is expressed by deleting the row. Anything the API
reports about a session is computed at read time, so there is no second source of truth
to drift.

## Boundaries the code holds to

These are enforced, not aspirational. Each names the test that keeps it true.

| Boundary | Guard |
|---|---|
| No plaintext bearer credential is ever stored — sessions, access and refresh tokens, authorization codes, password-reset and email-verification tokens all persist as SHA-256 fingerprints | <Status kind="tested" guard="conformance::b4b" /> |
| One error shape across the whole API: a stable machine code plus a human message, never a bare status with an empty body | <Status kind="tested" guard="conformance::j6" /> |
| The AI actor path never touches human account structures | <Status kind="tested" guard="conformance::a6" /> |
| Every endpoint, config key and permission name in the published contract exists in the running code — and nothing in the running code is missing from it | <Status kind="tested" guard="conformance::j4" /> |
| The service cannot alter its own schema | schema import is an operator step |

That last one has no test because it is structural: SoulAuth issues no DDL. The two SQL
files are imported by whoever deploys it. An authentication service holding permission to
rewrite its own tables is a boundary this project does not cross.

## Persistence

SurrealDB, one namespace and database pair, configured together. Logical stores in the
figure — identity, credential, session, audit — are responsibilities, not separate
databases.

::: warning The namespace/database pair is a real failure mode
Import the schema into a different pair than the process connects with and the service
starts, `/health` returns `ok`, and nothing fails until the first write. This is why the
deployment path has an executable walkthrough rather than only prose.
:::

## Running more than one instance

Stateless for authentication purposes: instances share the database and do not talk to
each other.

<Status kind="planned" /> **Revocation is not instantaneous across replicas.** Each
instance caches resolved sessions. A logout, password change or suspension takes effect
immediately on the instance that handled it; other instances observe it within
`AUTH_SESSION_CACHE_TTL_SECONDS`. Rate limiting and lockout counters *are* shared, since
they live in the database.

That delay is stated rather than hidden because the alternative — claiming global
instant propagation — is the kind of promise that is only discovered to be false during
an incident.

## What the architecture describes but this release does not have

<Status kind="planned" /> A materialised `AuthenticationResult` type ·
a consolidated credential object · formal assurance levels ·
RBAC over `ActorIdentity` · a tamper-evident audit chain.

The full list, with what is not yet true and why, is in the
[conformance readout](/project/status).

## Next

| | |
|---|---|
| The objects | [Actor identity model](/concepts/actor-identity-model) |
| Deploying it | [Deployment](/operate/deployment) |
| Why the boundaries exist | [Specification](/spec/) |
