# Register a Client

## Registering a software client that can enter a SoulAuth protocol flow

Before a human or an AIActor authenticates through an application, SoulAuth first needs to
know:

> **which software is participating in the protocol?**

In OAuth / OpenID Connect that participant is the **Client**.

```text
Client
≠
Actor
```

Actor answers *who is being authenticated.* Client answers *which software is
establishing a protocol relationship with SoulAuth.*

Registering a client therefore creates no human, no AIActor and no ActorIdentity, and it
completes no Actor authentication. It does exactly one thing:

> **it makes a software client ready to enter subsequent flows, within the protocol and
> security boundaries the current release supports.**

## Before you start

**1 · You know which software is actually the client.** A browser application, a
BFF/server application, an installed application, an agent application — which component
truly participates in the protocol? An application serving an AIActor does not make the
application an AIActor. AI and agents are a usage scenario; they do not create a new
OAuth client ontology.

**2 · You know where the client actually runs.** The question that matters is not whether
it serves a human or an AIActor, but **which trust boundary the software runs in, and
whether it can reliably protect client authentication material.**

```text
Client Security Boundary
≠
Actor Kind
```

**3 · You know which supported protocol path it will use.** The configuration must match
a profile the current release genuinely supports *and* the application genuinely needs.
Do not register extra capability "for later". Exact profiles belong to
[OIDC & Clients](../reference/oidc-and-clients).

**4 · You know the redirect boundary**, if the flow needs a redirect — where the protocol
result should safely return to once authentication or authorization completes.

**5 · You hold the administrative authority to create a client.** Client registration is
an administrative/control-plane operation:

```text
Registered Actor
≠
Permission to Register Clients
```

Exact permissions, roles and authority come from
[Administration](../reference/administration) and the current permission contract.

## Step 1 · Identify the client security model

| Runtime boundary | Reasonable assumption about long-lived client authentication material |
| --- | --- |
| **Server-controlled runtime / BFF** | May establish a reliable secret custody boundary |
| **Browser / user-controlled runtime** | Must not be assumed able to keep a confidential secret |
| **Installed / user-controlled runtime** | Being "not a browser" does not imply a secret can be kept |
| **Agent runtime** | Depends on the real deployment boundary |

This table helps you understand the client's security assumptions. It does **not** imply
SoulAuth has canonical enums like `client_type = browser` or `client_type = agent`.

Public/confidential classification describes a **protocol security assumption** — not an
Actor Kind, and not a universal trust level.

## Step 2 · Prepare the client configuration

Exact field names, wire format and registration schema come from
[OIDC & Clients](../reference/oidc-and-clients) and the current machine-readable
contract. Semantically you generally need to settle the following.

### Client identity / metadata

Which software is being registered? The client contract needs whatever resource/protocol
identity this software participant requires. But:

```text
OAuth `client_id`  ≠  ActorIdentity
OAuth `client_id`  ≠  Internal Client Resource ID by definition
```

Whether both an internal client resource identifier and an OAuth `client_id` exist is
decided by the current client contract. This page does not merge namespaces behind a
vague phrase like "client identifier".

## Step 3 · Configure the redirect boundary, if applicable

For redirect-based flows, be explicit about **where SoulAuth's protocol response is
allowed to return.**

```text
Redirect URI
≠
Arbitrary Application Return URL
```

A registered redirect URI is a **protocol security boundary**, not a general-purpose
application page router. An application may internally carry something like
`return_to=/projects/123` — that answers where the application wants to go after login. It
is a different question from the OAuth/OIDC redirect boundary.

Exact redirect matching rules are not defined here. Do not add prefix matching, custom
normalisation, wildcards or any other behaviour the contract has not declared.

## Step 4 · Select only the required protocol capabilities

The configuration should contain only capabilities the application genuinely uses and the
release formally supports. If the current profile uses authorization code, PKCE, client
authentication and a specific redirect model, the client must satisfy those contracts.

This page does not redefine grant types, response types, OAuth `scope`, claim mapping,
client authentication methods or PKCE applicability.

## Step 5 · Register through the supported administrative interface

A client cannot be registered by modifying SoulAuth's private persistence:

```text
Client Registration
≠
Direct Persistence Mutation
```

Create the client through the administrative/control-plane contract the release formally
supports, so registration passes the applicable validation, administrative authority,
security policy, audit and lifecycle invariants.

### Initial provisioning, only if the release provides it

Some deployments may have an initial provisioning or bootstrap path. Where the release
genuinely provides one, use its own formal contract — and keep:

```text
Being the first registered Client
≠
Administrative Authority
```

Creation order does not make a client an administrator, and initial provisioning must not
become a permanent alternative entrance that bypasses control-plane domain rules. This
page does not assume a bootstrap mechanism exists.

## Step 6 · Protect client authentication material, if the method uses it

What form the material takes, who generates it, whether it is displayed once, how it is
registered, and how it rotates or is replaced all come from the current client
authentication contract. This page locks the long-lived boundaries.

### Client authentication material is not an Actor credential

```text
Client Authentication Material
≠
Actor Credential
```

One proves **which software client is participating**; the other proves **which Actor is
authenticating.** Appearing in the same flow does not merge them.

