# RBAC API

`/api/rbac` — 17 endpoints for roles, permissions and assignments.

::: danger These govern SoulAuth, not your application
Every permission here is namespaced `soulauth:`. They control who may
administer SoulAuth itself — manage users, read audit logs, unlock accounts,
register OIDC clients.

Your application's authorization model is your application's. See [Role in the
Soulseed Ecosystem](/guide/soulseed-ecosystem) for why this line exists and
what crossing it costs.
:::

## Roles

| Endpoint | Permission |
| --- | --- |
| `GET /api/rbac/roles` | `soulauth:roles.read` |
| `POST /api/rbac/roles` | `soulauth:roles.write` |
| `GET /api/rbac/roles/:role_name` | `soulauth:roles.read` |
| `POST /api/rbac/roles/:role_name` | `soulauth:roles.write` (update) |
| `DELETE /api/rbac/roles/:role_name` | `soulauth:roles.delete` |
| `GET /api/rbac/roles/:role_name/permissions` | `soulauth:roles.read` |

::: tip Update is `POST`, not `PUT`
`POST /api/rbac/roles/:role_name` updates an existing role. It is inconsistent
with the rest of the API, and it is what the router does.
:::

Built-in roles cannot be deleted.

## Permissions

| Endpoint | Permission |
| --- | --- |
| `GET /api/rbac/permissions` | `soulauth:permissions.read` |
| `POST /api/rbac/permissions` | `soulauth:permissions.write` |
| `GET /api/rbac/permissions/:permission_name` | `soulauth:permissions.read` |

## Assignment

| Endpoint | Permission |
| --- | --- |
| `POST /api/rbac/roles/:role_name/permissions/assign` | `soulauth:permissions.write` |
| `POST /api/rbac/roles/:role_name/permissions/remove` | `soulauth:permissions.write` |
| `POST /api/rbac/users/:user_id/roles/assign` | `soulauth:roles.write` |
| `POST /api/rbac/users/:user_id/roles/remove` | `soulauth:roles.write` |

```bash
curl -X POST https://auth.example.com/api/rbac/users/user:abc/roles/assign \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"role_name": "auditor"}'
```

Role changes take effect on the user's **next login** — tokens do not carry
roles.

## Inspection

| Endpoint | Permission |
| --- | --- |
| `GET /api/rbac/users/:user_id/roles` | none for self; `soulauth:users.read` for others |
| `GET /api/rbac/users/:user_id/permissions` | none for self; `soulauth:users.read` for others |
| `GET /api/rbac/check/permission/:permission_name` | authenticated |
| `GET /api/rbac/check/role/:role_name` | authenticated |

Anyone may inspect their own roles and effective permissions. Inspecting
another user's requires `soulauth:users.read`.

The two `check/*` endpoints answer yes/no for the calling user — useful for a
front end deciding whether to render an admin control.

## Error responses are empty here

::: warning No response body on RBAC errors
This module returns bare status codes. A `403` arrives with no JSON explaining
which permission was missing. It is a known rough edge — match on the status
code and consult this table for the requirement.
:::

## Built-in roles

Seeded by `initial_data.sql`:

| Role | Holds |
| --- | --- |
| `admin` | Everything |
| `user` | Baseline; no administrative permissions |
| `user_manager` | `users.read`, `users.write` |
| `security_manager` | `security.read`, `security.write`, `users.read` |
| `auditor` | `audit.read` only |

Note `auditor`: with only `audit.read`, it can reach the dashboard,
activity-summary and security-report endpoints but **not** security-metrics or
system-health, which require `soulauth:security.read`. Grant both if you want
full read coverage.

Full mapping in the [permissions reference](./permissions).

## Next steps

- [**Permissions**](./permissions) — every permission and who holds it.
- [**Role in the Soulseed Ecosystem**](/guide/soulseed-ecosystem)
