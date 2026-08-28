# Integration path

Four ways in. Pick by what you are building.

| You are building | Use | Start at |
|---|---|---|
| A web app with a server | **BFF** — tokens stay on your server, browser gets a cookie | [Browser & BFF](/integrate/browser-and-bff) |
| A SPA or native app with no backend | **Public client + PKCE** | [Browser & BFF](/integrate/browser-and-bff#public-client-pkce) |
| An API that receives tokens | **Resource server** — validate, do not obtain | [Verify tokens](/integrate/verify-tokens) |
| An automated agent or job | **AI actor** — a key, not an account | [AI-native identity](/concepts/ai-native-identity) |

Something that already speaks OIDC — Grafana, a Kubernetes dashboard, an off-the-shelf
app — needs no code at all: [register a client](/integrate/register-a-client), hand it
the discovery URL, done.

## The one question worth asking first

**Can this thing keep a secret?**

A server can. A browser cannot, and neither can a mobile binary a user can unpack. That
single answer decides `confidential` versus `public`, which decides everything else.

Getting it wrong in the safe direction (treating a server as public) costs you nothing
but a little security margin. Getting it wrong the other way publishes a secret.

## What every path shares

- **PKCE**, `S256` only — forced on for public clients, on by default for confidential
  ones. Leave it on either way.
- **Redirect URIs match exactly.** No wildcards, no prefixes.
- **Compare `state`** before exchanging a code. It is the CSRF defence.
- **Validate `iss` and `aud`** on every ID token, and pin `alg` yourself.
- **Key users on `(iss, sub)`**, never `sub` alone and never email.

## Agents are different

An AI actor does not go through OIDC at all. It holds an Ed25519 key and signs a
one-time challenge — no account, no password, no redirect.

<Status kind="planned" /> Its session reaches `/api/actors/me` and nothing else: RBAC is
still keyed to human account rows. If your agent needs to call permission-gated
endpoints, that is not available yet, and
[project status](/project/status) says so rather than this page implying otherwise.

## Next

| | |
|---|---|
| Get something running first | [Quickstart](/start/quickstart) |
| Register the client | [Register a client](/integrate/register-a-client) |
