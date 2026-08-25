# Identity vs Authority

## Being identified is not the same as being allowed to act

[Actor Identity Model](./actor-identity-model) established the identity foundation:
**ActorIdentity answers "who is this Actor".** Knowing who, however, only solves the
identity problem. Even after SoulAuth has successfully authenticated an Actor, nothing
about *what that Actor may do* follows automatically.

When we designed SoulAuth we kept these questions apart at all times:

| Layer | The question it answers |
| --- | --- |
| **Identity** | Who is this Actor? |
| **Authentication** | Has the required identity been proven according to the authentication contract? |
| **Authority** | Why does the current principal have a basis to perform this class of operation in this domain? |
| **Authorization decision** | Is this one specific request allowed? |
| **Effect / outcome** | What actually changed, and what was the final result? |

They are related; they do not substitute for one another.

```text
Identity ≠ Authentication ≠ Authority ≠ Authorization Decision ≠ Effect / Outcome
```

A real runtime decision may additionally weigh authentication result, assurance,
freshness, current eligibility, target state and other domain preconditions. Those are
all *decision inputs*. None of them holding on its own means the final result holds.

## 1 · Knowing "who" is not permitting "what"

Suppose SoulAuth has established:

```text
ActorIdentity  = Alice
Authentication = successful
```

That means the authentication evidence presented has proven Alice's identity according
to the declared contract. It does not follow that:

```text
Alice may delete Project A
Alice may access every document
Alice may approve a payment
```

Those belong to authority and authorization. The same is true for an AIActor:

```text
ActorIdentity  = Agent-17
Authentication = successful
```

says only that the Actor proven right now is Agent-17. It does not follow that Agent-17
may use every tool on behalf of some human, or automatically inherits that human's
right to act.

> **An authentication result can be a trusted input to an authorization decision. It is
> neither the authority nor the decision.**

## 2 · Authority is domain-scoped, not an identity attribute

ActorIdentity has to stay stable for a long time. Authority does not work that way. It
answers:

> **Why does the current principal, in the current domain and context, have a basis to
> perform this class of operation?**

**Principal** here means the acting-subject context currently under authority
evaluation in a request or decision. It is not a new identity species and it is not the
persisted ActorIdentity. The same ActorIdentity can enter completely different decision
contexts at different times, through different clients, against different resources and
under different authority state:

```text
Persistent ActorIdentity
≠
Runtime Principal Context
```

Where authority comes from is defined by the corresponding domain contract. The SoulAuth
control plane can have its own roles, permissions and authority model; an application,
an infrastructure component or SoulseedOS can have an entirely different one. SoulAuth
does not define a cross-system

```text
universal_authority = true
```

For example, a principal may read Project A but not delete Project B; may manage
SoulAuth clients but not approve a financial operation inside an application; may hold
a permission in the SoulAuth control plane while holding no Soulseed governance
authority at all.

> **A stable identity may persist. Authority must stay domain-scoped.**

## 3 · Authentication conditions constrain decisions; they do not create authority

Authentication and authority must stay separate, but they are not unrelated. A
sensitive operation may require higher authentication assurance, more recent
authentication freshness, or re-authentication. Those can be preconditions of an
authorization decision. Even so:

```text
Higher assurance    ≠  More permission
Fresh authentication ≠  More authority
Reauthentication    ≠  Privilege escalation
```

A principal that lacks a permission does not acquire it by authenticating more
strongly. The reverse holds symmetrically — authority data cannot repair a failed
authentication:

```text
Authority cannot repair authentication failure
Authentication strength cannot repair missing authority
```

This symmetry is one of the most important boundaries in SoulAuth's runtime decisions.

## 4 · Authenticated is not currently eligible

Authentication establishes a fact: some Actor, at some time, proved its identity
according to the authentication contract. That historical fact is not rewritten when the
current state changes.

```text
T1  Authentication succeeds
T2  Actor is suspended
```

After T2, the authentication at T1 remains a fact that did hold. But:

```text
Authenticated
≠
Currently Eligible
```

When a new request arrives, the system still has to judge whether the current principal
may participate in this decision at all. Actor lifecycle, client status, revocation
state and other security state can all affect current eligibility.

