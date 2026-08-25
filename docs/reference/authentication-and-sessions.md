# Authentication & Sessions

## How SoulAuth establishes and sustains an authentication reality

SoulAuth's authentication runtime is not a single "login system". It has to keep four
semantics apart for the long term:

```text
Credential  ≠  Authentication Evidence  ≠  Authentication Result  ≠  AuthSession
```

| Concept | The question it answers |
| --- | --- |
| **Credential** | What authentication capability does this Actor hold over time? |
| **Authentication evidence** | What proof was supplied for *this* authentication? |
| **Authentication result** | After validation, what authentication fact did SoulAuth actually establish? |
| **AuthSession** | May the established authentication be reused within a bounded lifecycle? |

These objects are related. They must not be merged because merging is convenient. And
throughout:

```text
Authentication
≠
Authority
```

Authentication establishes **who the current Actor is, and under what conditions that
identity fact holds.** It does not answer what business, governance or real-world
operation that Actor may perform next.

## 1 · The authentication runtime model

Not every flow starts from the same credential type. The general model is:

```text
Identity Context
        + Applicable Authentication Source
        + Current Evidence / Assertion
        ↓
Applicable Validation
        ↓
Authentication Result
        ↓
Assurance / Freshness
        ↓
AuthSession, if established
```

The authentication source may come from different supported contracts — a SoulAuth-local
Actor-bound credential, or an external authentication source validated through a formal
federation contract. Therefore:

> **A credential is an important capability for local Actor authentication, but it is
> not a universal prerequisite for every authentication path.**

## 2 · Credential

A credential is **a long-lived authentication capability associated with an
ActorIdentity.** It answers:

> **Through which supported capability may this Actor prove itself?**

A credential has its own lifecycle — the current contract may define applicable
`create`, `rotate`, `revoke` and `expire` transitions. None of them changes the
ActorIdentity:

```text
Credential rotation   ≠  ActorIdentity replacement
Credential revocation ≠  ActorIdentity retirement
```

A credential belongs to the authentication world. It is not the Actor.

## 3 · Authentication evidence

A credential and the evidence actually used in one authentication attempt are different
things:

```text
Credential          → long-lived authentication capability
Authentication Evidence → proof used for this authentication attempt
```

Evidence usually has meaning only for the current request, challenge, transaction or
flow:

```text
Credential
≠
Authentication Evidence
```

Evidence existing also does not mean validation succeeded. SoulAuth may establish an
authentication result only after validation under the applicable contract.

## 4 · Authentication result

An authentication result is **the fact established in the current authentication.** It
is first a **runtime fact** — not, by default, a public API resource, and not another
persisted identity entity.

It can support semantics such as the authenticated ActorIdentity, the time
authentication was established, the authentication method or composition used,
assurance, freshness and the necessary authentication context.

Those are **authentication fact dimensions**. They do not automatically become a fixed
JSON schema or a public resource field.

### An authentication result is not a downstream artifact

```text
Authentication Result  ≠  AuthSession
Authentication Result  ≠  Protocol Token
Authentication Result  ≠  Soulseed AuthContext
```

Downstream objects may reference, carry or project established authentication facts.
They are not the authentication result itself.

### An authentication result does not store raw evidence

```text
Authentication Result
≠
Raw Evidence Container
```

Raw authentication evidence and secret material do not flow into the authentication
result, the AuthSession, claims or audit merely because authentication succeeded. Secret
protection and observability policy are defined by
[Authentication Protection](../security/authentication-protection) and
[Audit](./audit).

## 5 · Method, flow and continuity are not the same layer

```text
Authentication Method
≠
Authentication Flow / Composition
≠
Authentication Continuity
```

This is one of the most important runtime boundaries here.

**Method** answers *through which verification mechanism is evidence validated* — how
evidence is verified. Which methods the current release supports is decided by the
machine contract and [Project Status](../project/status); this page does not invent a
method list from architecture.

**Flow / composition** answers *which validation conditions or steps must hold together
to complete this authentication.* One flow may require a single method; another may
require several conditions to all hold:

```text
one successful method
≠
completed authentication by definition
```

A completed authentication result exists only once every necessary condition the flow
declares has held.

