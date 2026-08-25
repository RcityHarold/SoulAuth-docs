# Administration

## Who may change what in the SoulAuth control plane

The SoulAuth control plane is not **an ordinary API with higher privileges.** It lets an
authorized principal change **domain state SoulAuth itself owns** — ActorIdentity
lifecycle, credential state, IdentityBinding, client configuration, AuthSession
continuity and SoulAuth-local administrative authority.

But:

```text
Administrative Authority  ≠  Unlimited Authority
Administrative Authority  ≠  Permission to violate Domain Invariants
```

An administrator may request a state transition the domain contract already defines as
legitimate. It may not stand outside the identity, authentication, security and audit
contracts and redefine them.

> **An administrator in SoulAuth is not god mode.**

## 1 · The administrative decision model

Whether an administrative operation is allowed cannot be answered with
`authenticated? + is admin?`. A complete decision distinguishes at least:

```text
Administrative Principal Context
        ↓
Authentication Result
        ↓
Required Assurance / Freshness
        ↓
Current Principal Eligibility
        ↓
Domain-scoped Administrative Authority
        + Target / Operation Preconditions
        ↓
Authorization Decision
        ↓
Administrative Effect
        ↓
Outcome
```

**Principal context** answers *who is attempting this operation in the current
control-plane decision.* A principal is the acting subject in the current decision
context — not a new persistent identity species. It may be built on an ActorIdentity and
the applicable authentication context.

**Authentication** answers *whether the principal's identity has been proven as
required.* But:

```text
Authenticated Principal
≠
Administrative Authority
```

Knowing who the caller is does not yet answer why it may change the target state.

**Assurance / freshness** — a high-risk operation may require a specific assurance or
freshness. Even so:

```text
Administrative Permission  ≠  Authentication Assurance
Authority Satisfied        ≠  Authentication Freshness Satisfied
```

Stronger authentication creates no additional permission; more permission does not make
any old authentication automatically sufficient. Exact requirements belong to the
specific operation contract.

**Current eligibility** — a role or permission assignment existing does not mean the
principal may use it right now:

```text
Authority Assigned
≠
Principal Currently Eligible
```

Eligibility is judged against the currently effective identity, authentication and
authority contracts. Having held authority in the past does not extend administrative
capability indefinitely.

**Administrative authority** answers *why this principal is entitled to request this
class of SoulAuth-owned operation.* Authority is domain-scoped; being an admin does not
expand it into every domain.

**Target / operation preconditions** — even with correct authority, the target state
must permit the transition:

```text
Administrative Authority Satisfied
≠
Domain Preconditions Satisfied
```

Authority answers *are you entitled to ask?* A precondition answers *may this happen
now?*

**Authorization decision** — authority and preconditions are inputs. A decision must
still be made about this specific request:

```text
Authority
≠
Authorization Decision
```

**Administrative effect** — an allow decision is not a change in reality. Only once the
state transition holds does an effect exist:

```text
Authorization Decision
≠
Administrative Effect
```

**Outcome** — an effect having occurred does not mean the whole operation reached the
desired outcome; dependencies, notifications and follow-up work have their own results:

```text
Administrative Effect
≠
Outcome
```

This keeps the control plane from compressing permission, decision, state change and
result into a single "success".

## 2 · Administrative effect and propagation freshness are separate

An administrative operation has a canonical effect — an Actor lifecycle transition may
already be effective in its source domain. That does not prove every replica, cache,
session consumer, token consumer or other runtime participant has observed it:

```text
Administrative Effect  ≠  Propagation Freshness
Authority Effect       ≠  Authority Propagation Freshness
```

Effect answers *what is the canonical state now?* Freshness answers *when do other
consumers observe it?* Propagation, caching and replica contracts belong to the security
and operations references. This page does not promise instant global invalidation
without runtime evidence.

## 3 · Administration and configuration are separate

```text
Administration
≠
Configuration
```

Administration mainly changes **SoulAuth-owned runtime domain objects and administrative
authority state.** Configuration mainly defines **how the runtime, deployment and
security policy are configured.**

