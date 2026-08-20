# The BFF Pattern

If your front end runs in a browser or on a phone, you need a
Backend-for-Frontend between it and SoulAuth. This page explains why, and what
the BFF has to get right.

## Why a pure SPA cannot integrate directly

Three constraints compound:

1. **Browser code cannot hold a `client_secret`.** Anything shipped to the
   client is public. Registering as a `public` client acknowledges this but
   does not fix it.
2. **A refresh token in a browser is a long-lived credential in a hostile
   environment.** `localStorage` is readable by any XSS; a cookie needs a
   server to be `HttpOnly`.
3. **ID tokens are hard-capped at 300 seconds.** The holder must renew within
   five minutes, indefinitely, for the session to persist. That ceiling
   presupposes a server-side session holder — it is not an accident.

The third is the decisive one. Even a perfectly written SPA has to renew every
five minutes, which means storing a refresh token in the browser and running
the rotation logic there — the exact thing the short lifetime is meant to make
unnecessary.

## What a BFF is

A thin server-side component that:

- holds the `client_secret` and the refresh token,
- runs the authorization code flow,
- issues the browser an `HttpOnly`, `Secure`, `SameSite` session cookie,
- proxies or authorizes the front end's API calls.

The browser holds a session cookie. It never sees an OIDC token.

```
  browser  ──cookie──▶  BFF  ──OIDC──▶  SoulAuth
                         │
                         └──▶  your APIs
```

## Responsibilities

### Hold the secret

Server-side only, from the environment or a secret manager.

### Own the callback

Register the BFF's callback as the client's `redirect_uri`. The browser is
redirected there; the BFF redeems the code and never exposes it to the front
end.

### Serialize refreshes

This is where most BFF implementations get it wrong.

Refresh tokens rotate on every use, and replaying a rotated one is treated as
theft — SoulAuth revokes the user's entire token family for that client. So:

- **One refresh at a time, per session.** Two concurrent requests noticing an
  expired token and both refreshing will log the user out.
- **No blind retry on timeout.** A timeout does not mean the refresh failed; it
  may have succeeded with the response lost. Retrying then replays a rotated
  token. Determine the outcome before sending another.

A mutex per session, plus a "did the previous attempt land" check, is the whole
solution — but it has to be there.

### Verify tokens locally

Fetch JWKS once, cache it, verify signatures in process. No network call per
request. → [Verifying ID Tokens](./verifying-tokens)

### Coordinate logout

Clear your session cookie *and* call SoulAuth's RP-initiated logout with the
`id_token_hint`. Skipping the second leaves the SoulAuth session alive: the
user clicks "log in" and is silently signed straight back in, which reads as a
broken logout.

## Session lifetime

Your cookie session and the OIDC token lifetime are separate. A common shape:

- BFF session cookie: hours to days, `HttpOnly` + `Secure` + `SameSite=Lax`.
- SoulAuth ID token: 300 seconds, refreshed silently by the BFF.
- SoulAuth refresh token: bounds the maximum session length.

The user experiences one long session. The tokens underneath are short-lived
and rotating.

## The login page is still yours

`/api/oidc/authorize` needs the user to have a SoulAuth session. Without one
they land on `LOGIN_PAGE_URL` with a `return_to` parameter, and **you** must
provide that page: call `POST /api/auth/login`, then redirect to `return_to`.

This page belongs to SoulAuth's origin conceptually, not to your BFF — it is
where SoulAuth credentials are entered. Set `LOGIN_PAGE_URL` accordingly and
add its origin to `CORS_ALLOWED_ORIGINS`.

## Checklist

- [ ] `client_secret` server-side only
- [ ] Callback registered as the client's `redirect_uri`
- [ ] `state` generated per request and verified on return
- [ ] PKCE with `S256`
- [ ] Refreshes serialized per session
- [ ] No blind retry on refresh timeout
- [ ] JWKS cached; verification is local
- [ ] `iss`, `aud`, `exp` and signature all checked
- [ ] Session cookie `HttpOnly` + `Secure` + `SameSite`
- [ ] Logout clears the cookie **and** calls RP-initiated logout
- [ ] Login page implemented and `LOGIN_PAGE_URL` set

## Next steps

- [**Verifying ID Tokens**](./verifying-tokens)
- [**SoulSeedOS Adapter**](./soulseedos) — a BFF-shaped integration in practice.
