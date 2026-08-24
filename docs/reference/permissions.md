# Permissions

Every permission SoulAuth defines, who holds it, and which of them the code
actually checks.

::: danger These govern SoulAuth, not your application
The `soulauth:` prefix is a namespace assertion. These permissions control
SoulAuth's own administrative surface — nothing else. See [Role in the Soulseed
Ecosystem](/guide/soulseed-ecosystem).
:::

## Enforced permissions

Twelve permissions are checked by the code:

| Permission | Gates |
| --- | --- |
| `soulauth:users.read` | List/read users, profiles and preferences; read another user's roles |
| `soulauth:users.write` | Change account status and membership level |
| `soulauth:roles.read` | List and read roles |
| `soulauth:roles.write` | Create and update roles; assign roles to users |
| `soulauth:roles.delete` | Delete roles |
| `soulauth:permissions.read` | List and read permissions |
| `soulauth:permissions.write` | Create permissions; assign them to roles |
| `soulauth:security.read` | Read lockout status, security metrics, system health |
| `soulauth:security.write` | Unlock accounts and IPs |
| `soulauth:audit.read` | Audit dashboard, activity summary, security report, other users' activity |
| `soulauth:oidc_clients.read` | List and read OIDC clients |
| `soulauth:oidc_clients.write` | Create, update, disable clients; regenerate secrets |

## The registry matches what is enforced

`initial_data.sql` seeds **exactly** the twelve permissions the code checks —
no more, no fewer.

`tests/conformance.rs::i3` asserts this in both directions: one extra in the
seed (grantable but inert) or one extra in the code (permanently denied) turns
the test red.

::: tip It used to be otherwise
The seed once carried 18. Six of them — `users.delete`, `permissions.delete`,
`profile.*`, `preferences.*` — were consulted by no endpoint. They could be
granted and would show up in a role's details, but granting them did nothing.

An administrator holding `soulauth:users.delete` would reasonably believe they
had unlocked something. They had not. The registry was lying, so those six
were removed.

The profile and preferences pairs never needed a permission: those endpoints
are self-service and always act on the caller. The two `delete` permissions
described operations the API has never exposed.
:::

## Built-in roles

| Role | Permissions |
| --- | --- |
| `admin` | All 12 permissions |
| `user` | None — the baseline role |
| `user_manager` | `users.read`, `users.write` |
| `security_manager` | `security.read`, `security.write`, `users.read` |
| `auditor` | `audit.read` |

Built-in roles cannot be deleted.

### `auditor` cannot see everything audit-shaped

With only `soulauth:audit.read`, the `auditor` role reaches:

- ✅ `/api/audit/dashboard`
- ✅ `/api/audit/activity-summary`
- ✅ `/api/audit/security-report`
- ❌ `/api/audit/security-metrics` — needs `soulauth:security.read`
- ❌ `/api/audit/system-health` — needs `soulauth:security.read`

Grant `soulauth:security.read` as well if you want an auditor to see security
posture, not just activity history.

### `user_manager` cannot manage roles

It can change account status and membership, but not assign roles — that needs
`soulauth:roles.write`. Separating "who can suspend an account" from "who can
grant administrative power" is deliberate.

## Admin console access

`POST /api/auth/admin/login` admits an account holding **any one** of:

```text
soulauth:users.read
soulauth:roles.read
soulauth:security.read
soulauth:audit.read
```

So `auditor` and `security_manager` can both reach the console, each seeing
only what their permissions allow.

## Assigning permissions

Assign a role to a user:

```bash
curl -X POST https://auth.example.com/api/rbac/users/user:abc/roles/assign \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"role_name": "auditor"}'
```

Add a permission to a role:

```bash
curl -X POST https://auth.example.com/api/rbac/roles/auditor/permissions/assign \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"permission_name": "soulauth:security.read"}'
```

::: tip Changes take effect on next login
Tokens do not carry roles. A user whose permissions changed must log in again.
:::

## The first administrator

Registration grants nothing. The first admin is assigned directly in the
database — otherwise "whoever registered first" would be the condition for
holding every permission. See
[Deployment](/guide/deployment#deployment-steps).

## Next steps

- [**RBAC API**](./rbac)
- [**Role in the Soulseed Ecosystem**](/guide/soulseed-ecosystem)
