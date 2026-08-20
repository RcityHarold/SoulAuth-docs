# Verifying ID Tokens

SoulAuth signs ID tokens with RS256 and publishes the public keys at a JWKS
endpoint. Consumers verify **locally**. There is no per-request call back to
SoulAuth.

## Why local verification

Three reasons, in increasing order of importance:

1. **Latency** — no network hop on the authenticated path.
2. **Availability** — SoulAuth being briefly down degrades new logins, not
   every request across your system.
3. **It is the contract.** For SoulSeedOS this is fixed by `P0-DECISION-10`:
   RS256, verified locally, lifetime ≤300 seconds.

The short lifetime is what makes local verification safe. A revoked session
stops working within five minutes without any revocation channel — bounded
staleness traded for a vastly simpler and more available integration.

## Fetching JWKS

```bash
curl -s https://auth.example.com/api/oidc/jwks
```

```json
{
  "keys": [
    { "kty": "RSA", "use": "sig", "alg": "RS256", "kid": "...", "n": "...", "e": "AQAB" }
  ]
}
```

Cache this. Refetch when you encounter a `kid` you do not recognise — that is
key rotation, and it is the only event that should trigger a refetch. Do not
poll.

## What to check

Every one of these. Skipping any turns a signed token into a decorative one:

| Check | Why |
| --- | --- |
| **Signature** | RS256 against the JWKS key matching the token's `kid`. |
| **`iss`** | Must equal your configured issuer, character for character. |
| **`aud`** | Must equal your `client_id`. Without this, a token issued for a different client is accepted. |
| **`exp`** | Not expired. Allow a few seconds of clock skew, not minutes. |
| **`nonce`** | If you sent one at `/authorize`, it must match. |
| **`sid`** | Must be present and non-empty. |

::: danger Do not accept `alg: none`, and do not let the token pick the algorithm
Pin RS256. A verifier that reads `alg` from the token header it is verifying is
the classic JWT vulnerability.
:::

## Claims

| Claim | Meaning |
| --- | --- |
| `iss` | The issuer — `APP_URL` without a trailing slash |
| `sub` | Stable user identifier |
| `aud` | Your `client_id` |
| `exp` / `iat` | Expiry and issue time |
| `sid` | Authentication session id — **mandatory** |
| `nonce` | Echoed if you supplied one |

### `sid` is not optional

`sid` identifies the authentication session and is what makes coordinated
logout work: RP-initiated logout uses it to terminate the right session.

**SoulAuth refuses to sign an ID token when it cannot resolve a session
reference.** It never issues one without `sid`. So if you are looking at a
token with an empty `sid`, you have the **access token**, not the ID token.
This is the single most common integration mistake.

## Examples

### Node

```js
import { createRemoteJWKSet, jwtVerify } from 'jose'

const JWKS = createRemoteJWKSet(
  new URL('https://auth.example.com/api/oidc/jwks')
)

const { payload } = await jwtVerify(idToken, JWKS, {
  issuer: 'https://auth.example.com',
  audience: process.env.CLIENT_ID,
  algorithms: ['RS256'],
})

if (!payload.sid) throw new Error('missing sid — is this the access token?')
```

### Python

```python
from jwt import PyJWKClient
import jwt

jwks = PyJWKClient("https://auth.example.com/api/oidc/jwks")
key = jwks.get_signing_key_from_jwt(id_token).key

claims = jwt.decode(
    id_token, key,
    algorithms=["RS256"],
    audience=CLIENT_ID,
    issuer="https://auth.example.com",
)

assert claims.get("sid"), "missing sid — is this the access token?"
```

### Rust

```rust
use jsonwebtoken::{decode, Algorithm, DecodingKey, Validation};

let mut validation = Validation::new(Algorithm::RS256);
validation.set_issuer(&["https://auth.example.com"]);
validation.set_audience(&[client_id]);

let data = decode::<Claims>(id_token, &decoding_key, &validation)?;
```

## Debugging

```bash
# The issuer SoulAuth actually advertises
curl -s https://auth.example.com/.well-known/openid-configuration | jq -r .issuer

# The current signing key id
curl -s https://auth.example.com/api/oidc/jwks | jq -r '.keys[0].kid'

# What is actually inside your token
echo "$ID_TOKEN" | cut -d. -f2 | base64 -d 2>/dev/null | jq '{iss, aud, sid, exp}'
```

Common failures:

| Symptom | Cause |
| --- | --- |
| Every token fails with issuer mismatch | `issuer` differs by a trailing slash, port, or `www` |
| Works, then fails after a restart | No configured signing key — a new one per boot |
| Works on one replica, fails on another | Replicas do not share the signing key |
| `sid` is empty | You are inspecting the access token |
| Fails after several minutes | Working as intended — the token expired; refresh |

The second and third are the same root cause. See
[the production gate](/guide/configuration#the-production-gate).

## Next steps

- [**The BFF Pattern**](./bff)
- [**SoulSeedOS Adapter**](./soulseedos)
- [**OIDC API reference**](/reference/oidc)
