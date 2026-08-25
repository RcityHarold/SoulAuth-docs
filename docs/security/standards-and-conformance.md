# Standards & Conformance

## How SoulAuth uses standards, and how it proves precisely what it has done

SoulAuth uses OAuth, OpenID Connect and related standards to build an interoperable
protocol boundary with other systems. But:

> **"uses standards" is not a product slogan.**

A sentence like `SoulAuth supports OpenID Connect` is not, by itself, a complete
conformance claim. At minimum it still has to answer:

```text
Which specification or profile?
Which protocol role?
Which exact scope?
Which release or identified deployment?
What evidence supports the claim?
```

So:

> **A standards claim must be a qualifiable, traceable, verifiable fact** — not
> "OAuth-compatible", not "supports OIDC".

## 1 · Claim vocabulary

SoulAuth distinguishes several states that are routinely conflated:

| Claim | Meaning in a standards/verification context |
| --- | --- |
| **Implemented** | The corresponding capability exists in the runtime |
| **Tested** | A named evidence subject has run the declared test or test profile |
| **Conformant** | Applicable evidence supports that an implementation satisfies the requirements of a declared specification/profile |
| **Certified** | Formal certification status obtained for an explicit scope through the relevant external certification program |

These words are not interchangeable:

```text
Implemented  ≠  Tested  ≠  Conformant  ≠  Certified
```

There is also **Supported** — but supported is not a standards status defined here. It
belongs to the public support contract of the current product release and is published
by [Project Status](../project/status):

```text
Implemented  ≠  Supported
Tested       ≠  Supported
Conformant   ≠  Supported
```

A capability may exist in code without having entered the formal support surface. A
capability may have run some tests without that upgrading into a full conformance claim.

### `compatible` is not a formal conformance status

Expressions like `OAuth compatible` or `OIDC compatible` may describe integration
positioning. But:

```text
OIDC compatible  ≠  OIDC Conformant  ≠  OIDC Certified
```

When public documentation uses **conformant** or **certified**, it must satisfy the
stricter claim contract defined on this page.

## 2 · Who owns which semantics

SoulAuth faces three different semantic authorities at once, and they must stay
separate.

### External specification

OAuth, OpenID Connect and other applicable external specifications own **their own
protocol terms, wire behaviour and normative requirements.** If SoulAuth claims to
conform to a specification or profile, it must interpret that protocol's semantics as
the specification defines them.

An `OAuth Client` remains an OAuth client. SoulAuth may not reinterpret the standard's
Client as an Actor merely because ActorIdentity exists internally:

```text
External Specification owns External Protocol Semantics
```

### SoulAuth declared profile

An external standard usually permits many legitimate implementation choices. SoulAuth
does not have to implement every optional capability the standard has ever carried; it
may declare a narrower, more explicit profile:

```text
External Specification
        ↓  allowed protocol space
SoulAuth Declared Profile
        ↓  selected supported behavior
```

> **Interoperability does not require maximum optionality.**

Within what the external standard permits, SoulAuth may support a smaller feature
surface, apply stricter security requirements, restrict certain clients or flows, and
narrow algorithm or extension choices. But:

```text
SoulAuth Profile
≠
Permission to weaken an applicable External MUST
```

If SoulAuth claims to satisfy a requirement, it may not reinterpret the standard to
accommodate the existing implementation. The correct fix is to the implementation, the
declared profile or the public claim.

### SoulAuth Actor-native semantics

OAuth/OIDC solve **how systems interoperate through a shared protocol language.** They
do not define, for SoulAuth:

```text
ActorIdentity   AIActor   HumanAccount   IdentityBinding   Identity vs Authority
```

Those belong to SoulAuth's own canonical semantic contract:

```text
External Protocol Semantics  ≠  SoulAuth Actor Ontology
Protocol Conformance         ≠  SoulAuth Semantic Invariants Proven
```

Passing an external OIDC test suite does not prove that an AIActor needs no
HumanAccount, that Client and Actor stay separate, that credentials stay bound to the
correct ActorIdentity, that authentication was never promoted into authority, or that
Soulseed integration did not breach a source-of-truth boundary. Those belong to
**SoulAuth semantic invariant verification**, which is not another external standards
status.

## 3 · What a complete conformance claim contains

A formal conformance claim binds at least:

```text
Specification / Profile
Protocol Role
Claim Scope
Release or identified Deployment
Evidence Subject
Applicable Evidence
```

That is:

> **Conformance is never a single unqualified label covering an entire product.**

### Protocol role is part of the claim

OAuth/OIDC contain several protocol roles, and different roles carry different
requirements:

```text
Conformance Claim
≠
Role-less Claim
```

