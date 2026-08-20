# What is SoulAuth

SoulAuth is an **authentication service**: a single Rust binary, backed by a
single [SurrealDB](https://surrealdb.com/) instance, that owns the question
*"who is making this request?"* on behalf of everything else you run.

It speaks [OpenID Connect](https://openid.net/developers/how-connect-works/),
so the applications that consume it do not need to know anything about
SoulAuth specifically. They speak a standard protocol to a standard endpoint,
verify a signed token locally, and get on with their own work.

## The one-sentence version

> SoulAuth answers **who this is**. It deliberately does not answer **what they
> may do**.

That second half is not an omission — it is the design. The reasoning is worked
out in [Role in the Soulseed Ecosystem](./soulseed-ecosystem), and it is worth
reading before you wire SoulAuth into an authorization decision.

## What you get

Running `soulauth` gives you, immediately:

| Capability | What it means in practice |
| --- | --- |
| **Registration & login** | Email + password, Argon2 hashed, with a configurable minimum length and optional email verification. |
| **Social sign-in** | Google and GitHub, provider-scoped so a GitHub account with numeric id `4001` can never collide with a Google subject `"4001"`. |
| **Sessions** | Server-side session records the user can list and revoke individually or all at once. |
| **MFA** | TOTP with encrypted secrets and a replay watermark, so a code cannot be spent twice inside its window. |
| **Password lifecycle** | Reset by email token, forced initialization for admin-created accounts, and full credential revocation on change. |
| **OIDC provider** | Discovery, JWKS, authorize, token, userinfo, RP-initiated logout, and client registration/management. |
| **RBAC** | Roles, permissions, assignment and checking — governing SoulAuth's own administrative surface. |
| **Brute-force protection** | Per-account and per-IP lockout with tunable thresholds, plus per-route rate limiting. |
| **Audit** | Every security-relevant action recorded, with dashboards, activity summaries and security reports as endpoints. |

That is **74 HTTP endpoints across eight modules**. The full list is in the
[API reference](/reference/api).

## What you can build with it

SoulAuth is useful wherever you would otherwise reach for a hosted identity
provider but want to keep the identity data yourself.

### A login system you actually own

The most common case. You have one or more applications and you want users to
sign up, sign in, reset passwords and turn on two-factor auth — without
shipping user records to a third party, and without assembling the whole thing
from crates yourself. Point your app at SoulAuth's OIDC endpoints and you are
done.

### Single sign-on across several of your own services

Because SoulAuth is a real OIDC provider, several applications can share one
identity. A user signs in once; each application receives its own ID token for
the same subject. Sign-out is coordinated through the `sid` claim and the
RP-initiated logout endpoint.

### A back end for an AI agent or automation system

This is the case SoulAuth was built for, and it shapes the design. When
software takes actions on a person's behalf, "who authorized this?" stops being
a login concern and becomes an evidentiary one. SoulAuth's audit trail records
*who* and *when* for every credential event, and its short-lived, locally
verifiable ID tokens let a downstream system prove which human principal a
given action was attributed to — without that system holding any credentials.

### An identity provider behind a gateway

SoulAuth issues tokens; it does not want to be your API gateway. Put it behind
one. Your gateway validates ID tokens against the JWKS endpoint (no network
call per request after the first key fetch) and forwards a verified subject
downstream.

## What SoulAuth is not

Being clear about the edges saves integration time:

- **Not an authorization server for your business rules.** Its RBAC governs
  SoulAuth's own admin API — every permission is namespaced `soulauth:` for
  exactly this reason. Your application's permissions belong to your
  application.
- **Not a user-facing UI.** SoulAuth is an API. Login pages, consent screens and
  account settings are yours to build (`LOGIN_PAGE_URL` tells SoulAuth where
  yours lives).
- **Not a multi-tenant SaaS control plane.** There is no tenant or organization
  model. If you need one, it lives above SoulAuth, not inside it.
- **Not a directory.** There is no LDAP, no SCIM, no group sync.
- **Not a full OAuth 2.0 authorization server.** SoulAuth implements the
  authorization code flow for authentication. Client credentials, device code
  and resource-scoped access tokens for third-party APIs are out of scope.

## Why Rust, one binary, one database

The operational surface is deliberately small. There is no message queue, no
cache tier, no sidecar. SoulAuth needs a SurrealDB instance and four
environment variables to start, and it refuses to start at all if you point it
at a public URL without the keys that make its tokens survive a restart — see
[the production gate](./deployment#the-production-gate).

Everything that would normally be a runtime surprise is a startup failure
instead.

## How mature is it?

SoulAuth is pre-1.0 and honest about it. What exists is tested: 131 unit tests,
313 integration assertions run against a live server and a live database, and a
deployment walkthrough script that executes the documented install steps end to
end so the documentation cannot drift from reality without CI noticing.

Known gaps and accepted risks are listed in
[`SECURITY.md`](https://github.com/RcityHarold/SoulAuth/blob/main/SECURITY.md)
rather than left for you to discover.

## Next steps

- [**Quickstart**](./quickstart) — a running instance in about five minutes.
- [**Role in the Soulseed Ecosystem**](./soulseed-ecosystem) — where the
  identity/authority boundary falls, and why.
- [**Choosing an integration path**](/integrate/) — which of the three ways to
  connect fits your application.
