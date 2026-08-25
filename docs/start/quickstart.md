# Quickstart

## From zero to a first verified authentication result

This page does one thing:

> **Start from a fresh SoulAuth development instance, walk the release's golden path, and
> obtain a first authentication result you can independently verify.**

```text
Start SoulAuth
        ↓
Verify Runtime Readiness
        ↓
Establish Minimal Client State
        ↓
Establish a Test Human
        ↓
Run the Current Golden-path Authentication
        ↓
Validate the Authentication Result
```

Success is not the process starting, not the browser returning to your application, and
not the token endpoint answering. It is:

> **the client has independently proven, under the current authentication and protocol
> contract, that this authentication result is trustworthy.**

## Quickstart success is not production readiness

This page uses a **development environment** only.

```text
Quickstart Success
≠
Production Readiness
```

It proves the shortest developer path of the current release works. It proves nothing
about the production key/secret boundary, backup and recovery, the production issuer,
runtime topology, security operations or production evidence. Before production, complete
[Deployment](../operate/deployment) and
[Production Checklist](../operate/production-checklist) separately.

## Before you start

Prepare only what the release's official local development path requires: a running
SurrealDB instance and a Rust toolchain (edition 2021).

This Quickstart does not ask you to connect to SoulAuth's private persistence by hand,
create tables manually, insert Actor, client or credential records directly, or bypass the
supported control plane by editing database state:

```text
Quickstart
≠
Direct Persistence Setup
```

## Step 1 · Start SoulAuth

The application performs no DDL of its own — the schema and seed data are imported once:

```bash
surreal import --endpoint http://127.0.0.1:8000 --user root --pass root \
    --namespace auth --database main schema.sql
surreal import --endpoint http://127.0.0.1:8000 --user root --pass root \
    --namespace auth --database main initial_data.sql
```

Four environment variables are required; nothing else is:

```bash
export JWT_SECRET=$(openssl rand -hex 32)   # at least 32 characters
export APP_URL=http://localhost:8080        # loopback keeps development gates open
export SMTP_HOST=127.0.0.1
export SMTP_FROM=noreply@localhost

cargo run
```

`APP_URL` is the **public** address, not the listen address — that is `BIND_ADDR`,
default `0.0.0.0:8080`. It determines the OIDC issuer, the prefix of links in outgoing
mail, and whether session cookies carry `Secure`. Pointing it at a non-loopback host
switches the production gates on.

The full configuration vocabulary is owned by the config registry and explained in
[Configuration](../reference/configuration).

A start command returning does not mean the runtime can accept the next step.

## Step 2 · Verify runtime readiness

```text
Process Started
≠
Runtime Ready
```

```bash
curl -s http://localhost:8080/health
```

If readiness cannot be established, do not continue to client provisioning or the
authentication flow. Go to [Troubleshooting](../operate/troubleshooting) or
[Deployment](../operate/deployment) first.

## Step 3 · Verify the protocol surface

The golden path uses OpenID Connect, so confirm the declared protocol surface is really
available before authenticating. The trust order stays:

```text
Configured Trusted Issuer
        ↓
Current OIDC Metadata
        ↓
Declared Protocol Endpoints
```

never:

```text
Unknown endpoint / token → discover arbitrary issuer → trust it
```

```bash
curl -s http://localhost:8080/.well-known/openid-configuration
```

What this proves is that the protocol contract the Quickstart depends on is usable by a
client. The semantics of the authorization endpoint, the token endpoint, key distribution
and metadata belong to [OIDC & Clients](../reference/oidc-and-clients) and
[Authorization Code Flow](../integrate/authorization-code-flow).

## Step 4 · Establish the Quickstart client

Before authentication, a software client must exist. Keep:

```text
Client
≠
Actor
```

Client answers *which software participant is using SoulAuth.* Actor answers *who is being
authenticated.*

The client must be created through the supported administrative path:

```text
Client Provisioning
≠
Direct Persistence Mutation
```

A fresh instance has a genuine deadlock: registering an OIDC client requires
`soulauth:oidc_clients.write`, which comes from the `admin` role — and the first admin
would otherwise have to be granted by writing to the database directly. The current
release therefore provides a bootstrap path for exactly that window. On startup, the
runtime logs the command to run, including a freshly generated token:

