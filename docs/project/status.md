# Project Status

## What exactly can be publicly relied on, for one specific release, right now

Project Status does not answer *what SoulAuth wants to build*, and it does not answer
*what code happens to be in the repository.* It answers:

> **For one specific SoulAuth product release, at one specific status snapshot time, what
> are we willing to commit to publicly today?**

```text
Project Status
=
Release-scoped Public Status Manifest
```

It defines no new ActorIdentity, authentication, protocol, security or configuration
semantics — those belong to the canonical references and contracts. This page only
projects **current release reality** accurately.

## Current status

> **No public release status snapshot has been published yet.**
>
> SoulAuth has not completed a formal product release. Under the rule this page itself
> defines, that means the release status gate is **incomplete** — not that the status is
> blank.

```text
Unresolved Public Status
→
Release Status Gate Incomplete
```

The correct response is to leave the gate open and say so, rather than publish a status
snapshot padded with `TBD`, `Pending` or an unqualified version string. Everything below
describes the grammar a real snapshot must satisfy, and the exact facts a release process
must inject before one can exist.

### What does exist today

The machine-readable contracts are in place and guarded by the conformance suite in the
repository:

| Surface | What it holds |
| --- | --- |
| `contracts/permissions.yaml` | The administrative permission vocabulary, and where each permission is enforced |
| `contracts/configuration.yaml` | The configuration vocabulary: types, requiredness, defaults, production gates |
| `contracts/openapi.yaml` | The SoulAuth-owned HTTP wire, aligned with the runtime route table |
| `contracts/standards.yaml` | Per-specification implemented / supported / certified status |

`contracts/standards.yaml` currently records **zero certified specifications.**
Certification requires a formal process at a standards organisation as evidence; it is
never self-declared.

These registries are release *inputs.* They are not a release status snapshot, and their
existence is not a support claim.

## 1 · Release facts and status snapshot facts are separate

**Release facts** describe **who this release is**: product release, release date, source
revision, formal release artifact identity. They are not redefined when the project stops
supporting the release six months later.

**Status snapshot facts** answer **how the project supports, maintains and describes this
release at the current moment**: maintenance support, security support, capability
support, lifecycle status, known limitations, release contract alignment.

```text
Release Identity  ≠  Current Support State
Same Release      ≠  Same Project Status Forever
```

One release may be supported today, deprecated later and unsupported after that. What
changes is the public contract the project carries — not the release.

### Release date is not status snapshot time

```text
Release Date
≠
Status Snapshot Time
```

The first asks when the release was published; the second asks **when this status
judgment holds.** Maintenance, security support and lifecycle must bind to the snapshot
time, never be written permanently into release identity.

### Latest, recommended and supported are different questions

```text
Latest Published Release
≠  Recommended Release
≠  Supported Release by definition
```

They may point at the same release in one snapshot. Equal values do not merge the three
meanings. If the project does not formally maintain a recommended release, this page does
not create the field.

## 2 · Release identity, artifact identity and provenance are separate

A release must let a user answer: **what exactly did I deploy?**

```text
Product Release
Source Revision
Release Artifact Identity
```

plus two evidence questions:

```text
Artifact Authenticity
Build / Publication Provenance
```

### Product release is not source revision

```text
Product Release
≠
Source Revision
```

A product release may point at a specific source state. The source revision is not the
artifact the user finally runs.

### One product release may hold several artifacts

```text
Product Release
≠
Single Artifact by definition
```

Whether a release contains one or several formal artifacts is decided by that release's
real publication record.

### Artifact identity is not artifact authenticity

A digest answers **what these bytes are.** It does not answer **whether these bytes are
really what the project published:**

```text
Artifact Identity
≠
Artifact Authenticity
```

### Source revision is not build provenance

```text
Source Revision  ≠  Build Provenance
Tested Source    ≠  Tested Published Artifact
```

Knowing the source revision is X does not prove artifact Y was produced from X through the
declared build process.

### A mutable tag is not an immutable artifact identity

```text
Mutable Tag
≠
Immutable Release Artifact Identity
```

A tag may be a convenient locator. The user must still be able to answer accurately which
product release the artifact they run belongs to.

## 3 · The current release snapshot

A published Project Status leads with **current release facts** — not with status theory.
A snapshot shows only fields the project genuinely maintains and can prove, covering at
least: product release, release date, status snapshot time, source revision, release
artifact set, artifact identity, the authenticity and provenance status actually
established, documentation scope, and current maintenance and security support.

Where the project formally maintains other independent contract versions, show them.
Where it does not, do not create a version namespace that looks professional but does not
exist — including a `Deployment Configuration Revision` or any other identifier that is
not a formal project contract.

## 4 · Support status

