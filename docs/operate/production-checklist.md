# Production Checklist

## Proving this SoulAuth deployment can carry production identity traffic

[Deployment](./deployment) answers *can SoulAuth run correctly in this environment?*
This page asks a stricter question:

> **Can we prove, with evidence, that this specific release, artifact, configuration,
> topology and enabled feature set meets the production baseline this version defines?**

```text
Healthy Deployment
≠
Production-ready Deployment
```

This is not a list of nice-to-haves. It is a **production readiness gate.**

## 1 · Readiness results

Every gate has exactly three outcomes:

- **PASS** — the requirement is proven by applicable evidence.
- **BLOCKED** — the requirement is unmet, or cannot be proven met.
- **N/A** — the feature or contract genuinely does not apply, and the reason is recorded.

> **N/A is not a skip button.**

Once a feature is enabled in this production deployment, its required gates can no longer
be bypassed as N/A.

```text
Any REQUIRED gate that cannot be proven
=
Production Readiness Result: BLOCKED
```

## 2 · A PASS belongs to an explicit sign-off scope

Production readiness is not a permanent property of SoulAuth. A PASS binds to **a
specific set of operating facts.** Before sign-off, record at minimum:

| Sign-off scope | Must answer |
| --- | --- |
| **SoulAuth release** | Which release is being reviewed |
| **Artifact identity** | Which binary / image / artifact actually runs |
| **Artifact provenance** | Whether it came from the declared release source and satisfies the verification contract |
| **Configuration identity** | How the current production configuration is stably identified |
| **Deployment topology** | The actual deployment shape |
| **Enabled feature set** | Which supported features are genuinely enabled |
| **Sign-off owner** | Who is accountable for this readiness result |
| **Evidence** | Which tests, config, runbooks and runtime observations prove each gate |
| **Timestamp** | When this verification happened |

### Configuration identity need not be a configuration revision

If the current config contract formally provides a configuration revision, record it. If
not, use an equivalent reproducible identity the contract supports.

```text
Production Checklist
≠
Permission to invent a Configuration Revision
```

## 3 · Evidence must bind subject and scope

A test having once passed does not prove the current production artifact passed. Every
piece of evidence must answer: **which artifact? which configuration? which topology?
which feature/contract scope?**

```text
A test passed somewhere
≠
This deployment was verified
```

Sign-off accepts only evidence with an explicit relationship to this sign-off scope.

## 4 · Release & artifact gate — REQUIRED

- [ ] The running artifact can be identified unambiguously.
- [ ] The artifact is within the current release's formally supported range.
- [ ] The artifact actually running matches the artifact under review.
- [ ] Artifact provenance/integrity has been verified per the release contract.
- [ ] The enabled feature set does not exceed the formally supported surface.
- [ ] Canonical semantic and architecture integrity checks pass.
- [ ] No private patch changes ActorIdentity, authentication, Client, authority or other
      canonical semantics in an unsupported way.

This gate does not describe internal canonical architecture as "architecture conformant".
Standards conformance claims remain governed by
[Standards & Conformance](../security/standards-and-conformance).

## 5 · Enabled features must not exceed the supported surface

```text
Implemented  ≠  Supported
Configured   ≠  Supported
Enabled      ≠  Supported
```

This checklist cannot turn a capability that merely exists in the runtime, without formal
support, into a production-ready feature.

> **First confirm the supported surface with [Project Status](../project/status), then
> verify here whether that supported feature meets the production gate.**

The order does not reverse.

## 6 · Protocol & issuer gate — REQUIRED IF APPLICABLE

Where an issuer-based OAuth/OIDC capability is enabled:

- [ ] The production issuer is explicit.
- [ ] The public protocol surface matches the declared issuer.
- [ ] Discovery/metadata expresses the correct issuer where applicable.
- [ ] Issued artifacts match the declared issuer contract.
- [ ] Clients and resource servers use the correct trust source.
- [ ] Production configuration has not accidentally leaked a localhost or development
      issuer.
- [ ] The subject namespace and subject policy for the enabled protocol are explicit.

Do not write "the stable subject is the public protocol subject". Keep:

```text
ActorIdentity Resource ID  ≠  OIDC `sub`  ≠  Access-token Subject by definition
```

The exact subject contract belongs to
[OIDC & Clients](../reference/oidc-and-clients).

## 7 · Production protocol validation — REQUIRED IF APPLICABLE

For the enabled protocol profile, sign-off requires end-to-end validation close to the
real production boundary — of **both** kinds of fact:

**Positive path** — the declared flows complete per contract.
**Negative path** — flows that should fail do fail.

```text
Happy-path Success
≠
Sufficient Production Evidence
```

Applicable tests may include:

- [ ] Metadata/discovery readable from the correct public boundary.
- [ ] The declared authorization flow completes.
- [ ] The PKCE / redirect / transaction binding the profile requires is verified.
- [ ] ID tokens validate under the formal OIDC contract where applicable.
- [ ] Access tokens validate at the target resource under the formal contract.
- [ ] Wrong-resource / wrong-audience artifacts are rejected.
- [ ] An ID token cannot masquerade as an ordinary API access token.
- [ ] The logout / session flows actually enabled behave per their contract.

The tests are **derived from the enabled profile.** The checklist does not create a
profile.

## 8 · Network & transport gate — REQUIRED

- [ ] The public protocol surface meets the current production transport security
      baseline.
- [ ] The TLS certificate is valid at the applicable public boundary.
- [ ] The certificate hostname matches the public endpoint.
- [ ] Certificate expiry / renewal failure has an actionable monitoring signal.
- [ ] The internal listen address is not being read as the public issuer.
- [ ] The reverse proxy / ingress trust boundary is explicit.
- [ ] An internet caller cannot change the trusted scheme, host or external request
      context by forging forwarded metadata.
- [ ] The proxy-to-SoulAuth link satisfies the deployment security policy.
- [ ] Public protocol exposure and control plane exposure are clearly separated.
- [ ] Persistence is not a consumer-facing surface.
- [ ] Key/secret infrastructure is not a consumer-facing surface.

If issuer, transport or the trusted proxy boundary cannot form a consistent trust
contract: **BLOCKED.**

## 9 · Keys & secrets gate — REQUIRED

Production does not maintain a key purpose registry invented by this page. What must be
verified is that **every key/secret purpose the enabled security functions actually
depend on holds under its formal contract**:

- [ ] All required key/secret material exists and is usable.
- [ ] Different security purposes have not been collapsed, contract-free, into one
      universal secret.
- [ ] Production is not still using development or demo secret material.
- [ ] Long-lived production secrets are not in the source repository.
- [ ] Long-lived runtime secrets are not baked into a widely distributed artifact.
- [ ] Raw passwords, tokens, client secrets and private credential material do not reach
      an inappropriate log, metric, trace or audit surface.
- [ ] Key/secret lifecycle is independent of container/replica lifecycle.
- [ ] The runtime holds only the key/secret access its responsibilities require.
- [ ] Key/secret ownership is explicit.
- [ ] Key loss, replacement or compromise has at least a formal operations/recovery
      procedure.

Whether an OIDC signing key, credential protection key, audit integrity key or other
purpose exists is decided by the current release.

## 10 · Actor-held credential gate — REQUIRED IF APPLICABLE

Where an authentication method uses actor-held private credential material:

- [ ] That private material does not enter SoulAuth server custody.
- [ ] The verification-material lifecycle is frozen by the authentication contract.
- [ ] Actor credential and client authentication material stay separate.
- [ ] Credential-binding negative tests prove an attacker cannot impersonate another
      ActorIdentity by replacing verification material.

```text
AIActor enabled
≠
Actor-held private-key method enabled
```

This gate applies only where the method actually applies.

## 11 · Durable state gate — REQUIRED

- [ ] Canonical identity/authentication state that must survive restart has a supported
      durability mechanism.
- [ ] State that must persist across requests or restarts under the enabled
      protocol/security contract has verified continuity.
- [ ] No critical production state depends solely on an ephemeral runtime filesystem or
      instance-local memory.
- [ ] Supported administration does not depend on direct database mutation.
- [ ] The runtime accesses persistence with the least privilege production policy allows.
- [ ] Persistence transport/storage meets the applicable data protection requirements.
- [ ] Backups have their own explicit access control and sensitive data boundary.

