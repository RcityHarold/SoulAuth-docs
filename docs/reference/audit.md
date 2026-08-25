# Audit

## How SoulAuth records, attributes and interprets what already happened

Current state in SoulAuth changes constantly. ActorIdentity enters different lifecycle
states; credentials, IdentityBindings, clients, AuthSessions and administrative authority
all change. Those domains answer *what is the state now?*

Audit answers a different question:

> **What happened in the past, and on what basis do we interpret that history today?**

```text
Audit  ≠  Current State
Audit  ≠  Authority
```

Recording a fact does not create current authority. Audit carries **historical
accountability.**

## 1 · What audit is and is not

Audit records **the important identity, authentication, protocol, security and
administrative facts that require long-term accountability.** It is not a permanent copy
of every runtime event, and it is not another word for ordinary logging.

| Surface | The question it answers |
| --- | --- |
| **Audit** | Which facts requiring long-term accountability occurred? |
| **Operational log** | Why did the runtime behave this way? |
| **Metric** | How is the system running overall? |
| **Trace** | How did one operation run across components? |
| **Security event** | What security-significant thing happened or was detected? |
| **Execution receipt** | Did a downstream action really execute? |

```text
Audit           ≠  Operational Log  ≠  Metric  ≠  Trace
Security Event  ≠  Audit Event by definition
```

### Authentication audit is not an execution receipt

SoulAuth can prove that ActorIdentity A established an authentication result at a given
time, and it may record that an OAuth/OIDC protocol operation happened. Neither implies
that Actor A later transferred money, deleted a document or performed a Soulseed action:

```text
Authentication Audit  ≠  Application Execution Evidence
SoulAuth Audit        ≠  Execution Receipt
```

SoulAuth is accountable for the identity, authentication, protocol and administrative
facts it actually owns. Downstream application actions must be proven by the downstream's
own evidence/receipt contract.

## 2 · Attempt, decision, effect and outcome

Audit cannot record only `"something changed"`. One historical operation may contain four
different facts:

```text
Attempt  ≠  Decision  ≠  Effect  ≠  Outcome
```

**Attempt** — an operation was requested, triggered or attempted. An attempt existing
does not mean state changed:

```text
Operation Attempt
≠
Domain Effect
```

**Decision** — a formal security or policy judgment occurred: an authentication
judgment, an administrative authorization judgment, a protocol eligibility judgment.
But:

```text
Decision
≠
Effect
```

An administrative request being allowed does not mean the state transition then
succeeded.

**Effect** — **canonical domain state genuinely changed**: an ActorIdentity lifecycle
transition really occurred, or a credential really entered the revoked state.

**Outcome** — what the whole operation finally produced: success, rejection, conflict,
failure, or an unknown/partial outcome. The exact outcome vocabulary belongs to the real
audit/runtime contract; public reference does not invent wire enums from a semantic
model.

## 3 · Attribution

The most dangerous audit error is not a missing event. It is:

> **recording the wrong person, client or runtime context as the acting subject.**

Audit must therefore distinguish, semantically, at least:

```text
Initiator
Runtime Origin
Target
Actor Context
Client Context
Claimed / Resolved / Authenticated Identity State
```

These are attribution dimensions. They are not one field, and they do not require the
public wire to use these exact names.

### Initiator, runtime origin and target are separate

- **Initiator** — who or what originally requested or triggered the operation?
- **Runtime origin** — which trusted runtime context actually produced, committed or
  recorded the effect?
- **Target** — who or what was affected?

```text
Initiator  ≠  Runtime Origin  ≠  Target
```

If Admin A requests suspending Actor B and a background worker commits the transition,
the correct historical reading is still:

```text
Initiator      = Admin A
Runtime Origin = trusted worker
Target         = Actor B
```

The worker writing the state must not turn the initiator into "system".

### Client context is not Actor attribution

An OAuth client may participate in a protocol on behalf of an authenticated Actor. Audit
may record both contexts, but:

```text
Client Context
≠
Actor Attribution
```

A client is the software participating in the protocol; ActorIdentity is the identity
subject. They keep different attribution roles.

## 4 · Claimed, resolved and authenticated identity must stay apart

This is one of the most important boundaries in authentication audit. Suppose a request
submits:

```text
alice@example.com  +  wrong credential evidence
```

Even if that locator resolves to ActorIdentity A, the system has not proven the request
came from Actor A:

```text
Claimed Identity              ≠  Authenticated Actor
Resolved Authentication Target ≠  Authenticated Request Initiator
```

