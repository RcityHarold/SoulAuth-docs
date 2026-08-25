# Threat Model

## How SoulAuth's security properties fail

[Security Model](./security-model) defines what SoulAuth must keep true: ActorIdentity
must be attributed correctly; credentials and verification material must stay bound to
the right ActorIdentity; a Client must not be reinterpreted as an Actor; authentication
must not expand into authority; a protocol artifact holds only inside its own contract;
and after a trust boundary changes, the system must still interpret current state and
historical fact correctly.

This page inverts the question:

> **What malicious behaviour, error, fault or state drift could stop those properties
> from holding?**

```text
Threat
≠
Known Vulnerability
```

Including a threat in the model does not assert that the current implementation has a
corresponding vulnerability. It asserts that **SoulAuth must understand and defend this
security failure path.**

## 1 · A capability-based threat model

SoulAuth does not build its threat model around "who looks more dangerous". It asks:

> **Who or what holds which capability, and which trust boundary can that capability act
> on?**

```text
Actor Kind  ≠  Trust Level
AIActor     ≠  Threat Class
```

Human and AIActor are both Actors. Either may act normally, act maliciously, have
credentials stolen, be controlled by another system, or abuse a capability it legitimately
holds. What determines the threat is **capability, not an identity label.**

## 2 · A threat source is not necessarily an adversary

Many security failures come from attackers. Not all do:

```text
replicas run incompatible security semantics
        ↓
the same artifact receives different decisions
        ↓
a declared Security Property fails
```

That may originate in operator error, configuration drift, a software defect, clock
failure, replica divergence or a recovery mistake:

```text
Threat Source
≠
Adversary
```

Ordinary reliability failures do not automatically enter the threat model. A fault
becomes a **security-relevant threat source** only when it can break a declared security
property or trust boundary.

## 3 · Authenticated is not benign

Authentication proves the identity context satisfied the declared contract. It does not
prove intent. A registered client is not benign by virtue of registration; an
administrative principal is not benign by virtue of authority:

```text
Authenticated / Registered / Authorized
≠
Benign by definition
```

A legitimately authenticated Actor can still abuse its identity. A principal with
administrative authority may be compromised, act maliciously, or simply make a mistake.

## 4 · Cryptographic assumption

Assuming the current declared cryptographic profile and its security assumptions hold,
this model does not treat "directly breaking a correctly used cryptographic primitive"
as a default attacker capability.

Real threats still include key theft, key replacement, key custody compromise,
wrong-key validation, lifecycle error and secret disclosure:

```text
Breaking a cryptographic primitive
≠
Compromising cryptographic trust material
```

The latter is a real threat SoulAuth must handle directly.

## 5 · Threat applicability

Not every threat applies to every deployment. Identity misattribution applies almost
always. Federation-specific threats apply only once that feature is enabled.
Cross-replica inconsistency depends on topology.

> **Threat applicability must be read together with the current feature set and
> deployment topology.**

A threat not applying to one deployment is not a reason to delete it from SoulAuth's
overall model. Nor does this page fix a universal risk score for all environments — real
risk also depends on exposure, enabled features, deployed controls and impact.

## 6 · Threat sources by capability

| Threat source | Typical capability |
| --- | --- |
| **Remote caller** | Submit arbitrary input to a public surface, repeat requests, send anomalous protocol artifacts |
| **Authenticated Actor / registered Client** | Keep pushing past boundaries from inside a legitimate identity or protocol context |
| **Credential / artifact holder** | Use a stolen or wrongly obtained authentication, session or protocol capability |
| **Privileged operator / compromised infrastructure** | Control plane, persistence, runtime, configuration, key or secret access |
| **External provider** | Produce or influence external assertion / recovery / delivery facts within its declared trust scope |
| **Security-relevant fault** | Drift, defect, clock, replica, upgrade, recovery and other non-malicious failures |

Sources compose. What matters is always **which capability it genuinely holds now.**

## 7 · Trust boundaries and attack surfaces

Canonical trust boundaries are inherited from
[Security Model](./security-model):

