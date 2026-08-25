# Security Model

## How SoulAuth establishes a trustworthy identity fact

SoulAuth is Actor-native identity and authentication infrastructure. What its security
protects first is therefore not a password, a token or an endpoint. It is:

> **the correctness of identity and authentication facts.**

The most dangerous case is not that the system cannot determine who the current Actor
is. It is worse than that:

> **the system did not actually establish the identity fact, yet attributed the current
> principal to a different ActorIdentity.**

So the security model starts from one simple principle:

```text
Unable to establish a required Trust Fact
≠
Permission to assume that Fact is true
```

If a security-critical fact cannot be established under the applicable contract,
SoulAuth must not claim that it holds.

## 1 · Identity misattribution is the core security failure

An ordinary authentication failure usually means the required authentication trust was
not established:

```text
Credential verification fails
        ↓
Authentication rejected
```

The system did not get the result it wanted, but the security boundary is intact. This
is far more serious:

```text
Actor A presents evidence
        ↓
system resolves Actor B
        ↓
Authentication succeeds as B
```

Authentication "succeeded" on the surface. What it established was the **wrong Actor
attribution**:

```text
Authentication Success
+
Wrong Actor Attribution
=
Security Failure
```

For identity infrastructure, **identifying the wrong Actor is more dangerous than
failing to identify at all.** SoulAuth must protect both whether authentication evidence
is valid *and* whether that evidence ends up bound to the correct ActorIdentity.

## 2 · Trust is a bounded fact, not a component badge

SoulAuth does not use the model "this service is trusted, so everything it outputs is
trustworthy", nor "the previous step already validated, so later decisions inherit that
trust".

A trust fact that can actually be relied on must be able to answer:

```text
Source
+ Assertion / Fact
+ Verification
+ Scope
+ Purpose
+ Validity / Freshness
+ Consumer
```

In other words we always need to know:

> **who supplied what fact, verified how, valid within what scope and time, usable by
> whom for what decision.**

```text
Source Authority is claim-scoped
```

A source's authority over one class of fact does not expand into another domain:

```text
TLS verified            ≠  Access Token verified
Token signature valid   ≠  Token valid for this resource
Authenticated Actor     ≠  Authorized operation
```

Transport trust does not prove a token satisfies the token contract. Signature
verification is one condition among several — issuer, resource/audience, time, token
profile and other applicable validations must each hold. And authentication proves
identity; it never creates authority in an application, in SoulAuth administration or in
Soulseed governance.

## 3 · Fail closed: cannot establish is not already satisfied

SoulAuth's fail-closed principle applies to the **security-critical prerequisite
currently being established**. If the credential state required for the Actor's
authentication cannot be obtained reliably:

```text
Cannot establish required Authentication
→
do not authenticate the Actor
```

Generally:

```text
Unknown Security State
≠
Satisfied Security State
```

Fail-closed does **not** mean every dependency failure must turn into an authorization
denial. A metrics backend unrelated to the current security decision failing does not
invalidate existing authentication artifacts:

```text
Fail Closed
≠
Every Failure Is 403
```

The real principle is:

> **When a security-critical prerequisite cannot be established, the system must not
> downgrade *unknown* into *satisfied* for the sake of availability.**

It may report a technical failure, unavailability, or another result appropriate to that
boundary. It must not wrongly allow.

## 4 · What SoulAuth protects

SoulAuth security is not built around a single secret. It protects four related security
realities that must not be merged:

| Security area | What it primarily protects |
| --- | --- |
| **Identity & Authentication** | ActorIdentity continuity, IdentityBinding, credentials, and correct attribution of authentication results |
| **Protocol & Continuity** | Clients, AuthSessions and protocol artifacts holding in the right purpose, context and lifecycle |
| **Administrative & Infrastructure** | The control plane, configuration, persistence and key/secret infrastructure not bypassing domain boundaries |
| **Historical & Recovery** | Audit attribution, tamper-evident integrity, and historical facts surviving restart/restore without reinterpretation |

Exact endpoints, authentication methods, token profiles, permissions, key lifecycles and
recovery procedures are defined by their own reference and operations pages. This page
defines only why these properties must hold over the long term.

## 5 · Property A: identity and authentication integrity

SoulAuth must always be able to distinguish:

```text
ActorIdentity  ≠  Credential  ≠  Client
Client Authentication  ≠  Actor Authentication
```

A credential proves the Actor. Client authentication proves the client in the protocol.
Participating in the same request does not merge them.

Likewise, an IdentityBinding establishes a cross-domain identity relation. It does not
thereby become authentication evidence, and it does not merge two identity domains into
one namespace.

### Credential protection is more than confidentiality

Credential security obviously includes secret protection. That is not enough. Equally
important:

> **A credential or its verification material must remain bound to the correct
> ActorIdentity.**

Even if an AIActor's private key is never leaked, an attacker who can replace the
verification material registered for Actor A with their own public key —

```text
Actor A → Attacker Verification Material
```

— can still get authenticated as Actor A. Therefore:

> **Verification-material integrity matters as much as secret confidentiality.**

Supporting an asymmetric authentication method also does not make the SoulAuth server
the custodian of an AIActor's private key. Concrete credential protection is defined by
[Authentication Protection](./authentication-protection) and
[Authentication & Sessions](../reference/authentication-and-sessions).

## 6 · Property B: protocol and continuity integrity

After authentication succeeds, the system must protect how the established
authentication reality continues, and how protocol artifacts carry it correctly.

```text
AuthSession
≠
ActorIdentity
```

An AuthSession carries bounded authentication continuity only. It never becomes a new
identity root and it never freezes authority.

Protocol artifacts must be interpreted inside their own contract. An artifact being
*well-formed* does not make it *correct for this client, transaction, issuer, resource,
time and purpose*:

```text
Valid Representation
≠
Valid Protocol Context
```

Authorization codes, tokens, OIDC, federation, replay and freshness contracts are
defined by [OIDC & Clients](../reference/oidc-and-clients),
[Authentication & Sessions](../reference/authentication-and-sessions) and
[Authentication Protection](./authentication-protection). This page locks only:

> **An artifact must not be reinterpreted outside its purpose, context and lifecycle.**

## 7 · Property C: administrative and trust-boundary integrity

SoulAuth has its own control plane, and therefore its own administrative authentication
and authority. But:

```text
Administrative Authority
≠
Unlimited Authority
```

A correctly authenticated and authorized administrator still cannot bypass SoulAuth's
own domain invariants. Administrative authority does not confer the ability to rewrite
the ActorIdentity ontology, treat a Client as an Actor, skip the credential lifecycle,
silently modify audit history, obtain an AIActor's private key, or create Soulseed
governance authority.

```text
Authorized Administrator
≠
Permission to violate Domain Invariants
```

A second distinction matters just as much:

```text
Infrastructure Privilege
≠
SoulAuth Administrative Authority
```

An infrastructure operator may be physically able to reach the database, the environment
or the runtime. That does not mean SoulAuth's semantic contract regards that operator as
holding the corresponding administrative permission. Changing persistence directly,
around the formal control plane, is:

```text
Direct Database Mutation
≠
Supported Administration
```

— an event on the infrastructure/integrity boundary, not normal administration.

## 8 · Property D: historical and recovery integrity

Current state may change. Facts that already happened must not be reinterpreted because
of it:

```text
Current State
≠
Historical Fact
```

```text
T1  Authentication succeeds
T2  Actor is suspended
```

After T2, the Actor is no longer eligible. That does not mean the authentication at T1
never succeeded. Likewise:

```text
Permission revoked        ≠  Historical authorization invalidated
Configuration rollback    ≠  Historical rewrite
```

Audit must provide sufficient attribution for important identity, authentication,
administrative and security events, with a declared **tamper-evident** integrity
property. But:

```text
tamper-evident
≠
tamper-proof
```

SoulAuth does not claim any digital record is absolutely immutable. It requires that,
within the declared trust model, unauthorised historical modification is either
detectable or the corresponding integrity boundary explicitly fails.

Recovery obeys the same principle:

> **The goal of a restore is to recover an interpretable canonical truth — not to
> manufacture a more convenient history.**

The audit event model and recovery procedures are defined by
[Audit](../reference/audit) and
[Operations & Recovery](../operate/operations-and-recovery).

## 9 · Five trust boundaries

SoulAuth does not treat the deployment environment as one uniform trust zone. For the
public security model, five boundaries describe the main relations.

### External input boundary

Data from a caller, browser, client, network or any other external source is, at first,
only **input**:

```text
Caller-controlled Input
≠
Trusted Runtime Fact
```

Identifiers, headers, cookies, tokens, claims, redirect values and other inputs acquire
stronger meaning only after validation under the applicable contract.

### Identity & authentication boundary

This boundary protects who the current client is, who the current Actor is, what the
evidence proves, and how the authentication result is established.

```text
Client              ≠  Actor
Identity Resolution ≠  Authentication
```

Knowing an ActorIdentity reference does not prove the caller *is* that Actor.

### Administrative & infrastructure boundary

Covers the control plane, persistence, configuration and key/secret infrastructure.

```text
Database Access  ≠  Authorized Administration
Data Access      ≠  Key Access
```

Keys, secrets and domain state should have clear purposes and access boundaries so that
a real compromise stays scoped.

### External provider boundary