SoulAuth may make conformance claims only for the protocol roles it actually plays and
the profile scope it actually declares. Where a requirement belongs to a client, a
relying party, a resource server or another participant, SoulAuth may not claim
conformance on that participant's behalf just because it implemented the server side.

## 4 · External and SoulAuth requirements must stay traceable

Normative language in public documentation must not lose its origin. When SoulAuth uses
`MUST`, `MUST NOT`, `SHOULD`, `SHOULD NOT` or `MAY`, the source must be distinguishable
among three kinds:

- **External normative requirement** — from an applicable external specification,
  profile or security BCP.
- **SoulAuth profile requirement** — a formal contract SoulAuth tightened further,
  within what the external standard permits.
- **Operational recommendation** — useful advice for an operator or integrator, not a
  protocol conformance requirement.

```text
Recommendation
≠
Normative Requirement
```

More importantly: **even when two requirements demand the same behaviour, it must remain
traceable who defined it.** Only then can a conflict or drift be fixed at the real
source instead of by reinterpreting a downstream document.

## 5 · Registry and constitution are separate

The external standards ecosystem changes. New specifications appear, existing ones are
revised, and test suites, certification profiles and draft statuses move. SoulAuth
therefore splits two kinds of information.

**The long-lived conformance constitution** is this page. It defines rules that should
not drift:

```text
Claim must have scope
Protocol role must be explicit
External standard terms keep their external meaning
Evidence must have a defined subject and scope
Certification claims must not exceed their certified boundary
```

**The release-time standards registry** maintains the facts that do change: which
specifications are applicable, which profile is currently declared, which external
requirement applies, which test profile is used, what evidence exists, what external
status applies. In this repository that registry is the machine-readable
`contracts/standards.yaml`, guarded by the conformance suite.

```text
Long-lived Claim Grammar  ≠  Current Standards Inventory
Internet Draft            ≠  Published Standard
```

Which revision an external draft sits at today is a registry fact. It must not be
written into a long-lived SoulAuth identity or security invariant.

## 6 · Metadata is itself a standards claim

Machine-readable metadata is not marketing copy. When SoulAuth advertises an endpoint, a
flow, a response type, a subject type, a client authentication method, an extension or a
protocol capability, consumers treat it as part of the machine contract.

> **An advertised capability must be a real capability.**

More precisely, a publicly advertised capability must, within the same declared scope,
be implemented, be inside the current release's formal support contract, and hold
applicable test/verification evidence. That does not collapse the states:

```text
Advertised = Implemented = Supported = Tested   ← wrong
```

The correct relation is:

> **Advertisement must not exceed the intersection of the implemented, supported and
> evidenced surface.**

### Internal capability is not standards capability

This is where metadata most easily produces a false claim. SoulAuth being able to create
a client internally does not mean SoulAuth implements a standardised dynamic client
registration protocol:

```text
Internal Capability
≠
Corresponding Standards Extension
```

A capability enters a formal standards claim only once the declared profile, the machine
surface, the runtime behaviour and the applicable evidence all hold. This is a general
principle, not specific to client registration.

## 7 · A conditional capability does not join the supported profile

The standards ecosystem contains many optional extensions and related specifications,
and SoulAuth may internally have capabilities that resemble them. But:

> **Functional resemblance is not protocol implementation.**

Similarly, a security BCP recommending a mechanism does not mean the current SoulAuth
release implements it:

```text
Related Internal Behavior
≠
External Standards Support
```

Whether a specific OAuth/OIDC extension is currently implemented, supported, tested or
conformant is not frozen in this page. Those facts come from
[OIDC & Clients](../reference/oidc-and-clients), the standards registry, and
[Project Status](../project/status).

## 8 · Evidence only proves its own subject and scope

Conformance cannot rest on "the happy path worked". Nor does "we ran some tests" imply
full conformance. You must know:

```text
What was tested?
Which artifact or deployment?
Against which requirement?
Under which role and profile?
What result was expected?
What evidence was produced?
```

```text
Tested requires Evidence Subject + Test Scope
```

A test result on one source revision does not automatically prove another binary,
container image or deployment. A result for profile A does not prove profile B.

### Standards conformance evidence

This class of evidence supports **external specification / profile / protocol role
claims**. It may include protocol tests, metadata verification, positive behaviour
verification, negative requirement verification and external conformance suite results.
But:

```text
Test Suite
≠
Specification
```

A specification defines requirements; a test suite verifies an implementation against
them within its coverage. A test suite cannot redefine the specification in reverse.

### Project verification evidence