**Continuity** answers *may an authentication established earlier still be trusted and
reused under current conditions?* AuthSession lives at this layer:

```text
AuthSession reuse
≠
Authentication Method
```

Reuse does not re-verify the original credential. It verifies whether existing
authentication continuity is still valid.

## 6 · Method, assurance, freshness and authority stay separate

```text
Method   Composition / Factor   Assurance   Freshness
```

None of them derives the others:

```text
Authentication Method  ≠  Authentication Assurance
Number of Factors      ≠  Universal Assurance Level
```

A flow using several factors does not automatically reach a standardised assurance level
unless SoulAuth explicitly adopts and satisfies the corresponding assurance contract.

### Freshness is not session lifetime

```text
Authentication Freshness
≠
AuthSession Lifetime
```

A session still being valid says only that the continuity contract holds. It does not
say the authentication is recent enough for a highly sensitive operation.

### Assurance does not create authority

```text
Higher Authentication Assurance
≠
Greater Authority
```

An operation may require higher assurance. Meeting a stronger authentication requirement
never creates a new permission or governance authority. Authentication owns proof;
authority belongs to its own decision domain.

## 7 · Actor Kind does not determine authentication method

Human and AIActor share the ActorIdentity contract, but:

```text
Actor Kind
≠
Authentication Method
```

They may use different supported credentials and verification methods, and may gain new
methods as releases evolve. That neither creates a new Actor Kind nor changes the
ActorIdentity ontology.

The point of Actor-native authentication is not to build a second identity model for
AIActors. It is:

> **to let different Actors use the authentication capability that suits them, under one
> ActorIdentity contract.**

## 8 · Local credential-based authentication

For flows that authenticate through a SoulAuth-local Actor credential:

```text
ActorIdentity
        ↓
Actor-bound Credential
        ↓
Current Authentication Evidence
        ↓
Applicable Verification
        ↓
Authentication Result
```

Two boundaries must hold:

```text
Credential exists                              ≠  Authentication succeeded
Cryptographic or credential verification       ≠  Authority
```

If a declared flow needs several authentication conditions, authentication is complete
only once all of them are satisfied.

### HumanAccount is not the authentication subject

Human-facing identity input may pass through HumanAccount-related resolution. The
subject on which authentication is finally established remains **ActorIdentity**:

```text
HumanAccount
≠
Authentication Subject
```

HumanAccount may assist human-specific account resolution. It does not thereby become a
new canonical identity root.

## 9 · The federated authentication boundary

Federation must keep an external authentication fact apart from SoulAuth Actor
authentication:

```text
Validated External Authentication
        ↓
External Identity Context
        ↓
IdentityBinding Resolution
        ↓
SoulAuth ActorIdentity
        ↓
Authentication Result
```

What matters here is not a particular OIDC parameter but a few runtime boundaries.

### External authentication is not an IdentityBinding

```text
External Authentication
≠
IdentityBinding
```

The external provider validates a subject in *its* identity domain. IdentityBinding
answers which SoulAuth ActorIdentity that external identity formally relates to. The two
do not merge.

### An external identity needs source context

```text
External Subject String Alone
≠
External Identity
```

An external identity must be interpreted in the context of its source, issuer or
identity domain. An identical bare subject string must never be used to guess a SoulAuth
identity.

### Binding resolution must not guess

A SoulAuth authentication result may be established only once the applicable external
trust, authentication validation, IdentityBinding and Actor eligibility all hold. If the
binding result is ambiguous, Actor authentication must not be established. A wrong
binding is identity misattribution.

### External assurance is not local assurance

```text
External Assurance
≠
Automatically SoulAuth Assurance
```

If SoulAuth accepts an external assurance signal, a formal federation profile must
define its mapping and trust scope. Federation and OIDC protocol semantics are defined
by [OIDC & Clients](./oidc-and-clients).

## 10 · Downstream projections do not redefine the authentication result

OIDC, Soulseed integration and other consumers may need authentication facts. But:

```text
Protocol Projection
≠
Authentication Source of Truth
```

The correct relation is:

```text
Authentication Result
        ↓  declared projection contract
Consumer-facing representation
```

Downstream may select, project, validate and consume those facts. It may not reinvent
*when this authentication happened, what it proved, or what assurance it reached.* OIDC
claims are owned by [OIDC & Clients](./oidc-and-clients); AuthContext by
[Soulseed Integration](../integrate/soulseed).