External IdPs, key managers, delivery providers and other adapters supply facts only
within their own contract scope. An external identity provider can be the source of
certain verified external authentication facts. It does not thereby gain SoulAuth
ActorIdentity ownership, SoulAuth administrative authority or Soulseed governance
authority:

```text
Verified External Trust
≠
Transitive Universal Trust
```

### Consumer / integration boundary

Applications, APIs and SoulseedOS may consume the verified identity/authentication facts
SoulAuth provides. But:

```text
SoulAuth Authentication  ≠  Consumer Authorization
AuthContext              ≠  Governance Authority  ≠  Execution Authority
```

An IdentityBinding can connect two identity domains. It does not merge two trust
domains. SoulAuth's security guarantee stops at its own contract boundary.

## 10 · Security assumptions

A complete security guarantee also depends on external conditions. These are not
"SoulAuth unconditionally trusts some component" — they are the external security
dependencies a class of claim requires.

### Trusted runtime / artifact

Production must run the runtime artifact corresponding to the declared release. If the
runtime itself is replaced without authorisation, application-level authentication
controls cannot restore the trust model on their own.

### Protected persistence and key infrastructure

Persistence and key/secret infrastructure must be protected under the applicable
security contract. Even so:

```text
Stored
≠
Semantically Valid by definition
```

A record existing in a database does not prove the domain invariants hold.

### Reasonably correct time

Authentication, tokens, AuthSessions, key lifecycles and other time-sensitive security
decisions depend on acceptable clock conditions:

```text
Wall clock
≠
Universal causal truth
```

Severe clock failure can still break time-dependent security contracts.

### Trusted transport / proxy boundary

A production protocol surface must establish the applicable transport and proxy trust
correctly. Forwarded metadata originating from the caller does not become a trusted fact
merely by appearing in a header.

## 11 · Data minimisation and the disclosure boundary

Identity infrastructure inevitably touches sensitive data. Security means not only that
data was not taken by an attacker, but also:

> **the system does not collect, copy, spread and retain identity data unnecessarily for
> the sake of convenience.**

```text
More Identity Data
≠
More Security
```

Claims, token projections, AuthContext and other consumer-facing surfaces should carry
only the data required by the declared contract. They are not a replication channel for
SoulAuth's private database. Similarly:

```text
Auditability
≠
Secret Disclosure
```

Raw secrets, private keys, credential secrets or other bearer-style sensitive material
must not reach an inappropriate observability or projection surface because debugging,
logging or auditing found it convenient. Field-level disclosure, logging and audit rules
are defined by the corresponding security, operations and audit contracts.

## 12 · Where SoulAuth stops

A mature security model states its own responsibility boundary. SoulAuth is responsible
for ActorIdentity, authentication, security within its own control plane, the trust
facts it produces and verifies, and the audit/attribution boundary it owns.

A successful authentication does not make SoulAuth responsible for application business
authorization, Soulseed mind safety, Soulseed governance, the correctness of external
execution, an external provider staying secure forever, or the internal logic of a
consumer application.

```text
Out of Scope
≠
No Security Boundary
```

SoulAuth does not own an application's final business authorization, but it must still
never write authentication as authority, never write Client as Actor, never emit facts
beyond what its contract proves, and stop accurately at its own trust boundary. That is
where shared responsibility becomes meaningful rather than rhetorical.

## 13 · Security at a glance

| Security boundary | Meaning |
| --- | --- |
| **Unverified input ≠ Trusted fact** | External input must pass the applicable validation |
| **Wrong Actor attribution = Security failure** | Authenticating successfully to the wrong Actor is still a failure |
| **Source authority is claim-scoped** | A source's trust does not expand without limit |
| **Unknown security state ≠ Satisfied state** | A prerequisite that cannot be established must not implicitly allow |
| **Authentication ≠ Authority** | Proof does not create the right to act |
| **Infrastructure privilege ≠ Administrative authority** | Technical capability is not semantic permission |
| **Current state ≠ Historical fact** | Present change cannot rewrite the past |
| **tamper-evident ≠ tamper-proof** | Audit guarantees detectability, not absolute immutability |
| **Recovery ≠ Historical rewrite** | A restore must not manufacture a more convenient past |
| **More identity data ≠ More security** | Data minimisation is itself a security discipline |

Compressed to a single sentence:

> **Every piece of trust must answer: where it came from, what it proves, within what
> scope and time it holds, and where it stops.**

And:

> **The layer above being trustworthy does not let the next layer skip its own
> verification.**

## Next

This page answered which security properties SoulAuth must protect over the long term,
and how trust is established and bounded across boundaries.

[Threat Model](./threat-model) continues from the opposite direction: if these
properties must hold, what will an attacker, a misconfiguration, a system failure or
trust drift try to break? [Authentication Protection](./authentication-protection) then
enters the concrete controls.