```text
Durability    ≠  Permanent Retention
Durable State ≠  One Required Database Technology
```

## 12 · Audit baseline gate — REQUIRED

The required production baseline for audit is **historical accountability**:

- [ ] The key audit facts the release requires have corresponding coverage.
- [ ] Required audit records use a supported durable mechanism.
- [ ] Initiator, runtime origin and target attribution semantics match
      [Audit](../reference/audit).
- [ ] The audit retention policy is explicit.
- [ ] Operational logs are not being used as an audit substitute.
- [ ] Audit and observability do not leak raw authentication secrets or tokens.

"We have logs" is not "we have audit".

## 13 · Audit integrity gate — REQUIRED IF THE RELEASE CLAIMS IT

Where the release formally claims tamper-evidence, cryptographic audit integrity,
checkpoint/integrity verification or another integrity capability:

- [ ] The required integrity material/state exists and is usable.
- [ ] The corresponding integrity verification passes.
- [ ] The integrity contract still holds, as the release declares it, after recovery.

If the release makes no such claim, this page does not invent an audit integrity key.

## 14 · Recovery gate — REQUIRED

Production identity infrastructure cannot merely prove a backup exists. It must prove
**recovery actually works.**

```text
Backup Exists          ≠  Recovery Works
Backup Completeness    ≠  Restore every historical security state as currently active
```

- [ ] The backup strategy is defined.
- [ ] The recovery contract states which state is restored, invalidated or re-established.
- [ ] A restore does not silently resurrect expired, revoked, consumed or otherwise
      invalid security-sensitive state.
- [ ] Backup data and key/secret material have separate, explicit protection boundaries.
- [ ] Recovery restores the correct current key/reference relationships.
- [ ] A formal recovery runbook exists.
- [ ] At least one restore verification has completed successfully.
- [ ] ActorIdentity continuity and identifier non-reuse semantics are verified after
      restore.
- [ ] Credential, client and security state after restore match the recovery contract.
- [ ] A restore does not silently rewrite, fabricate or falsely make continuous the
      historical audit.

If a successful restore verification has never been completed: **BLOCKED.** This is one
of the hardest gates on this page.

## 15 · Authentication protection gate — REQUIRED

This page does not redefine the controls in
[Authentication Protection](../security/authentication-protection). It verifies that
**the required protections for the enabled authentication methods are genuinely in effect
and evidenced**:

- [ ] The authentication configuration matches the declared security profile.
- [ ] The exposed authentication surface has applicable abuse protection.
- [ ] Enumeration resistance has passed its negative tests.
- [ ] Replay-sensitive authentication/protocol mechanisms are verified per contract.
- [ ] Storage protection for security-sensitive recovery/verification material meets the
      contract.

### Password authentication — REQUIRED IF APPLICABLE

- [ ] The password protection profile meets the production contract.
- [ ] No long-lived readable storage of raw passwords exists.
- [ ] At-rest protection and online abuse protection each have their own control.
- [ ] The password recovery path meets the recovery security contract.

### Additional authentication factor — REQUIRED IF APPLICABLE

- [ ] Secret / verification material meets the protection contract.
- [ ] Enrollment, removal and recovery have authentication/authority boundaries.
- [ ] Documentation does not advertise "additional factor" as phishing resistance.

## 16 · Client gate — REQUIRED IF CLIENT CAPABILITIES ARE ENABLED

- [ ] Production client configuration is governed separately from development-only
      configuration.
- [ ] Redirect matching meets the client contract.
- [ ] Public clients do not depend on a long-lived confidential secret they cannot keep.
- [ ] Confidential client authentication material lives inside the production secret
      boundary.
- [ ] Client registration and mutation go through the supported control plane.
- [ ] Any development-only bootstrap credential or administrative path is disabled,
      restricted or brought under formal production governance.
- [ ] Client authentication is never interpreted as Actor authentication.

## 17 · AuthSession gate — REQUIRED IF APPLICABLE