## 11 · AuthSession

An AuthSession is **bounded authentication continuity maintained by SoulAuth.** It lets
some flows reuse an already-established authentication when the session contract allows.

```text
Successful Authentication
≠
AuthSession required
```

A successful authentication does not have to create a session; whether one is
established belongs to the flow contract.

### Its identity anchor is ActorIdentity

An AuthSession continues the authentication continuity of an ActorIdentity. It does not
turn HumanAccount, a Client or an external subject into a new session identity root.

### An AuthSession is not another artifact

```text
AuthSession  ≠  Credential
AuthSession  ≠  Protocol Token / Grant
AuthSession  ≠  Authority
```

Nor is a SoulAuth AuthSession an application session, an external provider session, or a
Mind / connector / execution session. Those namespaces may relate; they never
interchange.

## 12 · Session resource and session credential are separate

If session management exposes an AuthSession resource, that resource may have an
identifier — while continuing a session may require a session credential. Keep them
apart:

```text
AuthSession Resource ID
≠
Session Credential
```

If merely holding a value is enough to continue session-based authentication, that value
has authentication capability. It must be treated as a sensitive credential, not an
ordinary public identifier:

```text
Session Resource Representation
≠
Session Credential Disclosure
```

A session management resource must not return the raw credential that would let a holder
take over the session, just because it needs to display session information.

## 13 · Session time and authentication time are separate

```text
Authentication Time
≠
Session Lifetime
```

Authentication time is when evidence was actually validated and the authentication fact
established. Session lifetime is how much longer the continuity contract lasts.

### Session activity does not refresh authentication time

```text
Session Activity
≠
Authentication Time Refresh
```

Continuous use of a session does not turn a past authentication into "just
re-authenticated".

### Session renewal is not reauthentication

```text
Session Renewal
≠
Reauthentication
```

A session contract may permit continuity renewal. Only re-submitting and validating
applicable authentication evidence establishes a new reauthentication fact:

```text
Valid Session
≠
Fresh Authentication by definition
```

## 14 · Authentication reuse is not authorization reuse

An existing AuthSession may supply an established authentication context to a new flow
where policy allows. But:

```text
Authentication Reuse  ≠  Authorization Reuse
Existing AuthSession  ≠  Automatic Authorization Success
```

A new protocol or application operation still has its own client context, authority,
policy, resource, freshness requirement and decision context. AuthSession answers only
whether existing Actor authentication may be reused — never the new authorization
decision.

## 15 · Logout and revocation scope

"Logout" must always state its scope. SoulAuth local session logout means **terminating
SoulAuth authentication continuity within the declared scope.** It does not
automatically mean the application's own session ended, the external IdP session ended,
or every access token became invalid instantly at every resource server:

```text
SoulAuth Local Logout  ≠  Application Logout
Local Logout           ≠  Universal Token Revocation
```

The OIDC logout protocol is defined by [OIDC & Clients](./oidc-and-clients).

### Revocation effect and revocation freshness are separate

**Revocation effect** — once an AuthSession is effectively revoked:

```text
Effective Revoked AuthSession
→
must not establish future session-based authentication
```

That is the runtime semantic this page owns.

**Revocation freshness** — when every runtime participant that needs to make the
decision observes the revocation. That involves replicas, caches, security-state
propagation and infrastructure:

```text
Revocation Effect
≠
Revocation Freshness
```

This page defines the effect. Propagation and operations contracts continue in the
security and operations documents.

## 16 · Lifecycles do not cascade automatically

Credential, IdentityBinding, ActorIdentity and AuthSession have different lifecycles:

```text
Credential Revocation        ≠  AuthSession Revocation
IdentityBinding Revocation   ≠  AuthSession Revocation
ActorIdentity Suspension     ≠  AuthSession Revocation
```

Those events may trigger related security policy under the current contract, but **they
are not the same state transition.** Revoking a credential does not license a claim that
all sessions and tokens are globally and instantly invalid, absent a contract that says
so — and neither does the reverse. Which propagation effects genuinely exist must be
stated by the current release's exact contract.

## 17 · Authentication failures must keep their stage meaning

