# Browser & BFF

## Using SoulAuth safely inside a browser runtime boundary

The previous page established a **verified OIDC authentication result.** Once the protocol
transaction validates, the application still has to answer another set of questions:

Who holds the OAuth token? What does the browser hold long-term? Who maintains application
login state? How does the SoulAuth AuthSession relate to the application session? What
does the cookie carry? After the OIDC transaction, what CSRF defence do application
requests still need? What does a BFF reduce, and what can it not solve?

```text
Protocol Correctness
≠
Browser Runtime Security
```

The goal of browser integration is not to give the browser as much identity and token
state as possible. It is:

> **to place each kind of sensitive state inside the trust boundary that genuinely needs
> it and can carry the corresponding protection responsibility.**

## 1 · The browser changes the trust boundary

A browser is a powerful application runtime. It is not a controlled server environment:

```text
Browser-readable long-lived secret
≠
Confidential Client Credential
```

If long-lived sensitive material can be read directly by browser application code, it can
no longer be handled under server-side confidential-secret assumptions.

That does not mean a browser may never hold an access token — a browser-based OAuth client
is a real architecture. The lasting principle is:

> **Do not expand the OAuth token's browser exposure surface unnecessarily.**

## 2 · Choose the browser architecture

There is no single browser OAuth architecture. Three patterns:

**Backend for Frontend (BFF)** — the OAuth client, token custody and resource access sit
mainly at the server boundary.

**Token-mediating backend** — the backend performs part of the OAuth work but hands the
access token to the browser, which calls resources directly.

**Browser-based OAuth client** — the browser application itself is the OAuth client, and
OAuth tokens enter the browser security boundary.

These come from the applicable browser OAuth specifications and security best practice.
But:

```text
External Architecture Pattern
≠
SoulAuth Current Supported Integration
```

Which client/browser profiles the current release supports comes from
[OIDC & Clients](../reference/oidc-and-clients) and
[Project Status](../project/status).

## 3 · The BFF pattern

In a BFF pattern the BFF sits inside the consumer application boundary. It is not a
SoulAuth component:

```text
BFF  ≠  SoulAuth Runtime
BFF  ≠  Actor
```

It typically carries the OAuth client, OAuth token custody, the application session, and
resource access to an explicit resource boundary:

```text
Browser
   │
   │ Application Session
   ▼
BFF
   │
   ├── OAuth Client
   ├── OAuth Token Custody
   ├── Application Session
   └── Resource Proxy
   │
   ├──────────────▶ SoulAuth
   │
   └──────────────▶ Resource Server
```

BFF and application session both belong to the consumer application. SoulAuth continues to
own its identity, authentication and protocol contracts.

## 4 · A BFF does not redefine the authorization code flow

Using the authorization code flow through a BFF still inherits the protocol transaction
defined in [Authorization Code Flow](./authorization-code-flow). The only difference is
that **the client role now sits at the BFF server boundary.**

The BFF is responsible, where applicable, for the authorization transaction, the code
exchange, ID token validation and OAuth token custody. The browser does not reimplement a
parallel OIDC transaction.

## 5 · The key change is token custody

```text
Browser
   │
   │ Application Session
   ▼
BFF
   │
   │ Access Token
   ▼
Declared Resource Server
```

The browser interacts mainly with the application session; the BFF uses the access token
per the resource contract. The value of a BFF is not "there is one more backend" — it is:

> **OAuth tokens never need to enter state the browser application can read.**

## 6 · A BFF is not an arbitrary token-forwarding proxy

Once a BFF holds an access token it owns an important security boundary. The browser must
not be able to say "send my token to this arbitrary URL" — browser-controlled destination
plus BFF-held token is a token exfiltration path:

```text
BFF
≠
Unrestricted Outbound Proxy
```

A BFF should send applicable access tokens only to the resource boundary the application
has predefined and permitted. Which hosts, paths, methods and resources are allowed is
controlled by the consumer application's own BFF/resource contract.