- [ ] SoulAuth AuthSession and application session are clearly separated.
- [ ] AuthSession expiry, continuity and revocation contracts are explicit.
- [ ] The durability an AuthSession needs does not make one runtime its sole source of
      truth.
- [ ] Required session-fixation and credential-protection behaviour is tested against the
      current contract.

## 18 · Token & resource gate — REQUIRED IF APPLICABLE

- [ ] ID tokens are not treated as ordinary API access tokens.
- [ ] Resource servers do not guess a validation strategy from what a token "looks like".
- [ ] The trusted issuer/source is established in advance per the token contract.
- [ ] Required resource/audience validation is enabled.
- [ ] OAuth `scope` is not promoted into a SoulAuth permission or universal authority.
- [ ] Raw access tokens do not enter ordinary logs or audit.
- [ ] Access-token subject semantics are explicit.
- [ ] Resource servers can distinguish a declared Actor context from a client-only
      context.
- [ ] A client-only authentication is never silently read as an authenticated Actor.

If an Actor-aware consumer cannot answer **does this artifact establish an Actor context
or only a client context?** — **BLOCKED.**

## 19 · Refresh continuation gate — REQUIRED IF SUPPORTED AND ENABLED

Only where the release formally supports refresh tokens or an equivalent continuation
capability:

- [ ] The lifecycle is frozen.
- [ ] Storage and client-side custody meet the contract.
- [ ] Rotation, reuse and replay semantics are verified where applicable.
- [ ] Containment semantics are explicit.
- [ ] The refresh artifact is not treated as an ordinary API access credential.

If unsupported: **N/A**, with the support rationale recorded.

## 20 · Control plane gate — REQUIRED

- [ ] Network exposure is explicitly restricted.
- [ ] A formal authentication boundary is used.
- [ ] A formal domain-scoped authorization policy is used.
- [ ] High-risk administrative operations meet the required assurance/freshness policy.
- [ ] SoulAuth admin authority is not read as application or Soulseed governance
      authority.
- [ ] No ungoverned default administrative credential exists.
- [ ] Every supported initial or emergency administrative path is formally governed.
- [ ] Required administrative audit correctly distinguishes initiator, runtime origin and
      target.
- [ ] Direct persistence mutation is not a supported administration path.

### Emergency administrative path — REQUIRED IF APPLICABLE

- [ ] It does not use an ungoverned shared default credential.
- [ ] Its authority scope is explicit.
- [ ] Using it produces the evidence the audit contract requires.
- [ ] It has an explicit owner and review policy.
- [ ] It cannot bypass canonical domain invariants.

If none exists: **N/A.** This checklist never requires creating a break-glass capability
in order to "satisfy production".

## 21 · Runtime gate — REQUIRED

- [ ] Liveness and readiness are clearly separated.
- [ ] Readiness does not guess dependency state with a fixed sleep.
- [ ] System time meets the authentication/protocol contract.
- [ ] Development-only debug or unsafe diagnostic behaviour is disabled or tightly
      restricted.
- [ ] Readiness genuinely covers the core dependencies this instance promises to serve.
- [ ] A feature-specific dependency failure does not escalate, contract-free, into total
      runtime failure.

## 22 · Replication gate — REQUIRED IF SUPPORTED AND DEPLOYED

First:

- [ ] The current release formally supports this replicated topology.

Then:

- [ ] Cross-replica protocol/authentication continuity passes.
- [ ] Enabled stateful protections cannot be bypassed by switching replica.
- [ ] Required one-time / replay-sensitive semantics still hold across replicas.
- [ ] AuthSession continuity meets the contract where applicable.
- [ ] Replicas do not hold conflicting key/trust lifecycle views.
- [ ] Instance-local caches are not the only holder of a critical security fact.
- [ ] Replica routing does not break the attribution or durability semantics the audit
      contract requires.

This verifies **cross-replica security semantics** — not that all state must use one
database, and it does not create a `SecurityStateStore` component.

## 23 · Operational ownership gate — REQUIRED

