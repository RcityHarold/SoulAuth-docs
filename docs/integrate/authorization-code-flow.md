# Authorization Code Flow

## Establishing a trusted OIDC authentication result through the supported Authorization Code + PKCE profile

The previous page completed client registration. A registered, correctly configured client
can now enter the interactive OAuth / OpenID Connect flow the current release supports.

This page describes **Authorization Code Flow with PKCE** as SoulAuth's interactive OIDC
integration path. It is a **client-facing protocol flow** — not a single authentication
method every Actor uses.

It answers one question:

> **How does a registered client establish and validate an authorization code
> transaction, ending with a trustworthy OIDC authentication result?**

```text
Registered Client
        ↓
Load trusted protocol metadata
        ↓
Prepare transaction-bound state
        ↓
Authorization Request
        ↓
SoulAuth establishes / reuses applicable Actor authentication
        ↓
Authorization Response
        ↓
Validate transaction association
        ↓
Exchange Authorization Code
        ↓
Validate ID Token
        ↓
Establish issuer-scoped OIDC subject context
```

## Before you start

- The client is registered per [Register a Client](./register-a-client).
- The release formally supports the authorization code profile described here.
- The client is pre-configured to trust the correct SoulAuth issuer.
- The client knows which registered redirect URI the contract allows.
- The client can safely store the local state this transaction needs.
- Client authentication is configured, if the profile requires it.
- Which of PKCE, `state` and `nonce` are required comes from the current OIDC profile.

A golden path describes **how to use a declared protocol path correctly.** It does not
decide what the release supports.

## Step 1 · Load protocol metadata from a trusted issuer

A client must not guess the authorization endpoint, token endpoint, key set endpoint or
any other OIDC endpoint. The correct trust order is:

```text
Trusted Issuer
        ↓
OIDC Discovery / Metadata
        ↓
Declared Protocol Endpoints
```

not:

```text
Unknown Token / URL → discover an issuer → automatically trust it
```

> **Trust the issuer first. Discover capabilities second.**

Discovery answers *which protocol capabilities does this already-trusted issuer declare?*
It does not answer *whom should the client trust?*

```text
Discovery
≠
Trust Bootstrap from Arbitrary Input
```

A client must never read an arbitrary `iss` out of an artifact of unknown origin and
follow it into a new trust relationship.

## Step 2 · Prepare security state for this transaction

Several relations in this flow are routinely confused. They solve different problems:

| Mechanism | What it answers |
| --- | --- |
| **`state`** | Does the returned authorization response belong to the transaction this client started? |
| **PKCE** | Is the code exchange correctly related to the verifier from the original transaction? |
| **`nonce`** | Where the profile applies: is the ID token correctly associated with the original authentication request? |
| **Client authentication** | Which software client is performing the token exchange? |
| **Actor authentication** | Which Actor is being authenticated? |

```text
state ≠ PKCE ≠ nonce ≠ Client Authentication ≠ Actor Authentication
```

None substitutes for another.

### `state`, where the profile requires it

The client creates and retains transaction-correlation state. When the authorization
response returns, the client must confirm under the contract that the response really
belongs to the transaction it started. If that association cannot be established:

```text
Reject Transaction
```

Do not exchange the code, do not trust the returned identity information, and do not
assume "the state was probably just lost".

```text
Authorization Response Received
≠
Trusted Transaction
```

### PKCE, where the profile requires it

```text
code_verifier → derive → code_challenge
```

The authorization request carries the challenge; the later exchange submits the original
verifier; SoulAuth validates the relation under the PKCE contract.

```text
PKCE
≠
Client Authentication
```

PKCE binds the code exchange to the original transaction. Client authentication verifies
the software client. Both may appear in one flow.

The exact PKCE method — including whether the profile requires `S256` — comes from
[OIDC & Clients](../reference/oidc-and-clients) and the current metadata. This guide does
not widen the supported range.

### `nonce`, where applicable

Bind it to the current authentication transaction and verify it during ID token
validation under the OIDC contract. If it cannot be matched:

```text
Do not trust the OIDC authentication result
```

`nonce` covers the relation between the OIDC authentication request and the ID token. It
does not replace `state` or PKCE.

### Transaction state is not reused across requests

Whether the profile uses `state`, `nonce`, a PKCE verifier or another transaction-bound
value:

```text
Transaction-bound State belongs to one Transaction
```

A fixed value must not be reused across many authentication requests.