## 7 · Browser-based OAuth client

If an application has no trusted server boundary and the current SoulAuth profile supports
it, the browser application itself takes the OAuth client role:

```text
Browser Application
        │  OAuth Client
        ▼
     SoulAuth
```

This architecture is not inherently wrong. What changes is that **OAuth tokens enter the
browser application's trust boundary**, so the direct token exposure surface is larger
than with a BFF. The browser application must carry the corresponding token protection
responsibilities under the current OAuth/SoulAuth browser contract.

## 8 · BFF versus browser-based client

| Question | BFF | Browser-based OAuth client |
| --- | --- | --- |
| **Where does the OAuth client run** | Server / BFF | Browser |
| **Do raw OAuth tokens enter the browser JS boundary** | They should not | They do or may |
| **What does the browser mainly hold** | An application session credential | OAuth client / token state |
| **Resource access** | Through the BFF | The browser calls resources directly |
| **Main trade-off** | More backend complexity, smaller direct token exposure | More direct runtime, larger browser token exposure |

This describes architecture boundaries. It does not claim the current release supports
every profile in the table.

## 9 · A token-mediating backend is a different architecture

If the backend obtains an access token and then hands it to the browser, which calls
resources directly, that is no longer the BFF pattern discussed here:

```text
BFF
≠
Token-Mediating Backend
```

Both may involve a backend. The difference is who finally holds the token, and who issues
the token-bearing request to the resource server.

## 10 · Six kinds of runtime state must stay distinct

The most common browser authentication mistake is calling everything "session".

| State | Owner / meaning |
| --- | --- |
| **OIDC transaction state** | One authorization/authentication transaction |
| **SoulAuth AuthSession** | SoulAuth authentication continuity |
| **Application session** | The consumer application's own runtime continuity |
| **Browser cookie** | The mechanism carrying a session credential, reference or protected state |
| **ID token** | The protocol expression of an OIDC authentication result |
| **OAuth token** | Access or other token state defined by the resource/OAuth contract |

```text
OIDC Transaction State ≠ SoulAuth AuthSession ≠ Application Session
ID Token ≠ Application Session
Cookie   ≠ ActorIdentity
```

## 11 · OIDC transaction state is not application login state

`state`, a PKCE verifier, `nonce` and other transaction-bound state serve one specific
authorization transaction. They do not naturally become long-lived application login
state:

```text
OIDC Transaction State
≠
Application Session
```

The application session may continue after the transaction ends. Their lifecycles differ.

## 12 · A SoulAuth AuthSession is not an application session

```text
SoulAuth AuthSession
≠
Application Session
```

An AuthSession belongs to the SoulAuth authentication boundary and expresses authentication
continuity. An application session belongs to the consumer application and expresses
application runtime continuity.

If an existing AuthSession still satisfies the authentication contract, SoulAuth may reuse
the authentication context per
[Authentication & Sessions](../reference/authentication-and-sessions). That does not
automatically create, extend or delete a consumer's own application session.

## 13 · The application session starts from a verified OIDC subject context

After validation, the BFF or application may establish its own session. The identity
starting point should be:

```text
Trusted SoulAuth Issuer
+
Validated `sub`
        ↓
Verified OIDC Subject Context
        ↓
Application-local Session / Mapping
```

Never treat a bare `sub`, detached from its issuer, as a global Actor identifier. Email,
display name, username and other mutable profile claims do not replace OIDC subject
identity either.

## 14 · Application-local identity is not SoulAuth ActorIdentity

An application may of course have accounts, memberships, profiles, entitlements, internal
user IDs and sessions. But:

```text
Application-local Identity / Account  ≠  SoulAuth ActorIdentity Resource
Application Session                   ≠  ActorIdentity Source of Truth
```

A consumer may store a verified OIDC subject reference. That does not make it another
canonical owner in SoulAuth's identity domain.