Support status answers only:

> **Is this explicit capability scope part of the public support contract the release
> formally carries?**

At minimum `Supported` and `Unsupported`; the exact policy vocabulary comes from real
project policy.

**Supported** means the scope belongs to the formally maintained public contract, and the
claim can point at a canonical/public contract, the current runtime, the current release,
and evidence proportionate to the claim's scope. But:

```text
Supported
≠
Tested
```

Supported is not an alias for `tests = true`. Evidence and support are related but
distinct dimensions.

**Unsupported** means the scope is not part of the release's public support contract:

```text
Unsupported                      ≠  Broken
Unsupported Public Capability    ≠  Implementation Absence by definition
```

A runtime explicitly refusing an unsupported capability can be entirely correct
behaviour. An experimental capability existing in code does not enter the public support
contract by existing.

## 5 · Support status and lifecycle status are separate

Support asks whether the project still carries the contract. Lifecycle asks how the
project advises users to proceed.

```text
Support Status  ≠  Lifecycle Status
Deprecated      ≠  Unsupported
```

A capability may legitimately be:

```text
Support Status  = Supported
Lifecycle Status = Deprecated
```

meaning the project still carries the public contract but does not recommend new
integrations adopt it. The exact lifecycle vocabulary uses only states the project's
policy really maintains; this page creates no new lifecycle state machine.

## 6 · Five statuses stay separate

```text
Implemented ≠ Supported ≠ Tested ≠ Conformant ≠ Certified
```

This page does not redefine them. The precise claim grammar for **conformant** and
**certified** is owned by
[Standards & Conformance](../security/standards-and-conformance). Project Status only
summarises what the release actually reached — it cannot manufacture a standards claim.

### Canonical semantics do not enter the capability matrix

`ActorIdentity`, and Human and AIActor holding first-class identity standing, are
**canonical semantics.** They are not optional features a release may mark
`Supported / Unsupported`.

If the runtime departs from canonical semantics, that is **release contract drift or a
defect** — not "that ontology is unsupported in this version".

```text
Canonical Semantic Alignment
≠
Capability Support Surface
```

The first asks whether the release implemented the upstream canonical meaning correctly.
The second asks which public capabilities the release carries.

## 7 · A capability name is not a support scope

A name like `OIDC` is not a complete support claim. Real scope may need protocol role,
flow, client profile, subject policy, token contract, optional surface and applicability
preconditions:

```text
Capability Name
≠
Complete Support Scope
```

Project Status must not show `OIDC ✅` and let the reader guess.

### The public capability matrix

| Dimension | Meaning |
| --- | --- |
| **Capability / scope** | What exactly is promised |
| **Applicability** | Under what conditions it applies |
| **Support status** | Whether it is in the public contract |
| **Lifecycle status** | How current project policy regards it |
| **Evidence / status reference** | What evidence supports this status |
| **Canonical reference** | Where the exact contract is defined |

Rows do not repeat `Implemented=true` / `Tested=true`; those dimensions belong to the
evidence and standards surfaces.

### Release support is not deployment runtime state

```text
Release Support ≠ Deployment Applicability ≠ Enabled State ≠ Operational Reality
```

Project Status may state a supported capability's applicability preconditions. It does not
report whether a particular deployment is enabled or healthy right now — that belongs to
the runtime and operations surfaces.

## 8 · Every public status claim needs evidence

```text
Public Status Claim
=
Defined Scope
+ Exact Release
+ Evidence Subject
+ Applicable Evidence
+ Status Snapshot Time
```

**Defined scope** — what exactly is being claimed? **Exact release** — for which product
release? **Evidence subject** — does the evidence verify the source, the built artifact,
the released artifact, an identified deployment, a protocol profile, or a
configuration/feature scope? **Applicable evidence** — which tests, verification,
certification or traceability evidence? **Status snapshot time** — when does the judgment
hold?

Dropping any one of these can widen a public claim beyond what the evidence supports.

### The evidence subject cannot be omitted

`tests passed` is not a complete status claim — **tested what?**

```text
Test Evidence          ≠  Published Artifact Evidence by default
Prior Release Evidence ≠  Current Release Evidence by default
```

Old evidence supports a current claim only where the release gate can establish explicit
traceability.

## 9 · Important unsupported surface

A mature status page cannot list only what is supported. It must also tell users **which
things are easily assumed to exist but which the release does not actually carry a public
support contract for.**

In a mature OAuth/OIDC ecosystem, users readily infer adjacent capabilities. The important
unsupported surface must therefore be **explicit** — never left to documentation absence,
and never to "it was not mentioned, so presumably it does not exist".

### Unsupported is not a roadmap