| Canonical trust boundary | Typical attack surfaces |
| --- | --- |
| **External input** | Public protocol requests, browser/request input, redirect and host input |
| **Identity & authentication** | Credential, verification material, IdentityBinding, AuthSession |
| **Administrative & infrastructure** | Control plane, persistence, configuration, runtime, key/secret custody |
| **External provider** | Federation source, delivery/recovery provider |
| **Consumer / integration** | Client, BFF, resource server, Soulseed integration |

An attack surface is a concrete exposure inside or across a trust boundary. It is not a
new canonical architecture layer.

## 8 · Family 1: identity substitution and misattribution

One of the core threats to Actor-native identity. The goal is:

> **make the system establish an Actor context attributed to the wrong ActorIdentity.**

Paths include wrong credential/verification-material binding, a wrong IdentityBinding,
external identity source confusion, subject reuse and namespace confusion, a Client
wrongly promoted into an Actor context, tampering with identity relations in persistence,
and a wrong Soulseed-specific IdentityBinding mapping.

What breaks is the **identity attribution / identity integrity property.** In particular:

```text
No Identity Resolution
≠
Identity Misattribution
```

Failing to resolve an Actor usually means no trust was established. Resolving Actor A as
Actor B means the system already established *wrong* trust.

## 9 · Family 2: credential theft, guessing and binding substitution

Targets the Actor's authentication capability and the binding of verification material.
Includes credential guessing/stuffing, authentication secret theft, recovery capability
theft, compromise of actor-held cryptographic material where the method applies,
malicious replacement of verification material, and administrative or persistence
mutation that binds attacker-controlled material to a victim Actor.

```text
Credential Theft
≠
Credential Binding Substitution
```

An attacker does not necessarily need the victim's original credential. If attacker-
controlled verification material becomes trusted material for the victim's ActorIdentity,
impersonation follows just the same. This is one of SoulAuth's most important threat
boundaries.

## 10 · Family 3: client impersonation and client/Actor confusion

Targets the semantic boundary between client protocol context and ActorIdentity. Includes
client authentication material theft, client impersonation, wrong public/confidential
classification, a malicious registered client, and a client-only context being read as an
Actor context.

```text
Client            ≠  Actor
OAuth `client_id` ≠  ActorIdentity
```

Even a successful client authentication must not promote a software client into an
authenticated Actor through an implicit mapping. This family can break protocol
integrity, identity attribution and the authority boundary at once.

## 11 · Family 4: OAuth / OIDC transaction hijacking

Where the release enables the corresponding profile, the property to protect is:

> **a protocol result from transaction A must not be accepted as the result of
> transaction B.**

Threats appear across the applicable redirect binding, request correlation, `state`,
`nonce`, PKCE, authorization code, client binding, and issuer/response mix-up relations.

The real threat is not any single parameter name — it is **transaction binding being
broken.** The core question stays: was a result from a particular client, request,
redirect, issuer or transaction wrongly accepted into a different context? Which
protections apply is decided by the current declared OAuth/OIDC profile.

## 12 · Family 5: session and token artifact abuse

Targets established AuthSessions, access tokens, ID tokens and any other artifact the
current profile supports. Includes session theft, session fixation and binding confusion,
access token theft, wrong-resource token acceptance, ID/access token confusion,
acceptance of an expired or stale artifact, actor-bearing versus client-only subject
confusion, and replay where replay carries security meaning under that artifact's
contract.

If the profile supports refresh tokens, refresh theft and reuse belong here as a
feature-dependent threat.

```text
Replay Threat
≠
Every Artifact Must Be Single-use
```

## 13 · Family 6: federation and IdentityBinding hijacking

Where federation or external binding is enabled, prevent an external identity from being
interpreted as a SoulAuth ActorIdentity under the wrong source, namespace or binding.
Includes issuer/identity-source confusion, using an external subject string while
ignoring its source, unsafe attribute-based linking, external account takeover, a
malicious or incorrect IdentityBinding, a revoked relation being wrongly restored, and
Soulseed-specific binding hijacking.