## 15 · An ID token is not an application session

```text
ID Token
≠
Application Session
```

An ID token expresses one OIDC authentication result; an application session expresses
long-running application state. Storing an ID token indefinitely does not substitute for a
correct application session model.

## 16 · A cookie is a carrier, not an identity

A cookie may carry a session credential, a session reference, protected session state or
another supported representation depending on the session contract. Do not write
`Cookie = server-side session ID` as the only model. What is invariant:

```text
Cookie
≠
ActorIdentity
```

and a cookie's representation does not redefine the session semantics it carries.

## 17 · Application cookies and SoulAuth cookies have different owners

```text
Application Origin  → Application Session Cookie
SoulAuth Origin     → SoulAuth Authentication Cookie
```

```text
Application Cookie
≠
SoulAuth Cookie
```

Their owner, scope, lifecycle and security meaning all differ. Both being "cookies" is no
reason to merge the AuthSession and the application session.

## 18 · The BFF session cookie baseline

For deployments using the applicable browser OAuth BFF pattern, the BFF session cookie must
follow the corresponding external browser OAuth security contract:

```text
Secure
+
HttpOnly
```

Other attributes — `SameSite`, `Path`, `Domain`, cookie prefixes — must be configured
against the current external BCP, the site/origin topology and the consumer application
contract. This page does not hard-code one cookie configuration for every deployment in
the name of uniformity.

## 19 · SameSite is not a topology-free CSRF answer

SameSite matters. But site and origin are not the same concept, so a SameSite design does
not automatically cover every cross-origin request risk:

```text
SameSite = Part of CSRF Defense
```

but not:

```text
SameSite Enabled = CSRF Solved
```

## 20 · OIDC `state` is not application CSRF protection

`state` solves OIDC authorization transaction correlation. The CSRF problem a
cookie-authenticated application faces occurs at the later application request boundary:

```text
OIDC `state`
≠
General Application CSRF Protection
```

Even with a perfectly correct `state` and a completed login, cookie-authenticated
application requests still need applicable CSRF defence.

## 21 · CORS is not authentication or authorization

```text
CORS  ≠  Authentication
CORS  ≠  Authorization
```

CORS expresses a browser origin access policy. It cannot authenticate an Actor, establish
an ActorIdentity or decide application authority.

Within an explicit request/origin model, a strict CORS and preflight policy can be part of
CSRF defence. But:

```text
CORS Enabled
≠
CSRF Automatically Solved
```

The exact CSRF mechanism remains part of the consumer application's browser security
contract.

## 22 · A BFF is not XSS immunity

A BFF keeps raw OAuth tokens out of browser JavaScript, shrinking the direct token
exfiltration surface. But:

```text
BFF
≠
XSS Immunity
```

If malicious JavaScript is already running on the legitimate application origin, it may
still invoke the business operations the BFF permits using the currently valid application
session — even without reading an HttpOnly cookie or an OAuth token.

> **A BFF changes the token exposure boundary. It does not eliminate every risk from
> malicious browser code.**

## 23 · Prevent session fixation when establishing an authenticated session

Before authentication an application may already hold unauthenticated session state. After
authentication, a session credential an attacker could have pre-controlled must not be
promoted unconditionally into an authenticated application session.

> **Establishing an authenticated application session must prevent session fixation.**

The exact establishment/rotation mechanism is implemented by the consumer application's own
security contract.

## 24 · Token custody: BFF pattern

```text
Browser → Application Session
BFF     → OAuth Token Custody
```

The architectural invariant is: **raw OAuth tokens the BFF manages do not enter state the
browser application can read.**

This page does not prescribe which database the BFF uses internally, whether it needs a
server-side token store, or which session persistence it adopts. A token custody boundary
is not a storage implementation.

## 25 · Token custody: browser-based client