## Step 3 · Send the authorization request

Having obtained the authorization endpoint from trusted metadata, the client builds the
request. A **semantic** example:

```text
authorization_endpoint

client_id
registered redirect_uri
response_type=code
openid scope

transaction correlation state
PKCE challenge, where required
nonce, where applicable
```

This is not a complete raw HTTP contract. Exact parameters, requiredness, encoding,
supported scopes, PKCE method and error semantics come from
[OIDC & Clients](../reference/oidc-and-clients) and the applicable specifications.

```text
OAuth `client_id`
≠
ActorIdentity
```

`client_id` identifies the protocol client, not the Actor being authenticated.

### The redirect stays inside the registered protocol boundary

The redirect in the request must come from the registered boundary the client contract
allows:

```text
Redirect URI
≠
Arbitrary Application Return URL
```

An application's internal `return_to=/projects/123` answers post-login navigation. It does
not replace the OAuth/OIDC redirect contract. That boundary is defined in
[Register a Client](./register-a-client); redirect matching rules are not repeated here.

## Step 4 · SoulAuth establishes or reuses an Actor authentication context

An authorization request arriving does not mean a login UI must be shown every time. The
accurate question is:

> **Does an authentication context satisfying this request's requirements already exist?**

If an existing context meets the current authentication policy, assurance, freshness and
client/protocol requirements, SoulAuth may reuse it under its own authentication contract.
If not, it establishes a new authentication result using a supported method.

```text
Every Authorization Request
≠
Forced New Authentication
```

AuthSession and SSO reuse semantics belong to
[Authentication & Sessions](../reference/authentication-and-sessions). This guide does not
redefine credentials, authentication methods or AuthSession.

### Protocol authorization creates no cross-domain authority

```text
OAuth / OIDC Protocol Authorization  ≠  Application Authority
OAuth / OIDC Protocol Authorization  ≠  Soulseed Governance Authority
OAuth / OIDC Protocol Authorization  ≠  Universal Execution Authority
```

Completing this flow does not give the Actor downstream rights to act. Application and
Soulseed authority remain with their own domains.

## Step 5 · Validate that the response belongs to the original transaction

Once SoulAuth has completed authentication and protocol processing, the browser carries
the authorization response back to the registered redirect boundary. But:

> **A response arriving at the callback is not trust being established.**

```text
receive response
        ↓
validate transaction association
        ↓
trusted transaction?
       / \
     no   yes
     ↓     ↓
 reject  process result
```

```text
Authorization Response Received
≠
Trusted Transaction
```

Whether the response indicates success or a protocol error, if the request used a
transaction-correlation control, the client must validate it first. Otherwise: do not
exchange the code, do not consume the identity result, and do not treat the returned error
context as a trustworthy result of its own transaction.

## Step 6 · Handle the authorization code

```text
Authorization Code  ≠  Access Token
Authorization Code  ≠  Actor Credential
Authorization Code  ≠  AuthSession
```

An authorization code is a **bounded continuation artifact within this protocol
transaction.** It is not a resource credential and does not represent an ActorIdentity.

Per the code contract, a consumed, expired or invalid code cannot be used as a valid
exchange input again:

```text
Expected Second-use Rejection
≠
Server Instability
```

If the first legitimate use succeeded and the second failed, single-use protection is very
likely working correctly.

Authorization codes, transaction verifiers and similar sensitive protocol material must
not enter ordinary logs, audit records or public debug output.

## Step 7 · Exchange the authorization code

Only after the transaction has been trustworthily associated does the client proceed to
the token exchange. Semantically the profile may require:

```text
grant_type = authorization_code
authorization code
registered redirect context
PKCE verifier, where required
Client Authentication, where required
```

The exact wire representation comes from the token endpoint contract. Once again:

```text
PKCE                  → transaction continuation binding
Client Authentication → software client authentication
Actor Authentication  → Actor authentication
```

### Token endpoint success is not a verified identity

A successful token response means only that this exchange produced a token response as the
contract defines:

```text
Token Response Success
≠
Verified OIDC Authentication Result
```

The client must still validate the ID token fully.

### ID token and access token are separate

```text
ID Token      ≠  Access Token
Access Token  ≠  JWT by definition
```

The ID token carries the OIDC authentication result; the access token carries the access
capability the protected resource contract defines. Do not call an ordinary resource API
with an ID token. How to validate an access token belongs to
[Verify Tokens](./verify-tokens).

