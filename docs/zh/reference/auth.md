# 认证 API

`/api/auth` —— 21 个端点。通用规则见[通用约定](./api)。

## 注册与登录

### `POST /api/auth/register`

```json
{ "email": "user@example.com", "username": "user", "password": "CorrectHorse42!" }
```

密码策略：至少 `PASSWORD_MIN_LENGTH` 个字符（默认 12），
且含大写、小写、数字、符号四类中的三类。

邮箱或用户名被占用返回 `409`。注册**不**授予任何管理权限，
建立第一个管理员见[部署](/zh/guide/deployment#部署步骤)。

### `POST /api/auth/login`

```json
{ "email": "user@example.com", "password": "CorrectHorse42!" }
```

返回一个会话令牌。若账号开了 MFA，响应会指示需要第二因子，
到 `/api/auth/mfa/login-verify` 完成。

凭据错误返回 `401`。反复失败会触发[账号锁定](/zh/guide/lockout)。

### `POST /api/auth/admin/login`

管理后台的登录。要求账号至少持有以下之一：
`soulauth:users.read`、`soulauth:roles.read`、
`soulauth:security.read`、`soulauth:audit.read`。

### `GET /api/auth/me`

需要 bearer 令牌。返回当前用户，含 `is_admin`。

令牌不携带角色 —— 角色变更在下次登录时生效，
而这个端点反映的是调用时刻的当前状态。

## 会话管理

### `POST /api/auth/logout`

结束当前会话。

### `POST /api/auth/logout-all`

结束该用户的全部会话。

### `GET /api/auth/sessions`

列出用户的活跃会话。已过期的会话被过滤掉，结果截到 200 条。

## 邮箱验证

### `GET /api/auth/verify-email/:token`

消费验证邮件里的令牌。

### `POST /api/auth/resend-verification`

```json
{ "email": "user@example.com" }
```

响应不透露该地址是否存在。

## 密码生命周期

### `POST /api/auth/request-password-reset`

```json
{ "email": "user@example.com" }
```

无论地址是否存在，一律返回成功。

### `POST /api/auth/reset-password`

```json
{ "token": "<来自邮件>", "new_password": "NewCorrectHorse43!" }
```

重置成功会吊销**一切**：所有会话、所有 OIDC access token、
所有 refresh token。

### `POST /api/auth/initialize-password`

用于建号时没有密码的账号（由管理员开通）。需要认证。
已设置过密码则返回 `409` —— 这个端点不能用来改已有密码。

## 双因素认证

### `GET /api/auth/mfa/status`

当前用户是否开启了 MFA。

### `POST /api/auth/mfa/setup`

开始绑定。返回 TOTP 密钥与配置 URI。
密钥以 `MFA_SECRET_ENCRYPTION_KEY` 加密存储。

### `POST /api/auth/mfa/enable`

```json
{ "code": "123456" }
```

用验证器上的码确认绑定。

### `POST /api/auth/mfa/disable`

关闭 MFA。需要认证与一个有效验证码。

### `POST /api/auth/mfa/login-verify`

完成需要第二因子的登录。

::: tip 验证码不能被重放
水位线记录了最后一次被接受的时间步，所以一个码在有效窗口内不能用第二次。
被观察到的码不是可重用的码。
:::

## 第三方登录

| 端点 | 用途 |
| --- | --- |
| `GET /api/auth/login/google` | 发起 Google 流程 |
| `GET /api/auth/callback/google` | Google 回调到这里 |
| `GET /api/auth/login/github` | 发起 GitHub 流程 |
| `GET /api/auth/callback/github` | GitHub 回调到这里 |

没配凭据的 provider 返回 `501 Not Implemented`。

用 `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`、
`GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` 加 `OAUTH_REDIRECT_URL` 配置。
GitHub Enterprise 可用 `GITHUB_OAUTH_BASE_URL` 覆盖端点根地址 ——
明文值只允许指向环回地址。

::: warning 身份按 provider 隔离
第三方身份以 **provider 与 subject 一起**做键。只按 subject 做键
曾是一个真实的跨 provider 账号接管：数字 id 为 `4001` 的 GitHub 账号
会匹配上 sub 为字符串 `"4001"` 的 Google 用户，并拿到那个用户的会话。
:::

## 下一步

- [**用户与档案**](./users)
- [**安全**](./security)
- [**OIDC**](./oidc)
