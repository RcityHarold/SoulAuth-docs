# Verify Tokens

## Validating a SoulAuth access token at the resource server boundary

The preceding integration pages covered how a client completes protocol integration, how
an application obtains a trusted OIDC authentication result, and how a browser/BFF
arranges token and session boundaries. Now the view moves to the **resource server.**

When an API receives an access token, the real question is not *"can I decode it?"* but:

> **"Can I prove, under the SoulAuth token contract I established in advance, that this
> access token deserves to be accepted by this resource?"**

and only then:

> **"Do the constraints this token carries, together with the application's own authority
> model, permit this action?"**

```text
Token Trust
        ↓
Resource Applicability
        ↓
Request Authorization
```

## Before you start

Before receiving any untrusted token, a resource server should already know which
SoulAuth authorization/token source it trusts, which expected resource/audience context
this API corresponds to, which access token profile it accepts, which validation strategy
that profile requires, which token-level authorization constraints this resource must
check, and who owns the final application authorization once validation succeeds.

The order matters:

```text
Configured Trust Contract
        ↓
Incoming Untrusted Token
        ↓
Validation
```

never:

```text
Incoming Untrusted Token → read unverified claims → decide what to trust
```

`iss`, `aud` and other claims inside an unvalidated token may be **validation inputs.**
They must never become the resource server's own trust root.

## Step 1 · Accept only the access token the resource contract declares

An ordinary protected resource handles **the access token its contract accepts** — not
"any token SoulAuth issued".

```text
ID Token
≠
API Access Token
```

An ID token expresses an OIDC authentication result. An access token enters the protected
resource contract it declares. Sharing an issuer and signing infrastructure does not make
them interchangeable. Do not call an ordinary resource API with:

```http
Authorization: Bearer <ID_TOKEN>
```

## Step 2 · Receive the access token per the current profile

This page does not assume every access token uses bearer presentation. Where the profile
does use bearer tokens, receive them per the bearer contract and applicable
specifications — typically:

```http
Authorization: Bearer <ACCESS_TOKEN>
```

Do not move a bearer access token, for convenience, into a URL, an ordinary log or another
high-leakage surface the contract does not allow. In particular:

```text
Raw Access Token
≠
Log / Audit Payload
```

Where diagnostic or audit correlation is needed, use a bounded representation the audit
and observability contracts allow. This page does not prescribe a digest, hash or
reference format.

## Step 3 · The validation strategy comes from the contract, not the token's appearance

Do not decide "this looks like `xxxxx.yyyyy.zzzzz`, so it is a JWT and local signature
verification suffices":

```text
Token Appearance      ≠  Validation Contract
Token Representation  ≠  Validation Strategy
```

A representation may be structured or opaque/reference. A strategy may be local or online.
They are not fixed one-to-one.

> **What decides how to validate is the current SoulAuth access token contract.**

### Validation strategy at a glance

| Question | Local validation | Online validation |
| --- | --- | --- |
| **Where does the main trust judgment happen** | The resource server | A trusted validation service the contract declares |
| **Does every request need to reach SoulAuth** | Not necessarily | Per the contract |
| **How is freshness established** | Token profile / lifetime / validation contract | The online validation contract |
| **Does it replace application authorization** | No | No |

This shows two possible strategies. It does not say the current release supports both.

## Step 4A · Local validation, if the profile uses it

Execute the profile's complete validation contract. If the representation is a JWT:

```text
JWT Decoded
≠
JWT Validated
```

Decoding lets you see the payload. It does not turn any claim into a trusted fact. Also:

```text
Valid Signature
≠
Valid Access Token
```

### Obtain verification material from a pre-established trust contract

Where local validation uses issuer-published public verification material, the resource
server obtains it through the declared trusted metadata / key-distribution contract.

Do not establish issuer trust dynamically from an unvalidated token, do not treat today's
signing key as a permanent protocol contract, and do not accept an arbitrary algorithm or
key source the token header declares for itself:

```text
Current Signing Key
≠
Token Protocol
```

Keys may change. The contract must stay verifiable.

### Representative local checks

