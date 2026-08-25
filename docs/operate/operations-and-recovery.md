# Operations & Recovery

## Running, maintaining and recovering SoulAuth's trust

[Production Checklist](./production-checklist) answers whether this specific release,
artifact, configuration, topology and feature set is fit to carry production identity
traffic. This page continues:

> **After go-live, how is that established trust maintained over time?**

and:

> **When persistence, credentials, keys, configuration, IdentityBinding, the runtime or
> another trust boundary has been damaged, how do we recover without quietly rewriting
> who is who, what has been invalidated, and what actually happened?**

First:

```text
Service Recovery
≠
Trust Recovery
```

A process restarting — `process running`, `readiness healthy` — says only that the
runtime again meets some operating conditions. It does not prove ActorIdentity continuity
is correct, that revoked state has not been resurrected, that IdentityBinding is still
trustworthy, that key/secret trust has been restored, that downstream consumers accept the
new trust state, or that historical accountability is still interpretable.

What SoulAuth recovery actually restores is:

> **an interpretable current identity/authentication state, and continuous, honest
> historical accountability.**

## 1 · The day-2 operating model

Operations do not begin when something breaks. A deployment that has passed the
production gate keeps changing: configuration changes, keys and secrets move through
lifecycle stages, certificates expire, backups accumulate, runtimes are replaced,
releases upgrade, external dependencies degrade, and security incidents happen.

```text
Observe
        ↓
Maintain
        ↓
Change
        ↓
Verify
        ↓
Recover when required
        ↓
Revalidate
```

This is not a one-off procedure. It is the **continuous maintenance loop of production
trust.**

## 2 · Containment comes before availability recovery

When a failure may already have broken trust, the first goal is not to restore traffic
quickly. It is to **stop a boundary that has lost trustworthiness from producing further
effects.**

```text
Detect
        ↓
Contain
        ↓
Identify affected trust boundary
        ↓
Recover / revoke / reconcile
        ↓
Verify
        ↓
Revalidate production gates
        ↓
Reopen traffic
```

In particular, if a trust material may have been compromised, it must not keep being used
for availability's sake until "the new service is ready". Establish first which facts can
still be trusted.

## 3 · Identity continuity is not identity immutability

An incident should not usually be solved by:

```text
delete ActorIdentity → create another ActorIdentity
```

Credential compromise usually acts on the credential. AuthSession compromise usually acts
on the session. Client authentication material compromise usually acts on the client.
None of them should silently become ActorIdentity replacement.

```text
Identity Continuity
≠
Identity Immutability
```

Keeping the same ActorIdentity does not mean preserving every old credential,
IdentityBinding, lifecycle state or security state. Genuinely wrong relations must still
be revoked, corrected or reconciled under their canonical contracts.

## 4 · Recovery is not mechanical per database record

Recovery cannot only ask *what is this database object?* — one record may carry an
identity continuity fact, a current lifecycle fact, security-sensitive state and bounded
protocol state at once.

```text
Database Object Type
≠
Recovery Treatment
```

The real question is: **should this semantic fact, after recovery, be preserved,
reconciled, invalidated, or re-established?**

## 5 · Recovery answers four questions

**Which facts must preserve identity continuity?** Does this restore still represent the
same ActorIdentity? Do the applicable identifier non-reuse semantics still hold?
Infrastructure replacement must not turn an ActorIdentity into a new one merely because
the physical deployment changed.

**Which current lifecycle/security facts must be reconciled?** `active` in a historical
snapshot does not prove it should be active at recovery time:

```text
Historical State
≠
Automatically Current State
```

Current facts must be re-judged against the incident timeline, later security events and
the current domain contract.

**Which one-time or ephemeral facts must not be resurrected?** Bounded protocol or
security state that has been consumed, expired, revoked or otherwise invalidated must not
become usable again by restoring an old snapshot:

```text
Historical Restore
≠
Permission to Resurrect Expired / Revoked / Consumed State
```

**Which historical facts must remain interpretable?** The goal of audit recovery is not
"all the bytes came back". It is that **the system can still explain which history has
evidence, where a gap exists, and what the recovery itself did.** If a stretch of history
can no longer be proven, that gap must stay visible.

## 6 · Recovery treatment at a glance