Where the profile supports a browser-based OAuth client, tokens enter the browser
application boundary and cannot obtain the same server-side isolation as a BFF. Least
privilege, minimised exposure, bounded lifetime and the current OAuth/SoulAuth client
contract still apply.

`localStorage`, `sessionStorage`, IndexedDB and memory-only must not be advertised as "pick
this storage and you are safe". If an attacker can already execute malicious code on the
application origin, changing browser storage location alone does not remove all token
abuse risk.

## 26 · Refresh tokens, only if supported and issued

This page does not assume the browser profile issues refresh tokens. Where the profile does
support and issue them, they follow the SoulAuth token contract and the applicable OAuth
security requirements. For a public client in particular, a long-lived continuation
artifact must not be treated as an indefinite bearer secret free of replay protection.

Exact rotation, sender-constraining, lifetime and inactivity semantics belong to
[OIDC & Clients](../reference/oidc-and-clients),
[Authentication Protection](../security/authentication-protection) and the applicable
external specifications.

## 27 · ID tokens are not for ordinary resource APIs

Whatever the browser architecture:

```text
ID Token
≠
API Access Token
```

An ID token expresses an OIDC authentication result; an access token expresses an access
contract for a declared protected resource. For resource-server validation, see
[Verify Tokens](./verify-tokens).

## 28 · Logout is not a single state change

"Logout" routinely mixes several lifecycles. Separate at least:

```text
Browser Cookie
Application Session
SoulAuth AuthSession
OAuth Artifact Lifecycle
```

```text
Clear Browser Cookie
≠
Invalidate Application Session
```

With a server-managed session, deleting the browser cookie does not prove the server-side
session ended.

## 29 · Application logout is not SoulAuth logout

```text
Application Logout  ≠  SoulAuth Logout
Application Session ≠  SoulAuth AuthSession
```

Application logout acts on the consumer's own session. SoulAuth logout, where the protocol
profile supports it, acts on SoulAuth authentication and SSO continuity. Deleting an
application cookie proves nothing about the AuthSession.

## 30 · Different state spaces may still need coordination

```text
Different State Spaces
≠
Unrelated Security Lifecycles
```

Application session, SoulAuth AuthSession and current OAuth artifacts have different
semantic owners. A consumer application may still decide, under an explicit contract,
whether an application session must re-authenticate or end once the underlying access
capability can no longer be established. This page does not create a universal logout
algorithm.

## 31 · Architecture drift: a declared BFF exposing raw tokens

If an application declares a BFF pattern but raw access tokens (or other OAuth tokens the
BFF should hold) appear in browser JavaScript, a URL, HTML or ordinary diagnostic output,
this is not a display bug. It is **architecture / security drift**:

```text
Declared BFF + Raw OAuth Token exposed to Browser JS
→
Architecture Drift
```

## 32 · Architecture drift: a BFF that sends tokens anywhere

```text
BFF-held Token + Browser-controlled Arbitrary Destination
→
Unsafe Resource Proxy Boundary
```

If this holds, the BFF has left the resource boundary it should own. "It is a convenient
generic proxy" does not explain it away.

## 33 · Architecture drift: the application reinvents ActorIdentity

If, after OIDC authentication, an application ignores the verified issuer + `sub` context
and invents a "stable Actor ID" from email, display name, username or bare `sub`
comparison across issuers, that is identity mapping drift:

```text
Application-local Mapping
≠
Permission to redefine ActorIdentity
```

## 34 · Architecture drift: the session becomes the identity source of truth

An application session may store a reference to a verified OIDC subject. But:

```text
Application Session
≠
ActorIdentity Source of Truth
```

If session state starts deciding *who the Actor is in SoulAuth*, rather than consuming the
authentication contract SoulAuth established, the consumer boundary has drifted
semantically.

## 35 · Browser integration pattern