Public errors may hide internal detail for enumeration resistance or other security
reasons. The internal runtime must not therefore collapse different failure stages into
one fact:

```text
No Identity Resolution
≠
Wrong Identity Resolution
```

The latter may be identity misattribution — a completely different security failure from
"no Actor found".

> **Public error masking must not erase internal runtime semantics in reverse.**

Exact HTTP/protocol error contracts belong to
[API Conventions](./api-conventions) and the relevant protocol reference.

### An unavailable required state cannot succeed

If authentication depends on a security-critical state that cannot be established
reliably:

```text
Required Authentication State Unknown
≠
Authentication Success
```

SoulAuth must not downgrade *unknown* into *satisfied* for availability. The
caller-facing failure may be an authentication failure, a temporary failure,
unavailability or another error defined by that surface. It may not be fabricated
success.

## 18 · Retry and unknown outcome

The authentication runtime follows the retry principle from
[API Conventions](./api-conventions):

```text
Network Failure
≠
Operation Did Not Happen
```

An operation may consume one-time state, lose the response, and leave the caller with a
timeout. The caller cannot conclude the operation never ran:

```text
Retryable Transport Condition
≠
Safe Authentication Retry
```

Whether an authentication-sensitive operation may be retried is defined by that
operation's own contract. Do not blind-retry.

## 19 · Authentication result and audit event are separate

```text
Authentication Result
≠
Authentication Audit Event
```

The result belongs to the current runtime trust decision; the audit event belongs to
historical accountability. One attempt may produce one or more audit/security events —
and an audit record is not an authentication object a caller can use to prove identity.
Exact audit events and attribution are defined by [Audit](./audit).

## 20 · Authentication & sessions at a glance

| Boundary | Meaning |
| --- | --- |
| **Credential ≠ Evidence** | Long-lived capability and this attempt's proof are separate |
| **Evidence ≠ Authentication result** | An input proof is not an established fact |
| **Method ≠ Flow ≠ Continuity** | Verification, composition and session reuse are different layers |
| **Authentication result ≠ AuthSession** | One established fact is not long-lived continuity |
| **Assurance / freshness ≠ Authority** | Stronger or fresher authentication creates no permission |
| **Actor Kind ≠ Authentication method** | Human/AIActor share the identity model, not the method |
| **AuthSession resource ID ≠ Session credential** | A management reference is not a takeover capability |
| **Session renewal ≠ Reauthentication** | A continuity change does not manufacture a new authentication fact |
| **Authentication reuse ≠ Authorization reuse** | SSO reuses proof, not the right to act |
| **Logout ≠ Universal token revocation** | Ending a session does not expand lifecycle effects without limit |
| **Revocation effect ≠ Revocation freshness** | Canonical effect and propagation visibility are separate |
| **Result ≠ Audit event** | A current runtime fact is not a historical record |

The whole page compresses to:

```text
Authentication Source
        + Current Evidence / Assertion
        ↓
Validation
        ↓
Authentication Result
        ↓
Assurance / Freshness
        ↓
AuthSession, if established
```

At every step down, keep asking: **what did the layer above actually prove — and what
did it not prove?**

## Exact contract source

This page defines the **human-readable runtime semantics** of credential, authentication
evidence, authentication result, assurance/freshness and AuthSession.

It does not invent the exact wire. Authentication endpoints, credential method names,
evidence schemas, cookies and headers, session resource fields, session state enums,
error codes, challenge formats and cryptographic canonicalisation belong to public
reference only where the published machine-readable contract, the runtime and
[Project Status](../project/status) support them.

OAuth/OIDC token and client contracts remain with
[OIDC & Clients](./oidc-and-clients); administrative operations with
[Administration](./administration); audit shape with [Audit](./audit).

## Next

We now know how an ActorIdentity produces an authentication result from an
authentication source and current evidence, how result, assurance and freshness keep
their boundaries, and how an AuthSession sustains bounded continuity without redefining
identity or authority.

[OIDC & Clients](./oidc-and-clients) is next: how SoulAuth maps these identity and
authentication facts into OAuth/OpenID Connect, what a Client really is, and how
`client_id`, issuer, `sub`, ID tokens, access tokens, claims and the protocol profile
relate.
