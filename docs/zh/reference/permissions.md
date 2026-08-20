# 权限

SoulAuth 定义的全部权限、谁持有它们，以及其中哪些是代码真的会校验的。

::: danger 它们管的是 SoulAuth，不是你的应用
`soulauth:` 前缀是一条命名空间断言。这些权限只控制 SoulAuth 自己的管理面，
不控制别的。见[在 Soulseed 生态里的位置](/zh/guide/soulseed-ecosystem)。
:::

## 会被校验的权限

代码实际校验的有 12 条：

| 权限 | 把守什么 |
| --- | --- |
| `soulauth:users.read` | 列出 / 读取用户、档案与偏好；读别人的角色 |
| `soulauth:users.write` | 修改账号状态与会员等级 |
| `soulauth:roles.read` | 列出与读取角色 |
| `soulauth:roles.write` | 创建与更新角色；给用户分配角色 |
| `soulauth:roles.delete` | 删除角色 |
| `soulauth:permissions.read` | 列出与读取权限 |
| `soulauth:permissions.write` | 创建权限；把权限分配给角色 |
| `soulauth:security.read` | 读锁定状态、安全指标、系统健康 |
| `soulauth:security.write` | 解锁账号与 IP |
| `soulauth:audit.read` | 审计仪表盘、活动汇总、安全报告、别人的活动 |
| `soulauth:oidc_clients.read` | 列出与读取 OIDC 客户端 |
| `soulauth:oidc_clients.write` | 创建、更新、停用客户端；重新生成密钥 |

## 播了种但没有被校验的

`initial_data.sql` 播种了 **18** 条权限，其中 6 条在代码里没有任何地方校验：

```text
soulauth:users.delete
soulauth:permissions.delete
soulauth:profile.read
soulauth:profile.write
soulauth:preferences.read
soulauth:preferences.write
```

它们作为数据存在，也被分配给了角色，但没有任何端点会去查它们。
profile 与 preferences 这两对之所以没被校验，是因为对应端点是自助的 ——
它们总是作用在调用者身上，不需要权限。两条 `delete` 对应的操作，
API 根本没有暴露。

::: warning 授予这些不产生任何效果
把它们列在这里，是为了避免有人把一个持有 `soulauth:users.delete` 的角色
误认为「能删用户的角色」。并不存在那样一个端点。
:::

## 内置角色

| 角色 | 权限 |
| --- | --- |
| `admin` | 全部 18 条播种权限 |
| `user` | 无 —— 基线角色 |
| `user_manager` | `users.read`、`users.write`、`users.delete`、`profile.read`、`profile.write`、`preferences.read`、`preferences.write` |
| `security_manager` | `security.read`、`security.write`、`users.read` |
| `auditor` | `audit.read` |

内置角色不可删除。

### `auditor` 看不到所有「像审计」的东西

只持有 `soulauth:audit.read` 时，`auditor` 角色能访问：

- ✅ `/api/audit/dashboard`
- ✅ `/api/audit/activity-summary`
- ✅ `/api/audit/security-report`
- ❌ `/api/audit/security-metrics` —— 需要 `soulauth:security.read`
- ❌ `/api/audit/system-health` —— 需要 `soulauth:security.read`

如果你希望审计员看到的是安全态势而不只是活动历史，
请一并授予 `soulauth:security.read`。

### `user_manager` 不能管角色

它能改账号状态与会员等级，但不能分配角色 —— 那需要 `soulauth:roles.write`。
把「谁能停用一个账号」和「谁能授予管理权力」分开，是刻意的。

## 管理后台准入

`POST /api/auth/admin/login` 接纳持有下列**任意一条**的账号：

```text
soulauth:users.read
soulauth:roles.read
soulauth:security.read
soulauth:audit.read
```

所以 `auditor` 与 `security_manager` 都能进后台，
各自只看得到自己权限允许的部分。

## 分配权限

给用户分配角色：

```bash
curl -X POST https://auth.example.com/api/rbac/users/user:abc/roles/assign \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"role_name": "auditor"}'
```

给角色添加权限：

```bash
curl -X POST https://auth.example.com/api/rbac/roles/auditor/permissions/assign \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"permission_name": "soulauth:security.read"}'
```

::: tip 变更在下次登录时生效
令牌不携带角色。权限变了的用户必须重新登录。
:::

## 第一个管理员

注册什么也不授予。第一个管理员直接在数据库里指派 ——
否则「谁第一个注册」就成了拿到全部权限的条件。
见[部署](/zh/guide/deployment#部署步骤)。

## 下一步

- [**RBAC API**](./rbac)
- [**在 Soulseed 生态里的位置**](/zh/guide/soulseed-ecosystem)
