---
layout: home

hero:
  name: SoulAuth
  text: Identity for systems that must prove who acted
  tagline: >-
    An OpenID Connect provider written in Rust. Registration, sessions, MFA,
    RBAC and a tamper-evident audit trail — one binary, one database.
  image:
    src: /logo.svg
    alt: SoulAuth
  actions:
    - theme: brand
      text: Quickstart
      link: /guide/quickstart
    - theme: alt
      text: What is SoulAuth?
      link: /guide/what-is-soulauth
    - theme: alt
      text: GitHub
      link: https://github.com/RcityHarold/SoulAuth

features:
  - icon: 🔐
    title: A real OIDC provider
    details: >-
      Authorization code flow with mandatory PKCE for public clients, RS256 ID
      tokens served over JWKS, refresh rotation with reuse detection, and a
      discovery document you can point any conformant client at.
    link: /integrate/auth-code-flow
    linkText: See the flow
  - icon: 🧩
    title: Batteries included, not assumed
    details: >-
      Email/password, Google and GitHub sign-in, TOTP MFA with replay
      protection, password reset, session listing and revocation. 74 endpoints
      across eight modules — not a framework you finish yourself.
    link: /reference/api
    linkText: Browse the API
  - icon: 🛡️
    title: Hostile-input aware
    details: >-
      Per-route rate limiting, account and IP lockout you can tune and clear,
      Argon2 password hashing, encrypted TOTP secrets, and account status
      enforced on the OIDC path — not just at login.
    link: /guide/security-model
    linkText: Read the security model
  - icon: 🧾
    title: Auditable by construction
    details: >-
      Every security-relevant action writes an audit event, including the
      no-ops. Dashboards, activity summaries and security reports ship as
      first-class endpoints rather than log-scraping exercises.
    link: /guide/auditing
    linkText: See auditing
  - icon: 🌱
    title: A Soulseed infrastructure component
    details: >-
      SoulAuth is the Identity / Authentication / Session / MFA / OIDC provider
      of the SoulSeedOS P3 plane. It answers who this is — and deliberately
      stops short of deciding what they may do.
    link: /guide/soulseed-ecosystem
    linkText: Understand the boundary
  - icon: ⚙️
    title: Operable on day one
    details: >-
      Four required environment variables, a production gate that refuses to
      start misconfigured, a schema check with copy-pasteable fixes, and a
      deployment walkthrough that runs in CI so the docs cannot silently rot.
    link: /guide/deployment
    linkText: Deploy it
---
