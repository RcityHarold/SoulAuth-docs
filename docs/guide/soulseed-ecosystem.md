# Role in the Soulseed Ecosystem

SoulAuth is a general-purpose OpenID Connect provider, and you can run it
without ever hearing the word "Soulseed" again. But it was built as
infrastructure for a specific system, and that origin explains its most
unusual design decision: **SoulAuth refuses to be an authorization server.**

This page explains where SoulAuth sits, what it is forbidden from doing, and
why that restraint is worth copying even if you are not running the rest of
the stack.

## The stack in one paragraph

**SoulSeed-AGI** is a cognitive kernel. **SoulSeedOS** is the operating system
that runs on top of it, organized into numbered planes — P1 through P4 —
each owning one category of fact. SoulAuth is not part of the kernel and not
part of the OS. It is an **infrastructure component that plugs into
SoulSeedOS as a provider**.

Specifically, and in the language of the governing decision
(`P0-DECISION-09`):

> SoulAuth is positioned in SoulSeedOS V2 as the official **Identity /
> Authentication / Session / MFA / OIDC / SSO Provider** of the **P3 Identity,
> Authority & Credential Plane**.

Read that list carefully. It is long, and every word in it is about
*establishing who someone is and keeping that establishment alive*. The word
that is **not** in the list is *authorization*.

## The permanent inequality

The same decision states four non-equivalences that hold permanently. They are
the sharpest available summary of the boundary:

```text
Auth-local RBAC Role        ≠  OS Canonical Role / Standing
Auth-local Permission       ≠  OS PermissionGrant
SoulAuth membership_level   ≠  OS Permission, ≠ Mandate, ≠ Standing
AuthSession                 ≠  OS Second Wing Session
                            ≠  ConnectorSession
                            ≠  Browser Runtime Session
```

SoulAuth *does* have roles and permissions. It has to — something must decide
who is allowed to disable another user's account or read the audit log. But
those objects govern **SoulAuth's own administrative surface and nothing
else**. This is why every permission name in SoulAuth carries the prefix
`soulauth:`:

```text
soulauth:users.write
soulauth:security.write
soulauth:audit.read
```

The prefix is not decoration. It is a namespace assertion, mandated by
`DEC-10-05`, that makes the boundary visible at every call site: a permission
string that starts with `soulauth:` can never be mistaken for an
OS-level grant, no matter how many systems it passes through.

## The only legal path

So what happens when a SoulAuth role genuinely *should* affect what someone can
do in the OS? There is exactly one route:

> If SoulAuth's role / permission / membership_level needs to affect OS
> capability or eligibility to act, it must enter the OS Permission Service or
> Governance **as claim / entitlement material**, and the OS produces the
> `PermissionGrant`, `AccessTicket`, or corresponding governance result —
> carrying **Scope, Purpose, and Validity**.

And the line that the whole boundary rests on:

> When SoulAuth's roles and permissions enter the OS, their standing is
> **input material**, not an **authorization conclusion**.

```
   SoulAuth                          SoulSeedOS
   ────────                          ──────────
   role: soulauth:users.write
   membership_level: pro       ──▶   AuthClaimMaterial
   verified identity                 (PORT-P3-019)
                                          │
                                          ▼
                                   Permission Service
                                   / Governance
                                          │
                                          ▼
                                   PermissionGrant
                                   AccessTicket
                                   ⟨Scope, Purpose, Validity⟩
```

The material crosses the boundary. The *conclusion* is drawn on the far side,
by the component that is accountable for it.

## What SoulAuth must never write

The consequence of the above is a hard prohibition list. SoulAuth does not
produce, and must never be made to produce:

- `permission_grant_v1` — the OS canonical permission record
- `Mandate` — a standing authorization to act
- `Lease` — a time-bounded resource hold
- `GuardianDecision` — a governance adjudication
- `Receipt` — an evidentiary record of an action taken

`membership_level` deserves a specific note. It looks like a permission tier
and it is tempting to treat it as one. It is not: `P0-DECISION-09 §4.7` assigns
it to **Product Entitlement / Billing / Marketplace**. It describes what a user
has *paid for*, not what they are *permitted to do*. Two different systems, two
different failure modes, two different audit obligations.

Likewise, tenant and organization membership are **not** SoulAuth's
(`DEC-10-03`) — they belong to P2 Tenant Governance and Organization
Governance. SoulAuth holds no canonical membership.

## The integration contract

When SoulSeedOS consumes SoulAuth, the wire contract is fixed by
`P0-DECISION-10`:

| Item | Ruling |
| --- | --- |
| **ID Token** | RS256, verified **locally** against the JWKS endpoint. |
| **Lifetime** | **≤ 300 seconds.** 300 recommended, 120 for high-security deployments. |
| **`sid` claim** | **Mandatory** (`DEC-10-06`) — it is what makes coordinated logout possible. |
| **Refresh tokens** | **The OS never holds one.** |
| **Revocation** | Phase 0 accepts bounded staleness from the short token lifetime; introspection is a Phase 1 addition. |
| **AccessTicket vs PermissionGrant** | Two independent objects. The former is a short-lived admission credential; the latter is a durable authorization source-fact. |

Two practical consequences fall out of this table.

**The adapter makes almost no network calls.** The OS-side
`soulseed-adapter-soulauth` fetches JWKS and verifies tokens locally — that's
it. Identity verification does not put SoulAuth on the critical path of every
request, which means SoulAuth being briefly unavailable degrades new logins,
not the whole system.

**A pure SPA cannot integrate directly.** Because the OS holds no refresh
token, something must hold it, and that something must be a confidential
client. You need a Backend-for-Frontend. This is not a Soulseed peculiarity —
it is current OAuth security best practice — but here it is a contractual
requirement rather than a recommendation. See [The BFF Pattern](/integrate/bff).

## Why this matters if you are not using SoulSeedOS

Strip the proper nouns and a general principle remains:

**Authentication and authorization fail differently, so they should be owned
separately.**

An authentication bug lets the wrong person in. An authorization bug lets the
right person do the wrong thing. They have different blast radii, different
detection signatures, and different people responsible for reviewing them. When
one service owns both, every change to your business permission model becomes a
change to your login system, and the audit trail for "who authorized this"
gets tangled with "who signed in".

Most identity products blur this line because blurring it demos well. SoulAuth
holds it because the system it was built for treats "what authorized this
action" as evidence that has to survive scrutiny after the fact.

You are free to use SoulAuth's RBAC for your own application's permissions.
Nothing stops you. But the `soulauth:` prefix will be sitting in your
permission strings as a reminder that you crossed a line that the design drew
on purpose.

## Next steps

- [**SoulSeedOS Adapter**](/integrate/soulseedos) — the concrete wiring.
- [**Verifying ID Tokens**](/integrate/verifying-tokens) — local verification,
  step by step.
- [**Security Model**](./security-model) — what SoulAuth defends against on its
  own side of the boundary.
