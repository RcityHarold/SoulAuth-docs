# What SoulAuth is

A self-hosted authentication service. Written in Rust, one binary plus one SurrealDB,
speaking standard OpenID Connect. A client library that already talks to Keycloak or
Auth0 talks to it without changes.

Compared with other authentication services it does one extra thing: an AI actor is a
first-class object here, with an identity record and a key of its own, rather than
something hanging off a `user` row. The rest is a conventional authentication service.

## What is in it

**Accounts and sessions.** Register, log in, log out, log out everywhere. Session tokens
are signed JWTs; the database keeps only a SHA-256 fingerprint.

**Email and passwords.** Email verification, resend, password reset. An account created
through a social login can set its first password with `initialize-password`. All of it
goes over SMTP; the mail templates live in the code.

**Multi-factor.** TOTP plus backup codes. Enabling it takes two calls: fetch the secret,
then confirm with a real code. An authenticator set up wrong therefore cannot lock
anyone out.

**Social login.** Google and GitHub. The CSRF defence is the `state` parameter bound to
an HttpOnly cookie; an unverified email at the provider is refused.

**OIDC provider.** Authorization Code with PKCE (`S256` only), RS256-signed ID tokens, a
discovery document, JWKS, refresh token rotation with reuse detection, userinfo, and a
logout endpoint. Client registration and secret rotation have a full admin API.

**AI actors.** Ed25519 challenge–response, with no email, no password, and no user row
behind it. The next section goes into it.

**Permissions and audit.** RBAC over 14 permissions, governing SoulAuth's own admin API
only. Plus account status management, self-service profiles, activity logs and audit
reports.

**Protection.** Argon2 for passwords, lockout on both the account and the IP, rate
limiting by route template. Counters live in the database, so replicas share one budget.

**The first administrator.** There is no default account. A fresh instance prints a
one-time token in its startup log; you use it to create the first administrator without
touching the database.

## How an AI actor authenticates

A password can be copied. Once the same account is handed to several people and
machines, the log can only record that the account was used, not who used it. So this
path uses keys instead.

Each AI actor is an `ActorIdentity`, and authentication is two calls:

```
POST /api/actors/challenge      → a one-time nonce
POST /api/actors/authenticate   → the Ed25519 signature back
```

One identity can hold several active keys at once. That exists for safe rotation (add
the new one, confirm it authenticates, revoke the old), and it has a useful side effect:
each machine can hold its own. A successful authentication returns that key's
`credential_label` and stamps its `last_used_at`, so attribution reaches the key rather
than stopping at the account.

Rotating a key does not change the identity, so audit rows written before the rotation
still resolve to the same actor. The conformance suite checks the code itself:
`src/services/ai_actor.rs` must not contain `human_account`, `password`, `email` or
`username`.
<Status kind="tested" guard="conformance::a6" />

[The full model →](/concepts/actor-identity-model)

## How it relates to Soulseed

SoulAuth is the authentication component of the Soulseed stack, but it does not depend on
Soulseed and runs perfectly well on its own. Standalone is the default, not a fallback:
with `identity_source` set to `local` and `canonical_actor_ref` empty, authentication
behaves no differently.

Three systems, one job each:

| System | Owns |
|---|---|
| **SoulseedAGI** | What the subject is: the canonical actor, its Mind and intent |
| **SoulAuth** | How the subject proves itself: identity, credentials, sessions |
| **SoulseedOS** | What is running, and under which policy |

The subject SoulAuth authenticates is defined by SoulseedAGI, and the arrow points one
way: SoulAuth stores a reference to the canonical actor and never writes back. Exactly
one thing crosses the boundary, an authentication fact: this request really is that
subject, at this moment, proven this way. Authority does not cross, and neither does
profile data.

If you are not running Soulseed you can skip this section; nothing else on the site
assumes it exists.

[The full ownership boundary →](/spec/soulseed-and-mind-os)

## Next

| | |
|---|---|
| Running in five minutes | [Quickstart](/start/quickstart) |
| Choosing an integration | [Integration path](/start/integration-path) |
| Wiring an OIDC client | [Authorization Code flow](/integrate/authorization-code-flow) |
| Giving an AI actor an identity | [AI-native identity](/concepts/ai-native-identity) |