Being entitled to manage Actors or clients does not entitle you to modify deployment or
security configuration — and the reverse holds too. The exact configuration contract is
defined by [Configuration](./configuration).

## 4 · The administrative authority model

A control plane must not be swallowed by `is_admin = true`. At minimum:

```text
Permission
Role
Assignment
Authority to assign / grant authority
Administrative Operation
```

These are not one object.

**Permission** expresses **an administrative capability in the SoulAuth control plane.**
The exact vocabulary of permissions that formally exist in the current release is owned
by the **permission registry** — in this repository, `contracts/permissions.yaml`, which
also records where each permission is actually enforced. This page defines only how
permissions participate in the authority model.

**Role** — if the current authority model uses roles, a role aggregates permissions:

```text
Role
≠
Permission
```

### Definition and assignment are separate

```text
Role Definition        ≠  Role Assignment
Permission Definition  ≠  Permission Assignment
```

The first answers *what capability does this role contain*; the second answers *which
principal currently holds it.* Convenience of implementation does not license merging
them.

### Holding a permission is not authority to grant it

One of the most important administrative boundaries:

```text
Permission Possession
≠
Authority to Grant That Permission
```

A principal entitled to perform operation X does not naturally become entitled to grant
operation X's authority to someone else:

```text
Administrative Operation Authority
≠
Authority to Grant Administrative Operation Authority
```

Otherwise the control plane grows the most direct self-escalation path there is.

### Preventing self-escalation

A limited administrator must not grant itself stronger authority because it already
holds a permission. An assignment holds only where the principal genuinely has an
explicit **authority assignment / grant capability.** Exact assignment and grant
operations are defined by the current permission and administration contracts.

## 5 · Neither Actor Kind nor Client produces admin authority

Human and AIActor are identity classifications; administrator is control-plane
authority:

```text
Actor Kind               ≠  Administrative Role
Registered OAuth Client  ≠  Administrative Authority
```

Administrative authority comes from an explicit authority assignment, not from being a
Human or an AIActor. A client being able to participate in OAuth does not let it manage
the control plane.

## 6 · SoulAuth administrative authority does not spill over

```text
SoulAuth Administrative Authority  ≠  Application Business Authority
SoulAuth Administrative Authority  ≠  Soulseed Governance Authority
SoulAuth Administrative Authority  ≠  External Execution Authority
```

A principal entitled to manage SoulAuth clients does not become an administrator of
another application.

## 7 · Supported administration is not direct persistence mutation

A real administrative operation goes through a supported domain contract:

```text
Supported Administrative Mutation  ≠  Direct Persistence Mutation
Persistence Write Access           ≠  Administrative Authority
```

An infrastructure operator may technically be able to modify the database. SoulAuth's
semantic contract does not therefore consider that operator to hold legitimate
control-plane authority. Changing persistence around the formal domain operation sits
outside the supported administration contract and may constitute an
infrastructure/integrity incident.

## 8 · Administrative authority cannot bypass domain invariants

Even a principal with very high administrative authority may only request transitions
the domain model itself permits:

```text
Authorized Administrative Mutation
≠
Arbitrary State Mutation
```

An administrator cannot use an ordinary administrative operation to turn a Client into
an Actor, turn credential rotation into Actor replacement, turn a profile mutation into
an Actor Kind change, or let a binding change rewrite historical attribution.

> **Higher authority does not make the ontology weaker.**

## 9 · Administrative domains

This page does not redefine these domains' ontology. It defines how the control plane is
permitted to change them.

| Administrative domain | An operation may change | It does not redefine |
| --- | --- | --- |
| **ActorIdentity** | Currently supported lifecycle state | Actor Kind, identity history |
| **Credential** | Supported credential lifecycle state | ActorIdentity |
| **IdentityBinding** | The cross-domain relation | Source trust, historical attribution |
| **Client** | Registration, auth material, protocol configuration | ActorIdentity |
| **AuthSession** | Authentication continuity state | Authentication result, credential, token |
| **Administrative authority** | SoulAuth-local authority assignment | Application / Soulseed authority |

