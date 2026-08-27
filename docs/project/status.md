# Project status

What you can rely on right now, and what you cannot.

## The readout

<Conformance />

Every number above came from running those four commands. Nothing here is an estimate.

## What works today

| Capability | Status |
|---|---|
| Email + password authentication | <Status kind="supported" /> |
| TOTP two-factor with backup codes | <Status kind="supported" /> |
| Account lockout and per-IP rate limiting, shared across replicas | <Status kind="supported" /> |
| Session issuance and revocation | <Status kind="tested" guard="integration.sh" /> |
| **AI actor identity and challenge–response authentication** | <Status kind="tested" guard="conformance::a6" /> |
| OIDC Authorization Code flow with mandatory PKCE (S256) | <Status kind="tested" guard="integration.sh" /> |
| RS256 ID tokens, discovery, JWKS | <Status kind="supported" /> |
| Refresh-token rotation with reuse detection and family revocation | <Status kind="supported" /> |
| Google and GitHub federated login | <Status kind="supported" /> |
| RBAC over human accounts | <Status kind="supported" /> |
| Bootstrap of the first administrator without database access | <Status kind="tested" guard="integration.sh" /> |
| Audit of authentication events | <Status kind="implemented" /> |

Nothing in this project is <Status kind="conformant" glossary /> or
<Status kind="certified" glossary />. No standards organisation has certified any of it,
and there is no certification process under way.

## What is not built

Described by the architecture, absent from this release:

| | Why it matters to you |
|---|---|
| <Status kind="planned" /> RBAC over `ActorIdentity` | An AI actor can authenticate, but its session carries no permissions. It reaches `/api/actors/me` and nothing else. |
| <Status kind="planned" /> A consolidated `Credential` object | Password and TOTP still live on the legacy `user` table. Nothing you call changes, but the model is not fully realised. |
| <Status kind="planned" /> Tamper-evident audit | The audit log is an ordinary table. **Do not present it as evidence.** |
| <Status kind="planned" /> Attribution at the identity root for human events | Human audit rows key on `user_id`. AI actor events already key on the identity root. |
| <Status kind="planned" /> A materialised `AuthenticationResult` | Internal runtime fact only. What reaches you — session token, OIDC claims — is stable. |
| <Status kind="planned" /> Formal assurance levels | Beyond `auth_time`, there is no assurance model. |

## Limits you will actually hit

These are not roadmap items; they are properties of the running system.

**`sub` is weaker than the model describes.** It carries the legacy `user` row key, so it
is stable for that row's lifetime — not the "never reassigned" guarantee OIDC Core
expects. Recorded as a named caveat in
[standards & conformance](/security/standards-and-conformance).

**Revocation lags across replicas.** Each instance caches resolved sessions; other
instances observe a logout or suspension within `AUTH_SESSION_CACHE_TTL_SECONDS`.
Single-instance deployments are unaffected.

**No `/revoke` and no `/introspect`.** SoulAuth revokes tokens internally, and access
tokens are of course rows it can look up — but neither RFC 7009 nor RFC 7662 is
implemented as a wire protocol. Verify ID tokens locally against JWKS.

**Docker Compose is for local use only.** CI runs it end to end on every push, so it
works — but its database credentials are development defaults and SurrealDB has no TLS.
Production goes through the [production checklist](/operate/production-checklist).

## How to read a status word

Six words, and **none of them implies another**:

<Status kind="implemented" glossary /> ·
<Status kind="supported" glossary /> ·
<Status kind="tested" glossary /> ·
<Status kind="conformant" glossary /> ·
<Status kind="certified" glossary /> ·
<Status kind="deprecated" glossary />

Click any badge for its exact meaning. The consequence worth internalising: code existing
(`implemented`) is not a promise to keep it (`supported`), and neither has anything to say
about matching a specification (`conformant`).

Where a badge on this site makes a claim rather than defining a word, it names the
assertion backing it. If you see one without a name, that is a bug —
`scripts/check-status.mjs` is supposed to catch it.

## Checking this yourself

```bash
git clone https://github.com/RcityHarold/SoulAuth && cd SoulAuth
cargo test                    # unit + conformance
./tests/integration.sh        # end to end against a real database
./tests/deployment_walkthrough.sh   # the deployment doc, executed
```

The ignored conformance tests are not skipped noise. Each is a written, runnable
assertion that the current implementation does not satisfy, carrying a comment naming
why. Removing an `#[ignore]` and finding it still passes is how a gap gets closed.

## Next

| | |
|---|---|
| What the boundaries are | [Specification](/spec/) |
| Which RFCs apply, and which do not | [Standards & conformance](/security/standards-and-conformance) |
| Before you deploy | [Production checklist](/operate/production-checklist) |
