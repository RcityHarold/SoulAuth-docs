# SoulSeedOS Adapter

How SoulSeedOS consumes SoulAuth. Read [Role in the Soulseed
Ecosystem](/guide/soulseed-ecosystem) first — this page is the wiring; that one
is the reasoning.

## What the adapter is

`soulseed-adapter-soulauth` is a Rust crate on the **OS** side. It is small on
purpose: two source files, one verifier, one JWKS provider.

```
soulseed-adapter-soulauth
├── lib.rs        SoulAuthVerifier, SoulAuthConfig, JwksProviderPort
└── jwks_http.rs  HttpJwksProvider — the only component that touches the network
```

Its dependency on `jsonwebtoken` is declared **decode-only**, with a comment
saying why: the OS never signs a token. That restriction is structural, not a
convention.

## What it does

1. Fetches JWKS from SoulAuth (throttled, and only on an unknown `kid`).
2. Verifies the RS256 signature locally.
3. Checks `iss`, `aud` and `exp`.
4. Requires `sid` to be present and non-empty.
5. Produces claim material for the OS to interpret.

That is the whole surface. Identity verification is a local computation, so
SoulAuth is not on the critical path of every OS request.

## Configuration

`SoulAuthConfig` takes the issuer, the client id, and a clock leeway. The
constructor validates:

```rust
SoulAuthConfig::new(issuer, client_id, leeway_seconds)?
```

::: tip Leeway has a hard ceiling, enforced in the constructor
An adjustable, unbounded leeway is equivalent to having no expiry check at all
— expired tokens sail through. The bound lives in the one constructor that can
build the config, so it cannot be sidestepped by constructing the struct
literally.
:::

## `sid` is a production gate

The adapter models `sid` as `Option<String>` and then **rejects** the `None`
case explicitly.

That may look redundant when SoulAuth already refuses to issue an ID token
without `sid`. It is not: "the issuer promises to always send it" and "the
verifier requires it" are two independent guarantees, and the verifier's job is
to hold even when the issuer is a different build, a different version, or not
SoulAuth at all.

`DEC-10-06` makes `sid` mandatory. Coordinated logout depends on it.

## JWKS refresh throttling

An unknown `kid` triggers a refresh, throttled by a minimum interval, with the
refresh count exposed for observation. Without throttling, a stream of tokens
carrying bogus `kid` values becomes an amplification attack against SoulAuth's
JWKS endpoint.

## The boundary the adapter enforces

The adapter converts a verified ID token into **claim material** — and stops.

```
SoulAuth ID Token  ──verify──▶  AuthClaimMaterial  ──▶  OS Permission Service
                                (PORT-P3-019)                    │
                                                                 ▼
                                                          PermissionGrant
                                                      ⟨Scope, Purpose, Validity⟩
```

The adapter never produces `permission_grant_v1`, `Mandate`, `Lease`,
`GuardianDecision` or `Receipt`. Those are OS conclusions drawn from the
material, by the component accountable for them.

Two related boundaries:

- **`membership_level` is not a permission.** It belongs to Product Entitlement
  / Billing / Marketplace (`P0-DECISION-09 §4.7`). It records what someone paid
  for, not what they may do.
- **Tenant and organization membership are not SoulAuth's** (`DEC-10-03`) —
  they live in P2 Tenant Governance and Organization Governance.

## The contract, in one table

| Item | Value | Source |
| --- | --- | --- |
| Signing algorithm | RS256 | `DEC-10-01` |
| Verification | Local, against JWKS | `DEC-10-01` |
| ID token lifetime | ≤300 s (300 default, 120 high-security) | `DEC-10-01` |
| Refresh tokens held by OS | **Never** | `DEC-10-01` |
| `sid` | Mandatory | `DEC-10-06` |
| Permission namespace | `soulauth:` prefix + structural tagging | `DEC-10-05` |
| AccessTicket vs PermissionGrant | Two independent objects | `DEC-10-02` |

## Revocation, and the staleness you are accepting

Phase 0 has no introspection endpoint. Revocation propagates by expiry: a
suspended account's tokens stop working within the ID token lifetime, so ≤300
seconds of staleness. Introspection is a Phase 1 addition.

This is worth stating plainly because it is a real property of the system, not
a gap to be discovered later. On the SoulAuth side, suspension takes effect
immediately — sessions deleted, OIDC tokens revoked, auth cache invalidated. The
bounded window is only for tokens already in a consumer's hands.

## Because the OS holds no refresh token, you need a BFF

The OS cannot renew on its own. Something must hold the refresh token and
maintain the session, and that something must be a confidential client. See
[The BFF Pattern](./bff).

## Next steps

- [**Role in the Soulseed Ecosystem**](/guide/soulseed-ecosystem) — the reasoning.
- [**Verifying ID Tokens**](./verifying-tokens) — for non-Rust consumers.
- [**The BFF Pattern**](./bff)