> **A past successful authentication does not mean the principal may still enter every
> authority evaluation now.**

## 5 · Authentication continuity does not freeze authority

An AuthSession keeps an established authentication reality continuous for a bounded
period. Therefore:

```text
AuthSession               ≠  Authority
Authentication Continuity ≠  Authority Continuity
```

While an AuthSession is still valid, authority may already have changed:

```text
T1  Actor authenticates
T2  Permission X exists
T3  Permission X is revoked
T4  the same AuthSession is presented
```

T4 must not freeze the authority of T2 merely because the session still exists.

Likewise, SSO can reuse an applicable authentication context. It does not reuse
authority from another application, client or domain.

## 6 · Claims and tokens are interpreted only inside their own contract

After authentication, identity or authentication facts may be projected to a consumer
through a protocol. Those projections can be decision inputs. They do not thereby
acquire unlimited meaning.

### Claims

Correctly validated claims may be relied on within the declared consumer contract. But:

```text
Claims
≠
Authority by themselves
```

A claim stating `Actor Kind = AIActor` does not imply that every AIActor may call some
tool. An identity attribute or a verified communication channel does not generate a
permission either.

### Access tokens

A valid access token may only be interpreted according to the declared token/resource
contract:

```text
Valid Access Token  ≠  Universal Authority
Valid Access Token  ≠  Every resource operation is allowed
```

Successful token validation means the token satisfies the applicable validation
contract. Whether the current resource operation is allowed may still depend on
authority, resource policy, current eligibility, target state and other conditions.

The exact semantics of access tokens, ID tokens, OAuth `scope` and the protocol profile
are defined by [OIDC & Clients](../reference/oidc-and-clients).

## 7 · Having authority does not mean the operation can execute

Even when the principal holds the required authority, one question remains:

> **Does the current domain state allow this operation?**

A principal may hold permission to manage Actor lifecycle while the target is already in
a state that does not allow the requested transition:

```text
Authority satisfied
≠
Domain Preconditions satisfied
```

The reverse also holds: a failed domain precondition does not mean the principal never
had the authority.

```text
Authority Failure
≠
Domain Precondition Failure
```

Only by evaluating authority *together with* current domain preconditions does a request
reach an authorization decision.

## 8 · An authorization decision is not a change in reality

Suppose `Authorization Decision = Allow`. What can still happen: persistence failure,
dependency failure, concurrency conflict, other runtime failure. Therefore:

```text
Authorization Allow
≠
Operation Effect Succeeded
```

Keep distinguishing:

```text
Decision  ≠  Effect  ≠  Outcome
```

Authorization answers whether the request may be attempted. Effect answers whether real
state actually changed. Outcome answers what the whole operation finally produced.
Failure, recovery and historical accountability are defined by the corresponding
operations and audit contracts.

## 9 · SoulAuth still has its own administrative authorization

Separating identity from authority does not mean SoulAuth performs no authorization at
all. SoulAuth is itself identity infrastructure that has to be governed, and its control
plane must still decide whether an administrative principal may perform a management
operation.

SoulAuth therefore holds a **bounded administrative authority** — and that authority
belongs only to SoulAuth's own domain:

```text
SoulAuth Administrative Authority  ≠  Application Authority
SoulAuth Administrative Authority  ≠  Soulseed Governance Authority
SoulAuth Administrative Authority  ≠  Execution Authority
```

A principal may hold permission to manage SoulAuth clients. That does not make it an
administrator of a business system, and it certainly does not grant governance or
execution authority inside SoulseedOS.

SoulAuth's roles, permissions, permission assignment, delegation and administrative
decision mechanics are defined by the
[Administration](../reference/administration) reference. The accurate boundary is:

> **SoulAuth governs authorization for its own control plane. It does not try to become
> a universal authority engine for its consumers.**

## 10 · OAuth authorization is not universal authority

SoulAuth also implements OAuth/OIDC. Within it, `authorization request`,
`authorization code`, OAuth `scope` and `access token` belong to a specific
protocol/resource authorization context. These concepts carry real authorization
semantics — bounded by the applicable protocol contract:

```text
OAuth Authorization  ≠  SoulAuth Administrative Authority
OAuth `scope`        ≠  SoulAuth Permission
OAuth Grant          ≠  Universal Authority
```

Concrete OAuth/OIDC behaviour continues to be defined by
[OIDC & Clients](../reference/oidc-and-clients) and the applicable external normative
specifications. This page holds only the boundary: **protocol authorization must not be
inflated into a general right to act in other domains.**

## 11 · Delegation does not replace identity

Once humans and AIActors are both in the system, this boundary matters a great deal.
Suppose Alice creates or operates Agent-17. It does not follow that:

```text
Agent-17 = Alice
Agent-17 inherits all of Alice's authority
```

Alice and Agent-17 remain two different Actors. If one Actor needs to act on behalf of
another, an explicit and controlled authority relationship must exist:

```text
Delegation  ≠  Impersonation  ≠  Identity Transfer
```

Delegation can change what a principal may do within a specific scope. It does not
change who that principal is. A creator relationship, an operator relationship or a
client relationship does not by itself produce full representation.

If the system later supports on-behalf-of capabilities, it must still preserve the real
Actor, the acting principal, the authority basis and attribution — it must not erase the
identity boundary by "acting as someone else".

## 12 · AIActor: long-lived identity is not long-lived authority

An AIActor may run for a long time, work across many AuthSessions, and interact with
many applications, tools and resources. We want it to hold a stable ActorIdentity. But:

> **A stable, long-lived ActorIdentity does not mean permanent, unbounded authority.**

```text
Long-lived Identity
≠
Long-lived Authority
```

The system can keep asserting that Agent-17 is still the same Actor while it revokes a
permission, narrows a resource scope, terminates a delegation, requires a fresh
authentication, or re-runs the authorization decision for a new operation.

That is exactly what lets Actor-native identity and safe agent governance hold at the
same time.

## 13 · The Soulseed boundary

Inside the Soulseed ecosystem the same boundary applies:

```text
SoulseedAGI  defines Canonical Actor / Mind
SoulAuth     authenticates ActorIdentity
SoulseedOS   owns Governance / Execution
```

The authentication reality SoulAuth establishes can become a trusted input to
SoulseedOS through a formal integration contract. But:

```text
SoulAuth Authentication  ≠  Soulseed Governance Authority
Valid AuthContext        ≠  Execution Authority
```

SoulAuth stops here.

> **SoulAuth can tell SoulseedOS who has been proven and what authentication context
> applies. It does not decide for SoulseedOS how that Actor may ultimately be governed
> or executed.**

The overall relationship is explained in
[Soulseed & Mind OS](./soulseed-and-mind-os); the concrete AuthContext and integration
boundary are defined by [Soulseed Integration](../integrate/soulseed).

## 14 · Boundary at a glance

| Established fact | Does **not** imply |
| --- | --- |
| ActorIdentity exists | The Actor has authority |
| Identity resolved | The caller has been authenticated |
| Authentication succeeded | The current request is allowed |
| Higher assurance / freshness | More permission |
| Valid AuthSession | Authority is unchanged |
| Valid claims / token | Universal authority |
| Permission / role exists | This request will be allowed |
| Authority satisfied | Domain preconditions are satisfied |
| Authorization = Allow | The effect succeeded |
| SoulAuth admin authority | Application / Soulseed authority |
| A delegation exists | Identity has transferred |

The whole set compresses to:

```text
Who  ≠  Proof  ≠  Power  ≠  Decision  ≠  Reality
```

In SoulAuth:

- **ActorIdentity** establishes *who*.
- **Authentication** establishes *proof*.
- **Authority** provides a domain-scoped basis to act.
- **Authorization** decides *this request*.
- **Effect / outcome** tells us what actually happened.

## Next

SoulAuth's own identity/authority boundary is now in place. We know that reliably
knowing who an Actor is, is a precondition for governing action — never the right to act
itself.

[Soulseed & Mind OS](./soulseed-and-mind-os) widens the view: where SoulAuth sits among
SoulseedAGI, SoulseedOS, Soulseed apps and the larger AGI infrastructure, which part
each system owns, and why they must cooperate through explicit contracts.
