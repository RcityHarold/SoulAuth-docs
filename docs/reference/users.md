# Users & Profiles API

`/api/users` — 14 endpoints. Two groups: self-service (the caller's own data)
and administrative (any user, permission-gated).

## Self-service

No special permission — these always act on the authenticated caller.

| Endpoint | Purpose |
| --- | --- |
| `POST /api/users/profile` | Create the caller's profile |
| `GET /api/users/profile` | Read it |
| `PUT /api/users/profile` | Update it |
| `POST /api/users/preferences` | Create preferences |
| `GET /api/users/preferences` | Read them |
| `PUT /api/users/preferences` | Update them |
| `GET /api/users/activity-log` | The caller's own activity history |

## Administrative

::: tip The doubled path segment is not a typo
The module is mounted at `/api/users` and its administrative routes live under
`/users`, giving `/api/users/users/:user_id`. It is awkward, and it is the
actual path.
:::

| Endpoint | Permission | Purpose |
| --- | --- | --- |
| `GET /api/users/users` | `soulauth:users.read` | List users |
| `GET /api/users/users/:user_id` | `soulauth:users.read` | Read one user |
| `PUT /api/users/users/:user_id/status` | `soulauth:users.write` | Change account status |
| `PUT /api/users/users/:user_id/membership` | `soulauth:users.write` | Change membership level |
| `GET /api/users/users/:user_id/profile` | `soulauth:users.read` | Read a user's profile |
| `GET /api/users/users/:user_id/preferences` | `soulauth:users.read` | Read a user's preferences |
| `GET /api/users/users/:user_id/activity-log` | `soulauth:audit.read` | Read a user's activity |

Note the last row: reading someone else's activity is an **audit** capability,
not a user-management one, despite the route's location.

## Changing account status

```bash
curl -X PUT https://auth.example.com/api/users/users/user:abc/status \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"status": "Suspended"}'
```

Statuses: `Active`, `Suspended`, `Inactive`, `Deleted`.

Setting anything other than `Active` performs three actions immediately:

1. invalidates the auth cache for that user,
2. deletes their session rows,
3. revokes every OIDC access and refresh token they hold.

::: warning Why all three
Changing the status field alone only takes effect the next time someone asks.
An OIDC integration already holding a refresh token would keep rotating out
fresh access and ID tokens indefinitely — suspension would work on the login
page and nowhere else. This was a real authentication bypass before the token
revocation was added.
:::

Consumers holding an ID token issued before the change continue to verify it
successfully until it expires — at most 300 seconds. See
[Revocation](/integrate/soulseedos#revocation-and-the-staleness-you-are-accepting).

## Membership level

```bash
curl -X PUT https://auth.example.com/api/users/users/user:abc/membership \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"membership_level": "pro", "membership_expiry": "2027-01-01T00:00:00Z"}'
```

::: danger `membership_level` is not a permission
It describes what a user has **paid for**, not what they are **allowed to do**.
In SoulSeedOS terms it belongs to Product Entitlement / Billing / Marketplace
(`P0-DECISION-09 §4.7`), and it must never be treated as an authorization
decision. Using it as one puts your billing tier on the security path.
:::

## Activity log

```
GET /api/users/activity-log?page=1&page_size=50
```

Returns the caller's own history. See [Auditing](/guide/auditing) for the
action vocabulary.

## Known limitation

`GET /api/users/users` issues one query per user to attach roles — an N+1. It
is fine at hundreds of users and will not be at hundreds of thousands. It is
listed here rather than left to be discovered under load.

## Next steps

- [**RBAC**](./rbac)
- [**Audit**](./audit)
- [**Permissions**](./permissions)