SoulAuth also has many important internal contracts to verify: ActorIdentity/Client
separation, credential binding, security invariants, administration boundaries, audit
integrity, recovery behaviour, Soulseed integration boundaries. That evidence matters —
and it is a different thing:

```text
Project Verification Evidence
≠
External Protocol Conformance
```

An external OIDC conformance suite will not prove SoulAuth's internal Actor-native
architecture. Conversely, SoulAuth's own semantic tests do not prove OIDC protocol
conformance.

## 9 · Requirement traceability

A formal standards claim should be traceable along this chain:

```text
External Requirement  or  SoulAuth Profile Requirement
        ↓
Applicable Protocol Role
        ↓
Declared Behavior
        ↓
Implementation
        ↓
Verification
        ↓
Evidence
        ↓
Public Claim
```

The point is not which tool is used. It is that **every important claim can return to
the requirement and evidence it actually rests on.** Only then, when drift appears, can
we tell whether the specification was misread, the declared profile was written wrong,
the machine contract is wrong, the runtime is wrong, the test is wrong, or the public
claim simply exceeded the evidence — instead of saying "the code is the standard" or
"the docs are the standard".

## 10 · Tested, conformant and certified

**Tested** means a declared test or test profile was run against an explicit evidence
subject. It does not on its own imply conformance unless that evidence covers the
conformance scope being claimed.

**Conformant** means applicable evidence supports that the current
implementation/deployment satisfies the requirements within a declared
specification/profile scope. Conformance is therefore always
specification-specific, role-specific, profile-specific, scope-specific, and
release-or-deployment-specific.

**Certified** is not a stronger "conformant" invented by SoulAuth. It is a formal status
defined by the corresponding external certification program:

```text
Conformant     ≠  Certified
Tests Passed   ≠  Certified
```

Certification is interpreted only within its program, profile, role, deployment and
declared scope. It never implies:

```text
Certified Profile
=
Entire Product Security Proven
```

and it does not prove SoulAuth's Actor-native semantics, Soulseed integration,
operational recovery or anything else outside the certification scope.

## 11 · Release status belongs to Project Status

A conformance claim must bind to a specific release or identified deployment. But this
page does not decide what the current release supports. `Supported`, `unsupported` and
`deprecated`, and a capability's current product lifecycle status, are published by
[Project Status](../project/status).

This page defines only **what qualification and evidence a standards/conformance claim
requires if public status contains one**:

```text
Conformance Constitution
≠
Project Status Manifest
```

An older release having been conformant does not make a future release inherit the
claim. Every new release must again be consistent with its own runtime, machine contract
and evidence.

## 12 · Standards at a glance

| Claim / boundary | Correct reading |
| --- | --- |
| **OIDC-compatible** | Integration positioning; not automatically conformant or certified |
| **Implemented** | The capability exists in the runtime; not automatically supported |
| **Supported** | A formal public contract of the current release, defined by Project Status |
| **Tested** | A named evidence subject ran a declared test; not automatically conformant |
| **Conformant** | Evidence supports a declared specification / role / profile / scope |
| **Certified** | A formal scoped status inside an external certification program |
| **Advertised capability** | Must not exceed the real implemented, supported and evidenced surface |
| **Internal capability** | Not automatically the corresponding standards extension |
| **External protocol conformance** | Does not prove SoulAuth's Actor-native semantic invariants |
| **Certification** | Does not prove the security of the whole product |

The central set:

```text
Implemented  ≠  Supported  ≠  Tested  ≠  Conformant  ≠  Certified
```

These are not a single maturity ladder from low to high. They answer different
questions.

## 13 · The SoulAuth standards contract

Compressed, the whole page is one chain:

```text
External Normative Specification
        + SoulAuth Declared Profile
        ↓
Human-readable Contract + Machine-readable Contract
        ↓
Runtime Behavior
        ↓
Applicable Evidence
        ↓
Release-scoped Standards Claim
```

Each layer has its own job. The external specification defines external protocol
semantics. The declared profile states SoulAuth's chosen behaviour inside the legal
standard space. The machine-readable contract expresses the protocol surface a machine
can consume. The runtime actually implements the declared behaviour. Evidence proves its
own subject and scope. The public claim holds only when those layers agree.

> **A standards claim must never be wider than the real contract and evidence.**

## Next

The **Security & Trust** module is now closed: the security model defines what must be
trustworthy, the threat model analyses what would break those properties, authentication
protection defines the concrete controls, and this page defines which external and
internal contracts apply and on what basis we make claims at all.

Next comes **Reference**, starting with
[API Conventions](../reference/api-conventions) — which no longer asks *why is it
designed this way* but **what exactly is SoulAuth's own HTTP/API grammar.**
