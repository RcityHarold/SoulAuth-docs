# Authentication Protection

## How SoulAuth protects authentication

[Security Model](./security-model) answers *which security properties must remain true.*
[Threat Model](./threat-model) answers *how those properties fail.* This page answers:

> **Which controls stop an authentication threat from becoming a fact the system accepts
> as trusted, who owns them, what they guarantee, and where they stop?**

No single control represents authentication security:

```text
Password Protection              ≠  Online Abuse Protection
Additional Authentication Factor ≠  Phishing Resistance by definition
Transaction Protection           ≠  Client Authentication
Client Authentication            ≠  Actor Authentication
Token Validation                 ≠  Resource Authorization by itself
Detection                        ≠  Prevention
```

SoulAuth uses **layered authentication protection.**

## 1 · Every control answers four questions

Each control must state:

> **Who enforces it? Which boundary does it protect? What exactly does it guarantee? What
> does it explicitly not guarantee?**

Judging whether a system is "secure" is therefore not a matter of counting security
features. It is:

> **whether the controls together cover the corresponding threats, and whether any of
> them overstates its guarantee beyond its contract.**

## 2 · Protection is more than prevention

**Prevent** — stop a wrong fact from entering a trusted authentication context in the
first place: credential verification, credential binding protection, applicable protocol
transaction protection, secret and key protection.

**Detect** — surface the authentication failures, replay and misuse signals, abnormal
credential lifecycle events and other security-relevant events SoulAuth can actually
observe. But:

```text
Security Control Present  ≠  Every Compromise Detectable
No Security Signal        ≠  Proof of No Compromise
```

**Contain** — when a boundary has been affected, limit further damage. Containment must
have an explicit scope: credential, AuthSession, client and Actor lifecycle are not one
containment domain.

**Recover** — re-establish a trustworthy authentication capability. Recovery must restore
trust, not bypass it. Incident and recovery procedures belong to
[Operations & Recovery](../operate/operations-and-recovery); this page defines the
authentication-layer requirement.

## 3 · Authentication protection is shared responsibility

OAuth, OIDC, browser, resource server and application security cannot be delivered by the
SoulAuth server alone:

```text
Protocol Protection
≠
Server-only Protection
```

| Control area | Primary responsibility |
| --- | --- |
| **Actor credential protection** | SoulAuth and the declared credential contract |
| **Credential / ActorIdentity binding integrity** | SoulAuth identity/authentication boundary |
| **Protocol transaction protection** | SoulAuth + client, per the declared profile |
| **Client-side correlation / verifier custody** | The client, where required |
| **AuthSession protection** | SoulAuth |
| **Access token validation** | The resource server |
| **Application session protection** | The application / BFF |
| **Key / secret custody** | The corresponding runtime/deployment boundary |

SoulAuth can implement the protocol contract correctly. It cannot restore end-to-end
security for a consumer that skips required token validation, ignores audience/resource,
or misreads claims.

## 4 · Identity misattribution needs combined protection

An ActorIdentity being misattributed is rarely one control failing. It may depend at once
on ActorIdentity continuity, credential and verification material binding, client/Actor
separation, federation source and subject semantics, IdentityBinding integrity, token
subject semantics and integration provenance.

> **Protection cannot be measured by feature count.**

The real question is whether the controls together hold the property *this authentication
truly belongs to the correct ActorIdentity.*

## 5 · Credential protection is more than secret protection

```text
Credential Material Protection
+
ActorIdentity Binding Integrity
+
Protected Credential Lifecycle
```

Storing the secret safely is not enough. If an attacker can wrongly bind
attacker-controlled verification material to another ActorIdentity, authentication
security has already failed — the threat-model boundary:

```text
Credential Theft
≠
Credential Binding Substitution
```

Credential lifecycle ontology remains with
[Authentication & Sessions](../reference/authentication-and-sessions); administrative
mutation with [Administration](../reference/administration). This page locks:

> **The credential lifecycle is itself a security surface.**

## 6 · A raw secret must not be a readable stored credential

```text
Raw Secret
≠
Readable Stored Credential
```

For a password, authentication needs to verify that new input satisfies the existing
credential contract. It does not need SoulAuth to be able to recover the original
password. Likewise, raw authentication secrets must not reach claims, audit, ordinary
logs or any other inappropriate projection surface.

## 7 · Password protection is not online abuse protection

Where the release offers password-based authentication, at-rest protection addresses one
class of threat: reducing the feasibility of offline guessing after a credential store
leak. But:

```text
Password Protection
≠
Online Guessing Protection
```

It does not replace rate limiting, abuse control, enumeration resistance, an additional
authentication factor, or recovery protection.