```bash
curl -X POST http://localhost:8080/api/bootstrap/admin \
  -H 'Content-Type: application/json' \
  -d '{"token":"<TOKEN FROM STARTUP LOG>","email":"you@example.com",
       "username":"admin","password":"<at least the configured minimum length>"}'
```

The gate closes permanently once an administrator exists — its success condition is
exactly its deactivation condition. Set `SOULAUTH_BOOTSTRAP_TOKEN` to a fixed value when
you need a deterministic token, or to an empty string to disable the path entirely.

> **Being the first registered client or the bootstrap administrator is a runtime
> capability of this release, not a general architectural assumption.** Register a client
> properly, and the client contract itself, per
> [Register a Client](../integrate/register-a-client) and
> [OIDC & Clients](../reference/oidc-and-clients).

## Step 5 · Establish the test human

This golden path uses a **Human** as the authenticated Actor. That does not make SoulAuth
a human-only system — it means human interactive authentication is the first golden path
the Quickstart chooses.

Use the supported development provisioning path to create a test human and establish the
authentication conditions this path actually needs. HumanAccount, credential, password,
MFA and recovery are not redefined here; they belong to
[Actors & Profiles](../reference/actors-and-profiles) and
[Authentication & Sessions](../reference/authentication-and-sessions).

### The golden path does not require an AuthSession to exist

Do not read a mandatory runtime chain of
`Human → Authentication → AuthSession → Authorization Code` into this:

```text
Successful Authentication
≠
AuthSession Necessarily Created
```

Whether an AuthSession is established, and how it continues, is defined by the
authentication contract. Quickstart observes what the golden path really does — it does
not invent a stage to make the summary look complete.

## Step 6 · Run the golden-path authentication

The profile uses **authorization code flow with PKCE.** This page runs it; it does not
re-explain it.

```text
Authorization Request
        ↓
Actor Authentication
        ↓
Authorization Response
        ↓
Transaction Validation
        ↓
Authorization Code Exchange
```

Why `state`, PKCE, `nonce`, the redirect and client authentication each exist and how they
work belongs to [Authorization Code Flow](../integrate/authorization-code-flow). Quickstart
does not become a second protocol tutorial.

### A token response is not the success condition

```text
Token Response Success
≠
Verified Authentication Result
```

Once the token endpoint answers, the authentication result still has to be validated. This
page does not maintain a token response field list, and does not announce refresh tokens,
UserInfo or other optional capabilities in passing — the token surface belongs to
[OIDC & Clients](../reference/oidc-and-clients).

## Step 7 · Validate the OIDC authentication result

The final step is validating the ID token fully. Never:

```text
Decode JWT → Read Claims → Trust Identity
```

```text
ID Token Decoded
≠
ID Token Validated
```

Use the trusted issuer the release declares, the current OIDC metadata and verification
contract, and the complete validation the profile requires. Representative checks include
cryptographic validation, issuer, audience, time validity and — where applicable —
transaction binding. The complete normative rules belong to
[Authorization Code Flow](../integrate/authorization-code-flow) and
[OIDC & Clients](../reference/oidc-and-clients).

## Step 8 · Interpret the verified OIDC subject correctly

After validation, the client may consume the verified claims. `sub` must always be
interpreted inside the **trusted issuer / current OIDC subject contract**:

```text
Trusted Issuer
+
Validated `sub`
        ↓
Verified OIDC Subject Context
```

not:

```text
`sub` → Global Actor ID
```

### `sub` is not the ActorIdentity resource ID

```text
OIDC `sub`
≠
ActorIdentity Resource ID
```

`sub` belongs to the OIDC subject namespace; the ActorIdentity resource ID belongs to
SoulAuth's identity domain resource namespace. Matching strings do not license an implicit
cast.

### `sub` is not the stable subject foundation

```text
OIDC `sub`
≠
Stable Subject Foundation
```

This page does not tell you "`sub` is the stable Actor subject". Identity continuity and
OIDC subject policy are different layers of semantics.

### Mutable profile data does not replace the subject

Do not use email, username or display name in place of verified issuer + `sub` to build
your authentication subject mapping. The complete subject contract belongs to
[OIDC & Clients](../reference/oidc-and-clients).

### ID token and access token stay separate

Even when the token response contains both:

