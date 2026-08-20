# OIDC API

13 个端点：7 个协议端点加 6 个客户端管理端点。
接入教程在 [接入](/zh/integrate/)。

## 发现

### `GET /.well-known/openid-configuration`

无需认证。同一个处理器也挂在
`/api/oidc/.well-known/openid-configuration`，
所以按任一惯例来的客户端都能用。

```bash
curl -s https://auth.example.com/.well-known/openid-configuration | jq
```

::: danger 从这里抄 `issuer`
不要自己拼。尾斜杠、端口、`www` —— 差一个字符，所有令牌校验都会失败。
:::

### `GET /api/oidc/jwks`

无需认证。用于验 ID Token 签名的 RSA 公钥。

```json
{ "keys": [ { "kty": "RSA", "use": "sig", "alg": "RS256", "kid": "...", "n": "...", "e": "AQAB" } ] }
```

缓存它。只在遇到不认识的 `kid` 时重取。

## 协议端点

### `GET /api/oidc/authorize`

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `response_type` | 是 | `code` |
| `client_id` | 是 | |
| `redirect_uri` | 是 | 必须与注册过的某个精确一致 |
| `scope` | 是 | 必须含 `openid` |
| `state` | 建议 | 原样返回；你的 CSRF 防护 |
| `code_challenge` | 公开客户端必填 | base64url(SHA-256(verifier)) |
| `code_challenge_method` | 带 challenge 时 | 只接受 `S256` |
| `nonce` | 可选 | 会回显进 ID Token |

::: warning 这个端点用的是浏览器会话，不是 bearer 令牌
没有 SoulAuth 会话时，用户会被重定向到 `LOGIN_PAGE_URL`
（默认 `{APP_URL}/login`）并带上 `return_to`。那个页面要你提供：
它调 `POST /api/auth/login`，然后重定向到 `return_to`。
:::

公开客户端强制 PKCE，只接受 `S256`。
公开客户端不带 `code_challenge` 会在这里被拒 —— 不是降级放行。

### `POST /api/oidc/token`

表单编码。客户端认证走 `client_secret_post` **或**
`client_secret_basic` —— **不能两者兼有**；两处同时带凭证会以
`invalid_request` 被拒，而不是静默挑一个用。

**授权码 grant**

```bash
curl -X POST https://auth.example.com/api/oidc/token \
  -u "${CLIENT_ID}:${CLIENT_SECRET}" \
  -d grant_type=authorization_code \
  -d code=... -d redirect_uri=... -d client_id=... -d code_verifier=...
```

**刷新 grant**

```bash
curl -X POST https://auth.example.com/api/oidc/token \
  -u "${CLIENT_ID}:${CLIENT_SECRET}" \
  -d grant_type=refresh_token -d refresh_token=...
```

```json
{
  "access_token": "...",
  "id_token": "...",
  "refresh_token": "...",
  "token_type": "Bearer",
  "expires_in": 300
}
```

::: danger Refresh token 会轮换；重放会吊销一切
每次刷新返回一个新的 refresh token，旧的立即作废。
提交一个已轮换的会被当作被盗，从而吊销**该用户在该客户端上的全部令牌**。

按会话串行化刷新。超时后绝不盲目重试 —— 先确认上一次是否已经成功。
:::

授权码是一次性的，并发下亦然：同时兑换两次恰好成功一次。

**客户端密钥配错不会消耗授权码** —— 改对密钥，用同一个 code 重试即可。

错误遵循 OIDC 形状：

```json
{ "error": "invalid_grant", "error_description": "Client not found" }
```

### `GET /api/oidc/userinfo`

用 bearer access token。返回已认证 subject 的 claims。

账号状态在这里同样生效 —— 被停用的账号得到 `403`，不是 claims。

### `GET /api/oidc/logout`

RP 发起的登出。

| 参数 | 说明 |
| --- | --- |
| `id_token_hint` | ID Token；其 `sid` 用于定位会话 |
| `post_logout_redirect_uri` | 之后把浏览器送去哪 |

## ID Token claims

| Claim | 说明 |
| --- | --- |
| `iss` | `APP_URL` 去掉尾斜杠 |
| `sub` | 稳定的用户标识 |
| `aud` | 你的 `client_id` |
| `exp` / `iat` | 寿命**被夹在 300 秒** |
| `sid` | 认证会话 id —— 始终存在 |
| `nonce` | 你传了就回显 |

::: tip `sid` 为空说明你拿的是 access token
SoulAuth 在取不到会话引用时拒签，从不签发缺 `sid` 的 ID Token。
这是最常见的接入混淆。
:::

## 客户端管理

读需要 `soulauth:oidc_clients.read`，写需要 `soulauth:oidc_clients.write`。

| 端点 | 用途 |
| --- | --- |
| `GET /api/oidc/clients` | 列表 |
| `POST /api/oidc/clients` | 创建 —— **密钥仅此一次返回** |
| `GET /api/oidc/clients/:client_id` | 读取（密钥掩码为 `***`） |
| `PUT /api/oidc/clients/:client_id` | 更新 |
| `DELETE /api/oidc/clients/:client_id` | 停用 |
| `POST /api/oidc/clients/:client_id/regenerate-secret` | 重新生成密钥 |

`id_token_lifetime` 超过 300 会被**静默夹到** 300。

`DELETE` 是停用而非销毁，好让引用该客户端的审计事件仍然有意义。

重新生成密钥会**立刻**打断所有还在用旧密钥的组件。

字段与细节见[注册客户端](/zh/integrate/clients)。

## 下一步

- [**授权码流程**](/zh/integrate/auth-code-flow)
- [**验证 ID Token**](/zh/integrate/verifying-tokens)
