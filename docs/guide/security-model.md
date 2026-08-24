# Security Model

What SoulAuth defends against, how, and what it leaves to you.

## Credentials at rest

| Secret | Storage |
| --- | --- |
| Passwords | Argon2 hashes |
| TOTP secrets | ChaCha20-Poly1305, key from `MFA_SECRET_ENCRYPTION_KEY` |
| OIDC client secrets | Hashed; the plaintext is shown once at creation and never again |
| Session & OIDC tokens | Stored as issued |

That last row is an accepted limitation, not an oversight: database read access
is equivalent to session takeover until it changes. It is listed in
[`SECURITY.md`](https://github.com/RcityHarold/SoulAuth/blob/main/SECURITY.md)
in the repository. Scope the database account accordingly and keep backups
encrypted.

## Password policy

At least `PASSWORD_MIN_LENGTH` characters (default 12), containing three of the
four classes: uppercase, lowercase, digit, symbol.

Changing a password revokes everything: all sessions, all OIDC access tokens,
all refresh tokens. A password change that leaves an attacker's session alive
is not a password change.

## Account status is enforced everywhere

`Active`, `Suspended`, `Inactive` and `Deleted` are interpreted in exactly one
function, `User::ensure_usable()`, called on both the session path and the OIDC
path.

The OIDC half matters more than it sounds. Before it existed, suspending an
account had no effect on an integration that already held a refresh token: it
would keep rotating out fresh access and ID tokens indefinitely. Suspension
worked on the login page and nowhere else.

Setting an account to any non-`Active` status now also:

- invalidates the auth cache immediately,
- deletes the user's session rows,
- revokes every OIDC token issued to them.

## Multi-factor authentication

TOTP, with two properties worth naming:

- **Secrets are encrypted at rest** under a key that is independent of
  `JWT_SECRET`, so rotating the JWT secret does not destroy them.
- **A replay watermark** records the last accepted time step. A code cannot be
  spent twice inside its validity window — an attacker who observes a code
  in transit cannot reuse it.

## Brute-force protection

Two independent dimensions, both configurable, both able to be cleared by an
administrator. Covered in [Brute-force protection](./lockout).

Failed-attempt counting increments in a single transaction with a conflict
retry, so parallel login attempts cannot slip past the threshold by racing.

Lockout counts against the **email address**, not the user record — including
addresses that do not exist. If only real accounts accumulated lockout state,
"did this attempt produce a lockout record?" would itself be an account
enumeration oracle.

## Rate limiting

Per-route-template buckets, keyed by client IP. The template matters: bucketing
`/api/auth/verify-email/:token` on the concrete path would give every token its
own counter and limit nothing.

Two operational notes:

- `/health` is exempt, deliberately.
- Credential endpoints count against a shared SurrealDB bucket, so their
  limits hold across replicas. The general-API default rule is per-process by
  design — see [Brute-force protection](./lockout#rate-limiting-sits-underneath).

## OIDC hardening

- **PKCE is mandatory for public clients**, `S256` only. A public client
  omitting `code_challenge` is rejected at `/authorize` — not downgraded.
- **Refresh tokens rotate**, and replaying a spent one invalidates the entire
  token family.
- **Authorization codes are single-use under concurrency** — two simultaneous
  redemptions yield exactly one success.
- **Redirect URIs are validated** at client registration and again at
  authorization.
- **ID tokens are RS256** and verified locally by consumers against JWKS.

## Transport

SoulAuth speaks plain HTTP and expects a TLS-terminating proxy in front. Two
places where this becomes a security decision rather than a deployment detail:

- **`APP_URL` scheme controls the cookie `Secure` flag.** An `http://` value in
  production means session cookies without `Secure`.
- **`TRUST_PROXY_HEADERS` must match reality.** If it is `true` while SoulAuth
  is directly reachable, clients forge `X-Forwarded-For` and IP-based defences
  stop working. See [Deployment](./deployment#reverse-proxy-and-tls).

Database connections should use TLS too — prefix `DATABASE_URL` with `https://`.
SoulAuth warns at startup about plaintext connections to non-loopback
addresses.

## Audit trail

Every security-relevant action writes an event, **including no-ops**. An
unlock call against an account that was not locked still records
`lockout_cleared` with `was_locked: false` — because "an administrator
attempted to unlock this account" is the fact worth keeping, regardless of
outcome.

Identifiers entering audit details are rejected if they contain control
characters. Those values are read in terminals; permitting ANSI escapes there
is a log-injection channel.

## Enumeration resistance

Registration, login, password reset and resend-verification return responses
that do not distinguish "this address exists" from "it does not". Lockout state
accrues for unknown addresses for the same reason.

## What is left to you

SoulAuth does not do these, and does not pretend to:

- **TLS termination** — your proxy.
- **Your application's authorization** — see [Role in the Soulseed
  Ecosystem](./soulseed-ecosystem). SoulAuth's RBAC governs SoulAuth.
- **Secret management** — the environment is read as-is; SoulAuth has no vault
  integration.
- **Database hardening** — least-privilege accounts, encrypted backups,
  network isolation.
- **Bot defence at the edge** — no CAPTCHA, no device fingerprinting.

## Reporting a vulnerability

See
[`SECURITY.md`](https://github.com/RcityHarold/SoulAuth/blob/main/SECURITY.md),
which also carries the current dependency advisory table with a reachability
assessment per item — rather than a raw `cargo audit` dump.

## Next steps

- [**Brute-force protection**](./lockout)
- [**Auditing**](./auditing)
- [**Verifying ID Tokens**](/integrate/verifying-tokens)
