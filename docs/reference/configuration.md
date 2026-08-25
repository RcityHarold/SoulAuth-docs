# Configuration

## How SoulAuth turns configuration input into an effective runtime contract

SoulAuth's behaviour is never decided by a single configuration file. A deployment may
draw configuration from several supported sources and reference external secrets, keys,
providers or other dynamic runtime material.

What matters is not **what the configuration file says**, but:

> **what resolved, validated and activated configuration the runtime is actually
> using.**

```text
Configuration Input
≠
Effective Configuration
```

And:

```text
Configuration  ≠  Administration
Configuration  ≠  Ontology
Configuration  ≠  Runtime Security State
```

Configuration's job is **to choose how this deployment runs, within the semantics and
boundaries SoulAuth has already defined.** It cannot redefine ActorIdentity, credential,
Client, authority or historical identity.

## 1 · The config registry owns the exact vocabulary

SoulAuth's exact configuration contract comes from the **machine-readable config
registry** — in this repository, `contracts/configuration.yaml`, guarded by the
conformance suite. The registry defines what the current release genuinely understands:

- canonical configuration key
- value type
- requiredness
- absence / default behaviour
- allowed values
- supported sources
- validation
- lifecycle
- sensitivity
- other machine-readable per-key behaviour

This page's job is **to explain how those contracts are understood and used.**

```text
Human Configuration Reference
≠
Second Configuration Vocabulary
```

Public documentation never invents an environment variable, config key, enum or default
to make a page look complete.

## 2 · Configuration does not redefine ontology

Configuration may only choose behaviour inside the space SoulAuth formally supports:

```text
Configuration  ≠  Ontology
Configurable   ≠  Ontology-mutable
```

Configuration cannot redefine an OAuth Client as an ActorIdentity, and it cannot demote
Actor Kind from identity core into an ordinary configurable attribute. It changes **how
the system runs**, not **what the objects in the system are.**

## 3 · Configuration and administration are separate

Administration changes **SoulAuth-owned domain state.** Configuration defines **how the
runtime is constructed, connected and run.**

```text
Administration
≠
Configuration
```

A principal may hold administrative authority without being able to modify deployment
configuration — and the reverse. Configuration access does not produce SoulAuth
administrative authority either.

## 4 · Configuration and runtime security state are separate

Security configuration defines how security policy should run. Runtime security state
describes what the current security reality has become.

```text
Security Policy       ≠  Security State
Configuration Reload  ≠  Security State Reset
Process Restart       ≠  Permission to Reset Durable Security State
```

A reload, a restart or a re-read of configuration must never become a back door that
resurrects revoked sessions, credentials, authority or other trust state. This is one of
this page's most important long-term boundaries.

## 5 · From source input to effective configuration

```text
Admitted Source Input
        ↓
Resolution
        ↓
Typed Candidate
        ↓
Validation
        ↓
Activation
        ↓
Effective Configuration
```

These are **configuration lifecycle semantics.** They do not imply SoulAuth has a public
resource, resource ID or CRUD endpoint of the same name.

## 6 · A readable source is not an admitted source

The runtime being able to read a source does not qualify that source to participate in
resolution:

```text
Readable Input
≠
Admitted Configuration Source
```

A source must be permitted to participate within the declared configuration scope and
purpose. A source permitted to supply one class of config does not gain universal
authority to define all config.

## 7 · Source precedence is not source trust

Where several sources may participate, conflicts still need resolving. But:

```text
Source Precedence  ≠  Source Trust
Source admitted    ≠  Highest precedence
Highest precedence ≠  Highest trust
```

Higher precedence means only that this source's value wins under the declared resolution
contract. It does not mean the source inherently carries higher security trust. The two
dimensions are defined separately.

## 8 · Precedence is not merge semantics

Knowing which source wins does not say how values from several sources combine:

```text
Source Precedence
≠
Merge Semantics
```