| Semantic fact | Recovery intent |
| --- | --- |
| **ActorIdentity continuity** | Keep the same ActorIdentity; do not re-create it because infrastructure was rebuilt |
| **Current lifecycle / security state** | Reconcile after restore against later facts and the current contract |
| **One-time / bounded state** | Invalidated state must not silently return through a historical restore |
| **Historical accountability** | Preserve attribution and evidence; express any gap or recovery boundary visibly |

This describes recovery semantics. It is not a machine-readable recovery type registry.

## 7 · A database restore is not a SoulAuth recovery

A complete recovery needs more than persistence — it needs an interpretable operating
context:

```text
Recovered Durable State
+ Compatible Release
+ Compatible Configuration
+ Required Key / Secret Material
+ Applicable Schema / Storage Contract
+ Applicable Protocol Trust Context
+ Network / Deployment Boundary
```

```text
Database Restore          ≠  SoulAuth Recovery
Infrastructure Replacement ≠  Issuer Migration
```

Restoring a database onto another machine does not mean ActorIdentity should change —
unless the operator is deliberately performing a trust migration.

## 8 · Backups are derived from recovery requirements

The correct order:

```text
Recovery Requirements
        ↓
Semantic Facts that must survive
        ↓
Required Consistency Boundary
        ↓
Backup Scope
        ↓
Key / Secret Dependencies
        ↓
Retention
        ↓
Restore Verification
```

not:

```text
database dump exists → system is recoverable
```

Backup design answers **what trust recovery must ultimately restore** — not "what we
happen to be able to dump".

## 9 · A backup set needs an interpretable consistency boundary

Different state may come from different runtime or persistence scopes, with recovery
points that do not exactly coincide. That does not mean SoulAuth must wrap everything in
one global transaction. It means recovery must be able to explain **which recovery
boundary each fact in this backup set corresponds to, and how inconsistencies between
them are handled**:

```text
Backup Consistency
≠
One Global Database Transaction
```

## 10 · Backup availability is not backup integrity

```text
Backup Availability
≠
Backup Integrity
```

Before restoring, confirm at least backup integrity, source, intended recovery point,
release/schema compatibility and applicable protection. A corrupt, unattributed or
incompatible backup must not enter the production trust domain merely because it is the
most recent one.

## 11 · A valid backup is not a trusted recovery point

One of the most important distinctions in incident recovery:

```text
Valid Backup
≠
Trusted Recovery Point
```

A backup may be complete, uncorrupted and schema-compatible while already containing
malicious client state, a wrong IdentityBinding, a compromised credential or an
unauthorised administrative mutation.

Selecting a recovery point must therefore use the **incident timeline** and ask:

> **Is this recovery point inside the historical boundary we still trust?**

## 12 · Backup possession is not key/secret authority

Restoring protected state may need backup data, the required key/secret material, a
compatible release and a compatible configuration at once. But:

```text
Backup Possession
≠
Unrestricted Key / Secret Authority
```

Backups and key/secret material must have **explicit, separate access protection
boundaries.** Before restoring protected state, confirm the trust material recovery needs
can be obtained safely under the current contract.

## 13 · The canonical recovery sequence

Restore is not `restore snapshot → start process → open traffic`. The high-level sequence:

1. **Contain** — freeze or restrict the affected environment so untrusted state stops
   spreading.
2. **Establish the incident timeline** — which boundary is affected, and from when might
   it have been untrustworthy?
3. **Select a trusted recovery point** — a historical boundary that can still be trusted.
4. **Establish a compatible recovery context** — release, configuration, schema, required
   trust material, applicable protocol and deployment context.
5. **Restore the required durable facts** — only the state that genuinely belongs in this
   recovery scope.
6. **Reconcile current trust** — re-judge the ActorIdentity, IdentityBinding, credential,
   lifecycle and security facts this incident affected.
7. **Invalidate unsafe historical state** — ensure expired, revoked, consumed and
   distrusted state has not returned.
8. **Validate and re-run production gates** — positive and negative validation, then
   re-verify the affected gates.

Only then is the corresponding production traffic reopened.

## 14 · Snapshot state is not current trusted state

Suppose the recovery point is thirty minutes old. In those thirty minutes there may have
been a credential revocation, an Actor suspension, an AuthSession change, a client
mutation, an IdentityBinding revocation, a security policy change or another
security-sensitive operation. A historical snapshot knows none of it:

```text
Snapshot State
≠
Current Trusted State
```

After restore, affected state must be decided against the incident timeline:

```text
remain valid   revalidate   invalidate   reconstruct
```

`active` in the backup does not restore automatically to active.

## 15 · Containment may widen — as an explicit incident decision

If current trusted state cannot be rebuilt safely, an operator may choose containment
broader than the minimum: widening session invalidation scope, suspending a client,
suspending an Actor, distrusting a trust material.

But **widening the blast radius must be an explicit incident decision.** It must not
become a hidden default that every recovery "revokes everything", and it must not cross
the artifact freshness and revocation contracts defined by
[Authentication & Sessions](../reference/authentication-and-sessions) and
[OIDC & Clients](../reference/oidc-and-clients).

## 16 · A restored IdentityBinding is not the current binding

```text
Restored IdentityBinding
≠
Current IdentityBinding by definition
```

Restoring a binding proves only that the relation existed at that recovery point. It does
not prove the external identity source still recognises it today, that the Soulseed
canonical Actor still corresponds, or that no revoke/rebind happened afterwards. Affected
bindings must be re-judged under the current binding contract.

Recovery must never perform best-effort identity matching by email, display name or
client identifier.

## 17 · Preserving continuity is not preserving every old state

If the recovered entity is confirmed to be the same ActorIdentity, recovery must not
create a new one merely because infrastructure changed. But:

```text
Preserve ActorIdentity Continuity
≠
Preserve Every Historical State
```

Wrong IdentityBindings, lifecycle states, credential states and security states should
still be corrected. That is what `Identity Continuity ≠ Identity Immutability` means in
practice during recovery.

## 18 · Audit recovery must not fabricate continuous history

If audit capability degraded, was lost or was recovered, no one may afterwards manufacture
a history that "looks like it never stopped":

```text
Audit Reconciliation
≠
Retroactive Fabrication of Uninterrupted History
```

Where an interval cannot be reliably proven, the gap must stay visible. Recovery should
record how far the evidence reaches, which stretch has a known gap, when the recovery
happened, and which out-of-band evidence exists.

Where the release formally supports a cryptographic audit integrity profile, verify the
corresponding integrity boundary as that profile requires. Chain, checkpoint or segment
mechanisms not declared by
[Authentication Protection](../security/authentication-protection) or
[Audit](../reference/audit) are not invented here.

## 19 · Trust-material operations: rotation, loss and compromise are distinct

```text
Rotation  ≠  Loss  ≠  Compromise
```

They cannot share a runbook.

**Planned rotation** means the material is still under control and the system is being
moved deliberately to new material:

```text
introduce new material
        ↓
move new use to it
        ↓
retain old verification / read capability only where the contract requires
        ↓
retire old material
        ↓
verify continuity
```

Not every key or secret must support overlap; the exact lifecycle comes from the
corresponding security/protocol contract.

**Loss** means an authorised operator cannot obtain the material, with no evidence an
attacker has it. The questions become: which capabilities are lost, which protected state
is still interpretable, can current trust be re-established?

**Compromise** means an attacker may hold or control the material:

```text
contain
        ↓
stop / restrict affected trust
        ↓
introduce new trusted state
        ↓
reassess affected artifacts / state
        ↓
propagate trust change where required
        ↓
verify compromised trust is rejected
```

```text
Normal Rotation Overlap
≠
Compromised-material Trust Continuation
```

The old-material overlap that is legitimate in routine rotation must not be copied
mechanically into a compromise response.

## 20 · A server-side trust change is not a downstream trust update

```text
SoulAuth Trust Material Changed
≠
Downstream Trust Updated
```

Completing a rotation internally does not mean clients, resource servers or other
consumers have obtained the new trust view. Some incidents only truly close once the
affected consumers correctly see the new declared trust state.

## 21 · Different trust materials have different blast radii

Materials must not be treated as one thing because both are called "key" or "secret":

```text
Transport Trust Material    ≠  Protocol Signing Material
TLS Certificate Rotation    ≠  Protocol Signing-key Rotation
Cryptographic Key Lifecycle ≠  Operational Secret Lifecycle
```

How far a compromise reaches is judged from the security properties that genuinely depend
on that material. "One key had an incident, therefore the entire identity system fails"
does not follow.

## 22 · Credential, session, client and Actor have different containment scopes

Incident response must not escalate everything into Actor lifecycle termination:

```text
Credential Revocation  ≠  Actor Retirement
AuthSession Revocation ≠  Actor Retirement
Client Containment     ≠  Actor Retirement
Actor Suspension       ≠  Actor Retirement
```

## 23 · Revocation effect is not revocation freshness

After a revocation, SoulAuth's current server-side state may change immediately. But:

```text
Revocation Effect
≠
Universal Immediate Downstream Invalidation
```

When downstream consumers observe it depends on artifact representation, validation
strategy, lifetime, online versus offline validation, the resource contract and the
declared freshness semantics. Therefore:

```text
Credential Revocation   ≠  Universal Immediate Access-token Revocation
AuthSession Revocation  ≠  Universal Immediate Access-token Revocation
Actor Suspension        ≠  Universal Immediate Access-token Invalidation
```

This page can tell an operator **which upstream state has changed.** It cannot promise,
beyond what the token and protocol contracts state, when every downstream artifact stops
being accepted.

## 24 · Configuration drift is a day-2 operation

Production configuration changes over time. Operations must be able to tell whether the
current runtime configuration is still inside the most recently approved sign-off scope:

```text
Approved Production Configuration
        ↓
Change over time
        ↓
Potential Drift
```

On finding drift: `detect → review → correct or approve → revalidate affected gates`.

This page does not require GitOps, IaC or a configuration revision to exist. It requires
only that **operations can tell whether the current configuration is still the approved
one.**

## 25 · A configuration applied successfully is not trust still valid

A config change being accepted by the parser, reloaded by the runtime and followed by a
healthy process does not prove production trust is unchanged:

```text
Configuration Applied Successfully
≠
Production Trust Still Valid
```

A controlled change needs at least:

```text
prepare → validate → apply → verify runtime health
→ verify affected protocol / security behavior → observe
→ re-run affected Production Gates
```

The configuration lifecycle itself is defined by
[Configuration](../reference/configuration).

## 26 · Issuer migration is not a hostname rename

Where the profile uses an issuer:

```text
Issuer Migration
≠
Hostname Rename
```

An issuer change can affect downstream trust, protocol metadata, subject semantics, token
validation, and client and resource configuration. It must be treated as an **explicit
trust migration.** Exact protocol semantics belong to
[OIDC & Clients](../reference/oidc-and-clients).

## 27 · Confirm compatibility before upgrading

Upgrading is not `replace binary → hope it works`:

```text
read current release compatibility
        ↓
verify backup / recovery readiness
        ↓
establish migration ownership
        ↓
apply required migration
        ↓
upgrade runtime
        ↓
verify readiness
        ↓
verify protocol / security behavior
        ↓
re-run affected Production Gates
```

Exact migration commands, schema tools and deployment mechanisms come from the release
runbook. This page freezes only: **upgrades are bound by the compatibility contract.**

## 28 · Replicated deployment is not mixed-version compatibility

```text
Replicated Deployment
≠
Mixed-version Compatibility
```

Supporting multiple replicas does not mean old and new runtimes may serve the same
production trust domain simultaneously. Only an explicit release compatibility contract
permits the corresponding rolling upgrade.

## 29 · Schema mutation needs explicit ownership

If an upgrade modifies the persistence schema or other shared state, every replica must
not independently mutate it at startup:

```text
Schema Mutation requires explicit ownership / coordination
```

This page does not prescribe a migration job, a leader or an operator command. It requires
only that **it be a declared release contract, not each replica guessing.**

## 30 · Rollback is not recovery

```text
Binary Rollback            ≠  State Rollback
State Rollback             ≠  Safe Trust Recovery
Restore Old Configuration  ≠  Restore Old Trust Safely
```

External reality may already have moved: a key rotated or was compromised, the issuer
migrated, an IdentityBinding was revoked, client configuration changed, security policy
changed.

> **Code can go back to yesterday. Trust cannot.**

## 31 · Replica failover is not historical restore

Routine failover (`Replica A unavailable → Replica B continues`) continues current state.
A historical restore (`current state lost → older recovery point restored`) pulls state
back into the past:

```text
Replica Failover
≠
Historical State Restore
```

The latter requires full trust reconciliation.

## 32 · A graceful drain is not protocol correctness

Replica maintenance may use `remove/drain → settle bounded in-flight work → operate →
verify readiness → rejoin traffic`. But:

```text
Graceful Drain
≠
Protocol Correctness
```