```text
Unsupported        ≠  Roadmap Commitment
Known Limitation   ≠  Roadmap Promise
Project Status     ≠  Roadmap
```

Project Status answers **what holds now.** "Coming soon" must not be used to dress an
unsupported surface as half-supported.

### A known limitation is not "broken" by definition

```text
Known Limitation
≠
Broken by definition
```

It may be a current implementation boundary, a design constraint, or a known defect. The
words alone do not say which — the status must state which.

## 10 · Standards and evidence summary

This page creates no standards claim. The precise meaning and claim scope of
`implemented`, `tested`, `conformant` and `certified` in a standards context come from
[Standards & Conformance](../security/standards-and-conformance):

```text
Standards Status Summary
≠
New Conformance Claim
```

Without evidence, do not write conformant. Without a formal certification, do not write
certified.

A complete standards summary states specification/profile, protocol role, scope, evidence
subject, current claim, evidence, and certification where real. `OIDC compliant` alone is
not a status.

## 11 · Security support is a snapshot fact

```text
Security Support Status
≠
Immutable Release Fact
```

A release's bytes may never change while whether it still receives security fixes does.

```text
Security Testing            ≠  No Vulnerabilities
Release Security Controls   ≠  Every Deployment Is Secure
```

Any security test claim still needs an evidence subject and a test scope, and a release
having correct security contracts does not prove any deployment is configured correctly.

### A supported release is not a production-ready deployment

```text
Supported Release
≠
Production-ready Deployment
```

Project Status may state whether a release is inside the public support contract. It
cannot stamp `Production Ready` on any deployment — each deployment needs its own sign-off
through [Production Checklist](../operate/production-checklist).

```text
Release Contract Alignment
≠
Deployment Readiness
```

Note that "release conformance" is deliberately not used for general contract alignment;
`conformant` stays reserved for standards and profile claims.

## 12 · Support lifecycle

A status page states which releases are inside the maintenance support window, which
still receive security support, and which have entered deprecated or end-of-support
states where the project's policy has those concepts.

```text
Latest Published Release  ≠  Only Supported Release by definition
Open-source Maintenance   ≠  Commercial Support SLA
```

Unless the project explicitly offers a commercial SLA, "supported" must not be read as a
24×7 response time or a commercial service commitment.

## 13 · Compatibility is directional and scoped

```text
Source Contract State
        ↓
Target Contract State
```

```text
Compatibility(A → B)  ≠  Compatibility(B → A)
Supported Upgrade     ≠  Supported Rollback
```

A → B being supported does not prove B → A is safe.

Project Status does not presuppose that every release has a full API, protocol,
configuration, persistence, upgrade and rollback compatibility matrix. It shows only the
dimensions the release genuinely carries a contract for.

### A version number does not create a SemVer guarantee

```text
Version looks like x.y.z
≠
SemVer Compatibility Guarantee
```

A version format cannot create a compatibility promise on the project's behalf.

## 14 · Release contract alignment

SoulAuth's public contract is not one file. A release may be described jointly by
canonical documentation, the runtime, OpenAPI, the config registry, the permission
registry, the standards registry, verification evidence and other release assets. These
surfaces need not duplicate one another:

```text
Contract Alignment
≠
Contract Duplication
```

They only need to describe the same release reality, each within its ownership scope.

### Different surface is not different meaning

```text
Code Release  ≠  Complete Public Contract
OpenAPI       ≠  Complete Public Contract
```

OpenAPI owns the SoulAuth-owned exact HTTP wire. It does not own the ActorIdentity
ontology, external OAuth/OIDC semantics, the security model, or project status. Runtime
behaviour cannot silently rewrite upstream canonical meaning either. There is no blind
`code always wins` or `docs always win` — an inconsistency is investigated as contract
drift.

### Documentation published is not documentation aligned

```text
Documentation Published
≠
Documentation Aligned
```

A page being live does not prove it describes current release reality. If the docs say
endpoint A and the runtime has only endpoint B, publishing the page does not fix the
drift.

### Material contract drift is a release contract defect

```text
Material Runtime / Public Contract Drift within declared ownership scope
=
Release Contract Defect
```

## 15 · Release contract surface responsibilities

| Surface | Responsibility |
| --- | --- |
| **Canonical documentation** | Concepts, guides, semantic / human-readable contract |
| **Runtime** | Actually executing the contract the release declares |
| **OpenAPI** | The SoulAuth-owned HTTP wire contract |
| **Config registry** | The exact configuration vocabulary |
| **Permission registry** | The SoulAuth-local administrative permission vocabulary |
| **Standards registry** | Current standards / profile claim data |
| **Verification evidence** | Tests and other verifiable evidence |

This is not "the runtime owns the final semantics". The relation stays:

