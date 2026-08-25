# Troubleshooting

## Prove where the problem is before changing the system

When an authentication, protocol, browser, token, runtime or integration flow fails, the
instinctive response is to retry, restart, clear cookies, rotate a key, edit
configuration, or loosen validation.

The first goal of SoulAuth troubleshooting is **not to make the request succeed
quickly** — because a failure may mean a security boundary is working correctly. An
access token issued for the wrong resource being rejected:

```text
Wrong-resource Artifact → Rejected
```

may be exactly right. A consumed one-time protocol artifact failing on reuse may show
replay protection working.

```text
Diagnosis      ≠  Repair
Error Message  ≠  Root Cause
```

## 1 · Evidence before mutation

When a failure appears, capture the minimum necessary evidence **before** changing the
system:

```text
Observe / Capture  before  Mutate / Restart
```

Restarting, redeploying, rotating a key, clearing sessions or editing persistence can all
change current runtime state, local caches, loaded trust material, bounded protocol state,
clock-related evidence and correlation information.

```text
Restart Success
≠
Root Cause Identified
```

## 2 · The diagnostic method

```text
1. Capture
        ↓
2. Scope
        ↓
3. Locate
        ↓
4. Verify
        ↓
5. Isolate / Reproduce Safely
        ↓
6. Correct or Escalate
        ↓
7. Positive + Negative Validation
```

**Capture** the minimum context and evidence at failure time. **Scope** the blast radius:
who is affected? **Locate** where the flow first fails, and which canonical owner or trust
boundary owns that step. **Verify** hypotheses with read-only evidence first. **Isolate
and reproduce safely** using a controlled test identity, a test client, a fresh
transaction and fresh artifacts — not by replaying a production user's security-sensitive
state. **Correct or escalate**: make the smallest valid correction if trust is still
explainable; stop ordinary troubleshooting and go to
[Operations & Recovery](./operations-and-recovery) if it is not. **Validate** both that
the correct path recovered and that paths which should fail still fail.

## 3 · Determine blast radius first

The first question after seeing an error is not "what is the error code?" but **who is
affected?**

| Blast radius | First places to check |
| --- | --- |
| **Almost every request fails** | Runtime, network/TLS, required persistence, trust material, clock, global configuration |
| **Only one client fails** | Client contract, redirect, client authentication, applicable transaction-binding controls |
| **Only one ActorIdentity fails** | ActorIdentity lifecycle, applicable credential, authentication method, IdentityBinding where relevant |
| **Only one runtime instance fails** | Artifact identity, configuration identity, trust material, clock, required coordinated state, local cache |
| **Only one feature fails** | That feature's dependency and integration boundary |

A feature-specific failure should stay in its own failure domain. An optional integration
failing is not grounds to declare SoulAuth core unavailable.

## 4 · Then find the first failing stage

Blast radius tells you who is affected. The first failing stage tells you **where this
flow first departs from its contract.**

If new authentications fail while existing valid access tokens are still accepted, look at
the new authentication/transaction/issuance path — not the resource server. If artifacts
issue successfully but every target API rejects them, check the token contract and
resource validation boundary.

```text
Blast Radius
+
First Failing Stage
=
Diagnostic Scope
```

## 5 · Find the earliest broken boundary

With several errors visible, do not start tuning parameters at the most downstream
symptom. Walk the trust path and find **the earliest boundary that cannot be shown to
hold**:

```text
External protocol view wrong   → do not tune downstream resource policy first
Client contract wrong          → do not tune the token consumer first
Actor authentication never established → do not tune Soulseed authority first
```

Downstream errors are frequently derived consequences of an upstream trust failure.

## 6 · Diagnostic context