- [ ] The production owner is explicit.
- [ ] The security incident owner is explicit.
- [ ] The key/secret owner is explicit.
- [ ] The persistence owner is explicit.
- [ ] The backup/recovery owner is explicit.
- [ ] Audit and security review responsibility is explicit.
- [ ] Upgrade and release responsibility is explicit.
- [ ] The production change process is explicit.
- [ ] The incident escalation path is explicit.
- [ ] Recovery objectives are explicit.
- [ ] The most recent restore verification satisfies those objectives.

RPO/RTO may use whatever formal equivalents the organisation adopts; this page does not
mandate a vocabulary.

## 24 · Conditional feature gates

The gates below are all **REQUIRED IF APPLICABLE.** They may be N/A when the feature is
not enabled — with an explicit applicability rationale.

## 25 · Browser / BFF gate — IF ENABLED

- [ ] The browser architecture is frozen.
- [ ] The production browser flow has completed real end-to-end validation.
- [ ] The PKCE / transaction-binding controls the profile requires are verified.
- [ ] OIDC transaction correlation is not mistaken for complete application CSRF
      protection.
- [ ] Application logout, SoulAuth logout and token lifecycle are distinguishable.
- [ ] Origin, CORS and cookie settings match the real browser topology.

With a full BFF:

- [ ] Raw OAuth tokens are not exposed to the browser application.
- [ ] The BFF session cookie meets the cookie security baseline.
- [ ] CSRF defence is verified.
- [ ] The BFF resource proxy can only reach the declared resource boundary.
- [ ] The BFF cannot become an unrestricted outbound proxy.

## 26 · Federation gate — IF ENABLED

- [ ] External provider configuration is verified against the federation contract.
- [ ] External identities use source-qualified subject semantics.
- [ ] The IdentityBinding contract between external identity and ActorIdentity is
      explicit.
- [ ] External authentication stays separate from SoulAuth local Actor credentials.
- [ ] Provider secrets and client material live inside the production secret boundary.
- [ ] Provider failure/compromise impact is analysed against the declared trust scope.
- [ ] Federation events required by the audit contract have coverage.

## 27 · Mail / recovery delivery gate — IF ENABLED

- [ ] The production delivery provider is configured and available.
- [ ] Provider credentials live inside the production secret boundary.
- [ ] Verification and recovery links use the correct production public boundary.
- [ ] Security-sensitive artifacts are protected per the verification/recovery contract.
- [ ] Delivery failure is never silently interpreted as success.
- [ ] The sender/deliverability baseline the organisation requires is met.

## 28 · AIActor gate — IF ENABLED

- [ ] AIActors use the ActorIdentity contract rather than a fabricated HumanAccount.
- [ ] AIActor credentials stay separate from client authentication material.
- [ ] AIActor authentication is independently attributable.
- [ ] The AIActor authentication method in use is inside the supported surface.

If the method uses actor-held private credential material:

- [ ] The private material does not enter SoulAuth server custody.
- [ ] The verification material lifecycle is frozen.
- [ ] Freshness and replay semantics are verified against that method's contract.

## 29 · Soulseed integration gate — IF ENABLED

- [ ] The integration does not read SoulAuth private persistence as its contract.
- [ ] Trust validation and adapter translation responsibilities are separated.
- [ ] A client-only context cannot produce an Actor AuthContext.
- [ ] ActorIdentity reference/context semantics inside AuthContext are frozen.
- [ ] The Soulseed-specific IdentityBinding contract is frozen.
- [ ] The AuthContext wire contract is frozen.
- [ ] AuthContext provenance and validity boundaries are established.
- [ ] Assurance and freshness are not read directly as authority.
- [ ] The adapter does not perform runtime authority or governance decisions.

If those basic contracts cannot be explained: **Soulseed production integration =
BLOCKED.**

## 30 · Automatic blockers

Any of the following blocks sign-off outright:

**Release truth cannot be established** — the running artifact, release or supported
feature scope cannot be proven.

**Trust boundaries are inconsistent** — issuer, transport, proxy, identity namespace or
another required trust context cannot form a coherent contract.

**Required security / durability / recovery evidence is missing** — a critical gate has a
documented claim but no verifiable evidence.

**The privileged / secret boundary is unsafe** — an exposed control plane, a default
credential, raw secret leakage or another clear violation of the production contract.