Exact behaviour may differ for single values, structured values and collections. Whether
the result is replace, merge or something else must come from the config registry — never
from a runtime or operator guess.

## 9 · Source encoding is not a typed value

Environments, files and other sources supply values in different representations. At the
source layer, `"false"`, `"0"` and `"60"` do not define the runtime type:

```text
Source Encoding
≠
Canonical Typed Configuration Value
```

How boolean, integer, duration, URI, enum, collection or structured values parse is
defined by the config registry. The runtime must not rely on a programming language's
implicit truthiness or loose conversion rules.

## 10 · Absent, empty, null and default are not automatically equal

```text
Absent
≠ Explicit Empty
≠ Explicit Null, where representable
≠ Default
```

Whether a given key permits these states, and whether they are equivalent within a
particular contract, is defined by that key's own contract. In particular:

```text
Explicit Invalid Value  ≠  Declared Absence
Default                 ≠  Fallback for Invalid Explicit Value
```

If an operator explicitly supplies an illegal security value, the runtime must not
silently ignore it and fall back to a more permissive default.

## 11 · Parsed is not valid, and valid is not activated

```text
Parsed  ≠  Valid  ≠  Activated
```

- **Type validation** — does the value match the declared canonical type?
- **Semantic validation** — does a single value carry a legal meaning under the current
  security/protocol/runtime contract?
- **Cross-field validation** — do several individually legal values still form a coherent
  whole?

```text
Individually Valid Fields
≠
Valid Configuration Set
```

## 12 · Validation must precede activation

The runtime must not apply part of a new configuration and then discover mid-way that
the rest is illegal, leaving an uninterpretable mixed state. For any change that supports
runtime activation:

```text
Resolved Candidate
        ↓
Complete Validation
        ↓
Activation
        ↓
New Effective Configuration
```

```text
Configuration Activation
≠
Unvalidated Incremental Mutation
```

For startup-only configuration, the applicable validation must likewise complete before
entering normal runtime.

## 13 · Invalid security configuration must not silently loosen

```text
Invalid Security Configuration
≠
Permission to Fall Back to a More Permissive Policy
```

```text
Unknown Security-relevant Value
≠
Nearest Known Value
```

A security-critical setting that is not understood, is illegal, or cannot be validated
must not be silently coerced into a state that merely "looks successful". This is the
fail-closed principle at the configuration layer.

## 14 · The behaviour for unknown keys is itself a contract

A parser reading an unknown key does not mean its security semantics took effect:

```text
Configuration Text Accepted
≠
Configuration Semantics Applied
```

Whether the current release rejects, warns, ignores or preserves such a key must be
stated by the config registry. Public documentation does not decide it.

## 15 · Effective configuration is not runtime capability

A configuration taking effect does not prove its dependencies are healthy or the
capability is available:

```text
Effective Configuration  ≠  Effective Runtime Capability
Configured               ≠  Operational
```

An external dependency may be configured but unreachable; a key reference may be valid
while the referenced key is currently unusable.

Configuration answers *how is the runtime asked to run.* Operations and readiness answer
*can the runtime actually provide the capability right now.*

## 16 · Enabled configuration is not supported capability

Configuration cannot create product capability:

```text
Configuration Enabled  ≠  Feature Implemented
Configuration Enabled  ≠  Feature Supported
Configured Capability  ≠  Advertisable Capability
```

A capability may be declared by metadata or public documentation only within a scope
where the current release formally supports it, the runtime really implements it, the
configuration is valid, the necessary dependencies are available, and the applicable
evidence and protocol claims hold.

## 17 · A configuration reference is not the referenced material

Configuration often does not hold dynamic secrets or key material directly. The important
long-term boundary:

```text
Configuration Reference
≠
Referenced Runtime Material State
```

```text
Secret Reference  ≠  Secret Value
Key Reference     ≠  Current Active Key State
```

A stable reference not changing does not mean the secret or key material behind it has
not changed. Therefore:

```text
Effective Configuration
≠
Complete Runtime Security State
```