Complete requirements come from the current access token profile and the applicable
external specifications. Representative checks may include:

```text
expected token profile / role
allowed cryptographic policy
trusted verification material
cryptographic validation
issuer
resource / audience
time / validity conditions
other profile-required constraints
```

This is not a complete specification list authored here. If the release formally adopts a
standard access token profile, the resource server must validate that profile fully — not
just perform generic signature validation.

### Same issuer is not same token role

Two tokens from the same SoulAuth issuer do not necessarily play the same role at the
resource server:

```text
ID Token
≠
Access Token
```

Token type confusion must be rejected correctly by the token profile.

### Key rotation belongs to the validation contract

```text
Hard-coded Forever Key
≠
Key-lifecycle-aware Validation
```

Where the profile uses rotatable verification material, the resource server must follow
its legitimate lifecycle changes. Exact cache TTL, unknown-key-reference recovery, refresh
interval and overlap window are not defined here.

### Local validation is not a live revocation check

Avoid both:

```text
valid signature → live revocation was checked
self-contained artifact → can never be invalidated
```

Real freshness and revocation behaviour depend on token lifetime, validation strategy, the
revocation contract and the resource contract:

```text
Token Validation Success
≠
Universal Live Revocation Check
```

## Step 4B · Online validation, if the profile uses it

```text
Resource Server
        │  Access Token
        ▼
Trusted Online Validation Boundary
        │
        ▼
Contract-defined Token Context
        │
        ▼
Resource Server
```

Where the profile uses standard OAuth token introspection, the exact endpoint, caller
authentication, response and cache semantics come from
[OIDC & Clients](../reference/oidc-and-clients) and the applicable standard. This page
does not assume an introspection endpoint exists.

### Online validation is itself a trust relationship

Knowing a token string does not entitle a caller to query any token's state:

> **Online token validation must follow its own declared authentication/authorization
> boundary.**

How a resource server proves its own client/resource context is defined by that contract.

### A positive token status is not "allow every action"

```text
Positive Token Status
≠
Allow Every Application Action
```

Online validation helps establish token trust. It does not replace the resource's
application authorization.

### Unable to validate is not allow

```text
Unable to Validate
≠
Allow
```

When a security-critical trust fact cannot be established, availability pressure must not
turn unknown state into an implicit allow. At the same time:

```text
Invalid Token
≠
Validation Infrastructure Failure
```

If what actually failed is validation infrastructure, a dependency or the network, keep
the correct failure stage in the external error classification. Fail-closed does not mean
disguising every infrastructure failure as the same authentication error.

## Step 5 · Confirm resource applicability

Passing basic trust validation does not make a token applicable to this resource:

```text
Trusted Issuer
≠
Correct Resource / Audience
```

An access token from the correct issuer may legitimately apply to resource A and not to
resource B. A trusted issuer is one necessary condition among several. Validate the
expected resource/audience semantics the token profile defines.

## Step 6 · Interpret Actor / client context per the token contract

Only after trust and applicability validation does the resource server consume the token
context the contract permits. The discipline here:

> **Do not guess the subject.**

### `client_id` is not an ActorIdentity

```text
OAuth `client_id`      ≠  ActorIdentity
Client Authentication  ≠  Actor Authentication
```

An agent application may be a legitimate OAuth client. That does not make it the AIActor
it carries, and a client context does not upgrade itself into an Actor context.

### Actor-bearing context and client-only context are separate

A token contract may establish an `Actor-bearing Context` or a `Client-only Context`.
These are not two new identity species — they describe **which contract-validated request
contexts this token actually established.**

```text
Client-only Context
≠
Actor Context
```

If the token establishes only a client context, the resource server must not fabricate an
Actor. In particular, never do `OAuth client_id → ActorIdentity`, and never derive an
ActorIdentity from an email, a username, an arbitrary claim or the token string.

### An OIDC ID token `sub` is not the access-token subject

```text
OIDC ID Token `sub`
≠
Access-token Subject by definition
```

The OIDC `sub` belongs to the subject namespace of an OIDC authentication result; subject
semantics inside an access token belong to the access token profile. Even where both
happen to use the claim name `sub`, they must not be assumed to share a namespace without
a contract. This boundary is frozen by
[OIDC & Clients](../reference/oidc-and-clients) and inherited here in full.

