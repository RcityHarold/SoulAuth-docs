# 注册客户端

每个 OIDC 集成都从这里开始。注册客户端需要 `soulauth:oidc_clients.write`，
默认只有 `admin` 持有它。

```bash
curl -X POST $SOULAUTH/api/oidc/clients \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "client_name": "Demo App",
    "client_type": "confidential",
    "redirect_uris": ["http://localhost:3000/callback"],
    "allowed_grant_types": ["authorization_code", "refresh_token"],
    "allowed_scopes": ["openid", "profile", "email"]
  }'
```

```json
{
  "client_id": "client_1787796518211crEBwUSf",
  "client_secret": "OJFawoLENnseRQKvyJBOjAeOtW881Tinm2div3XnMkLhpSz2sN29RSw1ebKG13OM",
  "client_name": "Demo App",
  "client_type": "confidential",
  "redirect_uris": ["http://localhost:3000/callback"],
  "post_logout_redirect_uris": [],
  "allowed_scopes": ["openid", "profile", "email"],
  "allowed_grant_types": ["authorization_code", "refresh_token"],
  "allowed_response_types": ["code"],
  "require_pkce": true,
  "access_token_lifetime": 3600,
  "refresh_token_lifetime": 86400,
  "id_token_lifetime": 300,
  "is_active": true,
  "created_at": 1787796518,
  "updated_at": 1787796518
}
```

::: danger 这是你唯一一次看到密钥
`client_secret` 以哈希存储。它只在这里返回一次。之后列出客户端会返回**除密钥外**
的一切——那不是文档漏写，是这个 API 拿不出它没有以可读形式保存的东西。

丢了？`POST /api/oidc/clients/{client_id}/regenerate-secret` 签发一枚新的并作废旧的。
:::

## confidential 还是 public

唯一真正要决定的事：

| | 什么时候用 | 后果 |
|---|---|---|
| `confidential` | 你的服务器能保管密钥——后端、BFF、服务端渲染应用 | 令牌端点要求密钥。浏览器侧应用**不能**是它，因为把密钥发给浏览器就等于公开它。 |
| `public` | 原生应用、没有后端的 SPA | 没有密钥。PKCE 是唯一阻止授权码被拦截利用的东西，所以它不是可选项。 |

两者的 `require_pkce` 都默认为 `true`，且只接受 `S256`。`plain` 挡不住被拦截的
授权码被兑换，所以不提供。

## 重定向 URI

**精确匹配**——整串相等，不支持通配符，不支持前缀匹配。把你用到的每个环境都登记上：

```json
"redirect_uris": [
  "http://localhost:3000/callback",
  "https://app.example.com/callback"
]
```

这是客户端上安全相关性最强的一个字段。能改它的人就能把一枚有效授权码重定向给自己，
所以修改客户端需要 `.write`，而这条权限授予得很窄。

## 管理客户端

```bash
# 列出（永不返回密钥）
curl $SOULAUTH/api/oidc/clients -H "Authorization: Bearer $ADMIN_TOKEN"

# 更新
curl -X PUT $SOULAUTH/api/oidc/clients/$CLIENT_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" -H 'Content-Type: application/json' \
  -d '{"redirect_uris":["https://app.example.com/callback"]}'

# 禁用——记录保留，所以已签发给它的令牌仍然可归因
curl -X DELETE $SOULAUTH/api/oidc/clients/$CLIENT_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

完整端点清单：[OIDC 与客户端](/zh/reference/oidc-and-clients)。

## 接下来

[跑通授权码流程 →](/zh/integrate/authorization-code-flow)