Audit may accurately record that the request targeted/resolved to Actor A, that
verification failed, and that no authenticated initiator was established. It must not
record *"Actor A performed a failed login."*

### A claimed client is not an authenticated client

If a request claims `client_id = Client C` but client authentication fails:

```text
claimed `client_id`
≠
authenticated Client
```

Audit may record that the request claimed Client C. It must not record that
authenticated Client C performed the operation.

### Attributing an Actor as authenticated initiator requires verified context

To say **Actor A is the authenticated initiator of this request**, an applicable verified
authentication context must exist. Actor attribution cannot be generated from an email,
a username, a display name or an arbitrary request parameter.

That does not prevent an administrative operation from carrying Actor B as its
**target**. Authenticated initiator and target Actor reference are different semantic
roles.

## 5 · Attribution references must be typed

Historical attribution must not depend on a display name, the current profile, an
external subject without a qualified source, or an implicit conversion of the OIDC `sub`:

```text
Audit Actor Attribution Reference  ≠  Display Name
Audit Actor Attribution Reference  ≠  OIDC `sub` by default
```

Audit must be able to point stably at **event-time SoulAuth ActorIdentity semantics.**
The exact field, identifier carrier or wire representation is defined by the real audit
contract; this page does not create a new public identifier namespace in advance.

### Distinguishing claimed identity does not require retaining the raw locator

```text
Claimed Identity Context
≠
Requirement to retain raw locator
```

Audit obeys data minimisation, privacy, investigation need and enumeration risk too. The
representation is decided by the current audit contract.

## 6 · System-originated events still need attribution

Not every important event has a human or AIActor initiator. Automatic expiration,
scheduled work, security automation and recovery activity may all be system-originated:

```text
No Actor Initiator
≠
No Attribution
```

Such events should still record runtime origin, cause/trigger, target, outcome, and the
upstream initiator where one exists.

## 7 · Historical interpretation must not be recomputed from current state

The long-term value of audit is that **years later, the past is still interpreted by the
semantics that held at the time.** Current mutable state must never become the source of
historical attribution.

### The current profile does not rewrite the past

```text
Current Profile
≠
Historical Attribution Source
```

An Actor renaming itself today does not change which ActorIdentity yesterday's event
belonged to. Current display information may be used for UI; stable historical
attribution may not depend on it.

### The current binding does not re-map the past

```text
Current IdentityBinding
≠
Historical Authentication Attribution
```

If external identity X was bound to Actor A at T1 and the relation changed at T2, the
authentication history established at T1 still belongs to the Actor resolved then. It is
not recomputed from today's binding.

### Current roles do not rewrite past administrative authorization

```text
Current Role / Permission State
≠
Historical Administrative Authorization
```

Revoking Admin A's permission today does not make yesterday's then-lawful operation
"never authorised". Adding a permission today does not retroactively authorise a
previously unauthorised operation.

## 8 · Historical events are interpreted with event-time semantics

A historical record must be read not only with the identity, authentication and authority
of its time, but also with **the event schema/semantic version that defined the record
then**:

```text
Current Event Semantics  ≠  Automatic Interpretation of Historical Record
Vocabulary Evolution     ≠  Historical Record Rewrite
```

Where terminology later changes, old history is explained through version-aware
interpretation.

### Current audit coverage is not historical coverage

If release A did not require auditing a class of fact and release B later did:

```text
Current Audit Coverage
≠
Historical Audit Coverage
```

The absence of a new event type in old history does not prove that class of thing never
happened. Historical completeness is read against **the audit coverage contract that
actually held at the time.**

## 9 · Event time and record time are separate

```text
Event Time
≠
Record Time
```

**Event time** is when the recorded domain fact occurred in its business or security
semantics. **Record time** is when the audit runtime accepted or persisted the record.
They may be close; they are not the same fact.

### A timestamp is not a global total order

In a multi-replica or distributed runtime, `timestamp A < timestamp B` does not prove
event A preceded event B in every business and causal sense:

```text
Timestamp
≠
Global Total Order
```

Expressing causation requires a declared causal/parent/correlation context, not
wall-clock ordering.

## 10 · Boundaries on historical integrity claims

Only where the current release formally declares a tamper-evident audit capability may
public reference describe its exact integrity profile. Even then:

```text
Tamper-evident
≠
Tamper-proof
```

What tamper-evident actually expresses:

> **Within the declared integrity scope, representation, trust and verification
> boundary, certain unauthorised historical changes are detectable.**