## Step 8 · Validate the ID token fully

Use the pre-trusted SoulAuth issuer, the metadata and key information that issuer
declares, and a mature, maintained OIDC client library to perform the validation the
profile requires. Never:

```text
base64 decode → read claims → trust identity
```

```text
ID Token Decoded
≠
ID Token Validated
```

### Representative validation requirements

The complete requirements come from the applicable OIDC specifications and SoulAuth's
current OIDC profile. Common critical checks include, where applicable:

```text
signature / allowed key and algorithm
issuer
audience
expiration / time semantics
nonce, when used
other required OIDC context
```

Any security-critical validation failing means this ID token cannot form a trustworthy
authentication result. And:

```text
Valid Signature
≠
Valid OIDC Authentication Result
```

A verified signature does not prove the issuer is correct, the audience is correct, the
artifact is still valid, or that it belongs to this authentication transaction.

## Step 9 · Establish an issuer-scoped OIDC subject context

Once the ID token validates, the client may consume the verified claims. Among them,
`sub` expresses the **OIDC subject identifier** — always interpreted inside the
corresponding **issuer / subject policy namespace**:

```text
Trusted Issuer Context
+
Validated `sub`
        ↓
OIDC Subject Context
```

not:

```text
bare `sub` → global Actor ID
```

### `sub` is not the ActorIdentity resource ID

```text
OIDC `sub`
≠
ActorIdentity Resource ID
```

The resource ID belongs to SoulAuth's identity domain resource namespace; `sub` belongs to
the OIDC subject namespace. Even where an implementation maps between them, they must not
be cast directly without a contract.

### `sub` is not the stable subject foundation

```text
OIDC `sub`
≠
Stable Subject Foundation
```

The stable subject foundation is a semantic primitive for ActorIdentity continuity. It
does not automatically become a public OIDC field, a public resource identifier or a
persistence key. This page does not claim "OIDC `sub` is built on the stable subject
contract", and does not write `sub → stable Actor subject`.

### An OIDC subject needs issuer context

```text
OIDC Subject = Issuer Context + `sub`
```

```text
Issuer A, sub = "123"
Issuer B, sub = "123"
```

must not be read as the same identity merely because the strings match.

### `sub` stability is understood only inside its own subject contract

"Stable" must not be read as *the same Actor always exposes one public identifier to every
client, consumer and issuer.* The current OIDC profile may have its own public/pairwise,
consumer/sector, privacy and reuse semantics.

> **The stability and reuse scope of `sub` is defined only by the current OIDC subject
> contract.**

### Mutable profile claims do not replace subject identity

```text
Mutable Profile Attribute
≠
OIDC Subject Identity
```

Email, username, display name and other mutable attributes must not be substituted for the
OIDC subject.

### ID token validation does not create an ActorIdentity

Validating an ID token creates no SoulAuth ActorIdentity on the client side. What it
achieves is: **the client may now trust SoulAuth's authentication result within this
issuer-scoped OIDC subject contract.** ActorIdentity itself remains in the SoulAuth
identity domain.

## Failure semantics

All failures compress into three stages.

**1 · Transaction association failure** — the response cannot be trustworthily associated
with the original transaction. Result: `Reject Transaction`. Do not proceed to exchange.

**2 · Exchange failure** — the code lifecycle, client binding, redirect binding, PKCE or
client authentication the contract requires did not hold. Result: `Reject Exchange`. Exact
OAuth errors come from [OIDC & Clients](../reference/oidc-and-clients).

**3 · OIDC authentication-result validation failure** — the ID token cannot complete the
required validation. Result: `Do Not Trust the Authentication Result`.

### Fail closed applies to this untrusted transaction

```text
Required Trust Condition Failed
        ↓
Current Transaction must not continue as trusted success
```

This does not mean one failing transaction stops the whole service. Fail closed means
**when a security-critical condition for establishing trust fails, unknown or failed state
must not be downgraded into success.**

## Expected result

After the flow, the client can say:

> **I validated this authorization transaction and obtained a verified OIDC authentication
> result from a trusted issuer under the current OIDC contract.**

```text
Trusted Issuer
        + Validated Transaction
        + Valid Code Exchange
        + Validated ID Token
        + Issuer-scoped `sub`
        ↓
Verified OIDC Authentication Result
```

It is not the ActorIdentity resource itself, and not universal authority.