Which password protection algorithm and parameter profile the current release uses must
be proven by the release-aligned implementation and the configuration contract. This page
does not announce an algorithm or parameters that have not completed engineering
alignment.

## 8 · Additional factors do not produce authority

An additional authentication factor may let a flow satisfy different or stronger
authentication conditions. But:

```text
Higher Authentication Assurance
≠
Greater Authority
```

Assurance answers *what conditions the proof of who this is satisfied.* Authority answers
*why this subject may perform this action.* They do not merge.

### An additional factor is not phishing resistance

```text
Additional Authentication Factor
≠
Phishing-resistant Authentication by definition
```

Only an authentication method that itself satisfies a formal phishing-resistance contract
may claim that property. The label "MFA" does not widen a security claim.

## 9 · Recovery must not be a weaker authentication back door

Recovery is one of the most dangerous boundaries here, because it can replace, restore or
re-establish future authentication capability:

```text
Recovery
≠
Authentication Security Bypass
```

If normal authentication requires a higher level of trust, "the user can no longer
authenticate" is not a reason to make recovery a visibly weaker side path. Different
credentials or authentication methods need not share a single recovery contract.
Procedures are defined jointly by
[Operations & Recovery](../operate/operations-and-recovery) and the credential contract.

## 10 · Security-sensitive artifacts must be purpose-bound

An authentication system may hold several short-lived artifacts for different purposes.
Even if two artifacts both look like "a one-time token", their purposes are not
interchangeable:

```text
Valid for Purpose A
≠
Valid for Purpose B
```

Verification-purpose, recovery-purpose and protocol-continuation artifacts each follow
their own purpose, lifetime and replay semantics. This page does not promote those
descriptive concepts into new canonical resource types.

## 11 · Enumeration resistance

Public authentication flows should reduce observable differences that unnecessarily
expose Actor, account or credential state:

```text
Operator Diagnostic Detail
≠
Public Authentication Detail
```

The goal is **reducing unnecessary identity/credential enumeration signal.** This page
does not promise absolute timing indistinguishability, which cannot be proven. The
narrower property is both more accurate and more verifiable.

## 12 · Actor-held cryptographic credential protection (where supported)

Where the release supports an authentication method depending on actor-held private
cryptographic material, three things need protecting at once:

```text
Private Material Custody
+
Verification Material Integrity
+
ActorIdentity Binding Integrity
```

Even without stealing the Actor's private material, an attacker who can wrongly bind its
own verification material to a victim ActorIdentity can still impersonate.

### Actor-held private material is not a SoulAuth server secret

Where a declared method places private material with the Actor or its authorised custody
environment:

```text
Actor-held Private Credential Material
≠
SoulAuth Server Secret
```

What SoulAuth consumes or stores under that method is the applicable verification
information. Exact key format, algorithm and proof protocol come from the current
authentication contract; this page does not freeze them.

### A valid signature is not a fresh authentication proof

```text
Valid Signature
≠
Fresh Authentication Proof
```

A verified signature proves the signature relationship within its declared scope. It does
not prove the proof was generated for *this* attempt, that it was not replayed, or that
freshness still holds. Where a method carries replay risk, freshness and replay protection
must come from that method's own declared contract.

## 13 · An Actor credential is not client authentication material

```text
Actor Credential
≠
Client Authentication Material
```

One proves an ActorIdentity; the other proves which software client is participating in
the protocol. A machine-to-machine scenario does not erase this boundary.

## 14 · Client and authorization transaction protection

OAuth/OIDC protection is delivered jointly by the client and SoulAuth, and each control
has a distinct purpose:

| Control | Protects | It does not establish |
| --- | --- | --- |
| **Client authentication** | Client protocol context | ActorIdentity |
| **Registered redirect validation** | The response destination | Application authority |
| **PKCE, where the profile requires it** | Authorization-code continuation binding | Client authentication |
| **`state`, where applicable** | Client-side transaction correlation | Actor authentication |
| **`nonce`, where applicable** | OIDC response / authentication transaction binding | API authority |
| **One-time code semantics, where applicable** | Code replay resistance | Access token replay resistance |

Exact parameters, applicability, validation and error semantics are defined by
[OIDC & Clients](../reference/oidc-and-clients). This page explains only what each
control protects and what it cannot replace.

## 15 · Artifact protection must be artifact-specific

Authorization codes, AuthSessions, ID tokens, access tokens and any other artifact the
profile supports carry different purposes, lifetimes and threats. One unified "token
security" model must not swallow them all, and the protections are not the same thing:

```text
Single-use  ≠  Reuse Detection  ≠  Bearer Confidentiality  ≠  Method-specific Freshness
```

Replay protection must be **artifact-specific.**

## 16 · A SoulAuth AuthSession is not an application session

