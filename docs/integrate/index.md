# Choosing an Integration Path

There are three ways to put SoulAuth in front of an application. Pick by what
your application *is*, not by what looks simplest — the wrong choice usually
surfaces weeks later as an authentication bug.

## The three paths

### 1. OIDC with a confidential client — the default

Your application has a server. That server holds the `client_secret`, runs the
authorization code flow, and keeps the refresh token.

**Use this for:** traditional web applications, API gateways, anything with a
back end you control.

→ [The Authorization Code Flow](./auth-code-flow)

### 2. OIDC through a Backend-for-Frontend

Your application is a single-page app or a mobile client. It cannot safely hold
a secret, so a thin server-side component holds it on the app's behalf and
exposes a session cookie to the front end.

**Use this for:** SPAs, mobile apps, and any SoulSeedOS integration.

::: warning A pure SPA cannot integrate directly
Browser code cannot safely hold a `client_secret`, and is a poor place to keep
a long-lived refresh token. ID tokens are hard-capped at 300 seconds, which
means the holder must be able to renew within five minutes — that ceiling
presupposes a server-side session holder. Registering the client as `public`
does not solve this; it just moves the problem.
:::

→ [The BFF Pattern](./bff)

### 3. Direct API calls

Skip OIDC. Call `/api/auth/login` yourself, get a token, send it as
`Authorization: Bearer`.

**Use this for:** internal tools, scripts, and your own admin console. Also the
right choice when SoulAuth is the *only* thing consuming its own identity — no
protocol layer is buying you anything.

**Do not use this** to build your own multi-application SSO. That is what OIDC
already does, correctly.

→ [Authentication API](/reference/auth)

## What every OIDC integration needs

Exactly three values:

```text
issuer     = APP_URL with any trailing slash removed
jwks_uri   = {APP_URL}/api/oidc/jwks
client_id  = from the client registration response
```

::: danger `issuer` must match character for character
Trailing slash, `www` prefix, port number — one character of difference and
every token fails validation with a 401. Copy the `issuer` field out of the
discovery document rather than assembling it by hand:

```bash
curl -s https://auth.example.com/.well-known/openid-configuration | jq -r .issuer
```
:::

## Three behaviours that will bite you

These are not discoverable from the protocol, and each one produces symptoms
far from its cause.

### Replaying a refresh token logs the user out

Refresh tokens are single-use and rotate on every refresh. Presenting a
previously-rotated token is treated as evidence of theft, and SoulAuth revokes
**every token that user holds for that client**.

The practical consequence for a BFF: **retrying a refresh after a network
timeout can log your user out.** Serialize refreshes per session. Do not
refresh concurrently. On a timeout, check whether the previous attempt
succeeded before sending another.

### A wrong client secret does not consume the authorization code

If client authentication fails, the code survives. Fix the secret and the same
code still redeems successfully. You can implement "fix config, retry" without
sending the user back through login.

### `/api/oidc/authorize` authenticates with a session cookie, not a bearer token

When your BFF redirects a user to the authorize endpoint, that user needs an
existing SoulAuth login session. Without one they are redirected to
`LOGIN_PAGE_URL` (default `{APP_URL}/login`) with a `return_to` parameter. Your
login page must call `POST /api/auth/login` and then send the browser back to
`return_to`.

## Verifying an integration

Each step is independently falsifiable, so you find the break where it happens:

```bash
# 1. The issuer is what you configured
curl -s https://auth.example.com/.well-known/openid-configuration | jq -r .issuer

# 2. JWKS is reachable over https and has a kid
curl -s https://auth.example.com/api/oidc/jwks | jq -r '.keys[0].kid'

# 3. Run one real login, then inspect the ID token
echo "$ID_TOKEN" | cut -d. -f2 | base64 -d 2>/dev/null | jq '{iss, aud, sid, exp}'
```

On step 3: `aud` must equal your `client_id`, `iss` must equal your configured
issuer exactly, and `sid` must be non-empty.

::: tip An empty `sid` means you grabbed the wrong token
SoulAuth refuses to sign an ID token when it cannot resolve an authentication
session reference — it never issues one without `sid`. So an empty `sid` means
you are looking at the access token, not the ID token.
:::

## Next steps

- [**Registering a Client**](./clients)
- [**The Authorization Code Flow**](./auth-code-flow)
- [**The BFF Pattern**](./bff)
- [**SoulSeedOS Adapter**](./soulseedos)
