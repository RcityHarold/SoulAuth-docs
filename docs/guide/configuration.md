# Configuration

SoulAuth is configured entirely through environment variables (a `.env` file in
the working directory is read at startup). There are four required variables.
Everything else has a default that works.

The exhaustive list lives in the [environment variable
reference](/reference/environment); this page explains the ones whose behaviour
is not obvious from the name.

## The four required variables

```bash
JWT_SECRET=          # ≥32 characters — openssl rand -hex 32
APP_URL=             # your public address
SMTP_HOST=
SMTP_FROM=
```

If any is missing, the process exits at startup with a message naming it.

`SMTP_HOST` and `SMTP_FROM` are required even when
`EMAIL_VERIFICATION_ENABLED=false`, because password reset also sends mail. The
values are only used when SoulAuth actually sends something, so
`127.0.0.1` / `noreply@localhost` is a fine placeholder for local development.

## `APP_URL` does more than you think

This one variable drives four separate behaviours:

1. **The OIDC issuer.** Clients validate the `iss` claim against it. Changing
   `APP_URL` invalidates every outstanding ID token.
2. **Link prefixes in outbound email.** Verification and reset links are built
   from it.
3. **Cookie `Secure` flag.** An `https://` value makes session cookies
   `Secure`; an `http://` one does not.
4. **The production gate.** A non-loopback `APP_URL` switches SoulAuth into
   production mode, where two more variables become mandatory (below).

It is **not** the listen address. That is `BIND_ADDR`, default `0.0.0.0:8080`.
Behind a reverse proxy these differ: `BIND_ADDR=127.0.0.1:8080`,
`APP_URL=https://auth.example.com`.

## The production gate

When `APP_URL` points anywhere other than loopback, SoulAuth **refuses to
start** unless both of these are set:

```bash
OIDC_RSA_PRIVATE_KEY_PATH=/etc/soulauth/oidc-signing.pem
# ...or inline, with \n for newlines:
OIDC_RSA_PRIVATE_KEY_PEM=

MFA_SECRET_ENCRYPTION_KEY=   # openssl rand -base64 32
```

Both defaults are *convenient* and *wrong in production*:

- Without a configured signing key, SoulAuth generates a new RSA key on every
  boot. Every previously issued ID token stops verifying, and replicas do not
  accept each other's tokens.
- Without `MFA_SECRET_ENCRYPTION_KEY`, the TOTP encryption key is derived from
  `JWT_SECRET`. Rotating `JWT_SECRET` — an ordinary, recommended operation —
  then makes every stored TOTP secret undecryptable, locking every MFA user out
  of their own account.

Generate them:

```bash
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 \
  -out /etc/soulauth/oidc-signing.pem
openssl rand -base64 32   # → MFA_SECRET_ENCRYPTION_KEY
```

Failing at startup rather than at 3 a.m. is the entire point of this gate.

## Sessions and tokens

```bash
JWT_EXPIRATION=86400                  # seconds; session and access token lifetime
AUTH_SESSION_CACHE_TTL_SECONDS=5      # 0 = validate against the DB every request
PASSWORD_MIN_LENGTH=12
```

`AUTH_SESSION_CACHE_TTL_SECONDS` bounds how long a *externally* revoked session
can still be accepted. Revocations that go through SoulAuth — logout, status
change, password reset — invalidate the cache immediately, so the TTL does not
delay them.

## Trusting proxy headers

```bash
TRUST_PROXY_HEADERS=false
```

Set this to `true` **only** when SoulAuth genuinely sits behind a reverse proxy
you control. When it is on, SoulAuth reads the client IP from
`X-Forwarded-For`. When SoulAuth is directly reachable, that header is
attacker-controlled — and the client IP is what IP-based rate limiting and IP
lockout key on. Turning it on incorrectly hands attackers a way to rotate their
apparent address at will.

## Database

```bash
DATABASE_URL=127.0.0.1:8000
DATABASE_USER=root
DATABASE_PASS=root
DATABASE_NAMESPACE=auth
DATABASE_NAME=main
DATABASE_CONNECTION_TIMEOUT=30
```

Prefix `DATABASE_URL` with `https://` to connect over TLS. If you point a
plaintext connection at a non-loopback address, SoulAuth logs a warning at
startup: that link carries the database password, password hashes and session
tokens.

The namespace and database must match what you imported the schema into.
SoulAuth checks for the seeded `role:admin` at startup and, if it is absent,
prints the exact `surreal import` commands — with the namespace and database it
was actually looking at — rather than failing with a generic connection error.

## CORS

```bash
CORS_ALLOWED_ORIGINS=
```

Comma-separated. Empty means only `APP_URL` itself is allowed. Because SoulAuth
is a pure API and your login page is a separate origin, you will usually need
to set this.

## Brute-force protection

```bash
LOCKOUT_MAX_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=15
LOCKOUT_RESET_WINDOW_MINUTES=60
LOCKOUT_USER_ENABLED=true
LOCKOUT_IP_ENABLED=true
```

Zero is rejected for the three numeric values — `LOCKOUT_MAX_ATTEMPTS=0` would
lock every account on its first attempt. Disabling either dimension weakens
protection in a specific way; see [Brute-force protection](./lockout).

## Social sign-in

Optional. Each provider needs both halves, or neither:

```bash
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
OAUTH_REDIRECT_URL=       # required once any provider is configured

# Override endpoint roots — e.g. GitHub Enterprise.
# Plaintext values are only permitted for loopback addresses.
GOOGLE_OAUTH_BASE_URL=
GITHUB_OAUTH_BASE_URL=
```

With no provider configured, the corresponding endpoints return `501 Not
Implemented` rather than a confusing failure.

## Outbound proxy

```bash
PROXY_ENABLED=false
PROXY_URL=
```

This affects **OAuth HTTP requests only**. SMTP uses a raw TCP connection and
ignores it.

## Logging

```bash
RUST_LOG=soulauth=info,tower_http=warn
```

Standard [`tracing`
filter](https://docs.rs/tracing-subscriber/latest/tracing_subscriber/filter/struct.EnvFilter.html)
syntax.

## Next steps

- [**Environment variable reference**](/reference/environment) — the complete table.
- [**Deployment**](./deployment) — putting the above into practice.
