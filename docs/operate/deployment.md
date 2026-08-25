# Deployment

## Putting SoulAuth into a real environment without changing its semantics

The preceding pages answered what SoulAuth is, how an application integrates, how an
ActorIdentity is authenticated, and what contracts Client, token, AuthSession and the
control plane each carry. From here the question becomes:

> **How do those established semantics enter a real runtime environment and keep holding
> across startup, restart, traffic shifts and infrastructure change?**

Deployment changes **how the system physically runs.** It does not redefine
ActorIdentity, credentials, authentication, IdentityBinding, Client, authority or
historical fact:

```text
Deployment Topology
≠
Identity Ontology
```

A runtime may change process, container or host, and — where the release supports it —
run several replicas. None of that turns SoulAuth into a different identity system.

## 1 · The deployment boundary

A common deployment abstracts to:

```text
External Client / Consumer
        ↓
Public Network / Protocol Boundary
        ↓
SoulAuth Runtime
        ↓
Durable Infrastructure / Dependencies
```

The control plane has its own controlled exposure boundary.

This is a **topology sketch.** It is not a new canonical architecture figure, and it does
not require every deployment to run a separate reverse proxy, key service or control
plane process. [SoulAuth Architecture](../concepts/architecture) defines the logical
architecture; this page explains how those responsibilities enter a real deployment
boundary.

## 2 · Architecture component is not deployment unit

```text
Architecture Component  ≠  Deployment Unit
One Service             ≠  One Domain
```

Even when identity, authentication, AuthSession, protocol and the control plane are all
carried by one service process, their semantic boundaries remain. Simplicity in
deployment is not a merge of domains.

## 3 · Public protocol exposure is separate from control plane exposure

```text
Public Protocol Exposure
≠
Control Plane Exposure
```

The public authentication/protocol surface may need to be reachable by external clients.
The control plane should be governed separately by administrative authentication,
authorization, network boundary and deployment policy.

Sharing a process, a host or even an ingress does not mean **they should share a public
exposure policy.**

## 4 · Consumer access is not infrastructure access

Applications, SoulseedOS and other consumers should use SoulAuth through its **formally
supported interfaces** — not by reaching persistence, key/secret infrastructure or
internal runtime state directly.

```text
Consumer Access          ≠  Infrastructure Access
Supported Administration ≠  Direct Persistence Mutation
```

Persistence is internal infrastructure. It is not a second control plane that bypasses
the domain contract.

## 5 · Topology patterns

These describe topology — not different SoulAuth product editions.

### Local / development

A development deployment exists to start quickly, debug and validate an integration. But:

```text
Development Deployment
≠
Production Security Baseline
```

Exceptions allowed for convenience in development must not be copied into production
without an explicit production review. Which development artifacts, containers, compose
files or local configuration the current release provides comes from the current
deployment artifacts and [Project Status](../project/status).

### Single-runtime deployment

A production deployment is not illegitimate merely because it runs one SoulAuth runtime.
Nor does running one runtime prove production readiness:

```text
Single-runtime Topology
≠
Production Readiness
```

Readiness is judged by [Production Checklist](./production-checklist).

### Replicated deployment, where supported

Where the release formally supports it, several runtime instances may serve traffic
together. But:

```text
Replica Lifecycle
≠
ActorIdentity Lifecycle
```

A replica may restart, be replaced or disappear. ActorIdentity, credentials, AuthSession,
Client and historical fact must not be redefined because one replica vanished.

Whether the current release formally supports multiple replicas, and to what extent, must
be confirmed by [Project Status](../project/status) and runtime evidence. This page does
not convert an architectural possibility into a support claim.

## 6 · An ephemeral runtime is not a durable source of truth

One of the real deployment dividing lines is **which state may live only in the current
process, and which facts must survive process lifetime.**

Any canonical fact or security state that must keep holding across requests, restarts,
failover or applicable replica switches must not depend on ephemeral instance-local
memory as its only source of truth:

```text
Ephemeral Runtime
≠
Durable Source of Truth
```

However:

```text
Must survive instance loss
≠
Must live in one database
```

A contract may maintain its semantics through durable state, coordinated state, a
cryptographically protected artifact or another supported mechanism. Deployment requires
only that **necessary continuity does not disappear with a temporary runtime.**