**An enabled feature's contract is still vague** — a production feature is on while its
identity, authentication, authority, freshness or failure semantics remain unclear.

And the base rule:

```text
Any REQUIRED gate that cannot be proven  =  BLOCKED
```

## 31 · Final sign-off

### PASS

Only when all of the following hold:

- [ ] Every REQUIRED gate is PASS.
- [ ] Every applicable conditional gate is PASS.
- [ ] Every N/A has an explicit applicability rationale.
- [ ] No automatic blocker applies.
- [ ] The sign-off scope is complete.
- [ ] Evidence has an explicit relationship to that scope.

```text
Production Readiness Result = PASS
```

means:

> **This specific release, artifact, configuration, topology and enabled supported
> feature set meets the production baseline this version defines, and may accept
> production identity traffic under the organisation's own change and operations
> policy.**

### BLOCKED

Any REQUIRED gate failing, or being unprovable with applicable evidence, yields
`BLOCKED`. "We accept the risk for now" does not rename a BLOCKED baseline into PASS.

Organisations may have their own risk acceptance process:

```text
Organization Risk Acceptance
≠
SoulAuth Baseline PASS
```

## 32 · A PASS expires on material change

Production readiness is **a versioned, scoped, evidenced fact that can expire** — not a
one-time ceremony.

A material change is any change that could invalidate an assumption, evidence, trust
boundary, supported feature, configuration or deployment behaviour the last sign-off
depended on. Typical examples: release change, issuer change, key/secret architecture
change, persistence or schema change, token/subject contract change, browser architecture
change, replica topology change, control plane exposure change, Soulseed integration
contract change, a major security policy change.

After a material change, **re-verify the affected gates.** That is neither declaring all
prior evidence void, nor assuming the old PASS automatically stands.

## 33 · Production checklist at a glance

| Rule | Meaning |
| --- | --- |
| **Healthy ≠ Production-ready** | Running is not carrying real identity traffic |
| **A PASS belongs to a scope** | It is not a permanent product property |
| **Artifact identity ≠ Artifact authenticity** | Knowing what runs is not proving where it came from |
| **Enabled ≠ Supported** | Configuration cannot create support |
| **Happy path ≠ Sufficient evidence** | Negative paths must fail correctly |
| **N/A ≠ Skip** | Only genuine inapplicability qualifies |
| **Backup exists ≠ Recovery works** | A restore verification must actually have run |
| **Audit baseline ≠ Cryptographic integrity feature** | Integrity is required only where claimed |
| **Client context ≠ Actor context** | Production tolerates no identity ambiguity |
| **Replication configured ≠ Topology supported** | The release must support it first |
| **Risk acceptance ≠ Baseline PASS** | Organisational governance cannot rewrite the gate |
| **Material change ≠ Prior PASS still valid** | Affected gates must be re-verified |
| **Evidence without subject/scope ≠ Proof** | Evidence must point at this deployment |
| **Any unproven REQUIRED gate = BLOCKED** | Gates cannot pass on assumption |

## Exact contract source

This page owns the production readiness gates, sign-off scope, PASS/BLOCKED/N/A
semantics, evidence requirements, conditional applicability, automatic blockers and
material-change revalidation.

It does not own which OAuth profile exists, whether MFA exists, whether refresh tokens
exist, whether a break-glass path exists, whether audit integrity exists, whether
replicated deployment is supported, or which AIActor authentication method exists. Those
come first from [Project Status](../project/status),
[Authentication & Sessions](../reference/authentication-and-sessions),
[OIDC & Clients](../reference/oidc-and-clients),
[Configuration](../reference/configuration) and runtime/release evidence.

> **This checklist can only check whether an already-supported capability meets the
> production gate. It cannot make an unsupported or unfrozen feature production-ready.**

## Next

```text
Deployment              Can this deployment run correctly?
        ↓
Healthy Deployment
        ↓
Production Checklist    Can this exact deployment prove it is production-ready?
        ├── BLOCKED
        └── PASS
```

[Operations & Recovery](./operations-and-recovery) takes it from here: how to maintain a
proven trust state after go-live, and how to recover from key, persistence, configuration,
replica or security boundary failures without breaking identity continuity and historical
accountability.