Explicit cross-domain effects may exist. Implicit state equations do not.

## 10 · ActorIdentity lifecycle administration

ActorIdentity lifecycle semantics belong to
[Actors & Profiles](./actors-and-profiles). Administration decides whether a principal
may request a supported transition.

### Reactivation is not trust resurrection

One of the most important high-risk boundaries in the control plane:

```text
Reactivation
≠
Trust Resurrection
```

An ActorIdentity re-entering the applicable active lifecycle does not resurrect
credentials, IdentityBindings, AuthSessions or administrative authority that were
independently revoked. Each domain keeps its own current, real state.

### Lifecycle authority does not satisfy target preconditions

```text
Lifecycle Authority
≠
Valid Lifecycle Transition by itself
```

Exact current transitions, preconditions and supported operations are defined jointly by
[Actors & Profiles](./actors-and-profiles), the current administrative contract and
[Project Status](../project/status).

## 11 · Credential administration

Credential ontology and the authentication runtime belong to
[Authentication & Sessions](./authentication-and-sessions). This page defines **who may
perform an administrative credential mutation.** Three boundaries hold.

### Credential administration is not profile administration

```text
Credential Administration
≠
Profile Administration
```

Changing an authentication capability is not a presentation update.

### Verification-material mutation is identity-critical

Changing the verification material used to prove an ActorIdentity can directly change
*who can successfully prove they are that Actor.* Such a mutation is an
**identity-critical administrative operation** and must carry explicit authority,
authentication requirements and target preconditions under the current contract.

### Administrative authority is not secret-disclosure authority

```text
Administrative Authority       ≠  Secret Disclosure Authority
Administrative Read Authority  ≠  Unlimited PII Visibility
```

A principal may be authorised to rotate, replace or revoke a credential without being
able to read the corresponding raw secret. The control plane obeys least privilege and
data minimisation too.

## 12 · IdentityBinding administration

Binding ontology belongs to [Actors & Profiles](./actors-and-profiles). This page covers
who may request changing that cross-domain relation.

### Binding management does not establish source trust

```text
IdentityBinding Administration
≠
Source Trust Establishment
```

Being entitled to manage a binding does not let a principal promote an arbitrary external
provider into a trusted identity source. External source trust belongs to the federation
and configuration contracts.

### Binding mutation does not complete authentication

```text
IdentityBinding Exists
≠
Authentication Accepted
```

Creating or changing a binding changes a relation. It does not create an external
authentication result, an AuthSession or administrative authority.

### Rebind is not an ordinary descriptive update

Where the current release supports rebinding:

```text
Rebind
≠
Ordinary Binding Update
```

because it can change which ActorIdentity an external identity resolves to in future. It
is a high-risk identity mutation, not profile editing. Whether the current release
supports it, and its exact authority, preconditions and wire contract, are defined by the
current administration contract and [Project Status](../project/status).

### Current binding mutation does not rewrite history

```text
Current Binding Mutation
≠
Historical Attribution Rewrite
```

An administrator may change a future relation. It may not reinterpret authentication or
audit attribution that already happened.

## 13 · Client administration

Client protocol semantics belong to [OIDC & Clients](./oidc-and-clients).
Administration performs controlled mutation on a registered client and its
administrative state. Distinguish client registration/identifier, client authentication
material and client protocol configuration — do not let a boundless `update client`
swallow all their security meaning.

### Administrative registration is not dynamic client registration

```text
Administrative Client Registration
≠
OAuth Dynamic Client Registration Protocol
```

The control plane having a client-creation capability does not prove SoulAuth implements
the standardised protocol.

### Client authentication material is separate from the client

```text
Client Authentication Material  ≠  Client registration / protocol identity
Client credential rotation      ≠  Client replacement
```

### Secret issuance is not secret retrieval

```text
Secret Issuance
≠
Secret Retrieval
```

Even if a supported operation generates a new client secret, it does not follow that an
ordinary client read can fetch the raw secret again later. One-time disclosure behaviour
must follow the real machine contract.

