# The Authorization Code Flow

The full round trip, with the SoulAuth-specific details called out.

## Overview

```
  user            your app             SoulAuth
   │                 │                    │
   │─── visit ──────▶│                    │
   │                 │── redirect to ────▶│  /api/oidc/authorize
   │                 │   authorize        │
   │◀──────────── login page (if no session) ──│
   │─── credentials ───────────────────────────▶  /api/auth/login
   │                 │                    │
   │◀── redirect back with ?code= ────────│
   │                 │                    │
   │─── code ───────▶│                    │
   │                 │── POST code ──────▶│  /api/oidc/token
   │                 │◀─ id/access/refresh│
   │                 │                    │
   │                 │── verify locally ──│  (JWKS, cached)
   │◀── your session │                    │
```

## 1. Redirect to authorize

```
GET /api/oidc/authorize
  ?response_type=code
  &client_id=<your client_id>
  &redirect_uri=https://app.example.com/auth/callback
  &scope=openid
  &state=<random, tied to the user's browser session>
  &code_challenge=<base64url(sha256(verifier))>
  &code_challenge_method=S256
```

`redirect_uri` must exactly match one registered for the client.

`state` is yours to generate and verify on the way back — it is the CSRF
defence for this flow, and SoulAuth returns it untouched.

::: warning This endpoint uses a browser session, not a bearer token
`/api/oidc/authorize` authenticates the *user*, via their SoulAuth session
cookie. If they have no session, they are redirected to `LOGIN_PAGE_URL`
(default `{APP_URL}/login`) with a `return_to` parameter.

**You have to build that login page.** It must call `POST /api/auth/login` and
then send the browser to `return_to`. SoulAuth ships no UI.
:::

## 2. Generate the PKCE pair

Mandatory for public clients, recommended for everyone. `S256` only.

```bash
CODE_VERIFIER=$(openssl rand -base64 96 | tr -d '\n=' | tr '/+' '_-')
CODE_CHALLENGE=$(printf '%s' "$CODE_VERIFIER" \
  | openssl dgst -binary -sha256 \
  | openssl base64 | tr -d '\n=' | tr '/+' '_-')
```

Keep the verifier server-side, associated with the `state`.

## 3. Handle the callback

```
GET https://app.example.com/auth/callback?code=<code>&state=<state>
```

Verify `state` matches what you issued for this browser session. Then redeem
the code.

## 4. Redeem the code

```bash
curl -X POST https://auth.example.com/api/oidc/token \
  -u "${CLIENT_ID}:${CLIENT_SECRET}" \
  -d grant_type=authorization_code \
  -d code="$CODE" \
  -d redirect_uri=https://app.example.com/auth/callback \
  -d client_id="$CLIENT_ID" \
  -d code_verifier="$CODE_VERIFIER"
```

```json
{
  "access_token": "...",
  "id_token": "...",
  "refresh_token": "...",
  "token_type": "Bearer",
  "expires_in": 300
}
```

Codes are single-use, and single-use **under concurrency**: two simultaneous
redemptions of the same code produce exactly one success.

::: tip A wrong secret does not burn the code
Client authentication failure leaves the code redeemable. Fix the secret,
retry with the same code — no need to send the user back through login.
:::

## 5. Verify the ID token

Locally, against JWKS. Never trust an unverified token, and never call back to
SoulAuth per request. → [Verifying ID Tokens](./verifying-tokens)

## 6. Refresh

```bash
curl -X POST https://auth.example.com/api/oidc/token \
  -u "${CLIENT_ID}:${CLIENT_SECRET}" \
  -d grant_type=refresh_token \
  -d refresh_token="$REFRESH_TOKEN"
```

The response contains a **new** refresh token. The old one is dead.

::: danger Replaying a refresh token logs the user out
Refresh tokens rotate on every use. Presenting an already-rotated token is
treated as a theft signal, and SoulAuth revokes **every token that user holds
for that client**.

This makes naive retry logic dangerous:

- **Serialize refreshes per session.** Never refresh concurrently.
- **Do not blindly retry on timeout.** Determine whether the previous attempt
  succeeded first.

A network hiccup plus an automatic retry equals a logged-out user.
:::

## 7. Log out

```
GET /api/oidc/logout?id_token_hint=<id_token>&post_logout_redirect_uri=...
```

RP-initiated logout. The `sid` claim in the ID token is what lets SoulAuth
identify and terminate the right authentication session.

## Scopes

`openid` is required. SoulAuth's scope set is deliberately small — it
authenticates users; it does not broker access to third-party resource APIs.

## Next steps

- [**Verifying ID Tokens**](./verifying-tokens)
- [**The BFF Pattern**](./bff)
- [**OIDC API reference**](/reference/oidc)
