# Architecture

SoulAuth is one process and one database. This page describes what is inside
the process, what lives in the database, and which decisions in that layout you
will notice when operating it.

## The shape of it

```
                    ┌──────────────────────────────────┐
   browser / app ──▶│  reverse proxy (TLS, you supply) │
                    └────────────────┬─────────────────┘
                                     │ HTTP
                    ┌────────────────▼─────────────────┐
                    │            soulauth              │
                    │  ┌────────────────────────────┐  │
                    │  │ rate limit (per route)     │  │
                    │  ├────────────────────────────┤  │
                    │  │ auth extractor + cache     │  │
                    │  ├────────────────────────────┤  │
                    │  │ routes    auth / users /   │  │
                    │  │           rbac / oidc /    │  │
                    │  │           security / audit │  │
                    │  ├────────────────────────────┤  │
                    │  │ services  auth, oidc, mfa, │  │
                    │  │           lockout, audit   │  │
                    │  └─────────────┬──────────────┘  │
                    └────────────────┼─────────────────┘
                                     │
                    ┌────────────────▼─────────────────┐
                    │           SurrealDB              │
                    │  users, sessions, tokens, roles, │
                    │  permissions, lockouts, audit    │
                    └──────────────────────────────────┘
```

Outbound, SoulAuth talks to exactly two kinds of thing: an SMTP server for
mail, and Google/GitHub for social sign-in — and both are optional.

## Request path

Layer order matters here, and two placements are deliberate.

**Rate limiting runs after route matching.** It is installed with axum's
`route_layer` rather than `layer`, so the middleware can read `MatchedPath` —
the route *template*, like `/api/auth/verify-email/:token`, instead of the
concrete path. Bucketing on the raw path would give every distinct token its
own counter, which is the same as not rate limiting at all. The trade-off is
that requests matching no route (404s) are not counted; those never reach
business logic anyway.

**`/health` is registered after the rate-limit layer**, so it is exempt. A
liveness probe that gets a 429 under load reads as "the process is dead" to an
orchestrator, which then restarts the replica. Rate limiting exists to survive
pressure; that arrangement turns it into a suicide switch under pressure.

## Authentication of API calls

Requests carry a bearer token. The `AuthedUser` extractor validates it, looks up
the session, and confirms the account is usable.

That last check goes through a single function, `User::ensure_usable()`, which
is the only place account status is interpreted. Suspended, inactive and
deleted accounts are rejected there — including on the OIDC token path, where
a refresh token would otherwise keep minting fresh access and ID tokens for an
account that had already been shut off.

Session validation is cached for `AUTH_SESSION_CACHE_TTL_SECONDS` (default 5).
Setting it to `0` makes every authenticated request hit the database. The cache
is invalidated explicitly whenever an account's status changes or its
credentials are revoked, so the TTL bounds staleness for events that *aren't*
routed through SoulAuth — not for the ones that are.

## OIDC

SoulAuth implements the authorization code flow:

1. `GET /api/oidc/authorize` — validates the client, the redirect URI and the
   PKCE challenge, then issues a short-lived authorization code.
2. `POST /api/oidc/token` — redeems the code, once, for an access token, an ID
   token and a refresh token.
3. `GET /api/oidc/userinfo` — returns claims for a valid access token.

Three properties are worth knowing:

- **PKCE is mandatory for public clients**, with `S256` as the only accepted
  method. A public client that omits `code_challenge` is rejected at the
  authorize step, not silently downgraded.
- **Refresh tokens rotate, and reuse is detected.** Presenting a
  previously-redeemed refresh token invalidates the whole token family — the
  standard response to a stolen token being replayed.
- **Code redemption is single-use under concurrency.** Two simultaneous
  redemptions of the same code result in exactly one success.

ID tokens are signed RS256 and published through
[`/api/oidc/jwks`](/reference/oidc#get-api-oidc-jwks). Consumers verify locally; there is no
per-request call back to SoulAuth.

::: warning The signing key must be configured in production
Without `OIDC_RSA_PRIVATE_KEY_PATH` or `OIDC_RSA_PRIVATE_KEY_PEM`, SoulAuth
generates a fresh key at every startup. Previously issued ID tokens stop
verifying, and separate replicas do not recognise each other's tokens. This is
one of the conditions [the production gate](./deployment#the-production-gate)
refuses to start under.
:::

## Data model

Everything lives in one SurrealDB database:

| Area | Tables |
| --- | --- |
| Identity | `user`, `user_profile`, `user_preferences`, `identity` (per-provider social links) |
| Sessions | `session` |
| OIDC | `oidc_client`, `auth_code`, `access_token`, `refresh_token` |
| Access control | `role`, `permission`, `role_permission`, `user_role` |
| Defence | `account_lockout` |
| Audit | `user_activity` |

Social identities are keyed by **provider and subject together**. Looking them
up by subject alone was a real cross-provider takeover: a GitHub account with
numeric id `4001` would match a Google user whose subject was the string
`"4001"`.

Expired authorization codes, tokens and sessions are removed by a periodic
cleanup task rather than accumulating.

::: tip A SurrealDB footgun worth knowing
Comparisons in SurrealDB are type-ordered — a `datetime` never compares
meaningfully against a number or string. Record IDs passed through JSON
bindings degrade to plain strings, so `role_id IN [...]` silently matches
nothing. Both traps are commented at the call sites in the source. If you are
extending SoulAuth's queries, read those comments first.
:::

## Concurrency

Three paths are safe under concurrent access, and each was verified rather than
assumed:

- **Authorization code redemption** — exactly one winner.
- **Refresh token rotation** — exactly one new family; a replayed token
  triggers reuse detection.
- **Failed-login counting** — `failed_attempts += 1` happens in a single
  transaction with a conflict retry, so parallel failed logins cannot
  under-count past the lockout threshold.

## Running more than one replica

SoulAuth is stateless apart from two things you must think about:

1. **The OIDC signing key must be shared.** Configure the same PEM on every
   replica, or tokens issued by one will fail verification at another.
2. **Rate limiting needs a shared backend** to be meaningful across replicas.
   With per-process counters, N replicas means N times the effective limit.

Account lockout is not affected — it lives in the database and is therefore
already shared.

## Next steps

- [**Configuration**](./configuration) — every knob, and which ones matter.
- [**Security Model**](./security-model) — the threats this shape is answering.
- [**Deployment**](./deployment) — TLS, proxies and replicas in practice.
