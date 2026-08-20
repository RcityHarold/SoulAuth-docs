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

## Seeded but unenforced

`initial_data.sql` seeds **18** permissions. Six of them are not checked
anywhere in the code:

```text
soulauth:users.delete
soulauth:permissions.delete
soulauth:profile.read
soulauth:profile.write
soulauth:preferences.read
soulauth:preferences.write
```

They exist as data and are assigned to roles, but no endpoint consults them.
The profile and preferences pairs are unenforced because those endpoints are
self-service — they always act on the caller and need no permission. The two
`delete` permissions correspond to operations the API does not expose.

::: warning Granting these does nothing
They are listed here so that a role holding `soulauth:users.delete` is not
mistaken for a role that can delete users. There is no such endpoint.
:::

## Built-in roles

| Role | Permissions |
| --- | --- |
| `admin` | All 18 seeded permissions |
| `user` | None — the baseline role |
| `user_manager` | `users.read`, `users.write`, `users.delete`, `profile.read`, `profile.write`, `preferences.read`, `preferences.write` |
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