| Context | What to capture |
| --- | --- |
| **Release** | The current SoulAuth release |
| **Artifact identity** | A stable identifier for the running artifact |
| **Configuration identity** | A reproducible identifier for the current configuration |
| **Protocol / issuer context** | Where the flow applies |
| **Deployment topology** | The real current topology |
| **Timestamp** | When the failure occurred |
| **Last known good** | The most recent confirmed-working time |
| **Recent material change** | Release, configuration, key, certificate, proxy, schema, topology |
| **Expected** | What should have happened |
| **Actual** | What did happen |
| **Affected flow** | Authentication, token, API, browser, federation, integration |
| **Client context** | Where applicable |
| **ActorIdentity context** | Only once the ActorIdentity is trustworthily determined |
| **Runtime instance** | Where applicable |
| **Correlation reference** | Where the runtime provides one |

This is **diagnostic context**, not a full request dump:

```text
Diagnostic Context
≠
Secret Dump
```

## 7 · Debugging does not lift the secret boundary

Troubleshooting is one of the easiest places to leak credentials. Raw credentials, bearer
artifacts, client authentication material, private credential material, recovery and
verification secrets and session credentials must not be copied into an issue tracker,
chat, email, screenshot, public forum or ordinary diagnostic bundle.

```text
Debugging
≠
Secret Disclosure
```

Enabling more detailed diagnostic logging does not automatically lift secret/token
redaction.

## 8 · Reproduction is not side-effect free

Do not assume "I'll just try again". Many authentication and protocol operations change
state:

```text
Reproduction
≠
Side-effect Free
```

A resubmitted one-time artifact may be consumed. Repeated failures may trigger
abuse-control state:

```text
Failure after repeated retries
≠
Original Failure Condition
```

Reproduce with a fresh transaction, a controlled test actor, a controlled test client and
fresh test artifacts.

## 9 · Quick routing by failure domain

| First failing domain | Primary reference |
| --- | --- |
| **Network / external endpoint / proxy** | [Deployment](./deployment) |
| **Issuer / OAuth / OIDC / Client** | [OIDC & Clients](../reference/oidc-and-clients) |
| **Actor authentication / credential / AuthSession** | [Authentication & Sessions](../reference/authentication-and-sessions) |
| **Browser / application session / BFF** | [Browser & BFF](../integrate/browser-and-bff) |
| **Access token / resource validation** | [Verify Tokens](../integrate/verify-tokens) + [OIDC & Clients](../reference/oidc-and-clients) |
| **Runtime / persistence / failover / recovery** | [Deployment](./deployment) + [Operations & Recovery](./operations-and-recovery) |
| **Federation / cross-domain identity** | [Actors & Profiles](../reference/actors-and-profiles) + [OIDC & Clients](../reference/oidc-and-clients) |
| **Soulseed AuthContext** | [Soulseed Integration](../integrate/soulseed) |
| **Historical accountability** | [Audit](../reference/audit) |
| **Configuration** | [Configuration](../reference/configuration) |

This page does not duplicate those contracts. It routes the reader to the right owner.

## 10 · Network / TLS / proxy diagnosis

Typical symptoms: endpoint unreachable, TLS failure, issuer mismatch, internal access
works while external fails, external scheme/host differs from expectation.

```text
DNS / Routing
        ↓
Transport Boundary
        ↓
Proxy / Ingress
        ↓
SoulAuth Runtime
        ↓
Declared External Protocol View
```

Do not start by decoding a token, changing an audience or changing a credential.

### Reachable is not issuer-correct

```text
Public Endpoint Reachable  ≠  Issuer Configuration Correct
Internal Listen Address    ≠  Public Issuer
```

Compare the runtime's actual external view, metadata/discovery, the issuer the client
trusts and the issuer the resource trusts.

### Forwarded metadata is not automatically trusted

```text
Internet-supplied Forwarded Metadata
≠
Trusted External Request Context
```

Do not make a hostname or scheme problem "disappear" by trusting all forwarded headers.
Check the trusted proxy contract instead.

### Do not disable validation to diagnose

An issuer mismatch is not fixed by turning issuer validation off. If the issuer genuinely
needs to change, that is a trust migration — not a troubleshooting shortcut.

## 11 · Client and authorization transaction diagnosis

```text
Client Context
        ↓
Request Contract
        ↓
Redirect / Transaction Binding
        ↓
Actor Authentication
        ↓
Protocol Continuation
        ↓
Exchange
```

Always confirm first whether this is even the expected client, and keep:

```text
Client Authentication Failure
≠
Actor Authentication Failure
```

### Redirect mismatch

Compare the registered value against the actual request under the formal redirect
contract. Do not invent custom URI normalisation:

```text
Redirect Diagnosis
≠
Invent Custom URI Normalization
```

and never allow arbitrary redirects to make the error go away.

### Transaction-binding controls

`state`, `nonce` and PKCE are checked only where the declared profile applies. This page
does not turn them into universal requirements for all flows. When one fails, use
[OIDC & Clients](../reference/oidc-and-clients) to confirm the client-side and
SoulAuth-side responsibilities separately.

### A protocol error category is not a root cause

`invalid_grant` says only that the request falls into a protocol error category. It does
not distinguish expiry, replay, client/redirect binding or transaction continuation:

```text
Protocol Error Category
≠
Detailed Root Cause
```

## 12 · A one-time artifact failing twice may be correct

```text
first valid use  → succeeds
second use       → rejected
```

The second failure very likely means single-use protection is working:

```text
Expected Replay Rejection
≠
Server Instability
```

Diagnose with a fresh transaction. Do not repeatedly replay a production one-time
artifact.

## 13 · Actor authentication diagnosis

```text
ActorIdentity resolves?
        ↓
Current lifecycle eligible?
        ↓
Applicable Credential exists?
        ↓
Credential currently usable?
        ↓
Declared Authentication Method verifies?
```

```text
ActorIdentity
≠
Credential
```

A credential failing does not mean the ActorIdentity does not exist. One authentication
method failing does not mean the ActorIdentity is invalid. The exact contract stays with
[Authentication & Sessions](../reference/authentication-and-sessions).

## 14 · Operator diagnostic detail is not public error detail

An operator inside a controlled environment may see specific lifecycle, credential and
runtime diagnostics. A public authentication error must not therefore leak account
existence, ActorIdentity existence, credential configuration or internal lifecycle
detail:

```text
Operator Diagnostic Detail
≠
Public Error Detail
```

Troubleshooting is not a reason to lift enumeration resistance.

## 15 · Actor credential and client authentication material stay apart

Confirm first whether the failure is Actor credential authentication or client
authentication:

```text
Actor Credential
≠
Client Authentication Material
```

This page does not assume the current AIActor method uses a public-key/signature scheme.
Where a method does use actor-held private credential material, troubleshooting must not
ask for that raw material to be uploaded to an operator. The exact method stays with
[Authentication & Sessions](../reference/authentication-and-sessions).

## 16 · Browser / session diagnosis

A browser "login failure" usually mixes at least three layers:

```text
Cookie  ≠  SoulAuth AuthSession  ≠  Application Session
```

| Symptom | First boundary |
| --- | --- |
| **Authentication succeeded but the app is still logged out** | callback → application session → cookie |
| **Every SoulAuth visit re-authenticates** | SoulAuth AuthSession → cookie / lifecycle |
| **App login succeeded but API returns 401** | access token → resource validation |
| **Browser requests are blocked** | origin / cookie / CORS / CSRF / proxy |

The exact browser contract stays with
[Browser & BFF](../integrate/browser-and-bff).

### CORS is not authentication

```text
CORS                            ≠  Authentication
OIDC Transaction Correlation    ≠  General Application CSRF Protection
```

Do not prove "authentication finally works" by disabling CSRF, opening origins without
limit or loosening CORS.

### Full BFF architecture drift

If a deployment declares **full BFF** and diagnosis finds the browser application can
obtain raw OAuth tokens, that is not an ordinary cookie bug. **The implementation has
drifted from the declared architecture**, requiring an architecture/configuration
correction and revalidation of the affected production gates.

## 17 · Token diagnosis starts from the contract

The first step is not "let's decode the JWT" but **what token contract is this?**

```text
Token Representation  ≠  Validation Strategy
Access Token          ≠  JWT by definition
```

## 18 · ID token and access token are different

```text
ID Token
≠
API Access Token
```

If OIDC login succeeds but the API always returns 401, one of the first checks is whether
the application is handing the resource server the correct access token at all.

