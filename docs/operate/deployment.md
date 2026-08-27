# Deployment

The path below is the one the repository executes in CI —
`tests/deployment_walkthrough.sh` runs these exact steps from an empty database to a
working administrator. <Status kind="tested" guard="deployment_walkthrough.sh" />

That script exists because this document used to be wrong. `surreal import` was
documented with a flag that does not exist, and the schema went into a namespace the
process does not read — the service started, `/health` returned `ok`, and the first
write failed. Three failures, all produced by following the instructions, none findable
by rereading them.

## What you deploy

One statically-linked Rust binary and a SurrealDB instance. No runtime, no application
server, no sidecar.

## 1 · Database

```bash
surreal start --bind 0.0.0.0:8000 --user root --pass root \
  file:/var/lib/surrealdb/soulauth.db
```

For production give SoulAuth a scoped account rather than `root`, and put TLS in front —
see the [production checklist](/operate/production-checklist).

## 2 · Schema

SoulAuth issues no DDL. It cannot create or alter its own tables; that boundary is
structural, not a setting. You import the two files once:

```bash
DB="--endpoint http://127.0.0.1:8000 --user root --pass root \
    --namespace auth --database main"

surreal import $DB schema.sql
surreal import $DB initial_data.sql
```

::: danger The namespace and database must match the process
`auth` / `main` here must equal `DATABASE_NAMESPACE` / `DATABASE_NAME` below. Get it
wrong and everything looks fine until the first write.

The flag is `--endpoint`. `--conn` is the pre-3.x spelling and fails with an unhelpful
message.
:::

`initial_data.sql` seeds the system roles and permissions. Skipping it leaves you unable
to bootstrap an administrator.

## 3 · Configuration

```bash
DATABASE_URL=127.0.0.1:8000
DATABASE_NAMESPACE=auth
DATABASE_NAME=main
DATABASE_USER=root
DATABASE_PASS=root

JWT_SECRET=<openssl rand -hex 32>
APP_URL=http://localhost:8080
BIND_ADDR=127.0.0.1:8080
SMTP_HOST=127.0.0.1
SMTP_FROM=noreply@example.com
```

Every key: [configuration reference](/reference/configuration).

## 4 · Run

```bash
./soulauth
curl http://localhost:8080/health
# {"status":"ok","uptime_seconds":3}
```

## 5 · First administrator

The startup log prints a one-time bootstrap token:

```
WARN No administrator found. Bootstrap token for this process: 7f3a…
```

```bash
curl -X POST http://localhost:8080/api/bootstrap/admin \
  -H 'Content-Type: application/json' \
  -d '{"token":"7f3a…","email":"admin@example.com","username":"admin","password":"CorrectHorse42!"}'
```

The gate closes permanently once an administrator exists. **Do not create the first
admin by writing to the database** — that path predates the bootstrap endpoint and the
public documentation forbids it.

## Docker Compose

`docker-compose.yml` brings up SurrealDB, imports the schema and starts SoulAuth in one
command. It is <Status kind="implemented" /> — the file exists and has been reviewed, but
nobody has executed it end to end, so this page does not present it as verified.

The repository's rule after the incident above: *executable documentation must have been
executed.* When someone runs it through, this section moves to the top.

## systemd

```ini
[Unit]
Description=SoulAuth
After=network.target

[Service]
Type=simple
User=soulauth
EnvironmentFile=/etc/soulauth/env
ExecStart=/usr/local/bin/soulauth
Restart=on-failure
RestartSec=5

NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/var/lib/soulauth

[Install]
WantedBy=multi-user.target
```

Keep `/etc/soulauth/env` at mode `0600` — it holds `JWT_SECRET`.

## Reverse proxy

```nginx
location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_set_header Host              $host;
    proxy_set_header X-Real-IP         $remote_addr;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Set `TRUST_PROXY_HEADERS=true` **only** if SoulAuth cannot be reached without going
through the proxy. Otherwise a client forges `X-Forwarded-For` and walks past IP rate
limiting.

## Upgrading

1. Read the release notes for schema changes.
2. Back up the SurrealDB data directory.
3. Import any new schema statements.
4. Replace the binary and restart.

Rolling restarts are fine as long as every replica shares the same `JWT_SECRET` and OIDC
signing key. They must, or tokens from one replica fail against another's JWKS.

## Verify it yourself

```bash
./tests/deployment_walkthrough.sh
```

Zero failures means this document is executable, not merely readable.

## Next

| | |
|---|---|
| Harden it | [Production checklist](/operate/production-checklist) |
| Backups, rotation, incidents | [Operations & recovery](/operate/operations-and-recovery) |
