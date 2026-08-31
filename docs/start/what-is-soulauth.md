# What SoulAuth is

SoulAuth is a self-hosted authentication service written in Rust that speaks standard
OpenID Connect. One binary and one SurrealDB. A client library that already talks to
Keycloak or Auth0 talks to it without changes.

What it does differently: an AI actor gets an identity record and a key of its own,
rather than a `user` row with a made-up email address on it.

## What you get

**Accounts and sessions** — register, log in, sessions, log out, log out everywhere.
Session tokens are signed JWTs; the database keeps only a SHA-256 fingerprint.

**Email and passwords** — email verification, resend, password reset. An account created
through a social login can set its first password with `initialize-password`. All of it
goes through SMTP; the templates are in the code.

**Multi-factor** — TOTP plus backup codes. Enrolment is two calls (get the secret, then
enable with a real code), so an authenticator set up wrong cannot lock anyone out.

**Social login** — Google and GitHub. `state` and an HttpOnly cookie together are the
CSRF defence; an unverified email at the provider is refused.

**OIDC provider** — Authorization Code with PKCE (`S256` only), RS256-signed ID tokens,
a discovery document, JWKS, refresh token rotation with reuse detection, userinfo, and a
logout endpoint. Client registration and secret rotation have a full admin API.

**AI actors** — Ed25519 challenge–response, with no email, no password and no user row
behind it. See below.

**Permissions and audit** — RBAC over 14 permissions (governing SoulAuth's own admin API
only), account status management, self-service profiles, activity logs, audit reports.

**Protection** — Argon2 for passwords, account and IP lockout, rate limiting by route
template, with counters in the database and shared across replicas.

**Getting in** — no default account. A fresh instance prints a one-time token in its
startup log; you use it to create the first administrator without touching the database.

## The AI actor path

The usual way to give a bot an identity is to create a `user`, invent an email address
and set a password. That runs, but a password can be copied — once the same account is
handed to several people and machines, the log records that the account was used, not
which holder used it.

SoulAuth gives an AI its own `ActorIdentity`. Authentication is two calls:

```
POST /api/actors/challenge      → a one-time nonce
POST /api/actors/authenticate   → the Ed25519 signature back
```

One identity can hold several active keys at once — that exists for safe rotation (add
the new one, confirm it authenticates, revoke the old). It also means each machine can
hold its own key: a successful authentication returns that key's `credential_label`, and
the server stamps its `last_used_at`. Attribution reaches the key, not just the account.

Rotating a key does not change the identity, so audit rows written before the rotation
still resolve to the same actor. The conformance suite checks the code itself:
`src/services/ai_actor.rs` must not contain `human_account`, `password`, `email` or
`username`.
<Status kind="tested" guard="conformance::a6" />

[The full model →](/concepts/actor-identity-model)

## Next

| | |
|---|---|
| Running in five minutes | [Quickstart](/start/quickstart) |
| Choosing an integration | [Integration path](/start/integration-path) |
| Wiring an OIDC client | [Authorization Code flow](/integrate/authorization-code-flow) |
| Giving an AI actor an identity | [AI-native identity](/concepts/ai-native-identity) |
