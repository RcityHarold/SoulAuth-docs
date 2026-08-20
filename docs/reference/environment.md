# Environment Variables

The complete list. Explanations of the non-obvious ones are in
[Configuration](/guide/configuration).

A `.env` file in the working directory is read at startup. The repository ships
`.env.example` as a starting point.

## Required

| Variable | Notes |
| --- | --- |
| `JWT_SECRET` | At least 32 characters. `openssl rand -hex 32` |
| `APP_URL` | Your **public** address, not the bind address |
| `SMTP_HOST` | Required even when email verification is off — password reset uses it |
| `SMTP_FROM` | Sender address |

Missing any of these stops startup with a message naming it.

## Required in production

Mandatory whenever `APP_URL` is **not** a loopback address:

| Variable | Notes |
| --- | --- |
| `OIDC_RSA_PRIVATE_KEY_PATH` | Path to the RS256 signing key |
| `OIDC_RSA_PRIVATE_KEY_PEM` | Or inline PEM (`\n` is unescaped) — one of the two |
| `MFA_SECRET_ENCRYPTION_KEY` | `openssl rand -base64 32` |

Without a configured signing key SoulAuth generates a new one per boot,
invalidating every issued ID token and breaking multi-replica setups. Without
an MFA key, the TOTP encryption key derives from `JWT_SECRET`, so rotating that
secret makes every stored TOTP secret undecryptable.

See [the production gate](/guide/configuration#the-production-gate).

## Service

| Variable | Default | Notes |
| --- | --- | --- |
| `BIND_ADDR` | `0.0.0.0:8080` | Listen address |
| `JWT_EXPIRATION` | `86400` | Session and access token lifetime, seconds |
| `PASSWORD_MIN_LENGTH` | `12` | |
| `AUTH_SESSION_CACHE_TTL_SECONDS` | `5` | `0` validates against the database every request |
| `CORS_ALLOWED_ORIGINS` | *(empty)* | Comma-separated; empty allows only `APP_URL` |
| `TRUST_PROXY_HEADERS` | `false` | Only `true` behind a controlled reverse proxy |

## Database

| Variable | Default | Notes |
| --- | --- | --- |
| `DATABASE_URL` | `127.0.0.1:8000` | Prefix `https://` for TLS |
| `DATABASE_USER` | `root` | Use a scoped account in production |
| `DATABASE_PASS` | `root` | |
| `DATABASE_NAMESPACE` | `auth` | Must match the schema import target |
| `DATABASE_NAME` | `main` | Must match the schema import target |
| `DATABASE_CONNECTION_TIMEOUT` | `30` | Seconds |

A plaintext connection to a non-loopback address logs a startup warning — that
link carries the database password, password hashes and session tokens.

## Account lockout

| Variable | Default | Notes |
| --- | --- | --- |
| `LOCKOUT_MAX_ATTEMPTS` | `5` | Must be ≥1 |
| `LOCKOUT_DURATION_MINUTES` | `15` | Must be ≥1 |
| `LOCKOUT_RESET_WINDOW_MINUTES` | `60` | Idle time that clears the counter |
| `LOCKOUT_USER_ENABLED` | `true` | Per-account dimension |
| `LOCKOUT_IP_ENABLED` | `true` | Per-IP dimension |

Zero is rejected for the numeric values. Disabling either dimension leaves a
specific hole — see [Brute-force protection](/guide/lockout#the-two-dimensions-do-different-jobs).

## Email

| Variable | Default | Notes |
| --- | --- | --- |
| `SMTP_PORT` | `587` | |
| `SMTP_USERNAME` | *(empty)* | |
| `SMTP_PASSWORD` | *(empty)* | |
| `SMTP_INSECURE` | `false` | `true` sends over plaintext SMTP — local sinks only |
| `EMAIL_VERIFICATION_ENABLED` | `false` | |

## Front-end URLs

| Variable | Default | Notes |
| --- | --- | --- |
| `LOGIN_PAGE_URL` | `{APP_URL}/login` | Where `/api/oidc/authorize` sends unauthenticated users |
| `VERIFY_EMAIL_PAGE_URL` | derived from `APP_URL` | Target of verification links |

## Social sign-in

All optional; each provider needs both halves or neither.

| Variable | Notes |
| --- | --- |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | |
| `OAUTH_REDIRECT_URL` | Required once any provider is configured |
| `GOOGLE_OAUTH_BASE_URL` | Endpoint root override |
| `GITHUB_OAUTH_BASE_URL` | For GitHub Enterprise; plaintext only for loopback |

With no provider configured, the corresponding endpoints return `501`.

## Outbound proxy

| Variable | Default | Notes |
| --- | --- | --- |
| `PROXY_ENABLED` | `false` | |
| `PROXY_URL` | *(empty)* | **OAuth HTTP only** — SMTP uses raw TCP and ignores it |

## Logging

| Variable | Default |
| --- | --- |
| `RUST_LOG` | `soulauth=info,tower_http=warn` |

Standard `tracing-subscriber` `EnvFilter` syntax.

## Next steps

- [**Configuration**](/guide/configuration) — the reasoning behind the tricky ones.
- [**Deployment**](/guide/deployment)
