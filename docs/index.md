---
layout: home

hero:
  name: SoulAuth
  text: Identity and authentication for humans and AI agents
  tagline: A self-hosted OpenID Connect provider where a non-human actor is a first-class subject — not a service account wearing a person's clothes.
  actions:
    - theme: brand
      text: Get started
      link: /start/quickstart
    - theme: alt
      text: Why SoulAuth
      link: /start/what-is-soulauth
    - theme: alt
      text: GitHub
      link: https://github.com/RcityHarold/SoulAuth

features:
  - title: An AI agent can hold its own identity
    details: Register an actor with an Ed25519 public key and it authenticates by signing a one-time challenge. No email, no password, no fake human account behind it.
    link: /concepts/ai-native-identity
    linkText: AI-native identity
  - title: Standard OpenID Connect
    details: Authorization Code flow with PKCE (S256 only, forced for public clients), RS256 ID Tokens, discovery, JWKS, refresh-token rotation with reuse detection.
    link: /integrate/authorization-code-flow
    linkText: Wire up a client
  - title: Every claim names its guard
    details: Endpoints, config keys, permissions and standards live in machine-readable registries that a test suite checks against the running code. When a page says "supported", you can open the assertion.
    link: /project/status
    linkText: Conformance readout
  - title: Run it yourself
    details: One Rust binary and SurrealDB. Docker Compose for local, a documented production gate that refuses to start on unsafe defaults.
    link: /operate/deployment
    linkText: Deployment
---

## What it is

SoulAuth is a self-hosted identity provider you run yourself. It speaks OpenID Connect,
so anything that already talks to Keycloak or Auth0 can talk to it — and it treats an
AI agent as a subject in its own right rather than as a human account with a robot avatar.

```bash
git clone https://github.com/RcityHarold/SoulAuth && cd SoulAuth
surreal start --bind 127.0.0.1:8000 --user root --pass root memory &

DB="--endpoint http://127.0.0.1:8000 --user root --pass root --namespace auth --database main"
surreal import $DB schema.sql
surreal import $DB initial_data.sql

export JWT_SECRET=$(openssl rand -hex 32) APP_URL=http://localhost:8080 \
       BIND_ADDR=127.0.0.1:8080 SMTP_HOST=127.0.0.1 SMTP_FROM=noreply@example.com
cargo run
```

Or `docker compose up -d` — the compose file does the same thing, and
[CI runs it on every push](/start/quickstart). The steps above are shown because they
are what the compose file actually does.

There is no default account. A fresh instance prints a one-time bootstrap token in its
startup log — use it to create the first administrator without touching the database:

```bash
curl -X POST http://localhost:8080/api/bootstrap/admin \
  -H 'Content-Type: application/json' \
  -d '{"token":"<from the log>","email":"you@example.com","username":"admin","password":"CorrectHorse42!"}'
```

An agent needs no account at all:

```bash
# The agent's private key never leaves the agent.
curl -X POST http://localhost:8080/api/actors \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"public_key":"<base64url Ed25519 public key>","label":"nightly-runner"}'
```

[Full quickstart →](/start/quickstart)

## Why the agent case is different

Most identity systems let you fake it: give the bot an email address, give it a password,
put it in a group. That works right up until you need to answer a question in the audit
log — *who did this?* — and the honest answer is "a service account somebody created in
2023 and shared over Slack."

SoulAuth separates the objects that most systems merge:

| Object | Answers | Applies to |
|---|---|---|
| `ActorIdentity` | Who is this, durably? | every actor |
| `HumanAccount` | How does a person manage their login? | humans only |
| Credential | What can prove it right now? | both, different kinds |
| `IdentityBinding` | Which external subject is the same actor? | optional |

An agent gets an `ActorIdentity` and a key. That's it — no `HumanAccount` row exists for
it, and the conformance suite asserts that the authentication path never touches one.

<Figure2 locale="en" />

## What this release actually does

Being able to describe an architecture is not the same as having built it. Every
capability on this site carries one of these words, and none of them implies another:

<Status kind="implemented" glossary /> the code path exists ·
<Status kind="supported" glossary /> we carry its contract ·
<Status kind="tested" glossary /> automated evidence covers it ·
<Status kind="conformant" glossary /> verified against an external spec ·
<Status kind="certified" glossary /> a standards body certified it — **nothing here is** ·
<Status kind="planned" glossary /> described but not built ·
<Status kind="deprecated" glossary /> present, but scheduled for removal

Click any badge for its exact meaning. Where a badge makes a real claim rather than
defining a word, it names the assertion that backs it — like
<Status kind="tested" guard="conformance::j8" />, the guard over AI actor
authentication.

<Conformance />

## What it is not

- **Not an authorization server for your application's rules.** A successful
  authentication tells you *who*. It grants no application authority.
  [Identity vs authority →](/spec/identity-vs-authority)
- **Not certified.** No OpenID Foundation certification exists for this project, and
  self-declaration does not create one.
- **Not a hosted service.** You run it.

## Where to go next

| If you want to… | Start here |
|---|---|
| See it running in five minutes | [Quickstart](/start/quickstart) |
| Connect a web app over OIDC | [Authorization Code flow](/integrate/authorization-code-flow) |
| Give an AI agent an identity | [AI-native identity](/concepts/ai-native-identity) |
| Know exactly what's supported | [Project status](/project/status) |
| Understand the model before coding | [Actor identity model](/concepts/actor-identity-model) |
| Read the full specification | [Specification](/spec/) |