### An access-token subject is not the ActorIdentity resource ID

```text
Access-token Subject
≠
ActorIdentity Resource ID by definition
```

Unless the token contract explicitly declares a typed mapping or representation relation,
a resource server must not perform an implicit identifier cast. This page therefore
defines no `actor_subject`, `actor_id` or `principal_id` field — exact wire semantics
belong to [OIDC & Clients](../reference/oidc-and-clients) and the machine-readable
contract.

## Step 7 · Apply OAuth token constraints

A validated token may carry the OAuth authorization constraints the profile declares,
possibly including **OAuth `scope`**. But:

```text
OAuth `scope`  ≠  SoulAuth Permission
OAuth `scope`  ≠  Complete Application Authority
OAuth `scope`  ≠  Soulseed Governance Authority
```

Scope can bound the protocol/resource operations a token may participate in. It does not
prove the Actor may perform this concrete action against this resource. Do not promote
scope into a universal permission system.

## Step 8 · Hand the final authorization to the application

With a validated token context established, the application's own authorization decision
begins:

```text
Valid Access Token
≠
Authorized Request
```

```text
Validated Token Context
        ↓
Resource Applicability
        ↓
Token-level Constraints
        ↓
Application Actor / Action / Resource / Context Policy
        ↓
Authorization Decision
```

This page does not redefine the application authority model. It hands that decision a
**validated, clearly scoped token context.**

## Three questions that close the flow

```text
1. Token Trust
   Can I trust this artifact under my configured token contract?

2. Resource Applicability
   Is it valid and intended for this resource boundary?

3. Request Authorization
   Do the validated token constraints and the application's own authority
   permit this concrete action?
```

What must never happen:

```text
Token exists → Allow
```

## Token verification does not read SoulAuth's private persistence

Establish trust through the token contract — declared local validation or declared online
validation — not:

```text
Resource Server → SoulAuth private database → query token / session / actor state
```

```text
Token Verification
≠
Private Persistence Lookup
```

which keeps the architectural principle intact:

```text
Supported Integration
≠
Private Database Coupling
```

## Failure semantics

**1 · Access token trust failure** — the required token is absent; the artifact does not
belong to an accepted contract; cryptographic, issuer or validity validation failed; a
required online validation could not produce a trusted result. Result: **do not establish
a validated token context.** The external HTTP/OAuth error follows the resource/token
profile.

**2 · Resource / token constraint failure** — the token is trustworthy but does not apply
to this resource, or a token-level requirement is unmet. Result: **reject the request** —
but do not record it as "the token must be forged".

**3 · Application authorization denial** — trust holds, applicability holds, token-level
constraints are satisfied, and application policy still refuses this action for this
Actor/client context. Result: **deny the action.** This is not a token validation failure.

### Preserve the failure stage

```text
Invalid Access Token       ≠  Validation Infrastructure Failure
Token Validation Failure   ≠  Application Authorization Denial
```

Do not collapse every failure into one "token error" for the sake of a uniform error code.
Troubleshooting, audit and operations all depend on the distinction.

## Audit / observability boundary

A resource server may record what the audit and observability contracts allow: the
validation outcome, bounded issuer/resource context, actor/client attribution context once
trustworthily established, correlation information, and the authorization outcome. The
core principle is unchanged:

```text
Raw Access Token
≠
Log / Audit Payload
```

This page defines no audit event schema; historical accountability belongs to
[Audit](../reference/audit).

## Expected result

> **A validated, resource-applicable token context.**

It means the artifact validated under the token contract, applies to this resource
boundary, its permitted Actor/client/constraint context has been interpreted under its own
contract, and it may now serve as a trusted input to application authorization.

It does not mean the current action is already permitted.

## Complete resource server flow