Traffic management decides where requests go. It does not prove cross-replica AuthSession,
one-time state or token/protocol continuity is correct — that comes from the runtime and
protocol contracts.

## 33 · When a security-critical fact cannot be established, do not implicitly allow

If persistence, key/secret material or another security-critical dependency fails, the
affected operation must not read unknown state as "allow":

```text
Unable to Establish Required Security Fact
≠
Implicit Allow
```

That does not mean a persistence failure invalidates every previously issued artifact in
the world. Downstream acceptance of issued artifacts continues to follow its own
validation and freshness contract.

## 34 · When required trust material is unavailable, do not invent new trust

If an operation needs key/secret material the runtime cannot obtain, generating fresh
material to restore availability creates **a new, ungoverned trust domain.** The correct
behaviour depends on the material's purpose, the current operation, existing trusted local
state and recovery policy.

> **Availability pressure is not a reason to manufacture temporary trust.**

## 35 · Unsafe time breaks time-bound security semantics

If system time becomes untrustworthy, time-dependent security decisions may no longer hold
credibly:

```text
detect unsafe time
→ restrict affected operation / runtime
→ restore trusted time
→ revalidate time-bound behavior
→ return to service
```

This page defines neither a clock technology nor a skew threshold — those come from the
protocol/security contract.

## 36 · A feature dependency failure is not whole-service failure

Where the release supports feature isolation:

```text
Feature-specific Dependency Failure
≠
Whole Identity Service Failure
```

An optional provider failing should first affect the features that depend on it, not stop
entirely independent authentication paths. Whether failures *can* be isolated must itself
be supported by the release/runtime contract.

## 37 · Restore verification is a periodic operation

Having done one restore test before go-live does not mean the system stays recoverable
forever.

> **Restore verification should continue as a periodic day-2 operation.**

Frequency follows recovery objectives, organisational risk, change rate and operations
policy.

## 38 · Emergency administrative path, if one exists

This page does not require every deployment to create a break-glass capability. Where a
formal emergency path does exist, it must still obey the canonical identity and authority
boundaries:

```text
Emergency Access  ≠  Permanent Alternate Admin Path
Emergency Access  ≠  Identity Semantics Bypass
```

An emergency path is never a licence for identifier reuse, fabricating an IdentityBinding,
silently deleting audit records, or unsupported direct identity-state rewriting. Prefer
supported administration, backup/restore, release migration and the declared maintenance
contract. Ad-hoc persistence mutation must not become an ordinary recovery technique.

## 39 · Audit degradation must keep the gap visible

If audit capability is temporarily unavailable, recovery must not pretend the history was
continuous:

```text
Audit Reconciliation
≠
Retroactive Fabrication
```

Operations should ensure the degradation is identified, out-of-band incident evidence is
retained where necessary, audit capability is restored, the known gap stays visible, and
the recovery event itself is recorded. History that cannot be proven must not be "fixed"
into never having been interrupted by writing events afterwards.

## 40 · Recovery validation = positive + negative

What makes recovery validation different from an ordinary readiness check:

> **it verifies not only that what should work works again, but that what must not come
> back has not come back.**

### Positive validation

- [ ] The runtime meets health and readiness requirements.
- [ ] The recovery context matches the intended production state.
- [ ] The required durable state is internally consistent.
- [ ] Required key/secret references remain interpretable.
- [ ] ActorIdentity continuity holds.
- [ ] Affected IdentityBindings have been reconciled.
- [ ] Current lifecycle and security state meet their contracts.
- [ ] Applicable production protocol smoke tests pass.
- [ ] Representative downstream consumers accept the intended trust state.
- [ ] Historical accountability remains interpretable.
- [ ] The recovery operation itself has left the required evidence.

### Negative validation

- [ ] Credentials that should remain revoked cannot establish new authentication.
- [ ] AuthSessions that should remain invalid are still invalid.
- [ ] Expired or consumed one-time state did not return through the restore.
- [ ] Revoked IdentityBindings did not silently become current again.
- [ ] Distrusted trust material is not accepted within the scopes that forbid it.
- [ ] Wrong-resource / wrong-context artifacts are still rejected, where the profile
      applies.
- [ ] Downstream consumers have seen the new trust state the incident requires, where the
      contract requires it.

This negative half is one of the most important differences between recovery validation
and "the service looks normal again".

## 41 · Negative validation still obeys the freshness contract