```text
External Subject String Alone
≠
Federated Identity
```

An external subject must be understood inside an explicit external identity
source/issuer context.

### Provider compromise

Even a protocol-valid provider response only proves what the declared federation contract
permits it to prove. It does not prove the provider has not been compromised internally:

```text
Valid Provider Response
≠
Provider Proven Uncompromised
```

The blast radius of a provider compromise is decided by the trust scope that provider
actually holds.

## 14 · Family 7: administrative and privileged control abuse

Targets high-privilege capabilities that can change SoulAuth-owned security state:
administrative credential compromise, privilege escalation, a malicious authorized
operator, unauthorized Actor/credential/client/binding mutation, authority-assignment
abuse, direct persistence manipulation, configuration or runtime mutation, and violating
domain invariants through a privileged path.

```text
Privileged
≠
Unlimited
```

Holding one high-privilege capability does not confer the others. A database operator
should not gain key custody by being able to write persistence; a key custodian should
not gain ActorIdentity mutation authority.

## 15 · Family 8: key, secret and trust-material compromise

Targets the keys, secrets and trust material the release actually uses — protocol signing
material, credential protection material, transport material, operational secrets and
whatever else the current security profile depends on.

Threats include theft, disclosure, malicious replacement, deletion, wrong version, stale
key material, unauthorized custody access, and secrets leaking into logs, images or
backups.

```text
Compromise of one key purpose
≠
Compromise of every trust domain
```

Different key purposes must carry different blast radii; the purposes themselves are
defined by the security/protocol contract.

## 16 · Cross-cutting failure mode: current-state manipulation

Some threats are not new targets — they describe **how an attacker or fault directly
changes the security state the system currently believes**: direct persistence mutation,
Actor lifecycle tampering, IdentityBinding replacement, credential binding replacement,
malicious configuration, trust anchor manipulation, runtime artifact replacement.

```text
Current trusted state
        ↓
altered
        ↓
system continues operating from the altered state
```

Identity threats, administrative abuse, key compromise and infrastructure compromise can
all trigger this, which is why it is a **cross-cutting state integrity failure mode.**

## 17 · Cross-cutting failure mode: temporal / replica / recovery reintroduction

Another class does not rewrite the present. It **lets expired, revoked, inconsistent or
historical security state re-enter a current trust decision**: historical snapshot
restore, revoked credential or AuthSession resurrection, consumed one-time artifact
resurrection, revoked IdentityBinding resurrection, stale key state, replica divergence,
clock skew, unsupported mixed-version behaviour, recovery sequencing errors.

```text
historical / stale / divergent state
        ↓
re-enters current runtime
        ↓
is treated as current trusted state
```

```text
Current-state manipulation
≠
Temporal / recovery reintroduction
```

One tampers with the present; the other makes a wrong past become "now".

## 18 · Cross-cutting threat: availability and resource abuse

An attacker may create resource pressure, lockout pressure, expensive authentication
work, protocol state exhaustion or dependency pressure through high-frequency,
high-cost or deliberately state-consuming behaviour.

SoulAuth does not promise it can never be DoSed. It must keep:

```text
Resource Pressure
≠
Permission to Authenticate Less Safely
```

Availability pressure is never a reason to turn off trust validation, lower an
authentication requirement, or ignore security preconditions.

## 19 · Cross-cutting threat: privacy, enumeration and data exposure

A security failure can also be the system leaking identity or security information it
should not. It may surface through authentication or recovery errors, timing, claim
projection, logs and audit, diagnostics and debug output, or support artifacts.

Threats include resource/account enumeration, unnecessary identity correlation, sensitive
metadata disclosure and secret or token leakage. Data minimisation and enumeration
resistance are therefore cross-cutting security disciplines; the concrete protections
belong to their respective owners.

## 20 · Cross-cutting threat: backup and recovery integrity

```text
Backup Available
≠
Trusted Recovery Point
```

A backup may leak sensitive historical state, be tampered with, contain already-revoked
trust, or resurrect security state that is no longer trustworthy. Recovery procedures are
defined by [Operations & Recovery](../operate/operations-and-recovery). This page locks
only:

> **Recovery material is itself a security-sensitive trust input.**

## 21 · Cross-cutting threat: audit suppression and misattribution

An attacker or fault may prevent required audit evidence from being produced, delete
history, hide a gap, forge an event, or attribute an operation to the wrong principal or
Actor:

```text
Audit Presence
≠
Correct Attribution
```

A history that looks complete but attributes wrongly can be more dangerous than a clearly
visible gap, because it establishes **false accountability.** Historical integrity is
defined by [Audit](../reference/audit).

## 22 · Feature lens: AIActor authentication

SoulAuth does not build a second threat model for AIActors. An AIActor first inherits
every Actor threat: identity misattribution, credential compromise, verification material
substitution, session and artifact abuse, administrative mutation.

If the current release supports an AIActor authentication method that depends on
actor-held cryptographic material, compromise of that private material may confer Actor
authentication capability. If that method uses a replayable authentication proof, its
replay and freshness security follows that method's own declared contract.

This page does not freeze challenge, nonce, timestamp, canonicalisation or algorithm —
those belong to the exact authentication contract in
[Authentication & Sessions](../reference/authentication-and-sessions).

## 23 · Feature lens: Soulseed integration

With Soulseed integration enabled, the threats still fall into the families above.

**A client-only context converted into an Actor AuthContext** breaks `Client ≠ Actor`.

**A hijacked Soulseed-specific IdentityBinding** wrongly associates a SoulAuth
ActorIdentity with a Soulseed canonical Actor — identity misattribution.

**A forged AuthContext**: `AuthContext-shaped payload ≠ Trusted AuthContext`.

**A stale AuthContext**: upstream security state changed while SoulseedOS keeps relying
on an outdated context — a trust freshness/continuity threat.

**Adapter authority creep**: the adapter expands from translation into runtime
authorization, breaking `Authentication ≠ Authority`.

The canonical integration boundary for all of these remains
[Soulseed Integration](../integrate/soulseed).

## 24 · Foundational trust compromise

Some threats break not one credential or session but **one or more foundational trust
assumptions the security model depends on** — for example an attacker holding runtime
artifact modification, persistence write, critical key/secret access, configuration
control and control plane access at once.

```text
Foundational Trust Compromise
≠
Ordinary Authentication Failure
```

An ordinary password check continuing to return success does not, on its own, prove
system trust still holds. This state calls for containment, incident response, trust
re-establishment, recovery and downstream revalidation — procedures owned by
[Operations & Recovery](../operate/operations-and-recovery).

## 25 · Model limits

SoulAuth does not promise it retains all original security guarantees once every
foundational trust assumption is fully under attacker control.

That is not the same as saying "host compromise is out of scope". The threat model must
still state which assumption was broken, which security property no longer holds, which
trust facts can no longer be relied on, and when incident/recovery must begin. That is
more useful engineering than a bare "out of scope" label.

## 26 · Consumer misvalidation

End-to-end failures can also occur at the consumer boundary: decoding a structured token
without required validation, ignoring audience/resource, treating an ID token as an access
token, reading `client_id` as an ActorIdentity context, or expanding claims into
undeclared authority.

```text
Consumer Misvalidation
≠
SoulAuth Protocol Correctness
```

This is not a disclaimer. SoulAuth is responsible for issuing artifacts correctly,
publishing an accurate contract, and providing safe integration guidance. The consumer is
responsible for validating according to that contract and performing its own
authorization. Even a correctly issued artifact can be misread into an end-to-end
security failure.

## 27 · Threat composition

Real attacks rarely stay in one family. They form a **capability acquisition chain**:

```text
Client authentication material compromised
        ↓
Client capability acquired
        ↓
Protocol transaction abused
        ↓
Resource-access artifact acquired
        ↓
Downstream resource misused
```

or:

```text
Privileged credential compromised
        ↓
Administrative capability acquired
        ↓
Verification Material replaced
        ↓
Actor Authentication capability acquired
        ↓
Identity Misattribution
```