### Current client configuration does not rewrite past transactions

```text
Current Client Configuration
≠
Historical Authorization Transaction
```

Changing a redirect, client authentication material or other protocol configuration
today does not change what yesterday's transaction was. Current state may affect future
eligibility; it cannot rewrite history.

## 14 · AuthSession administration

AuthSession semantics belong to
[Authentication & Sessions](./authentication-and-sessions). Administration performs
controlled management on existing authentication continuity — with one absolute boundary:

```text
Administrative Authority
≠
Actor Impersonation Authority
```

### Session management is not minting authentication

```text
Administrative Session Management
≠
Authority to mint an authenticated Actor session
```

Where the current contract allows, an administrator may inspect permitted session
metadata and revoke an existing session. That confers no ability to "pick Actor A and
manufacture an authenticated session".

### An administrator cannot fabricate an authentication result

```text
Administrative Authority
≠
Authority to fabricate Authentication Result
```

Even after resetting a credential, changing verification material or reactivating an
ActorIdentity, the next real Actor authentication must still go through the
authentication contract.

### Session management does not disclose session credentials

```text
AuthSession Resource Representation
≠
Session Credential Disclosure
```

Managing a session does not require obtaining the raw capability to take it over.

### Session revocation changes only continuity

```text
AuthSession Revocation  ≠  Credential Revocation
AuthSession Revocation  ≠  Universal Access Token Revocation
```

Session administration may change only the domain state it genuinely owns.

## 15 · Administrative authority lifecycle

Administrative authority is itself current security state. Still distinguish:

```text
Authority Definition            ≠  Authority Assignment
Current Authority Assignment    ≠  Authority Projection Artifact
```

A role being revoked does not make old content inside a previously issued projection
artifact physically disappear. Whether the runtime performs a live lookup, uses a cache,
or relies on session or token projection must obey its own freshness contract:

```text
Administrative Authority Effect
≠
Authority Propagation Freshness
```

## 16 · Current authority does not rewrite historical authority

Modifying a role or permission today changes current and future authority only:

```text
Current Role / Permission State
≠
Historical Administrative Authorization
```

Revoking authority today does not mean yesterday's then-lawful operation was never
authorised. Granting authority today does not retroactively authorise an operation that
was unauthorised yesterday. Historical administrative authorization is interpreted by
**event-time authority context.**

## 17 · Concurrency, preconditions and retry

Security-sensitive administrative mutation must not treat concurrency as a database
accident:

```text
Administrative Concurrency Semantics
≠
Database Implementation Detail
```

What must hold is that at the boundary where the state transition actually commits, the
domain invariant still holds.

```text
Concurrency  ≠  Retry
```

Concurrency answers what happens when operations compete; retry answers what a caller
does when it does not know whether the previous operation produced an effect.

```text
Network Failure  ≠  Administrative Mutation Did Not Happen
Same Final State ≠  No Additional Observable Effects
```

A state change may have committed while the response was lost — do not blind-retry on a
transport failure. A repeated operation may reach the same resource state while producing
different audit, notification or other effects, so idempotency must be read against the
specific operation contract. These shared rules are inherited from
[API Conventions](./api-conventions).

## 18 · Administrative failures must keep their layers

```text
Authentication / Freshness Failure
Authority Failure
Domain Precondition Failure
Concurrency Conflict
```

```text
Authentication Failure  ≠  Authority Failure  ≠  Domain Precondition Failure
```

- **Authentication / freshness failure** — the principal may be known, but the current
  authentication does not meet the operation's requirement.
- **Authority failure** — correctly authenticated, but lacking the administrative
  authority.
- **Domain precondition failure** — authority held, but the target state does not allow
  the transition.

They require different remediation, retry and audit interpretation. Exact HTTP status and
machine errors are defined by the endpoint contract.

## 19 · An administrative surface is not unlimited visibility

The control plane is a privileged surface, but:

```text
Administrative Surface         ≠  Unlimited Read Authority
Administrative Read Authority  ≠  Unlimited PII Visibility
```