```text
                    SoulAuth
                       │
                OIDC Authentication
                       │
                       ▼
                  ┌─────────┐
                  │   BFF   │
                  │         │
                  │ OAuth   │
                  │ Client  │
                  │         │
                  │ Token   │
                  │ Custody │
                  │         │
                  │ App     │
                  │ Session │
                  │         │
                  │ Resource│
                  │ Proxy   │
                  └────┬────┘
                       │
             Application Session
                 Credential
                       │
                       ▼
                    Browser
```

BFF and application session both belong to the consumer application boundary. This is a
browser integration pattern diagram — not a new SoulAuth canonical architecture figure.

## Browser & BFF at a glance

| Boundary | Meaning |
| --- | --- |
| **Protocol correctness ≠ Browser runtime security** | Correct OIDC is not a correct web boundary |
| **Browser-readable secret ≠ Confidential client credential** | Readable material cannot pretend to be a server secret |
| **External pattern ≠ SoulAuth current support** | A pattern in a specification is not a product capability |
| **BFF ≠ SoulAuth runtime** | The BFF belongs to the consumer application |
| **BFF ≠ Actor** | An application component is not an authentication subject |
| **BFF ≠ Token-mediating backend** | Whether the token reaches the browser is the difference |
| **Transaction state ≠ Application session** | One transaction is not long-lived login state |
| **Application session ≠ SoulAuth AuthSession** | Two continuities, two owners |
| **Application session ≠ Identity source of truth** | A consumer session cannot redefine SoulAuth identity |
| **Cookie ≠ ActorIdentity** | A cookie is a carrier for session state |
| **Application cookie ≠ SoulAuth cookie** | Different owner, scope and lifecycle |
| **OIDC `state` ≠ Application CSRF protection** | Protocol correlation is not request security |
| **CORS ≠ Authentication / authorization** | Origin policy is neither identity nor authority |
| **BFF ≠ XSS immunity** | It reduces exfiltration, not malicious code |
| **BFF ≠ Unrestricted outbound proxy** | Tokens go only to a declared resource boundary |
| **ID token ≠ API access token** | Authentication result is not resource access |
| **Clear cookie ≠ Session invalidated** | Browser state is not server state |
| **Application logout ≠ SoulAuth logout** | Two lifecycles; the latter only where supported |

Compressed:

```text
Choose the Browser Architecture
        ↓
Place the OAuth Client
        ↓
Place Token Custody
        ↓
Separate Transaction / AuthSession / Application Session
        ↓
Map verified issuer + sub into Application-local state
        ↓
Protect Cookie / CSRF boundary
        ↓
Protect Resource Proxy boundary
        ↓
Detect Architecture Drift
```

## Next

If a backend or resource server must now decide whether an access token is trustworthy,
continue to [Verify Tokens](./verify-tokens). To understand SoulAuth's own authentication
and AuthSession, see
[Authentication & Sessions](../reference/authentication-and-sessions). For exact client,
token, subject, logout and profile contracts, see
[OIDC & Clients](../reference/oidc-and-clients). For redirect, cookie, session, token
exposure, login loop or replica-related browser problems, see
[Troubleshooting](../operate/troubleshooting).

## Exact contract source

This page owns the **browser runtime trust boundary and the browser/BFF integration
pattern guide.**

It does not define whether BFF, browser-based OAuth client or token-mediating backend is
currently supported, whether authorization code + PKCE is supported for each browser
profile, whether refresh tokens are issued, whether SoulAuth logout is supported, exact
client authentication methods, exact cookie values for every topology, an exact CSRF
implementation or exact browser token storage. Those come from the external browser OAuth
and OAuth security specifications,
[OIDC & Clients](../reference/oidc-and-clients),
[Authentication & Sessions](../reference/authentication-and-sessions),
[Authentication Protection](../security/authentication-protection),
[Project Status](../project/status), and the consumer application's own browser security
contract.

```text
External BCP Requirement   ≠  SoulAuth Support Claim
SoulAuth Protocol Contract ≠  Consumer Application Session Contract
```