> **Each step in a chain usually represents a new capability acquisition or a new trust
> boundary crossing.**

One of the main values of a security control is cutting the chain exactly at those
capability transitions.

## 28 · Threat family summary

| Threat family | Applies when | Main property at risk |
| --- | --- | --- |
| **Identity substitution & misattribution** | Core | Correct ActorIdentity attribution |
| **Credential theft / binding substitution** | Core / method-dependent | Credential binding and authentication integrity |
| **Client impersonation / client-Actor confusion** | Client / protocol use | Client / Actor semantic separation |
| **OAuth / OIDC transaction hijacking** | Declared OAuth / OIDC profile | Transaction binding and protocol integrity |
| **Session / token artifact abuse** | Relevant artifacts enabled | Artifact purpose, freshness, resource binding |
| **Federation / IdentityBinding hijacking** | Federation or external binding enabled | Cross-domain identity integrity |
| **Administrative / privileged abuse** | Administrative or infrastructure access | Domain-scoped authority and state integrity |
| **Key / secret / trust-material compromise** | Relevant trust material exists | Cryptographic and trust-material integrity |

Two failure modes cut across all of them:

```text
Current-state manipulation
Historical / stale / divergent state reintroduced as current
```

## 29 · Threat model at a glance

| Boundary | Meaning |
| --- | --- |
| **Threat ≠ Known vulnerability** | Modelling a threat does not assert a current defect |
| **Threat source ≠ Adversary** | Non-malicious faults can break security properties |
| **Actor Kind ≠ Trust level** | Human / AIActor is not a security rating |
| **Authenticated ≠ Benign** | Identity holding does not prove intent |
| **Client ≠ Actor** | A client context must not be implicitly promoted |
| **No identity resolution ≠ Identity misattribution** | Not finding and mis-identifying are different failures |
| **Credential theft ≠ Binding substitution** | Stealing a credential and swapping a binding are different paths |
| **External subject alone ≠ Federated identity** | An external identity must carry source context |
| **Privileged ≠ Unlimited** | High privilege still has a domain scope |
| **Valid provider response ≠ Provider uncompromised** | Protocol validity does not prove upstream trust |
| **Backup available ≠ Trusted recovery point** | A restorable file is not trustworthy history |
| **Audit present ≠ Attribution correct** | A complete record may still name the wrong subject |
| **Foundational trust compromise ≠ Authentication failure** | A broken trust root is not explained by login results |
| **Healthy-looking runtime ≠ Correct security state** | A responsive system may already believe the wrong relation |

## Control mapping

This page defines **how security properties can fail.** It does not expand every control
here. Each important threat should map to:

```text
Threat
        ↓
Prevent / Mitigate
        ↓
Detect
        ↓
Contain / Recover
        ↓
Verify / Test
```

Owners differ. Authentication-specific threats:
[Authentication Protection](./authentication-protection). Deployment and runtime threats:
[Deployment](../operate/deployment) and
[Operations & Recovery](../operate/operations-and-recovery). Administrative threats:
[Administration](../reference/administration). Audit threats:
[Audit](../reference/audit). Protocol threats:
[OIDC & Clients](../reference/oidc-and-clients) and
[Verify Tokens](../integrate/verify-tokens). Integration threats:
[Soulseed Integration](../integrate/soulseed).

## One last thing

The most dangerous scenario is not necessarily a crash. In many of the worst security
failures the system is still responding normally, still authenticating, still issuing
artifacts, still resolving IdentityBindings, still running replicas, still displaying
audit records. It has simply come to believe the wrong relation:

```text
wrong Actor            but authentication succeeds
wrong IdentityBinding  but mapping appears valid
wrong Resource         but token is accepted
compromised material   but verification still passes
stale state            but recovery looks healthy
software Client        but interpreted as Actor
```

> **A system that still looks like it is working may already have suffered a security
> failure. The real danger is not only downtime — it is a wrong identity, credential
> binding, protocol relationship, trust material or historical state continuing to be
> treated as a trusted fact.**
