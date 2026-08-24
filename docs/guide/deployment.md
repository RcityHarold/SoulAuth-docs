# Deployment

This page covers running SoulAuth for real: TLS, reverse proxies, database
accounts, multiple replicas, and the checks that stop a misconfigured instance
from starting.

If you just want it running locally, use the [Quickstart](./quickstart)
instead.

## Prerequisites

- A **SurrealDB 3.x** instance you can reach
- A **reverse proxy terminating TLS** — SoulAuth speaks plain HTTP by design
- A **front end**. SoulAuth is a pure API: no login page, no consent screen, no
  account settings UI ship with it.

## The production gate

The single most useful thing to know before deploying: when `APP_URL` is not a
loopback address, SoulAuth **refuses to start** without both an OIDC signing
key and an MFA encryption key.

```bash
export APP_URL=https://auth.example.com
export OIDC_RSA_PRIVATE_KEY_PATH=/etc/soulauth/oidc-signing.pem
export MFA_SECRET_ENCRYPTION_KEY=$(openssl rand -base64 32)
```

The reasoning is in [Configuration](./configuration#the-production-gate). In
short, both defaults silently destroy previously issued credentials — a fresh
signing key per boot invalidates every ID token, and a `JWT_SECRET`-derived MFA
key means rotating your JWT secret locks out every MFA user permanently.

Generate the signing key once and distribute it to every replica:

```bash
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 \
  -out /etc/soulauth/oidc-signing.pem
chmod 600 /etc/soulauth/oidc-signing.pem
```

## Reverse proxy and TLS

SoulAuth does not terminate TLS. Put nginx, Caddy, Traefik or your cloud load
balancer in front of it.

```nginx
server {
    listen 443 ssl http2;
    server_name auth.example.com;

    ssl_certificate     /etc/letsencrypt/live/auth.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/auth.example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Then bind SoulAuth to loopback only and let it trust the proxy's headers:

```bash
BIND_ADDR=127.0.0.1:8080
APP_URL=https://auth.example.com
TRUST_PROXY_HEADERS=true
```

::: danger `TRUST_PROXY_HEADERS` and reachability must match
`TRUST_PROXY_HEADERS=true` makes SoulAuth believe `X-Forwarded-For`. If
SoulAuth is *also* reachable directly — a container port published to the host,
a permissive security group — any client can set that header to any value and
sidestep IP rate limiting and IP lockout entirely. Bind to loopback, or ensure
the only network path in is through the proxy.
:::

## Database account

Do not run SoulAuth as `root`. Create a dedicated account scoped to its
namespace and database:

```sql
DEFINE USER soulauth ON DATABASE PASSWORD '<generated>' ROLES EDITOR;
```

`EDITOR` grants data read/write without schema modification. SoulAuth does not
define tables at runtime; the schema is imported ahead of time.

Connect over TLS by prefixing the URL:

```bash
DATABASE_URL=https://db.internal:8000
```

A plaintext connection to a non-loopback address produces a startup warning.
That connection carries the database password, Argon2 password hashes and
session tokens.

## Deployment steps

1. **Start SurrealDB** and confirm it is reachable:

   ```bash
   surreal start --bind 127.0.0.1:8000 --user root --pass "$DB_PASS" \
       file:/var/lib/surrealdb
   curl -f http://127.0.0.1:8000/health && echo " SurrealDB OK"
   ```

2. **Set the environment.** Export the namespace and database as variables so
   the import target and the runtime target cannot drift apart:

   ```bash
   export DATABASE_URL=127.0.0.1:8000
   export DATABASE_NAMESPACE=auth
   export DATABASE_NAME=main
   export DATABASE_USER=soulauth
   export DATABASE_PASS="$DB_PASS"
   export JWT_SECRET=$(openssl rand -hex 32)
   export APP_URL=https://auth.example.com
   export SMTP_HOST=smtp.example.com
   export SMTP_FROM=noreply@example.com
   export OIDC_RSA_PRIVATE_KEY_PATH=/etc/soulauth/oidc-signing.pem
   export MFA_SECRET_ENCRYPTION_KEY=$(openssl rand -base64 32)
   ```

3. **Import the schema**, reusing those variables:

   ```bash
   surreal import --endpoint "http://$DATABASE_URL" \
       --user "$DATABASE_USER" --pass "$DATABASE_PASS" \
       --namespace "$DATABASE_NAMESPACE" --database "$DATABASE_NAME" schema.sql

   surreal import --endpoint "http://$DATABASE_URL" \
       --user "$DATABASE_USER" --pass "$DATABASE_PASS" \
       --namespace "$DATABASE_NAMESPACE" --database "$DATABASE_NAME" initial_data.sql
   ```

   ::: warning It is `--endpoint`, not `--conn`
   `--conn` is the older SurrealDB spelling and fails unhelpfully on 3.x.
   :::

4. **Build:**

   ```bash
   cargo build --release
   ```

5. **Run:**

   ```bash
   ./target/release/soulauth
   ```

6. **Verify:**

   ```bash
   curl https://auth.example.com/health
   # → {"status":"ok","uptime_seconds":12}
   ```

7. **Create the first administrator.** Registration grants no admin rights —
   the first one must be assigned in the database, so that "whoever registered
   first" is not the condition for holding every permission:

   ```bash
   curl -X POST https://auth.example.com/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","username":"admin","password":"CorrectHorse42!"}'

   curl -u "$DATABASE_USER:$DATABASE_PASS" \
     -H "surreal-ns: $DATABASE_NAMESPACE" -H "surreal-db: $DATABASE_NAME" \
     --data "LET \$u = (SELECT VALUE id FROM user WHERE email = 'admin@example.com')[0];
             CREATE user_role CONTENT {
               user_id: \$u, role_id: role:admin,
               assigned_at: 0, assigned_by: user:system
             };" \
     "http://$DATABASE_URL/sql"
   ```

   Log in again afterwards — tokens do not carry roles — then confirm
   `"is_admin": true` from `GET /api/auth/me`.

::: tip This procedure is executable
`tests/deployment_walkthrough.sh` runs steps 1–7 from scratch and asserts
`is_admin: true`. Documentation that is never executed drifts; this one fails
CI when it does.
:::

## Running multiple replicas

Two things need attention:

**Share the OIDC signing key.** Every replica must load the same PEM. Otherwise
a token issued by replica A fails verification against replica B's JWKS.

**Rate limiting is already shared where it matters.** Credential endpoints
(login, register, password reset, verify-email, MFA challenge) count against a
SurrealDB-backed bucket that is shared automatically. The general-API default
rule is per-process by design, so non-credential traffic does get an N× ceiling
across N replicas.

Account lockout is stored in the database and is therefore already shared.
Sessions likewise.

## Health checks

```
GET /health  →  {"status":"ok","uptime_seconds":12}
```

`/health` is registered *after* the rate-limiting layer and is exempt from it —
a probe returning 429 under load would be read as a dead process and trigger a
restart, turning the rate limiter into a failure amplifier.

## Upgrading

Check `DEPLOYMENT.md` in the repository for version-specific migration steps
before upgrading. The API response shape was normalised to bare objects in a
recent revision; clients that unwrapped a `data` envelope need updating.

## Next steps

- [**Security Model**](./security-model) — a pre-launch checklist.
- [**Brute-force protection**](./lockout) — tuning and unlocking.
- [**Auditing**](./auditing) — what gets recorded and how to read it.
