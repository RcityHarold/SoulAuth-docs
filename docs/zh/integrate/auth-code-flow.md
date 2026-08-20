# 授权码流程

完整的一趟往返，并点出 SoulAuth 特有的细节。

## 总览

```
  用户            你的应用             SoulAuth
   │                 │                    │
   │─── 访问 ───────▶│                    │
   │                 │── 重定向到 ───────▶│  /api/oidc/authorize
   │                 │   authorize        │
   │◀────────── 登录页（若无会话）────────│
   │─── 凭据 ──────────────────────────────▶  /api/auth/login
   │                 │                    │
   │◀── 带 ?code= 重定向回来 ─────────────│
   │                 │                    │
   │─── code ───────▶│                    │
   │                 │── POST code ──────▶│  /api/oidc/token
   │                 │◀─ id/access/refresh│
   │                 │                    │
   │                 │── 本地验签 ────────│  （JWKS，已缓存）
   │◀── 你的会话     │                    │
```

## 1. 重定向到 authorize

```
GET /api/oidc/authorize
  ?response_type=code
  &client_id=<你的 client_id>
  &redirect_uri=https://app.example.com/auth/callback
  &scope=openid
  &state=<随机值，绑定到用户的浏览器会话>
  &code_challenge=<base64url(sha256(verifier))>
  &code_challenge_method=S256
```

`redirect_uri` 必须与该客户端注册过的某一个精确一致。

`state` 由你生成、回来时由你校验 —— 它是这条流程的 CSRF 防护，
SoulAuth 会原样返回。

::: warning 这个端点用的是浏览器会话，不是 bearer 令牌
`/api/oidc/authorize` 认证的是**用户**，靠他们的 SoulAuth 会话 cookie。
没有会话时会被重定向到 `LOGIN_PAGE_URL`（默认 `{APP_URL}/login`）
并带上 `return_to`。

**那个登录页要你自己写。** 它必须调 `POST /api/auth/login`，
然后把浏览器送到 `return_to`。SoulAuth 不带任何界面。
:::

## 2. 生成 PKCE 对

公开客户端强制，其它客户端也建议用。只接受 `S256`。

```bash
CODE_VERIFIER=$(openssl rand -base64 96 | tr -d '\n=' | tr '/+' '_-')
CODE_CHALLENGE=$(printf '%s' "$CODE_VERIFIER" \
  | openssl dgst -binary -sha256 \
  | openssl base64 | tr -d '\n=' | tr '/+' '_-')
```

verifier 留在服务端，与 `state` 关联保存。

## 3. 处理回调

```
GET https://app.example.com/auth/callback?code=<code>&state=<state>
```

先校验 `state` 与你为这个浏览器会话签发的一致，再去兑换。

## 4. 兑换授权码

```bash
curl -X POST https://auth.example.com/api/oidc/token \
  -u "${CLIENT_ID}:${CLIENT_SECRET}" \
  -d grant_type=authorization_code \
  -d code="$CODE" \
  -d redirect_uri=https://app.example.com/auth/callback \
  -d client_id="$CLIENT_ID" \
  -d code_verifier="$CODE_VERIFIER"
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

授权码是一次性的，而且**在并发下也是一次性的**：
同一个码被同时兑换两次，恰好成功一次。

::: tip 密钥配错不会烧掉这个码
客户端认证失败时授权码仍可兑换。改对密钥、用同一个 code 重试即可，
不必让用户重走登录。
:::

## 5. 验证 ID Token

在本地对着 JWKS 验。永远不要信任未验证的令牌，
也不要为每个请求回调 SoulAuth。→ [验证 ID Token](./verifying-tokens)

## 6. 刷新

```bash
curl -X POST https://auth.example.com/api/oidc/token \
  -u "${CLIENT_ID}:${CLIENT_SECRET}" \
  -d grant_type=refresh_token \
  -d refresh_token="$REFRESH_TOKEN"
```

响应里含一个**新的** refresh token，旧的已经作废。

::: danger 重放 refresh token 会把用户登出
Refresh token 每次使用都轮换。提交一个已经轮换掉的会被当作被盗信号，
SoulAuth 会吊销**该用户在该客户端上的全部令牌**。

这让朴素的重试逻辑变得危险：

- **按会话串行化刷新。** 绝不并发刷。
- **超时后不要盲目重试。** 先确认上一次是否已经成功。

一次网络抖动加上一次自动重试，等于一个被踢下线的用户。
:::

## 7. 登出

```
GET /api/oidc/logout?id_token_hint=<id_token>&post_logout_redirect_uri=...
```

RP 发起的登出。ID Token 里的 `sid` claim 是 SoulAuth
用来定位并终止正确会话的依据。

## Scope

`openid` 必填。SoulAuth 的 scope 集合刻意很小 ——
它做的是认证用户，不是替第三方资源 API 中介访问权。

## 下一步

- [**验证 ID Token**](./verifying-tokens)
- [**BFF 模式**](./bff)
- [**OIDC API 参考**](/zh/reference/oidc)