## 7 · Durability is not permanent retention

```text
Durability
≠
Permanent Retention
```

Different domains have different lifetimes, expiry, retention and deletion contracts. A
short-lived protocol state may need to be durable for a bounded window; that does not
turn it into a long-lived historical record.

## 8 · Persistence does not define ontology

```text
Persistence Infrastructure  ≠  Identity Ontology
One Database                ≠  One Domain
```

A database schema cannot become the source of truth for ActorIdentity, credential or
IdentityBinding semantics in reverse. Even where several domains share one physical
database, they keep different canonical contracts. Which persistence implementations the
current release supports belongs to the current deployment/runtime contract, not to this
page's long-term semantics.

## 9 · Operational logs are not audit

A deployment usually has logs, metrics, traces and monitoring. But:

```text
Operational Log  ≠  Audit Record
Container Log    ≠  Durable Audit History
```

Operational observability supports diagnosis, performance and runtime investigation.
Audit carries historical accountability. Any current audit integrity capability is
defined by [Audit](../reference/audit) and [Project Status](../project/status).

### Observability must not become a secret exfiltration channel

```text
Observability
≠
Secret Exfiltration Channel
```

Centralised collection of logs, metrics or traces does not dissolve the secret and token
protection boundary. Deployment convenience is never a reason to write raw credentials,
tokens or other sensitive material into ordinary telemetry.

## 10 · Key/secret lifecycle does not follow replica lifecycle

```text
Key / Secret Lifecycle
≠
Container / Replica Lifecycle
```

Material that must maintain trust continuity across restarts must not be regenerated
contract-free because a pod or process was recreated. The reverse holds too: keys may
rotate, retire, be revoked or replaced — but by a **declared key/secret lifecycle**, not
because "the container happened to restart".

## 11 · Configuration is not secret material

```text
Configuration
≠
Secret Material
```

Configuration decides how the runtime runs, which dependencies it references and which
policies apply. Secret and key material carry their own confidentiality, custody and
lifecycle. Configuration sources and key/secret reference semantics are defined by
[Configuration](../reference/configuration); this page keeps the boundary at deployment
time.

## 12 · A runtime image is not a secret store

```text
Runtime Image
≠
Secret Store
```

Long-lived runtime secrets must not be baked into a widely distributed software artifact
for deployment convenience. Software artifacts and runtime secrets carry different
lifecycles and access boundaries.

## 13 · Actor-held credential material is separate from server secrets

Where an authentication method uses actor-held private credential material:

```text
Actor-held Private Credential Material
≠
SoulAuth Server Secret
```

Its custody boundary must not be pulled back into the SoulAuth server secret store
because the deployment shape changed. The current AIActor authentication methods and
verification material are defined by
[Authentication & Sessions](../reference/authentication-and-sessions) and the current
release. This page does not create authentication methods through a deployment document.

## 14 · Internal listen address is separate from the public issuer

The listen address answers where the process receives traffic on the local network. The
public issuer answers which identity/trust domain external protocol consumers treat as
the formal issuer:

```text
Internal Listen Address
≠
Public Issuer
```

A runtime may listen on a private address while external clients see an entirely
different public origin. Deployment convenience must not merge the two concepts.

### Deployment must not create a split-brain protocol view

Where the profile uses a public issuer, the public endpoint, proxy reconstruction,
metadata and what the runtime actually issues must present one consistent declared
protocol view. A deployment where clients reach one public origin while artifacts claim
an unrelated issuer cannot expect consumers to establish trust correctly. Exact issuer
semantics belong to [OIDC & Clients](../reference/oidc-and-clients).

### An issuer change may be a trust migration

```text
Issuer Change
≠
Ordinary Hostname Edit
```

A deployment change that alters the declared issuer may change downstream trust and
subject semantics. It cannot be handled as an ordinary network rename. Migration
procedures live in [Operations & Recovery](./operations-and-recovery),
[OIDC & Clients](../reference/oidc-and-clients) and
[Configuration](../reference/configuration).

## 15 · The external production boundary needs transport protection

An external boundary carrying real production authentication and protocol traffic should
satisfy the transport protection the current security baseline requires — for a typical
public deployment, a protected HTTPS boundary.

Whether a deployment has met *all* production conditions is judged by
[Production Checklist](./production-checklist). This page locks only:

> **The external identity-protocol boundary in production must not treat transport
> protection as an unrelated optimisation.**

## 16 · Forwarded metadata is not automatically trusted

Behind a reverse proxy or ingress, SoulAuth may need the external request context the
proxy supplies. But:

```text
Internet-supplied Forwarded Metadata
≠
Trusted External Request Context
```

Enabling proxy support does not make any host or forwarded information an internet caller
submits trustworthy. Only a declared **trusted proxy boundary** can establish that
context. Exact headers and proxy configuration come from the current
deployment/configuration contract.

## 17 · Process started is not runtime ready

```text
Process Started
≠
Runtime Ready
```

Before accepting the traffic it promises to carry, a runtime must satisfy the applicable
critical dependencies and initialisation requirements.

## 18 · Reliable system time is a security dependency

A great deal of authentication and protocol semantics is time-bounded: expiry, freshness,
key lifecycle, time-bound security state.

> **Reasonably trustworthy system time is an operational dependency of time-bound
> authentication and protocol security.**

If several runtimes disagree significantly about time, the same artifact can receive
inconsistent security decisions. This page does not prescribe a synchronisation
technology or an allowed clock skew — those belong to the security/protocol contract.

## 19 · Liveness and readiness are separate

```text
Liveness
≠
Readiness
```

**Liveness** asks whether the process is still in a state where it can keep running.
**Readiness** asks whether this instance meets the conditions to safely accept the traffic
it declares.

An instance may be alive and temporarily not ready. Equally, a feature-specific dependency
failing need not mechanically crash the whole runtime.

## 20 · Core and feature-specific dependencies are separate

```text
Core Runtime Dependency
≠
Feature-specific Dependency
```

An optional integration failing temporarily does not necessarily mean SoulAuth cannot
continue serving other ready capabilities. Readiness should be judged from what this
instance promises to provide and which dependencies those capabilities actually need —
never as a blanket "any adapter failure means the identity service is down".

## 21 · Elapsed time is not dependency readiness

Startup ordering cannot be replaced with:

```text
start dependency
sleep N seconds
start SoulAuth
```

because:

```text
Elapsed Time
≠
Dependency Readiness
```

What is needed:

```text
Required Dependency Ready
        ↓
SoulAuth Initialization
        ↓
SoulAuth Ready
        ↓
Traffic Accepted
```

The mechanism comes from the current runtime/deployment contract.

## 22 · Replicated deployment, where supported

Where several runtimes share traffic, routing and failover must not change identity,
protocol or security semantics. A request beginning on instance A and continuing on
instance B must not break the declared protocol contract merely because the runtime
differs.

### Protocol continuity is not one shared database

```text
Protocol Continuity
≠
Mandatory Shared Database
```

Cross-request or cross-replica semantics may be maintained through durable state,
coordinated state, a protected artifact or another declared mechanism. This page requires
only that **the contract still holds after failover** — not that all state share a single
database or storage technology.

### A runtime replica is not an ActorIdentity source of truth

```text
Runtime Replica
≠
ActorIdentity Source of Truth
```

Instance-local caches may exist. They must not become the only, unrecoverable ActorIdentity
fact. Replacing a replica must not change *who this Actor is.*

### Different security state, different consistency requirements

Not all security state needs one consistency model. What is required is that **each
stateful protection satisfies its own declared atomicity, consistency and freshness
requirement**:

```text
Cross-replica Security Correctness
≠
One Universal Shared Store
```

This page defines no `SecurityStateStore` and mandates no Redis, SurrealDB or other
infrastructure.

### Replicated is not stateless

```text
Replicated
≠
Stateless
```

Running several runtimes does not mean SoulAuth holds no state. What must hold is that
critical identity, security and protocol semantics do not depend on one short-lived
instance as their sole holder.

## 23 · An optional dependency is not a core dependency

```text
Optional Integration  ≠  Core Deployment Dependency
Standalone SoulAuth   ≠  Soulseed Deployment Dependency
```

Soulseed integration existing does not remove SoulAuth's ability to stand alone. An
optional integration failing should first affect the features that genuinely depend on it,
not escalate unconditionally into total identity service failure.

## 24 · Deployment does not guarantee zero-downtime upgrade

