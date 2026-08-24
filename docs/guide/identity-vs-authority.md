# Identity vs Authority

SoulAuth can tell you, with confidence, that the actor on the other end is who
they claim to be. That is where its answer stops.

> **Knowing who an actor is does not tell you why that actor may do something.**

This page is about the gap between those two sentences, and why SoulAuth
refuses to close it on your behalf.

## Five things that are not one thing

```text
Identity
   ↓
Authentication
   ↓
Authority
   ↓
Authorization Decision
   ↓
Execution
```

| Stage | Question |
| --- | --- |
| **Identity** | Who is this actor? |
| **Authentication** | Is the current evidence enough to trust that identity? |
| **Authority** | What legitimate basis does this actor have for the requested action? |
| **Authorization Decision** | Is *this specific request* allowed under current rules and context? |
| **Execution** | Did the action happen, and what came of it? |

This is not a demand that you deploy five services. It is a claim that these
five meanings cannot be compressed into one `authenticated = true` flag.

SoulAuth's contract to consumers covers the first two. It keeps a limited,
local authorization role over its own control plane. Everything past that
belongs to the systems accountable for it.

## Authenticated does not mean permitted

Suppose SoulAuth confirms:

```text
Actor = Alice
Authentication = successful
```

You now know you are talking to Alice. You do not know any of this:

```text
Alice may delete this project
Alice may read every document
Alice may move organizational funds
Alice may act on behalf of Bob
```

Same for a machine subject:

```text
Actor = Agent-17
Authentication = successful
```

tells you nothing about whether Agent-17 may send email for a human, spend
money, invoke a particular tool, or touch another actor's data.

The fuller shape:

```text
Actor Identity
      ↓
Authentication Evidence
      ↓
Authentication Result
      ↓
Applicable Authority
      +
Action / Resource / Context
      ↓
Authorization Decision
      ↓
Execution
```

An authentication result is a trustworthy **input** to an authorization
decision. It is not the decision.

## Authority is a relationship, not a property

Small systems write:

```text
user.role = admin
```

and that is fine, until it is read as *"admin is an unlimited power this actor
carries around."*

Authority is the basis an actor has for a particular action. It may come from
a role, a permission, a mandate, a delegation, a membership or a policy — and
whether a specific request succeeds also depends on:

```text
Actor
Action
Resource
Context
```

The same human may read Project A and not delete Project B. An AI actor may
read a calendar and have no standing to initiate a payment. A SoulAuth
administrator may manage OIDC clients and hold no financial approval anywhere.

> **A stable identity can last for years. Authority and authorization
> decisions must be free to change with relationship and context.**

### Entitlement is not identity

Subscriptions, plans, organization membership and feature entitlements can
feed authorization. They do not change who someone is.

A human upgrading from Free to Pro is the same actor. A lapsed subscription
does not alter a stable subject.

```text
Identity  ≠  Entitlement
```

Entitlement affects *what is available now*. It does not answer *who this is*.

## Where tokens and sessions stop

### Claims

Claims express verified identity facts. Some may legitimately feed an
authorization policy — a verified membership, a scope, an assurance level.

But:

```text
Identity Claims  ≠  Authority by themselves
```

A claim saying the subject is an AI actor does not mean "all AI actors may
call this tool." A verified email does not imply access to an organization.

### Access tokens

**ID tokens** express an authentication event and identity claims. They are
not general-purpose API access tokens.

**Access tokens** are different — within OAuth, a valid access token *is* an
authorization artifact for resource access, bounded by its audience, scope and
resource:

```text
Valid Access Token
→ may authorize access within its defined contract

Valid Access Token
≠ universal or cross-domain authority
```

A token valid at API A means nothing at API B, at SoulseedOS, at an external
connector, or in any real-world execution system. Its authority cannot exceed
the contract that issued it.

### AuthSession

A session keeps an established authentication continuous. It does not freeze
the permissions that existed when it started.

```text
AuthSession  ≠  Authority Lease
```

Authority can change while a session is still valid — the actor left an
organization, a delegation was revoked, a policy changed. They remain
authenticated; a given request is simply no longer allowed.

> **Authentication lifetime and authority lifetime are different lifecycles.**

### The word "authorization" in OAuth

You will see *authorization endpoint*, *authorization code*, *authorization
code flow*. That is not a legacy misnomer — OAuth is an authorization
framework, describing how a client obtains bounded access to protected
resources.

That authorization is real, and it is bounded by grant, audience, scope and
resource:

```text
OAuth Authorization  =  authorization inside a defined protocol boundary
OAuth Authorization  ≠  authority over every application and action
```

Completing an authorization code flow does not confer standing anywhere else.

## SoulAuth still needs local authorization

SoulAuth is itself infrastructure that must be governed. Someone has to decide
who may manage identities, manage credentials, register clients, revoke
sessions, read restricted audit data, or change security configuration.

Those operations need authorization, so SoulAuth keeps an **auth-local** RBAC
over its own control plane:

```text
SoulAuth Control Plane

Identity Administration
Credential Administration
Client Administration
AuthSession Revocation
Security Administration
Audit Access
```

Its boundary is explicit:

```text
SoulAuth Role        ≠  Application Business Role
SoulAuth Permission  ≠  External Execution Authority
SoulAuth Role        ≠  Soulseed Governance Role
```

Holding SoulAuth administrator rights means you may perform permitted
management actions **inside SoulAuth**. It does not make you a governor of
SoulseedOS or grant business permissions in someone else's application.

So the accurate statement is not "SoulAuth does no authorization." It is:

> **SoulAuth performs the local authorization its own infrastructure requires,
> and does not try to become a general authority engine for its consumers.**

This is why every permission name carries the `soulauth:` prefix — the
boundary stays visible at every call site.

## Delegation must be explicit

When humans and AI actors share a system, one inference is especially
dangerous:

```text
Alice authenticated
      ↓
Alice created Agent-17
      ↓
Agent-17 = Alice
      ↓
Agent-17 inherits Alice's authority
```

Every arrow after the second one is wrong.

Alice and Agent-17 are two actors. They may have a creator, operator or
ownership relationship — none of which produces representation.

```text
Actor A authenticated  ≠  Actor B may act as Actor A
```

For Agent-17 to act for Alice, an explicit authority relationship must exist:

```text
Human
   │
Explicit Delegation / Mandate
   ↓
AIActor
   │
Scoped Authority
   ↓
Authorization Decision
```

> **Representation must be established explicitly. It is never inferred from
> identity, creation, operation or client relationship.**

Who created an agent is not who the agent may act as. Who started it is not
whose authority it carries. The same rule applies to any actor acting for
another.

## Why AI actors make this sharper

The distinction predates AI. Human systems always had to separate *who is
this* from *may they do this now*.

AI actors amplify it. A long-running actor may work across many sessions and
interact with many applications, tools and resources. You want it to have a
**stable, durable identity** — and precisely because that identity is stable
and durable, it must not carry accumulated standing along with it.

A stable identity is desirable. A stable identity that quietly becomes
permanent authority is not.

## Next steps

- [**Actor Identity Model**](./actor-identity-model) — the objects this builds on.
- [**Role in the Soulseed Ecosystem**](./soulseed-ecosystem) — the same boundary as an integration contract.
- [**RBAC reference**](/reference/rbac) — what auth-local authorization actually covers.