```text
Client / BFF
     │
     │ Access Token
     ▼
Resource Server
     │
     ├── Is this an accepted Access Token Contract?
     │
     ├── Which declared Validation Strategy applies?
     │      ├── Local, if supported
     │      └── Online, if supported
     │
     ├── Token trust established?
     │
     ├── Current validity / freshness conditions satisfied?
     │
     ├── Intended for this Resource / Audience?
     │
     ├── Actor-bearing Context or Client-only Context?
     │
     ├── Apply token-level constraints
     │
     ▼
Validated Token Context
     │
     ▼
Application Authorization
     │
     ├── Allow
     └── Deny
```

`Validated Token Context` is the logical result of completing contract validation — not a
new canonical domain object in SoulAuth.

## Verify tokens at a glance

| Boundary | Meaning |
| --- | --- |
| **ID token ≠ API access token** | Authentication result is not resource access |
| **Access token ≠ JWT by definition** | Representation comes from the token contract |
| **Token appearance ≠ Validation contract** | Looking like a JWT decides nothing |
| **Representation ≠ Strategy** | Structured/opaque and local/online are not paired |
| **Decoded ≠ Validated** | Reading a claim does not make it trustworthy |
| **Valid signature ≠ Valid access token** | Cryptographic success is one part |
| **Trusted issuer ≠ Correct resource/audience** | A trusted issuer may still be inapplicable |
| **Valid access token ≠ Authorized request** | Token trust is not the final decision |
| **`client_id` ≠ ActorIdentity** | A client identifier cannot stand in for an Actor |
| **ID token `sub` ≠ Access-token subject** | Two protocol contexts do not merge implicitly |
| **Access-token subject ≠ ActorIdentity resource ID** | No direct cast between namespaces |
| **Client-only context ≠ Actor context** | An absent Actor context must not be fabricated |
| **`scope` ≠ Permission / application authority** | Scope is a protocol-level constraint |
| **Verification ≠ Private persistence lookup** | Consumers trust through public contracts |
| **Raw token ≠ Log / audit payload** | Tokens must not spread into the wrong data domain |
| **Positive status ≠ Allow every action** | Token state does not replace authorization |
| **Unable to validate ≠ Allow** | Unknown security state is not an implicit allow |
| **Invalid token ≠ Infrastructure failure** | Failure stages must be preserved |

## If verification fails

| Failure | First place to look |
| --- | --- |
| **The artifact is not an accepted access token** | [OIDC & Clients](../reference/oidc-and-clients) / current token profile |
| **Local validation failed** | Issuer / verification material / token profile / resource / time |
| **Online validation failed** | Online validation contract / caller trust / dependency |
| **Wrong resource / audience** | Resource applicability |
| **Actor / client context cannot be interpreted** | Access token subject/context contract |
| **Token is trusted but the action is denied** | Application authorization |
| **Only some runtimes fail** | [Troubleshooting](../operate/troubleshooting) / [Deployment](../operate/deployment) |
| **Suspected token or trust-material compromise** | [Operations & Recovery](../operate/operations-and-recovery) |

## Next

If a validated token context must become an authentication projection SoulseedOS can
consume, continue to [Soulseed Integration](./soulseed). For exact access token
representation, resource/audience, OAuth `scope`, actor-bearing versus client-only
semantics, online validation and token profile, see
[OIDC & Clients](../reference/oidc-and-clients). For token protection, replay and secret
boundaries, see
[Authentication Protection](../security/authentication-protection). For revocation,
trust-material incidents or recovery, see
[Operations & Recovery](../operate/operations-and-recovery).

## Exact contract source

This page owns the **access token verification procedure.**

It does not define the access token representation, bearer support, JWT support, RFC 9068
support, online validation or introspection support, sender-constrained token support, the
resource/audience wire representation, the access token claim schema, access-token subject
representation, actor-bearing or client-only wire shapes, the OAuth scope vocabulary, the
revocation freshness contract, or exact HTTP/OAuth error responses.

Those come from [OIDC & Clients](../reference/oidc-and-clients), the machine-readable
protocol contract, the external normative specifications, the runtime, verification
evidence and [Project Status](../project/status).

```text
Standard Defines a Profile
≠
SoulAuth Supports That Profile
```

```text
Token Contains a Claim
≠
SoulAuth Has Assigned That Claim the Meaning the Consumer Guessed
```
