# 管理

<ContractNote file="openapi.yaml" />

## 用户

读取与修改**别人**的记录。全部受权限管控；每个端点都写明它要哪一条。

<ApiTable tag="Administration" />

::: tip `/api/users` 与 `/api/me` 的区别
`/api/users/*` 按 id 作用于别人，需要权限。`/api/me/*` 作用于自己，只需一枚会话。
它们曾经共用同一个前缀，于是产生了 `/api/users/users/:user_id` 这样的路径——
<Status kind="tested" guard="conformance::j7" /> 现在会拒绝重复的路径段。
:::

## 角色与权限

角色、权限的管理以及对主体的分配都在 `/api/rbac` 下，已在上表中。

两个端点值得单独点出来，因为它们便宜又实用：
`/api/rbac/check/permission/:name` 与 `/api/rbac/check/role/:name`
回答的是**调用方自己**，只需一枚会话。

## 权限词汇表

<ContractNote file="permissions.yaml" />

<PermissionTable />

::: warning 一条没有任何 handler 检查的权限，比没有这条权限更糟
它看起来像访问控制，实际什么也没管住。`conformance::j1` 双向断言——
种子里有而没人检查的，或者代码里检查而种子从没建过的，都会让套件变红。
:::

## 安全运维

锁定状态查询与手工解锁。

<ApiTable tag="Security" />

解锁是幂等的：对一个没被锁的账号解锁返回 `false` 而不是报错。
上锁与解锁都会写审计——只记上锁不记解锁的话，审计里会留下一串永远没有下文的事件。

## 运营

<ApiTable tag="Operations" />

::: warning 会员状态不该挂在身份根上
<Status kind="planned" /> `membership_level` 与 `membership_expiry` 挂在遗留的
`user` 行上，而且总览端点里硬编码了定价档位。商业状态不是身份状态；
这一条记在[一致性读数](/zh/project/status)里。
:::

## 接下来

| | |
|---|---|
| 审计与报表 | [审计](/zh/reference/audit) |
| 每一个配置项 | [配置](/zh/reference/configuration) |