It never expresses "no one can ever modify any audit bit".

### Validity, coverage and freshness are three questions

```text
Cryptographic / Integrity Validity
Coverage
Freshness / Continuity
```

A proof being mathematically valid does not mean it covers the whole history. A proof
covering a stretch of history does not mean it represents the most recent trustworthy
history:

```text
Valid Integrity Evidence  ≠  Complete History
Valid Old Evidence        ≠  Latest Trustworthy History
```

### Cryptographic validity is not trust validity

```text
Cryptographic Validity
≠
Trust Validity
```

A signature being mathematically valid does not mean the corresponding key was in a
trusted state during that period. Integrity evidence must be interpreted inside the
declared trust model.

### Cryptographic integrity is not semantic truth

This is the boundary audit must never oversell:

```text
Cryptographic Integrity   ≠  Semantic Correctness
Attribution Correctness   ≠  Historical Storage Integrity
```

If the system wrongly recorded that Actor B performed an operation, an integrity
mechanism can at most prove the record was not silently altered afterwards. It cannot
prove the original attribution was correct.

### Integrity is not confidentiality

```text
Audit Integrity
≠
Audit Confidentiality
```

A record being verifiable does not mean any caller may read its full payload.

## 11 · Committed history must not be silently rewritten by administration

```text
Historical Audit Record   ≠  Ordinary Mutable Resource
Administrative Authority  ≠  Authority to Rewrite Audit History
```

Where the current audit contract permits correction, annotation or investigation
conclusions, they must preserve the distinction between the original history and the
later interpretation:

```text
Correction
≠
History Rewrite
```

## 12 · An audit gap is not the absence of activity

One of the most important interpretive principles for historical evidence:

```text
Audit Gap                 ≠  No Activity
No Matching Audit Record  ≠  Event Never Occurred
```

A missing record supports a stronger historical inference only when the applicable
historical audit coverage, retention coverage, gap/continuity state and query
completeness can all be established.

## 13 · An audit outage must not be dressed up later as continuous history

```text
Audit Outage
≠
Permission to fabricate continuous history later
```

After recovery, it is legitimate to record truthfully that a gap occurred, that recovery
was performed, and that some facts were reconciled afterwards. It is not legitimate to
pretend every event was captured in real time, continuously and in original order.

## 14 · Recovery must not claim uninterrupted history

```text
Recovered Audit State
≠
Uninterrupted Audit History by assertion
```

If later historical evidence existed and was already seen by a trusted observer,
restoring an older state does not make that evidence "never have existed". Therefore:

> **Historical confidence after a recovery may carry a scope, a range and a boundary.**

An unqualified `audit history = trusted` must not paper over gaps and uncertainty.
Recovery procedures are defined by
[Operations & Recovery](../operate/operations-and-recovery).

## 15 · Retention must not become silent historical rewriting

```text
Audit Retention        ≠  Ad-hoc Administrative Deletion
Authorized Retention   ≠  Silent Historical Rewrite
Retention Expiry       ≠  Historical Event Never Existed
```

Audit retention and Actor/profile retention are also different contracts.

## 16 · Audit data is sensitive security data

Audit is not a public log. It may contain Actor activity, authentication context, client
context, administrative operations, identity references, security state, and timing and
correlation information:

```text
Audit Data
≠
Public Data
```

### Audit read authority is not general admin authority

```text
Audit Read Authority
≠
General Administrative Mutation Authority
```

A principal that may suspend an Actor need not thereby gain full audit read authority.
Conversely, a controlled audit reader needs no Actor or credential mutation authority.

### Audit read is not unlimited PII access

```text
Audit Read Authority
≠
Unlimited Identity / PII Visibility
```

Audit access still obeys caller context, authority, purpose, data minimisation and
projection.

## 17 · Canonical record and caller-visible projection are separate

```text
Canonical Audit Record
≠
Caller-visible Audit Projection
```

A caller projection may redact, mask, minimise or omit under policy. But:

```text
Projection Redaction
≠
Canonical Historical Mutation
```

Changing the current display projection must not rewrite canonical history.

### A projection is not automatically an integrity payload

Where the current release offers canonical integrity verification:

```text
Caller-visible Projection
≠
Canonical Integrity Payload
```

A redacted query response is not interpreted as the canonical record merely because it
came from an audit API. If verifiable projection later becomes a supported contract, it
must carry its own exact proof semantics. This page does not create that feature in
advance.