```text
Multi-replica Support
≠
Zero-downtime Upgrade Guarantee
```

Whether an upgrade can complete without interruption also depends on release
compatibility, persistence compatibility, configuration compatibility, protocol/session
compatibility, key lifecycle and mixed-version behaviour. Migration and upgrade procedures
are defined by [Operations & Recovery](./operations-and-recovery). Having several replicas
does not imply every release can be rolling-upgraded.

## 25 · Deployment health

This page ultimately answers one question:

> **Can this deployment currently run correctly according to the contract it declares?**

A healthy deployment can answer:

- **Runtime** — is it running and has it completed necessary initialisation?
- **Durable dependencies** — is the durable infrastructure the promised capabilities need
  available?
- **Security dependencies** — are the required key, secret and time dependencies usable?
- **Network / protocol boundary** — do the external exposure, proxy and public protocol
  view match the declared contract?
- **Readiness** — is this instance genuinely fit to accept the traffic it declares?

Exact images, ports, health and readiness endpoints, persistence products, proxy keys and
configuration keys must all come from the current deployment/configuration contract. This
page does not invent them.

## 26 · A healthy deployment is not a production-ready deployment

```text
Healthy Deployment
≠
Production-ready Deployment
```

This page can establish that SoulAuth runs in this environment according to its declared
contract. It cannot establish on its own that backups have been rehearsed, recovery has
been verified, monitoring meets production requirements, operational ownership is clear,
or the production security gate has passed. Those are judged by
[Production Checklist](./production-checklist).

## 27 · Deployment at a glance

| Boundary | Meaning |
| --- | --- |
| **Deployment topology ≠ Identity ontology** | Runtime shape does not redefine ActorIdentity |
| **Architecture component ≠ Deployment unit** | A logical responsibility needs no dedicated process |
| **One service ≠ One domain** | Sharing a process does not merge semantic domains |
| **One database ≠ One domain** | Shared persistence does not merge ontologies |
| **Public protocol exposure ≠ Control plane exposure** | Exposure is governed separately |
| **Consumer access ≠ Infrastructure access** | Consumers use supported contracts |
| **Ephemeral runtime ≠ Durable source of truth** | Facts that must survive restart cannot live only in memory |
| **Durability ≠ Permanent retention** | Recoverable is not kept forever |
| **Key / secret lifecycle ≠ Replica lifecycle** | Trust material does not follow pod accidents |
| **Runtime image ≠ Secret store** | Artifacts and long-lived secrets stay apart |
| **Internal listen address ≠ Public issuer** | Network address is not protocol identity |
| **Forwarded metadata ≠ Trusted request context** | Only a trusted proxy boundary establishes it |
| **Process started ≠ Runtime ready** | Starting is not being fit for traffic |
| **Liveness ≠ Readiness** | Being alive is not being serviceable |
| **Elapsed time ≠ Dependency readiness** | A fixed sleep is not proof |
| **Protocol continuity ≠ One shared database** | Continuity does not fix a storage implementation |
| **Replicated ≠ Stateless** | Scaling out does not remove identity and security state |
| **Healthy deployment ≠ Production-ready** | Running is not having passed the production gate |

Compressed:

```text
Declared Architecture Semantics
        ↓
Deployment Topology
        ↓
Runtime + Required Dependencies
        ↓
Network / Exposure Boundary
        ↓
Durable Continuity
        ↓
Readiness
```

One principle:

> **Deployment may change where SoulAuth runs, how many instances run, and how it
> connects to infrastructure — it must never change what SoulAuth considers an
> ActorIdentity, an authentication, an authority or a trustworthy history.**

## Exact contract source

This page defines the deployment boundary, topology patterns, the runtime/durable state
separation, network exposure, the key/secret lifecycle boundary, health and readiness, and
the semantic requirements of a replicated topology.

It does not define an official container image, runtime port, health or readiness
endpoint, persistence implementation, multi-replica support status, proxy header
configuration, deployment configuration keys, migration command or upgrade procedure.
Those come from the current deployment artifacts, the config registry, the runtime
implementation and [Project Status](../project/status).

> **Multi-replica being an architecture or deployment pattern does not make it formally
> supported in the current release.**

## Next

[Production Checklist](./production-checklist) takes over: whether this specific
deployment meets production sign-off conditions.