### A public environment must not masquerade as a confidential one

If a runtime cannot reliably protect a long-lived secret, do not hard-code one into it for
configuration convenience:

```text
Unable to protect Client Authentication Material
≠
Permission to embed it anyway
```

Confidential material must not enter a browser bundle, a public repository, ordinary logs,
or any distributable client artifact without a proper secret boundary. Which method to use
instead is decided by the current client profile.

### Client authentication material has its own lifecycle

```text
Client Authentication Material Lifecycle
≠
Actor Credential Lifecycle
```

Changing client authentication material changes no human or AIActor credential. Exact
lifecycle operations belong to [OIDC & Clients](../reference/oidc-and-clients) and
[Administration](../reference/administration).

## Step 7 · Verify the registration

The question is not "did a row appear in the database?" but:

> **is this client ready to participate in subsequent flows, under the intended security
> boundary and the current protocol contract?**

- [ ] The registration was accepted by the current administrative contract.
- [ ] The resource/protocol identity the client contract requires exists.
- [ ] Redirect configuration matches the real application boundary, where applicable.
- [ ] The client security model matches the real runtime environment.
- [ ] Every requested protocol capability is inside the supported surface.
- [ ] Client authentication configuration is correct, where applicable.
- [ ] Any client authentication material has entered the correct custody boundary.

Verify using the registration result, or a supported administrative read/inspection
surface if the release provides one. This page does not assume a separate client
inspection endpoint exists.

## Expected result

> **Client is ready for protocol flow.**

It does not mean a human authenticated, an AIActor authenticated, the client gained
administrative authority, or the application gained resource authority:

```text
Client Registration Success
≠
Actor Authentication Success
```

## If registration fails

Do not start from the database. Determine which boundary failed.

| Failure | First place to check |
| --- | --- |
| **Administrative operation rejected** | Caller authority / [Administration](../reference/administration) |
| **Registration payload rejected** | Client contract / machine-readable schema |
| **Redirect rejected** | Registered redirect contract |
| **Requested capability rejected** | Current supported protocol profile |
| **Client authentication configuration rejected** | Current client authentication method |
| **Registration succeeds but the later flow fails** | [Authorization Code Flow](./authorization-code-flow) / [OIDC & Clients](../reference/oidc-and-clients) / [Troubleshooting](../operate/troubleshooting) |

## Registration does not create administrative authority

```text
Registered Client
≠
Administrative Authority
```

A client is a software/protocol participant. Authority is a domain-scoped governance
relationship. Successful registration does not merge them.

## Registration does not change ActorIdentity lifecycle

```text
Client Lifecycle
≠
ActorIdentity Lifecycle
```

Registration establishes the start of a client's lifecycle only. An application being
replaced or retired does not mean an ActorIdentity that once authenticated through it
should be deleted; registering a new agent application does not require re-creating the
original AIActor. Exact client lifecycle belongs to
[OIDC & Clients](../reference/oidc-and-clients) and
[Administration](../reference/administration).

## Register a client at a glance

| Boundary | Meaning |
| --- | --- |
| **Client ≠ Actor** | Software participates in the protocol; the Actor is authenticated |
| **Client security model ≠ Actor Kind** | Security assumptions come from the real runtime |
| **Public / confidential ≠ Trust level** | It describes credential custody capability |
| **`client_id` ≠ ActorIdentity** | A protocol client identifier cannot stand in for an Actor |
| **Client authentication ≠ Actor authentication** | Software proof and subject proof are separate |
| **Client material ≠ Actor credential** | Two credentials, two relationships |
| **Redirect URI ≠ Arbitrary return URL** | A redirect is a protocol security boundary |
| **Registration ≠ Direct persistence mutation** | Clients are created through supported administration |
| **Registered client ≠ Administrative authority** | Being registered grants no management power |
| **Client lifecycle ≠ ActorIdentity lifecycle** | Application change does not rebuild an Actor |
| **Registration success ≠ Authentication success** | This page ends with software readiness only |

Compressed:

```text
Identify the software Client
        ↓
Identify its real runtime boundary
        ↓
Prepare Current Client configuration
        ↓
Register through supported administration
        ↓
Protect client-auth material if applicable
        ↓
Verify effective Client configuration
        ↓
Client ready for protocol flow
```

## Next

If the client profile uses a supported authorization code path, continue to
[Authorization Code Flow](./authorization-code-flow). If the application runs at a
browser/BFF boundary, continue to [Browser & BFF](./browser-and-bff). For the exact
client, redirect and protocol contract, see
[OIDC & Clients](../reference/oidc-and-clients). For client mutation, authority and
lifecycle administration, see [Administration](../reference/administration).

## Exact contract source

This page owns the **client registration procedure.**

It does not define the exact registration endpoint, a CLI command, an admin API path, a
bootstrap mechanism, the client resource schema, `client_id` generation, the
public/confidential wire enum, client authentication methods, client secret issuance,
PKCE applicability, the redirect matching algorithm or an inspection endpoint. Those come
from [OIDC & Clients](../reference/oidc-and-clients), the machine-readable contract,
[Administration](../reference/administration) and
[Project Status](../project/status).

> **A reasonable client pattern appearing in a guide does not mean the current release
> supports it.**