## Complete flow

```text
Client                    Browser                   SoulAuth
  │                          │                         │
  │ prepare applicable       │                         │
  │ transaction state        │                         │
  │                          │                         │
  │──── Authorization ──────▶│──── Authorization ─────▶│
  │                          │                         │
  │                          │◀─ establish / reuse ───▶│
  │                          │   actor authentication  │
  │                          │                         │
  │◀──── response / code ────│◀──── Redirect ──────────│
  │                          │                         │
  │ validate transaction     │                         │
  │                          │                         │
  │──── code exchange + applicable transaction ───────▶│
  │     / client-auth inputs │                         │
  │                          │                         │
  │◀──────────── Token Response ───────────────────────│
  │                          │                         │
  │ validate ID Token        │                         │
  │ establish issuer + sub   │                         │
  ▼
Verified OIDC Authentication Result
```

This is a local explanatory diagram for the authorization code flow — not a new canonical
architecture figure. It does not define browser token storage, cookies, application
sessions, CSRF or BFF architecture; those belong to
[Browser & BFF](./browser-and-bff).

## Authorization code flow at a glance

| Boundary | Meaning |
| --- | --- |
| **Authorization code ≠ Access token** | A code continues a protocol transaction |
| **Authorization code ≠ Actor credential** | A code does not prove an Actor |
| **Authorization code ≠ AuthSession** | Protocol continuation is not authentication continuity |
| **PKCE ≠ Client authentication** | Transaction binding is not client identity |
| **Client authentication ≠ Actor authentication** | Software and Actor proof are separate |
| **Response received ≠ Trusted transaction** | Callback arrival does not establish trust |
| **Token response success ≠ Verified result** | ID token validation still follows |
| **Decoded ≠ Validated** | Parseable is not trustworthy |
| **Valid signature ≠ Valid OIDC result** | Signature is one part of validation |
| **ID token ≠ Access token** | Authentication result is not resource access |
| **Access token ≠ JWT by definition** | Representation comes from the token contract |
| **`sub` ≠ ActorIdentity resource ID** | Two namespaces, no implicit cast |
| **`sub` ≠ Stable subject foundation** | A continuity primitive is not a public identifier |
| **Mutable attribute ≠ Subject identity** | Email and display name cannot stand in |
| **Protocol authorization ≠ Cross-domain authority** | Completing the flow creates no universal authority |

Compressed:

```text
Trust the Issuer
        ↓
Prepare transaction state
        ↓
Send authorization request
        ↓
Establish / reuse Actor authentication
        ↓
Validate authorization response
        ↓
Exchange authorization code
        ↓
Validate ID Token
        ↓
Interpret `sub` inside the trusted Issuer namespace
        ↓
Verified OIDC Authentication Result
```

## If the flow fails

| Stage | First place to look |
| --- | --- |
| **Cannot establish transaction association** | Client transaction state / current OAuth profile |
| **Authorization request rejected** | Client / redirect / request contract |
| **Actor authentication cannot be established** | [Authentication & Sessions](../reference/authentication-and-sessions) |
| **Code exchange rejected** | Transaction / code / client / PKCE contract |
| **ID token validation fails** | [OIDC & Clients](../reference/oidc-and-clients) / trusted issuer / validation profile |
| **Authentication succeeds but the API fails** | [Verify Tokens](./verify-tokens) / resource contract |

For deeper diagnosis, see [Troubleshooting](../operate/troubleshooting).

## Next

If a browser enters your application's security boundary, continue to
[Browser & BFF](./browser-and-bff). If a backend or resource server must validate access
tokens, continue to [Verify Tokens](./verify-tokens). For the complete client, metadata,
scope, subject, token and PKCE contracts, see
[OIDC & Clients](../reference/oidc-and-clients).

## Exact contract source

This page owns the **authorization code + PKCE procedure.**

It does not define whether this profile is currently supported, whether `state` or `nonce`
is mandatory, which PKCE methods are supported, whether `S256` is required, exact
authorization or token endpoints, exact HTTP request encoding, exact client authentication
methods, exact token response fields, refresh token support, the ID token algorithm
profile, the OIDC subject policy or UserInfo support. Those come from the external OAuth
and OIDC specifications, [OIDC & Clients](../reference/oidc-and-clients), the
machine-readable protocol contract and [Project Status](../project/status).

A guide explains only **how to use the currently declared profile correctly.**