Recovery must not misread correct bounded freshness as failure. If the token contract
explicitly allows a class of already-issued artifact to keep validating locally for a
bounded period after an upstream revocation, that behaviour is not automatically a
recovery failure. What is verified is whether **current behaviour still strictly matches
the frozen revocation/freshness contract.**

## 42 · Re-run affected production gates after recovery

Any recovery, trust migration, security incident or material change that affects an
assumption or evidence the sign-off depended on requires re-running the affected gates in
[Production Checklist](./production-checklist):

```text
Recovery / Material Change
        ↓
Identify invalidated assumptions
        ↓
Re-run affected Production Gates
```

Not mechanically re-running every gate each time — and not assuming that a runtime
becoming ready again means nothing needs re-verifying.

## 43 · Readiness healthy is not recovery complete

```text
Readiness Healthy
≠
Recovery Complete
```

Readiness returning means the runtime again meets some conditions for accepting traffic.
Recovery is complete only when ActorIdentity continuity is interpretable, current security
state is correct, revoked and consumed state has not wrongly returned, downstream trust has
reached its intended state, historical accountability can explain what happened before and
after, and the affected production gates have passed again.

## 44 · Operations & recovery at a glance

| Boundary | Meaning |
| --- | --- |
| **Service recovery ≠ Trust recovery** | A restarted process does not prove correct identity/security state |
| **Identity continuity ≠ Identity immutability** | Keeping the Actor is not keeping every old state |
| **Database restore ≠ SoulAuth recovery** | Restoring data is one part of recovery |
| **Backup exists ≠ Recovery works** | Without restore verification there is no evidence |
| **Backup availability ≠ Backup integrity** | A file existing does not make it safe to restore |
| **Valid backup ≠ Trusted recovery point** | An intact backup may still contain wrong trust |
| **Historical state ≠ Current trusted state** | `active` in a snapshot is not active today |
| **Historical restore ≠ State resurrection** | Expired, revoked and consumed state must not return |
| **Restored binding ≠ Current binding** | Bindings are re-judged under the current contract |
| **Preserve continuity ≠ Preserve every old state** | Wrong lifecycle and security state is still corrected |
| **Rotation ≠ Loss ≠ Compromise** | Three trust-material events, three responses |
| **Rotation overlap ≠ Compromise continuation** | Leaked material does not inherit routine overlap |
| **Credential / session containment ≠ Actor retirement** | Incident scope must not inflate |
| **Revocation effect ≠ Revocation freshness** | Upstream change and downstream observation differ |
| **Replica failover ≠ Historical restore** | One continues the present; one returns to the past |
| **Replicated ≠ Mixed-version compatible** | Replicas do not imply rolling upgrade |
| **Binary rollback ≠ State rollback** | Software version is not security state |
| **State rollback ≠ Safe trust recovery** | Historical state needs reconciliation |
| **Emergency access ≠ Identity semantics bypass** | Emergency authority cannot rewrite the domain |
| **Audit reconciliation ≠ Retroactive fabrication** | A gap cannot be forged into never existing |
| **Readiness healthy ≠ Recovery complete** | A running runtime is not restored trust |

## Exact contract source

This page defines day-2 operating discipline, the trusted recovery point,
restore/reconciliation ordering, trust-material incident classification, revocation and
containment boundaries, configuration change, upgrade and rollback discipline, and
recovery validation.

It does not define exact backup or restore commands, a specific key-management system, a
key versioning scheme, a schema migration tool, a formal break-glass implementation, the
refresh token lifecycle, an AIActor authentication method, an audit cryptographic
integrity mechanism, or a replica coordination store. Those come from the runtime, the
release compatibility contract, the config registry, the authentication/token/audit
references, [Project Status](../project/status) and the engineering runbooks.

Operations documentation may organise those contracts. It cannot create current capability
on their behalf.

## Next

```text
Deployment              Can SoulAuth run correctly?
        ↓
Production Checklist    Can this exact deployment prove it is production-ready?
        ↓
Operations & Recovery   How do we maintain and recover that trust over time?
```

[Troubleshooting](./troubleshooting) stops discussing what the correct architecture should
be and starts from the symptoms an operator actually sees: **why did authentication fail,
and did the problem occur at the issuer, the client, the redirect, the token, the session,
the proxy, persistence, a key, the clock, an external provider, or the Soulseed
integration boundary?**