```text
SoulAuth AuthSession
≠
Application Session
```

An AuthSession carries authentication continuity; an application or BFF session carries
the application's own session semantics. SoulAuth protecting its AuthSession does not make
the application session secure. Browser and BFF protection is defined by
[Browser & BFF](../integrate/browser-and-bff).

## 17 · Access token protection follows the real token contract

```text
Access Token
≠
JWT by definition
```

Protection depends on what the current profile actually defines: representation,
resource/audience, lifetime, validation strategy, bearer or other proof semantics, and
consumer handling. One implementation using a structured token does not promote
"access token = JWT" into product ontology.

### A bearer token is not inherently replay-detectable

Where the profile uses bearer semantics, possession of the artifact is a large part of
the capability:

```text
Bearer Access Token
≠
Necessarily Replay-detectable Artifact
```

A stolen but still-valid bearer token may be indistinguishable, from the resource request
alone, between attacker replay and legitimate use. Bearer protection therefore rests
mainly on disclosure prevention, bounded lifetime, correct resource restriction, correct
consumer handling, and whatever else the profile declares.

## 18 · An ID token is not an API access token

```text
ID Token
≠
API Access Token
```

An ID token expresses an authentication projection to an OIDC client. Containing identity
claims does not let a resource server treat it as a general API credential. Exact token
purpose is defined by [OIDC & Clients](../reference/oidc-and-clients).

## 19 · Upstream revocation is not universal instant invalidation

Credential, AuthSession or Actor lifecycle changes alter upstream canonical security
state. But:

```text
Upstream Revocation / Lifecycle Effect
≠
Universal Immediate Downstream Artifact Invalidation
```

Real freshness depends on artifact lifetime, local versus online validation, server-side
state, the resource contract, and the declared revocation/freshness semantics. That is why
revocation *effect* and propagation *freshness* stay separate.

## 20 · Rate limiting, lockout and enumeration resistance are separate

These three are routinely collapsed into "login protection". They are not the same:

```text
Rate Limiting  ≠  Lockout  ≠  Enumeration Resistance
```

### Rate limiting

Limits the rate of a class of request or expensive operation. It may use source signals,
client context, identifier-related signals, endpoint and other abuse context. Those are
**abuse-control signals**, not an ActorIdentity:

```text
IP Address
≠
ActorIdentity
```

A shared IP or network address must not be promoted into a unique attacker identity.

### Lockout

Limits further attempts or use of an authentication capability. But:

```text
More Aggressive Lockout
≠
Always More Secure
```

because an attacker can also weaponise lockout into a denial of service. Also:

```text
Lockout  ≠  Credential Revocation
Lockout  ≠  Actor Suspension
```

Three different states with three different lifecycle scopes.

### Enumeration resistance

Concerns how much identity or credential state a public flow unnecessarily leaks. It is
neither rate limiting nor lockout. Exact errors and public disclosure remain each
endpoint's contract.

## 21 · Cross-replica correctness is not one shared store

In a multi-replica deployment, what must hold is that a security control keeps its
declared semantics when a request moves to another replica:

```text
Cross-replica Security Correctness
≠
Every Security Control Uses One Shared Store
```

Different controls may use different consistency mechanisms. This page does not create a
canonical `SecurityStateStore`, and does not mandate Redis, SurrealDB or any other
infrastructure. What the engineering contract must answer is what consistency, atomicity,
freshness or single-use guarantee each control actually needs.

## 22 · Detection has a visibility boundary

SoulAuth can only detect the security events it can observe. A failure inside a resource
server, inside a consumer runtime, or inside a compromised external provider may produce
no direct signal at all:

```text
No Security Signal
≠
Proof of No Compromise
```

Detection is shared responsibility. Which events the current release can observe is stated
by the runtime and audit contracts.

## 23 · Detection is not secret logging

```text
Detection
≠
Secret Logging
```

Investigation needs context. Raw authentication secrets, raw tokens and private credential
material must not enter an inappropriate log, event or trace surface because "security
detection needs more information". Exact audit event contracts belong to
[Audit](../reference/audit).

## 24 · Containment must have an explicit scope

```text
Credential Containment
≠ AuthSession Containment
≠ Client Containment
≠ Actor Lifecycle Action
```

A containment operation must not be read as "everything related fails system-wide,
immediately". It carries only the effect its contract declares.

### Containment is not Actor retirement

```text
Containment
≠
Actor Retirement
```

Temporarily restricting a capability to control an incident does not mean permanently
ending an ActorIdentity lifecycle. This is an important blast-radius discipline.

## 25 · Integration must not widen protection into authority

When SoulAuth hands authentication facts to SoulseedOS, authentication protection still
protects only the authentication boundary:

```text
AuthContext
≠
Authority
```

An adapter must not expand trusted authentication facts into runtime governance for the
sake of integration convenience. The exact Soulseed protection boundary is defined by
[Soulseed Integration](../integrate/soulseed).

## 26 · Key and secret purpose separation

Key and secret material used by different enabled security functions must keep purpose
separation. Compromise of one purpose is not compromise of every trust domain. Which key
purposes exist in the current release is defined by the security/protocol/runtime
contract — this page does not invent an unimplemented audit key or other key domain.

### Planned rotation is not compromise response

```text
Planned Rotation
≠
Compromise Response
```

A normal lifecycle transition may keep controlled verification continuity. A compromise
means the original trust assumption may already have failed. "We rotated the key" must not
be read as "the compromise is fully handled".

## 27 · Control guarantees and limitations

| Control | What it mainly protects | What it does not guarantee |
| --- | --- | --- |
| **Credential material protection** | Lower credential disclosure / offline compromise risk | Online abuse prevention |
| **Credential binding protection** | Material belongs to the correct ActorIdentity | The credential cannot be stolen |
| **Additional authentication factor** | Meeting an extra authentication condition | Phishing resistance by definition |
| **Higher assurance** | A stronger authentication condition | Greater authority |
| **Recovery protection** | Controlled re-establishment of capability | A security bypass |
| **Client authentication** | Client protocol identity/context | ActorIdentity |
| **Protocol transaction protection** | Request / transaction continuation binding | Business authority |
| **Token signature / validation** | Artifact authenticity and validity within scope | Resource authorization by itself |
| **Rate limiting** | Abuse rate control | ActorIdentity |
| **Lockout** | Limiting a class of attempt or capability | Credential revocation or Actor suspension |
| **Audit / detection** | Visible security signal | Every compromise being detectable |
| **Revocation** | Changing the source-domain state | Instant universal downstream invalidation |
| **Signature verification** | Signature validity | Proof freshness by itself |
| **Key rotation** | Controlled key lifecycle transition | A compromise being fully remediated |

This table is the discipline of this page:

> **A control is only explainable when both its guarantee and its limitation are
> stated.**

## 28 · Authentication protection at a glance

| Boundary | Meaning |
| --- | --- |
| **Protection ≠ Prevention only** | Protection includes detection, containment and controlled recovery |
| **Protocol protection ≠ Server-only** | Client, resource server and application share responsibility |
| **Credential security ≠ Secret confidentiality only** | Binding and lifecycle integrity matter too |
| **Password protection ≠ Online abuse protection** | At-rest and online threats differ |
| **Additional factor ≠ Phishing resistance** | Stronger authentication is not automatically phishing-resistant |
| **Assurance ≠ Authority** | Stronger authentication creates no right to act |
| **Recovery ≠ Security bypass** | Recovery must not become a weaker back door |
| **Actor credential ≠ Client authentication material** | Actor and software client stay separate |
| **Valid signature ≠ Fresh proof** | Cryptographic validity does not supply freshness |
| **AuthSession ≠ Application session** | Two continuity contracts, two layers |
| **Access token ≠ Assumed JWT** | Representation comes from the token profile |
| **Bearer token ≠ Inherently replay-detectable** | Bearer semantics rest on possession protection |
| **Rate limiting ≠ Lockout ≠ Enumeration resistance** | Three different abuse protections |
| **Revocation ≠ Instant universal invalidation** | Effect and freshness are separate |
| **No security signal ≠ No compromise** | Detection has a visibility boundary |
| **Containment ≠ Actor retirement** | Limiting damage is not ending an identity lifecycle |

## Exact contract source

This page defines control ownership, guarantees, limitations, shared responsibility, abuse
protection, detection visibility and containment boundaries for authentication protection.

It does not define the password hashing algorithm, MFA method, TOTP parameters, recovery
artifact representation, AIActor proof protocol, client-secret storage representation,
PKCE applicability, refresh-token lifecycle or cross-replica state technology. Those come
from [Authentication & Sessions](../reference/authentication-and-sessions),
[OIDC & Clients](../reference/oidc-and-clients), the config registry, the runtime
implementation and [Project Status](../project/status).

> **A control being valuable in the security architecture does not mean the current
> release has implemented it.**

## Next

Pages 19–21 now close the loop:

```text
Security Model         What must remain true?
Threat Model           How can it fail?
Authentication Protection  Which controls protect it, who owns them, where do they stop?
```

For standards claims, continue to
[Standards & Conformance](./standards-and-conformance). To deploy and operate securely,
continue to [Deployment](../operate/deployment),
[Production Checklist](../operate/production-checklist) and
[Operations & Recovery](../operate/operations-and-recovery).