## 19 · Decoded is not validated

A structured token being decodable only means the representation parses. It does not
prove the issuer is trusted, the signature holds, the audience/resource applies, the time
is valid or the subject semantics hold:

```text
Decoded Token
≠
Validated Token
```

## 20 · Local and online validation take different paths

Where the contract uses local validation, check the applicable issuer, key, signature,
resource and time contracts in [Verify Tokens](../integrate/verify-tokens). Where it uses
online validation, check the trusted validation endpoint, caller authentication, response
semantics and resource applicability.

Do not send an opaque/online validation failure into JWKS debugging. This page routes;
[Verify Tokens](../integrate/verify-tokens) and
[OIDC & Clients](../reference/oidc-and-clients) hold the semantics.

## 21 · 401 / 403 are hints, not root causes

```text
HTTP Status
≠
Complete Failure Semantics
```

`401` is usually closer to "no authentication/access context the resource accepts has been
established". `403` is usually closer to "some accepted context exists but the
authorization requirement is unmet". The answer still comes from the resource contract,
protocol error information and safe server-side diagnostics.

## 22 · A wrong-resource rejection may mean the system is fine

```text
Artifact for Resource A → Resource B → Rejected
```

usually means the resource boundary is working:

```text
Wrong-resource Rejection
≠
System Failure
```

The right question is **why did the client obtain or send an artifact not applicable to
this resource?** — not "how do we turn resource/audience validation off?"

## 23 · An unknown key reference does not mean a forged token

Where local public-key-set validation applies, an unknown key reference may come from a
wrong issuer, a wrong key source, stale validator state, a legitimate key lifecycle
transition, or an unknown/distrusted key:

```text
Unknown Key Reference
≠
Automatically Forged Token
```

Do not "refresh the cache until it works", and never automatically trust an unknown key
the artifact itself carries. Key lifecycle stays with the protocol/security contract.

## 24 · Do not paper over a time failure by extending lifetimes

Where the error involves time-bound semantics, check clock consistency between SoulAuth,
the consumer and the applicable runtimes. Do not hide a clock failure by inflating
artifact lifetimes. Confirm whether system time satisfies the declared protocol skew.

## 25 · A client context must not be guessed into an ActorIdentity

If an artifact validated successfully but the consumer still cannot answer whether the
context represents an Actor or only a client, that is a **contract problem.**

```text
Client
≠
Actor
```

Never introduce a local fallback of `OAuth client_id → treated as ActorIdentity`. When
subject or principal semantics are unclear, stop guessing and return to the formal
contracts in [OIDC & Clients](../reference/oidc-and-clients),
[Identity vs Authority](../concepts/identity-vs-authority) and
[Soulseed Integration](../integrate/soulseed).

## 26 · Runtime / persistence diagnosis

Typical symptoms: readiness failure, persistence errors, intermittent authentication,
success after retry, session continuity anomalies, different runtimes producing different
results.

Compare first:

```text
Artifact Identity
Configuration Identity
Relevant Trust-material State
System Time
Required Coordinated State
Instance-local Cache
```

Do not compare only "the version strings match". The same version label does not prove two
instances run the same actual artifact or the same effective configuration.

## 27 · Replicated diagnosis, where the topology is supported

If the problem appears only on some replicas, confirm first that the release formally
supports this topology. If replicas run different versions:

```text
Replicated Deployment
≠
Mixed-version Compatibility
```

Check whether the release compatibility contract permits this mixed-version serving
window.

### Sticky routing is a diagnostic signal, not a fix

```text
normal routing  → intermittent failure
sticky routing  → works
```

is valuable evidence — it may show that continuity or security state that should hold
across runtimes is wrongly bound to one instance. But:

```text
Sticky Session Workaround
≠
Protocol Continuity
```

Sticky routing helps locate the problem. It does not prove the architecture is fixed.

## 28 · Diagnostic health detail is not a public infrastructure inventory

An operator needs enough internal detail to locate persistence, required trust material,
initialisation, configuration and other readiness dependencies. But:

```text
Diagnostic Health Detail
≠
Public Infrastructure Inventory
```