This is one of the most important interfaces between configuration, the
[Security Model](../security/security-model),
[Authentication Protection](../security/authentication-protection) and
[Operations & Recovery](../operate/operations-and-recovery).

## 18 · Accepted secret input is not a readable configuration field

```text
Accepted Secret Input       ≠  Readable Configuration Field
Configuration Inspection    ≠  Secret Export
Configuration Observability ≠  Secret Logging
```

A secret having once been supplied does not mean it can be read back through
configuration inspection. Configuration observability must not become a secret-leak
channel.

## 19 · Effective configuration and caller-visible projection are separate

```text
Effective Configuration
≠
Caller-visible Configuration Projection
```

An operator's view may redact, mask or omit according to authority and sensitivity.
Projection differences never redefine the configuration the runtime actually uses.

## 20 · Key/secret lifecycle is separate from configuration lifecycle

```text
Key Rotation           ≠  Configuration Rewrite
Secret Rotation        ≠  Configuration Rewrite
Key Reference Change   ≠  Successful Key Rotation
```

Configuration expresses what the runtime should reference. The actual material lifecycle,
activation, trust and revocation belong to the key/secret runtime contract.

## 21 · A configured dependency is not a current dependency state

```text
Configured Dependency
≠
Current Dependency State
```

An external identity provider's configuration may be unchanged while its metadata or keys
change; persistence may be configured correctly while the service is down; a key source
may be configured while the required key is unusable. Therefore:

```text
Effective Configuration
≠
Complete Effective Runtime State
```

This page does not build an ontology for each adapter, and adapter configuration does not
become a domain semantic owner in reverse.

## 22 · Some configuration changes are trust changes

Not every change carries the same risk. A setting being technically modifiable does not
make it an ordinary operational adjustment:

```text
Reloadability     ≠  Security / Trust Impact
Hot-reloadable    ≠  Low-risk Change
```

Changing issuer, subject policy or a trust source may amount to a trust migration rather
than runtime tuning. Exact per-key change impact is defined by the config registry.

## 23 · Current configuration does not rewrite historical contract

```text
Current Configuration
≠
Historical Runtime Contract
```

Changing authentication, protocol or security policy today does not make historical facts
lawfully produced under the old contract "never have happened". Current configuration may
change whether an old artifact is still accepted, whether a continuation is allowed, and
current security eligibility. But:

```text
Historical Configuration Semantics
≠
Current Security Eligibility
```

What an old artifact was, and how it was produced, is still interpreted by the event-time
contract.

## 24 · A source change is not an activation

```text
Configuration Source Changed
≠
Effective Configuration Changed
```

What actually changes runtime behaviour is the new effective configuration established
after resolution, validation and successful activation.

## 25 · Configuration effect is not propagation freshness

In multi-runtime or multi-replica deployments, a new configuration taking effect
somewhere does not mean every participant adopted it simultaneously:

```text
Configuration Effect
≠
Configuration Propagation Freshness
```

The same product release does not automatically mean every runtime is using an identical
effective configuration. However:

```text
Configuration Convergence
≠
Byte-for-byte Equality
```

Legitimate replica-local differences must not be misreported as semantic drift. What
should be compared is **the consistency scope the config registry declares.**

## 26 · Configuration rollback is not safe recovery

A historical revision having been lawful does not make restoring it safe today:

```text
Configuration Rollback  ≠  Safe Recovery
Configuration Restore   ≠  Trust Restore
Configuration Rollback  ≠  Trust Resurrection
```

Reality outside the config may have moved: a key was compromised, an external source is
no longer trusted, an algorithm was disabled, security policy changed after an incident.
Rollback must not restore old text and resurrect revoked trust along with it.

### Product rollback and configuration rollback are separate

```text
Product Release Rollback
≠
Configuration Rollback
```

Old software may not understand the current configuration contract; current config may
not be compatible with old software. Rollback must pass release/config contract
compatibility validation. Recovery procedures are defined by
[Operations & Recovery](../operate/operations-and-recovery).

