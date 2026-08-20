# RBAC API

`/api/rbac` —— 17 个端点，管角色、权限与分配。

::: danger 它们管的是 SoulAuth，不是你的应用
这里每条权限都带 `soulauth:` 命名空间。它们控制的是谁可以管理 SoulAuth
自身 —— 管用户、读审计日志、解锁账号、注册 OIDC 客户端。

你应用的授权模型属于你的应用。这条线为什么存在、越过它要付什么代价，
见[在 Soulseed 生态里的位置](/zh/guide/soulseed-ecosystem)。
:::

## 角色

| 端点 | 权限 |
| --- | --- |
| `GET /api/rbac/roles` | `soulauth:roles.read` |
| `POST /api/rbac/roles` | `soulauth:roles.write` |
| `GET /api/rbac/roles/:role_name` | `soulauth:roles.read` |
| `POST /api/rbac/roles/:role_name` | `soulauth:roles.write`（更新） |
| `DELETE /api/rbac/roles/:role_name` | `soulauth:roles.delete` |
| `GET /api/rbac/roles/:role_name/permissions` | `soulauth:roles.read` |

::: tip 更新用的是 `POST`，不是 `PUT`
`POST /api/rbac/roles/:role_name` 更新一个已有角色。
它与 API 其余部分不一致，但路由就是这么写的。
:::

内置角色不可删除。

## 权限

| 端点 | 权限 |
| --- | --- |
| `GET /api/rbac/permissions` | `soulauth:permissions.read` |
| `POST /api/rbac/permissions` | `soulauth:permissions.write` |
| `GET /api/rbac/permissions/:permission_name` | `soulauth:permissions.read` |

## 分配

| 端点 | 权限 |
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

角色变更在用户**下次登录**时生效 —— 令牌不携带角色。

## 查询

| 端点 | 权限 |
| --- | --- |
| `GET /api/rbac/users/:user_id/roles` | 查自己无需权限；查别人需 `soulauth:users.read` |
| `GET /api/rbac/users/:user_id/permissions` | 同上 |
| `GET /api/rbac/check/permission/:permission_name` | 已认证即可 |
| `GET /api/rbac/check/role/:role_name` | 已认证即可 |

任何人都可以查自己的角色与实际权限。查别人的需要 `soulauth:users.read`。

两个 `check/*` 端点针对调用者返回是 / 否 ——
适合前端用来决定要不要渲染某个管理入口。

## 这里的错误响应没有响应体

::: warning RBAC 的错误不带响应体
这个模块只返回裸状态码。`403` 到达时不会有 JSON 说明缺的是哪条权限。
这是已知的粗糙处 —— 请按状态码匹配，并对照本页表格查所需权限。
:::

## 内置角色

由 `initial_data.sql` 播种：

| 角色 | 持有 |
| --- | --- |
| `admin` | 全部 |
| `user` | 基线角色，无任何管理权限 |
| `user_manager` | 用户与档案管理 |
| `security_manager` | `security.read`、`security.write`、`users.read` |
| `auditor` | 仅 `audit.read` |

注意 `auditor`：它只有 `audit.read`，因此能访问 dashboard、
activity-summary 与 security-report，但**访问不了** security-metrics
和 system-health —— 那两个要 `soulauth:security.read`。
想要完整读取覆盖，两条都授予。

完整映射见[权限参考](./permissions)。

## 下一步

- [**权限**](./permissions) —— 每条权限及其持有者。
- [**在 Soulseed 生态里的位置**](/zh/guide/soulseed-ecosystem)