A public health surface must not expose internal topology, sensitive references or secret
detail for debugging convenience. A health endpoint is also not an admin API.

## 29 · A persistence failure does not license implicit allow

If SoulAuth cannot establish a new security-critical identity/authentication fact:

```text
Cannot Establish Required Security Fact
≠
Allow in Degraded Mode
```

`persistence unavailable → temporarily accept everyone` is never correct. Symmetrically, a
SoulAuth persistence failure does not make every previously issued artifact invalid at
every consumer — their continued validation follows their own freshness/validation
contract.

If a restore or trust reconciliation is already needed, stop ordinary troubleshooting and
go to [Operations & Recovery](./operations-and-recovery).

## 30 · When required trust material is unavailable, do not invent new trust

If an operation fails because required key/secret/trust material cannot be obtained, first
determine what material this operation actually depends on. Do not generate a random
replacement key "to see if it runs" — that is not troubleshooting, it is **creating a new
trust state.** Recovery belongs to
[Operations & Recovery](./operations-and-recovery).

## 31 · Optional integration diagnosis, only when enabled

### Federation

Establish the complete external identity context first:

```text
Trusted External Identity Source + External Subject
```

```text
External Subject String Alone  ≠  Federated Identity
Provider Authentication        ≠  SoulAuth IdentityBinding
```

A successful provider authentication does not on its own prove which ActorIdentity
SoulAuth should map it to. Diagnose in order: provider trust, source-qualified external
identity, IdentityBinding, ActorIdentity resolution. Never do ad-hoc identity matching by
email or display name.

## 32 · No identity resolution and identity misattribution are different severities

**No identity resolution** — no unique ActorIdentity was established. If trust is still
clear, ordinary troubleshooting may continue.

**Identity misattribution** — an ActorIdentity *was* established, and it is the wrong one.

```text
No Identity Resolution
≠
Identity Misattribution
```

The first usually means trust was not established. The second means **wrong trust has
already been established.** On finding misattribution:

```text
STOP ordinary troubleshooting
        ↓
Operations & Recovery / Incident Response
```

Do not keep "trying a few more mappings".

## 33 · Mail flow state is not delivery state

A user not receiving an email does not mean the SoulAuth flow was never established:

```text
Flow State
≠
Mail Delivery State
```

Check the SoulAuth flow, adapter invocation, provider acceptance and delivery result in
turn — but the detail an operator sees must not be exposed verbatim to a public caller,
or enumeration resistance breaks.

## 34 · Soulseed diagnosis, when enabled

Reuse the three-layer failure model already frozen in
[Soulseed Integration](../integrate/soulseed):

```text
Trust Validation Failure
Actor Context Projection Failure
Downstream Runtime Denial
```

**Trust validation failure** — trusted SoulAuth authentication facts cannot be established
within the declared scope. **Actor context projection failure** — trust holds, but no
unique Actor context satisfying the integration contract can be formed. **Downstream
runtime denial** — AuthContext is trusted and SoulseedOS still refuses under its own
runtime/governance policy. The last is not a SoulAuth authentication failure.

### Wrong Actor attribution escalates immediately

Failing to establish an AuthContext is troubleshootable. An AuthContext established and
attributed to the wrong ActorIdentity is identity misattribution — go to
[Operations & Recovery](./operations-and-recovery) at once.

### Binding absent is not Actor absent

```text
Soulseed IdentityBinding Absent
≠
ActorIdentity Absent
```

If the consumer does not require a Soulseed canonical Actor reference, the missing binding
may be entirely legitimate. Confirm the consumer contract before declaring identity
damage.

## 35 · Runtime denial is not SoulAuth failure

```text
Trusted AuthContext + Runtime Denial
≠
SoulAuth Authentication Failure
```

Do not make the action succeed by fabricating assurance, fabricating an IdentityBinding,
changing the Actor Kind, or treating a Client as an Actor.

## 36 · Troubleshooting is not permission to weaken a trust boundary

```text
Troubleshooting
≠
Permission to Weaken Trust Validation
```

