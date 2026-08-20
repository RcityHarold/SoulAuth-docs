# Authentication API

`/api/auth` — 21 endpoints. Conventions in [API Conventions](./api).

## Registration and login

### `POST /api/auth/register`

```json
{ "email": "user@example.com", "username": "user", "password": "CorrectHorse42!" }
```

Password policy: at least `PASSWORD_MIN_LENGTH` characters (default 12), with
three of the four classes — uppercase, lowercase, digit, symbol.

`409` if the email or username is taken. Registration grants **no**
administrative rights; see [Deployment](/guide/deployment#deployment-steps) for
creating the first admin.

### `POST /api/auth/login`

```json
{ "email": "user@example.com", "password": "CorrectHorse42!" }
```

Returns a session token. If the account has MFA enabled, the response indicates
that a second factor is required — complete it at
`/api/auth/mfa/login-verify`.

`401` on bad credentials. Repeated failures trigger [account
lockout](/guide/lockout).

### `POST /api/auth/admin/login`

Login for the administrative console. Requires the account to hold at least one
of the console read permissions: `soulauth:users.read`, `soulauth:roles.read`,
`soulauth:security.read`, `soulauth:audit.read`.

### `GET /api/auth/me`

Requires a bearer token. Returns the current user, including `is_admin`.

Tokens do not carry roles — role changes take effect on the next login, and
this endpoint reflects the current state at call time.

## Session management

### `POST /api/auth/logout`

Ends the current session.

### `POST /api/auth/logout-all`

Ends every session for the user.

### `GET /api/auth/sessions`

Lists the user's active sessions. Expired sessions are filtered out, and the
result is capped at 200 entries.

## Email verification

### `GET /api/auth/verify-email/:token`

Consumes a verification token from a verification email.

### `POST /api/auth/resend-verification`

```json
{ "email": "user@example.com" }
```

The response does not reveal whether the address exists.

## Password lifecycle

### `POST /api/auth/request-password-reset`

```json
{ "email": "user@example.com" }
```

Always returns success, regardless of whether the address exists.

### `POST /api/auth/reset-password`

```json
{ "token": "<from the email>", "new_password": "NewCorrectHorse43!" }
```

A successful reset revokes **everything**: all sessions, all OIDC access
tokens, all refresh tokens.

### `POST /api/auth/initialize-password`

For accounts created without a password (administratively provisioned).
Requires authentication. `409` if a password is already set — this endpoint
cannot be used to change an existing one.

## Multi-factor authentication

### `GET /api/auth/mfa/status`

Whether MFA is enabled for the current user.

### `POST /api/auth/mfa/setup`

Begins enrolment. Returns the TOTP secret and provisioning URI. The secret is
stored encrypted with `MFA_SECRET_ENCRYPTION_KEY`.

### `POST /api/auth/mfa/enable`

```json
{ "code": "123456" }
```

Confirms enrolment with a code from the authenticator.

### `POST /api/auth/mfa/disable`

Turns MFA off. Requires authentication and a valid code.

### `POST /api/auth/mfa/login-verify`

Completes a login that requires a second factor.

::: tip Codes cannot be replayed
A watermark records the last accepted time step, so a code cannot be spent
twice within its validity window. An observed code is not a reusable one.
:::

## Social sign-in

| Endpoint | Purpose |
| --- | --- |
| `GET /api/auth/login/google` | Begin the Google flow |
| `GET /api/auth/callback/google` | Google redirects here |
| `GET /api/auth/login/github` | Begin the GitHub flow |
| `GET /api/auth/callback/github` | GitHub redirects here |

A provider with no configured credentials returns `501 Not Implemented`.

Configure with `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`
/ `GITHUB_CLIENT_SECRET`, plus `OAUTH_REDIRECT_URL`. Endpoint roots can be
overridden for GitHub Enterprise via `GITHUB_OAUTH_BASE_URL` — plaintext values
are permitted only for loopback addresses.

::: warning Identities are scoped per provider
Social identities are keyed on **provider and subject together**. Keying on
subject alone was a genuine cross-provider takeover: a GitHub account with
numeric id `4001` matched a Google user whose subject was the string `"4001"`,
and received that user's session.
:::

## Next steps

- [**Users & Profiles**](./users)
- [**Security**](./security)
- [**OIDC**](./oidc)