A principal that may only manage clients must not automatically obtain all Actor,
credential, binding or session data. Resource existence, data visibility and mutation
authority stay separate.

## 20 · Administrative attribution

Every security-sensitive mutation must stably distinguish **who performed the operation**
from **which object was operated on**:

```text
Administrative Initiator
≠
Administrative Target
```

When a principal changes another Actor's binding, initiator and target are different
semantic roles. Recording only the target ID and losing who performed the mutation is not
acceptable.

### An operation is not an audit event

```text
Administrative Operation  ≠  Audit Event
Audit Presence            ≠  Administrative Authority
```

An operation changes current state; an audit event records what happened. Audit is not an
authority source. The exact audit event contract is defined by [Audit](./audit).

### An administrator cannot rewrite audit history

```text
Administrative Authority        ≠  Authority to Rewrite Audit History
Current Administrative Mutation ≠  Historical Attribution Rewrite
```

Even the highest ordinary administrative authority does not acquire the semantic power to
rewrite security facts that already happened.

## 21 · Administration at a glance

| Boundary | Meaning |
| --- | --- |
| **Authenticated principal ≠ Administrative authority** | Proof of identity creates no control-plane power |
| **Role ≠ Permission ≠ Assignment** | Capability, aggregation and current holding are separate |
| **Permission possession ≠ Grant authority** | Being able to do is not being able to confer |
| **Administrative authority ≠ Unlimited authority** | An admin always has a domain scope |
| **Administrative authority ≠ Domain invariant bypass** | High privilege does not redefine legal state |
| **Persistence access ≠ Administrative authority** | Technical write capability is not semantic authorization |
| **Reactivation ≠ Trust resurrection** | Recovering one domain does not revive other revoked trust |
| **Administrative authority ≠ Secret disclosure authority** | Changing a credential is not reading it |
| **Session administration ≠ Actor impersonation** | Managing sessions cannot manufacture authentication |
| **Current authority ≠ Historical authority** | A role change today does not rewrite yesterday's decision |
| **Administrative effect ≠ Propagation freshness** | Canonical change and global observation are separate |
| **Initiator ≠ Target** | Who acted and who was acted on are attributed separately |
| **Current mutation ≠ Historical rewrite** | Control-plane state cannot rewrite the past |

Compressed:

```text
Principal Context
+ Authentication
+ Assurance / Freshness
+ Current Eligibility
+ Administrative Authority
+ Target Preconditions
        ↓
Authorization Decision
        ↓
One Domain-scoped Administrative Effect
        ↓
Outcome
```

with `Audit / Attribution` running horizontally throughout, and
`Effect ≠ Propagation Freshness` holding at all times.

## Exact contract source

This page defines the human-readable semantics of the administrative principal,
authority, the role/permission/assignment relationship, the mutation boundary, and
historical administrative authorization.

It does not invent the permission vocabulary — that is owned by the **permission
registry**. The exact HTTP wire is owned by the **published machine-readable contract**.
Which administrative operations the current release supports is published by
[Project Status](../project/status).

Domain objects belong to their owners: ActorIdentity to
[Actors & Profiles](./actors-and-profiles); credential and AuthSession to
[Authentication & Sessions](./authentication-and-sessions); Client to
[OIDC & Clients](./oidc-and-clients); audit events to [Audit](./audit); configuration to
[Configuration](./configuration).

> **An administrative semantic concept existing does not mean the current release has a
> corresponding endpoint.**

## Next

We now know who may be an administrative principal; how authentication, assurance,
eligibility and authority combine in a control-plane decision; why role, permission,
assignment and grant authority cannot be merged; why an administrator may not bypass
domain invariants, leak secrets or fabricate Actor authentication; why administrative
effect is not propagation freshness; and why current authority cannot rewrite historical
authority.

[Audit](./audit) is next: how SoulAuth records what happened, how Actor, principal,
client, target, operation and outcome are stably attributed, how current state stays
separate from historical fact, and what tamper-evident auditing does and does not
guarantee.