Do not "fix" a problem by: disabling issuer or resource validation; disabling TLS
verification; accepting arbitrary redirects or arbitrary forwarded request context;
loosening browser origin/security policy without limit; interpreting a Client as an
ActorIdentity; manufacturing an IdentityBinding from an email or a name; exposing raw
credentials, tokens or private material to a debug surface; editing production persistence
directly; generating temporary trust material to bypass a key problem; or modifying
historical audit to hide a gap.

An error that only disappears after dismantling a security boundary is not fixed.

## 37 · When to stop ordinary troubleshooting

In the following cases the question is no longer "which setting is wrong?" but **what can
we still trust?**

**Identity misattribution** — a wrong ActorIdentity was established; identity ownership
shows unexplained collision, reuse or wrong binding.

**Trust material uncertainty** — the provenance of a required credential, key or secret
cannot be explained; a trust material may be compromised; downstream still accepts
material that should be distrusted.

**Persistence / current-state integrity uncertainty** — production state appears to have
been modified without authorisation; an unexplained historical rollback appeared.

**Administrative compromise** — unauthorised privileged mutation; an unknown administrative
initiator; a possibly leaked administrative credential.

**Historical accountability failure** — an unknown audit gap; history apparently deleted,
forged or rewritten; audit integrity verification failing where that profile exists.

**Security material compromise** — a raw credential, session credential, token or other
security-sensitive artifact may have leaked.

```text
STOP ordinary troubleshooting
        ↓
Operations & Recovery / Incident Response
```

## 38 · Troubleshooting is not direct persistence mutation

```text
Troubleshooting
≠
Direct Persistence Mutation
```

"Changing one record should fix it" bypasses the domain contract, audit, authority and
lifecycle. Ordinary corrections go through the supported control plane, the configuration
contract, or a formal migration/maintenance mechanism. If genuine low-level state repair
is needed, that is already controlled recovery.

## 39 · Resolution validation

The error disappearing is not the only success condition. Completing troubleshooting means
answering: **did the correct path recover? does the wrong path still fail correctly? did
we weaken any trust boundary to make the request succeed?**

**Positive validation** — the original failing flow now succeeds per contract; upstream and
downstream trust relationships remain correct; ActorIdentity attribution is correct;
runtime and topology behaviour matches the contract.

**Negative validation** — choose the tests that genuinely apply to this failure domain and
enabled feature set: a wrong issuer is still rejected; a wrong resource is still rejected;
an invalid or expired artifact still fails; invalid transaction binding still fails; a
client-only context still cannot become an ActorIdentity; an untrusted IdentityBinding is
still not accepted.

```text
Success after Weakening Validation
≠
Successful Troubleshooting
```

## 40 · Where to go after a correction

**Local correction** — a local, non-trust-affecting error (a test client with wrong
configuration, an application sending to the wrong resource, a feature-local non-trust
setting). Complete the applicable validation and stop.

**Material / trust-affecting change** — if the correction changed the issuer, trust
material, persistence or schema, control-plane exposure, the token contract, deployment
topology, browser architecture, the Soulseed integration contract or another assumption
the last sign-off depended on, **re-run the affected gates in
[Production Checklist](./production-checklist).**

**Recovery / incident operation** — if the problem involves a historical restore, identity
misattribution, trust-material compromise, emergency containment, IdentityBinding
correction or historical-accountability recovery, go to
[Operations & Recovery](./operations-and-recovery).

## 41 · Quick symptom routing matrix