## 18 · Audit detail is not secret capture

For accountability, audit may record which credential or token-related event occurred,
which resource was affected, and what result held. But:

```text
Audit Detail       ≠  Secret Capture
Token Correlation  ≠  Raw Token Logging
```

Raw authentication, session, client or token secret material must not enter the
historical audit payload because it would be convenient. Where the contract needs token
correlation, it must use a controlled reference or representation that cannot be
reassembled into a usable secret. The mechanism is decided by the engineering contract.

## 19 · A query result is not historical completeness

Where an audit query surface exists, one evidence boundary matters greatly:

```text
Audit Query Result
≠
Proof of Complete Audit History
```

A query returning ten records proves the current query contract returned those results.
It does not prove an eleventh relevant record does not exist:

```text
Verified Audit Record  ≠  Verified Query Completeness
No Matching Result     ≠  Event Never Occurred
```

Exact query, filter, pagination and ordering follow
[API Conventions](./api-conventions) and the published machine-readable contract.

## 20 · Display order is not business causality

Even where an audit UI or query result is shown in some time, sequence or storage order:

```text
Display Order
≠
Business Causal Order by definition
```

To express that one event caused another, use an explicit causal context — never infer
causation from ordering position.

## 21 · Audit at a glance

| Boundary | Meaning |
| --- | --- |
| **Audit ≠ Current state** | Audit interprets the past; it does not define the present |
| **Audit ≠ Authority** | A historical record creates no current power |
| **Audit ≠ Log / metric / trace** | Accountability and observability are separate |
| **Authentication audit ≠ Execution receipt** | Authentication evidence does not prove a downstream action ran |
| **Attempt ≠ Decision ≠ Effect ≠ Outcome** | Request, judgment, real change and final result are separate |
| **Initiator ≠ Runtime origin ≠ Target** | Who asked, who executed and who was affected are attributed separately |
| **Claimed / resolved identity ≠ Authenticated initiator** | An input or target identity cannot impersonate a verified Actor |
| **Current profile / binding / role ≠ Historical attribution source** | Today's state does not recompute yesterday |
| **Event time ≠ Record time** | When it happened and when it was recorded differ |
| **Timestamp ≠ Global total order** | Wall-clock ordering is not universal causality |
| **Tamper-evident ≠ Tamper-proof** | Detectability is not immutability |
| **Cryptographic integrity ≠ Semantic truth** | Integrity cannot prove the original record was right |
| **Query result ≠ History completeness** | Returned records do not prove the full set |
| **No audit record ≠ Event never occurred** | Gap, coverage and retention decide evidential strength |
| **Audit data ≠ Public data** | Accountability data is still sensitive data |
| **Administrative authority ≠ Audit rewrite authority** | Even a high-privilege admin cannot ordinarily rewrite history |

Compressed:

```text
Something happens
        ↓
Attempt / Decision / Effect / Outcome
        ↓
Attribution
        ↓
Event-time Context
        ↓
Historical Audit Record
```

then judged separately along coverage, integrity, retention, gap/recovery and
projection — none of which redefines what actually happened at the time.

## Exact contract source

This page defines the human-readable contract for audit events' historical semantics,
attribution, temporal interpretation, historical integrity claim boundaries,
gap/completeness, and access/projection.

It does not invent event type values, event schema fields, audit resource IDs, checkpoint
formats, hash algorithms, integrity keys, query endpoints or retention durations. Exact
HTTP/query wire is owned by the **published machine-readable contract**. Which audit
events, queries, integrity or verification capabilities the current release supports is
published by [Project Status](../project/status). Recovery procedures belong to
[Operations & Recovery](../operate/operations-and-recovery); security and key trust to
[Security Model](../security/security-model) and
[Authentication Protection](../security/authentication-protection).

> **An audit semantic concept existing does not mean the current release has a resource,
> endpoint or cryptographic feature of the same name.**

## Next

The historical layer's boundaries are now in place: current state separate from
historical fact; attempt, decision, effect and outcome separate; initiator, runtime
origin and target separate; claimed/resolved identity separate from authenticated
initiator; today's profile, binding, role and schema not rewriting the past; integrity
evidence not inflated into semantic truth; a missing record not inflated into "no
activity".

[Configuration](./configuration) is next: which runtime behaviour changes through
configuration; how configuration vocabulary, value, source, effective state and observed
state keep their boundaries; how secrets stay separate from ordinary config; and how a
configuration change aligns with runtime effect, rollback, audit and the release
contract.