```text
Canonical Meaning
        ↓
Declared Contract
        ↓
Machine Representation
        ↓
Runtime
```

with evidence proving upward:

```text
Runtime → Verification → Evidence → Status
```

## 16 · SoulAuth status is not Soulseed status

```text
SoulAuth Project Status
≠ SoulseedAGI Project Status
≠ SoulseedOS Project Status
```

Whether Soulseed integration is supported may be a SoulAuth capability. But:

```text
Soulseed Integration Support
≠
Soulseed Runtime Dependency
```

SoulAuth still runs standalone, and a new SoulseedAGI or SoulseedOS release does not
change SoulAuth's release identity without an explicit compatibility contract.

## 17 · Other project assets answer their own questions

Project Status answers **what holds now.** Other assets carry their own responsibilities —
a changelog for what changed over time, a security policy for how issues are reported and
handled, contribution guidance for how changes are made, and a licence for legal use and
distribution. Public documentation links only assets that really exist in the repository.

## Project Status at a glance

| Boundary | Meaning |
| --- | --- |
| **Project Status ≠ New semantic source of truth** | It projects upstream contracts |
| **Release identity ≠ Current support state** | A release is not redefined by policy change |
| **Release date ≠ Status snapshot time** | Publication and current status are two times |
| **Product release ≠ Source revision** | Product version and code state are separate |
| **Artifact identity ≠ Artifact authenticity** | A digest does not prove publication |
| **Source revision ≠ Build provenance** | Knowing the source is not proving the build |
| **Mutable tag ≠ Immutable artifact identity** | `latest` cannot serve as release identity |
| **Implemented ≠ Supported ≠ Tested ≠ Conformant ≠ Certified** | Five states, not one badge |
| **Support status ≠ Lifecycle status** | Deprecated may still be supported |
| **Unsupported ≠ Broken** | Outside the contract is not a defect |
| **Canonical semantics ≠ Optional capability** | Canonical meaning cannot be marked unsupported |
| **Capability name ≠ Complete support scope** | `OIDC ✅` is not a claim |
| **Release support ≠ Deployment operational state** | This is not a live dashboard |
| **Supported release ≠ Production-ready deployment** | Production is signed off separately |
| **Compatibility(A→B) ≠ Compatibility(B→A)** | Compatibility has direction and scope |
| **Supported upgrade ≠ Supported rollback** | One does not imply the other |
| **Contract alignment ≠ Contract duplication** | Each surface keeps its owner |
| **Documentation published ≠ Documentation aligned** | Existence is not accuracy |
| **Known limitation ≠ Roadmap promise** | A current boundary is not a future commitment |
| **Project Status ≠ Roadmap** | This describes today |
| **SoulAuth status ≠ Soulseed status** | Three independent release truths |

## The final rule for a public status claim

```text
What exactly are we claiming?
        ↓
For which Product Release?
        ↓
What is the Evidence Subject?
        ↓
What Evidence supports it?
        ↓
Is that Evidence applicable to this Release and Scope?
        ↓
At what Snapshot Time does this Claim hold?
```

```text
Public Status Claim
=
Defined Scope + Exact Release + Evidence Subject
+ Applicable Evidence + Snapshot Time
```

If "we support this" cannot answer those five questions, it is not yet a public claim.

## Current release data boundary

This page differs from the other twenty-nine in one fundamental way. The others can be
canonically final on their semantics alone. This one cannot become a real public status
snapshot without real release data.

A published status snapshot must have the following injected and verified by the release
process: current product release; release date; status snapshot time; source revision;
release artifact set; artifact identity; actual authenticity and provenance status;
documentation scope; current supported and unsupported surface; deprecated surface where
one exists; maintenance support; security support; current standards claims; evidence
subjects; evidence pointers; certification where real; compatibility commitments;
important unsupported surface; known limitations; and the release contract alignment
result.

> **These facts cannot be inferred, completed or guessed by documentation.**

### No placeholder rule

A published Project Status must not contain:

```text
<EXACT_RELEASE>   TBD   Pending   ?   blank status
```

```text
Unresolved Public Status
→
Release Status Gate Incomplete
```

— rather than publishing with the blank left in. That rule is why the top of this page
says the gate is open instead of showing an invented snapshot.

## Exact semantic ownership

This page owns the **release identity summary, supported/unsupported public status, the
lifecycle status projection, evidence-backed public status claims, the support lifecycle,
the compatibility summary, the unsupported surface, and the release contract alignment
summary.**

It does not define ActorIdentity semantics, authentication methods, token profiles, the
configuration vocabulary, the permission vocabulary, standards conformance semantics,
production readiness, audit semantics or protocol wire behaviour. It only aggregates what
the upstream owners have proven for the current release.