| Symptom | First boundary | Do not assume |
| --- | --- | --- |
| **Endpoint unreachable** | DNS / TLS / proxy / runtime | "The token is broken" |
| **Issuer mismatch** | External protocol view / issuer / proxy | "Just disable issuer validation" |
| **Redirect mismatch** | Client / redirect contract | "We need looser redirects" |
| **Protocol exchange error** | Transaction lifecycle / binding | The error category is the root cause |
| **Authentication succeeded, app still logged out** | callback / app session / cookie | Actor authentication must have failed |
| **App logged in, API 401** | Access token / resource validation | The password must be wrong |
| **API 403** | Resource / application / governance authority | Authentication must have failed |
| **Token decodes but the API rejects it** | Token validation contract | Decoded means validated |
| **Wrong-resource artifact rejected** | Resource boundary | The system is broken |
| **Fails only on one runtime** | Artifact / config / trust material / clock / state | Retry succeeding means fixed |
| **Federated login works, no ActorIdentity** | External source + subject / IdentityBinding | Provider auth equals SoulAuth binding |
| **Wrong ActorIdentity resolved** | Identity integrity | An ordinary mapping bug worth retrying |
| **Mail not received** | Flow / provider / delivery | The flow was never established |
| **Soulseed trusted AuthContext rejected** | Downstream runtime / governance | SoulAuth authentication must have failed |

## 42 · Troubleshooting at a glance

| Boundary | Meaning |
| --- | --- |
| **Diagnosis ≠ Repair** | Change the system after finding the cause |
| **Error message ≠ Root cause** | An error category is evidence |
| **Evidence before mutation** | Restart and retry can destroy the scene |
| **Diagnostic context ≠ Secret dump** | Debugging context must not leak secrets |
| **Reproduction ≠ Side-effect free** | Trying again can change security state |
| **Blast radius + first failing stage → scope** | Establish who is affected and where it broke |
| **Earliest broken boundary first** | Tuning downstream before fixing upstream is futile |
| **ActorIdentity ≠ Credential** | A credential failure does not disprove the identity |
| **Decoded ≠ Validated** | Parsing is not trust |
| **HTTP status ≠ Complete semantics** | 401/403 are hints |
| **No resolution ≠ Misattribution** | Not finding and mis-identifying differ in severity |
| **Wrong-boundary rejection ≠ System failure** | A correct rejection may show security working |
| **Retry success ≠ Root cause resolved** | A retry may only have changed the scene |
| **Troubleshooting ≠ Weakening validation** | Turning checks off is not a fix |
| **Troubleshooting ≠ Direct persistence mutation** | Diagnosis does not bypass the domain contract |
| **Trust uncertain → Stop and escalate** | When trust itself is unexplainable, go to recovery |
| **Positive success ≠ Enough** | Negative paths must still fail |

## 43 · The troubleshooting flow

```text
What failed?
        ↓
Who is affected?
        ↓
Where does the flow first fail?
        ↓
Which contract / trust boundary owns it?
        ↓
What read-only evidence proves the hypothesis?
        ↓
Can it be reproduced safely?
        ↓
Is trust still explainable?
        │
        ├── Yes
        │     ↓  smallest valid correction
        │     ↓  positive + negative validation
        │
        └── No
              ↓  Operations & Recovery / Incident Response
```

The core discipline is not *make authentication succeed as fast as possible*. It is:

> **Prove where the problem is before changing the system.**

## Exact contract source

This page owns safe triage, diagnostic context, blast radius, first failing stage,
earliest broken boundary, domain routing, escalation boundaries and resolution validation.

It does not define which OAuth flows are supported, whether PKCE is mandatory, whether MFA
or TOTP exists, whether refresh tokens exist, whether a replicated topology is supported,
whether a configuration revision exists, which AIActor authentication method exists, or
whether audit integrity is supported. Those come first from
[Project Status](../project/status),
[Authentication & Sessions](../reference/authentication-and-sessions),
[OIDC & Clients](../reference/oidc-and-clients),
[Verify Tokens](../integrate/verify-tokens), [Deployment](./deployment),
[Configuration](../reference/configuration), [Audit](../reference/audit) and
[Soulseed Integration](../integrate/soulseed).

> **Troubleshooting can diagnose why an existing contract was not honoured. It cannot
> create a new contract along the way.**

## Next

The **Operate** module now closes:

```text
Deployment              Place SoulAuth into a real runtime environment
        ↓
Production Checklist    Prove this exact deployment is production-ready
        ↓
Operations & Recovery   Maintain and recover production trust over time
        ↓
Troubleshooting         Locate the earliest broken boundary without weakening trust
```

To understand the security properties behind these diagnostic boundaries, continue to
[Security Model](../security/security-model).