## 27 · Configuration provenance is not human attribution

A runtime may know which source a value came from and when a new effective configuration
was observed or activated. But:

```text
Configuration Source Provenance
≠
Human Operator Attribution
```

If an infrastructure platform modified a mounted configuration, SoulAuth may credibly say
the runtime observed a source change. Without additional evidence it must not fabricate
which human operator made the change. This matches the initiator/runtime-origin
separation in [Audit](./audit).

## 28 · Configuration contract evolution

The configuration contract itself evolves across releases:

```text
Current Configuration Contract
≠
Automatic Interpretation of Historical Configuration
```

```text
Configuration Syntax Compatibility
≠
Configuration Semantic Compatibility
```

Two releases parsing the same string does not mean the string means the same thing in
both. Contract evolution cannot substitute "the parser still reads it" for a real
semantic compatibility judgment.

## 29 · Configuration at a glance

| Boundary | Meaning |
| --- | --- |
| **Configuration ≠ Administration / ontology / security state** | Config chooses how to run; it does not redefine the domain |
| **Readable input ≠ Admitted source** | Being readable does not qualify a source for resolution |
| **Precedence ≠ Trust** | Who overrides whom and who is trusted are different questions |
| **Precedence ≠ Merge semantics** | Priority does not define how structures combine |
| **Source encoding ≠ Typed value** | A raw string does not become a runtime type on its own |
| **Absent / empty / null / default are not interchangeable** | Absence semantics are a per-key contract |
| **Invalid explicit value ≠ Declared absence** | An illegal value must not be swallowed by a default |
| **Parsed ≠ Valid ≠ Activated** | Reading config is not validating or applying it |
| **Effective configuration ≠ Runtime capability** | Configured does not mean dependencies work |
| **Configuration enabled ≠ Feature supported** | Config does not create product capability |
| **Reference ≠ Referenced secret / key material** | Stable config and dynamic security material are separate |
| **Config inspection ≠ Secret export** | Observability does not create a read right for secrets |
| **Reloadability ≠ Security impact** | Hot-reloadable is not low-risk |
| **Source change ≠ Activation** | Editing a source is not the runtime adopting it |
| **Effect ≠ Propagation freshness** | Taking effect is not every replica seeing it |
| **Rollback ≠ Trust restoration** | Old config must not resurrect revoked trust |
| **Current configuration ≠ Historical runtime contract** | Today's policy does not rewrite yesterday's facts |

The whole lifecycle compresses to:

```text
Admitted Source Input
        ↓
Resolution + Typed Parsing
        ↓
Complete Validation
        ↓
Activation
        ↓
Effective Configuration
```

and must still be observed separately along `Referenced Runtime Material` and
`Effective Runtime Capability`, because:

> **what the config says, what the runtime adopted, and what state the dependencies are
> in right now are three different questions.**

## Exact contract source

This page defines the human-readable contract for configuration sources, resolution,
typing, validation, activation, effective state, referenced material, lifecycle and
historical semantics.

The exact configuration vocabulary is owned by the **machine-readable config registry**,
which holds the keys, types, requiredness, defaults, sources, scopes, validation,
lifecycle and sensitivity that genuinely exist in the current release.

Public documentation must not invent keys, change defaults, derive precedence, add reload
capability or widen the supported configuration surface. Current product support is
published by [Project Status](../project/status); runtime readiness and recovery belong
to the operations documents.

## Next

The configuration layer's boundaries are complete: configuration cannot modify ontology;
source input is not effective runtime; resolution, typing, validation and activation are
layered; secret/key references are separate from the material itself; a configured
capability cannot impersonate a supported or operational one; reloadability does not
lower security impact; rollback does not resurrect trust; and current configuration does
not reinterpret historical identity, authentication, protocol or audit facts.

Following canonical dependency order, next is
[Soulseed Integration](../integrate/soulseed).