```text
ID Token      ≠  API Access Token
Access Token  ≠  JWT by definition
```

If your next step is protecting a backend/API, continue to
[Verify Tokens](../integrate/verify-tokens). Quickstart does not infer an access token's
public contract from the fact that it can be decoded.

## Expected result

```text
Runtime Ready                              PASS
Current Protocol Surface                   PASS
Client Provisioning                        PASS
Human Authentication                       PASS
OIDC Transaction                           PASS
ID Token Validation                        PASS
Verified Issuer-scoped OIDC Subject Context  ESTABLISHED
```

The last line means the client can trustworthily identify the subject of this
authentication inside the current OIDC subject contract. It does not mean the client
obtained the SoulAuth ActorIdentity resource itself, and it does not mean the Actor gained
any downstream authority.

## Quickstart at a glance

| Boundary | Meaning |
| --- | --- |
| **Quickstart success ≠ Production readiness** | A development first success is not a production gate |
| **Process started ≠ Runtime ready** | A running process is not a serviceable runtime |
| **Client ≠ Actor** | A software participant is not the authenticated subject |
| **Client provisioning ≠ Direct persistence mutation** | Initial setup goes through supported paths |
| **Human golden path ≠ Human-only architecture** | Human is just the first developer path |
| **Authentication success ≠ AuthSession created** | A session is not a mandatory stage |
| **Protocol explanation ≠ Quickstart procedure** | Quickstart runs the protocol; it does not define it |
| **Token response success ≠ Verified result** | Validation still follows |
| **Decoded ≠ Validated** | Readable is not trustworthy |
| **`sub` ≠ ActorIdentity resource ID** | Two namespaces do not merge implicitly |
| **`sub` ≠ Stable subject foundation** | A protocol subject is not a continuity primitive |
| **ID token ≠ API access token** | Authentication result is not resource access |
| **Access token ≠ JWT by definition** | Representation comes from the token contract |

## If it fails

| Failure stage | Go to |
| --- | --- |
| **Runtime will not start or become ready** | [Deployment](../operate/deployment) → [Troubleshooting](../operate/troubleshooting) |
| **Initial client provisioning fails** | [Register a Client](../integrate/register-a-client) → [Administration](../reference/administration) |
| **Human provisioning / authentication fails** | [Authentication & Sessions](../reference/authentication-and-sessions) → [Troubleshooting](../operate/troubleshooting) |
| **The authorization transaction fails** | [Authorization Code Flow](../integrate/authorization-code-flow) → [Troubleshooting](../operate/troubleshooting) |
| **ID token validation fails** | [OIDC & Clients](../reference/oidc-and-clients) → [Troubleshooting](../operate/troubleshooting) |
| **Using the access token against an API fails** | [Verify Tokens](../integrate/verify-tokens) → [Troubleshooting](../operate/troubleshooting) |

If you see identity misattribution, unknown trust material, suspected persistence
corruption or possible security material compromise, stop ordinary Quickstart debugging
and go to [Operations & Recovery](../operate/operations-and-recovery).

## Next

If you are unsure which integration boundary your real system needs:
[Choose an Integration Path](./integration-path). To register a real application client:
[Register a Client](../integrate/register-a-client). To understand the authorization code
transaction properly: [Authorization Code Flow](../integrate/authorization-code-flow). To
protect a backend/API: [Verify Tokens](../integrate/verify-tokens). To move towards a real
deployment: [Deployment](../operate/deployment), then
[Production Checklist](../operate/production-checklist). To understand why Human and
AIActor share one ActorIdentity contract:
[AI-native Identity](../concepts/ai-native-identity) and
[Actor Identity Model](../concepts/actor-identity-model).

## Exact contract source

This page owns the **golden-path Quickstart procedure of the current release.**

The repository URL, local runtime packaging, start command, readiness endpoint, default
port, initial client provisioning mechanism, client schema, human provisioning mechanism,
human authentication method, authorization endpoint, PKCE profile, token endpoint, token
response schema, ID token validation command, OIDC subject policy and the current
supported feature set are all owned elsewhere: the release artifact, the machine-readable
contracts, the canonical references, the runtime, verification evidence and
[Project Status](../project/status).

```text
Quickstart Consumes Current Contracts
Quickstart Does Not Define Current Contracts
```
