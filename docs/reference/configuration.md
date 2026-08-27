# Configuration

<ContractNote file="configuration.yaml" />

Configuration comes from **process environment variables only**. A `.env` file in the
working directory is read at startup. There is no configuration file format, no remote
configuration, and no runtime reload — changing anything means restarting the process.

## The production gate

Two settings have defaults that would silently destroy already-issued credentials if a
real deployment ran on them. Rather than warn, SoulAuth **refuses to start**:

when `APP_URL` is not a loopback address, `OIDC_RSA_PRIVATE_KEY_PATH` (or `_PEM`) and
`MFA_SECRET_ENCRYPTION_KEY` become required.

That is why the [quickstart](/start/quickstart) needs neither — and equally why the
quickstart's settings are not a deployment.

## `APP_URL` is not the listen address

`APP_URL` is the **public** address. It determines:

- the OIDC `issuer` — which must match character for character, or every client's
  discovery check fails;
- the prefix of links in outgoing mail;
- whether session cookies carry `Secure`;
- whether the production gate above applies.

`BIND_ADDR` is what the process listens on. In any deployment behind a proxy these two
differ.

## All keys

<ConfigTable />

## Next

| | |
|---|---|
| Getting a deployment right | [Production checklist](/operate/production-checklist) |
| What each setting protects against | [Security model](/security/security-model) |
