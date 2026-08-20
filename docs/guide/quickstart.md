# Quickstart

This gets you a running SoulAuth with an admin account in about five minutes.
Everything here runs on `localhost` over plain HTTP, which SoulAuth permits
only for loopback addresses — see [the production gate](./deployment#the-production-gate)
before you expose it.

## Prerequisites

- **Rust** 1.75 or newer (`rustup` recommended)
- **SurrealDB** 3.x — [installation instructions](https://surrealdb.com/install)
- **OpenSSL** for generating secrets
- **curl** and a JSON pretty-printer such as `jq` (optional, for following along)

::: tip Why SurrealDB?
SoulAuth uses one database for everything — users, sessions, tokens, roles,
audit events. There is no second datastore to operate. The schema ships as two
SQL files in the repository.
:::

## 1. Get the source

```bash
git clone https://github.com/RcityHarold/SoulAuth.git
cd SoulAuth
```

## 2. Start SurrealDB

```bash
surreal start --bind 127.0.0.1:8000 --user root --pass root file:/tmp/soulauth-db
```

Leave that running and open a second terminal. Confirm it is up:

```bash
curl -f http://127.0.0.1:8000/health && echo " SurrealDB OK"
```

## 3. Load the schema

The namespace and database you import into **must** match what the application
connects to later. Exporting them as variables first is the easiest way to keep
the two in step:

```bash
export DATABASE_URL=127.0.0.1:8000
export DATABASE_NAMESPACE=auth
export DATABASE_NAME=main
export DATABASE_USER=root
export DATABASE_PASS=root

surreal import --endpoint "http://$DATABASE_URL" \
    --user "$DATABASE_USER" --pass "$DATABASE_PASS" \
    --namespace "$DATABASE_NAMESPACE" --database "$DATABASE_NAME" schema.sql

surreal import --endpoint "http://$DATABASE_URL" \
    --user "$DATABASE_USER" --pass "$DATABASE_PASS" \
    --namespace "$DATABASE_NAMESPACE" --database "$DATABASE_NAME" initial_data.sql
```

::: warning The flag is `--endpoint`, not `--conn`
Older SurrealDB documentation uses `--conn`. On 3.x it is `--endpoint`, and
passing the wrong one fails with an unhelpful message.
:::

`schema.sql` defines the tables and indexes. `initial_data.sql` seeds the
built-in roles and permissions — including `role:admin`, which SoulAuth checks
for at startup to tell "the schema was never imported" apart from "the database
is empty on purpose".

## 4. Configure

Only four variables are required. Copy the example file and fill them in:

```bash
cp .env.example .env
```

At minimum, set:

```bash
JWT_SECRET=$(openssl rand -hex 32)   # at least 32 characters
APP_URL=http://localhost:8080         # public address, not the bind address
SMTP_HOST=127.0.0.1
SMTP_FROM=noreply@localhost
```

::: tip `APP_URL` is not the listen address
`APP_URL` is the address clients reach you at. It determines the OIDC issuer,
the prefix of links in outbound email, and whether session cookies get the
`Secure` flag. The listen address is `BIND_ADDR`, which defaults to
`0.0.0.0:8080`.
:::

Every other variable has a working default. The full list is in the
[environment reference](/reference/environment).

Email is not required for this walkthrough: `EMAIL_VERIFICATION_ENABLED`
defaults to `false`, so registration completes without a mail server. SoulAuth
still needs `SMTP_HOST` and `SMTP_FROM` to be *set* — the values are only used
when it actually sends something.

## 5. Build and run

```bash
cargo build --release
./target/release/soulauth
```

Check it:

```bash
curl http://localhost:8080/health
# → {"status":"ok","uptime_seconds":3}
```

If startup fails, the error message tells you what to fix — SoulAuth validates
its configuration and its schema before it binds a port. A missing schema
import, for example, prints the exact `surreal import` commands to run,
including the namespace and database it was actually looking at.

## 6. Register a user

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","username":"admin","password":"CorrectHorse42!"}'
```

Password policy: **at least 12 characters**, containing **three of the four**
character classes (uppercase, lowercase, digit, symbol). The minimum length is
tunable via `PASSWORD_MIN_LENGTH`.

Log in:

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"CorrectHorse42!"}'
```

You get back a token. Use it:

```bash
TOKEN=<paste the token>
curl http://localhost:8080/api/auth/me -H "Authorization: Bearer $TOKEN"
```

## 7. Grant yourself admin

Registration does **not** hand out administrative rights. The first admin has
to be granted directly in the database — deliberately, because otherwise
"whoever registers first" would be the condition for holding every permission
in the system.

```bash
curl -u "$DATABASE_USER:$DATABASE_PASS" \
  -H "surreal-ns: $DATABASE_NAMESPACE" -H "surreal-db: $DATABASE_NAME" \
  --data "LET \$u = (SELECT VALUE id FROM user WHERE email = 'admin@example.com')[0];
          CREATE user_role CONTENT {
            user_id: \$u, role_id: role:admin,
            assigned_at: 0, assigned_by: user:system
          };" \
  "http://$DATABASE_URL/sql"
```

Now **log in again** — tokens do not carry roles, so an existing token will not
pick up the change:

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"CorrectHorse42!"}'
```

Confirm:

```bash
curl http://localhost:8080/api/auth/me -H "Authorization: Bearer $NEW_TOKEN"
# → "is_admin": true
```

You now have a working instance with an administrator.

::: tip These steps are tested
`tests/deployment_walkthrough.sh` in the repository executes this exact
sequence from scratch and asserts `is_admin: true` at the end. If the steps
above ever stop working, CI fails.
:::

## Next steps

- [**Configuration**](./configuration) — what the other environment variables do.
- [**Registering a client**](/integrate/clients) — connect your first
  application over OIDC.
- [**Deployment**](./deployment) — TLS, reverse proxies, multiple replicas, and
  the production gate.
- [**Security Model**](./security-model) — what you should turn on before this
  faces the internet.
