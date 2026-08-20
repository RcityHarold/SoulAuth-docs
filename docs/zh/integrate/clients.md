# 注册客户端

每个 OIDC 接入都从注册一个客户端开始。
这需要一个持有 `soulauth:oidc_clients.write` 的账号（内置 `admin` 角色有）。

## 创建

```bash
curl -X POST https://auth.example.com/api/oidc/clients \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "client_name": "My Application BFF",
    "client_type": "confidential",
    "redirect_uris": ["https://app.example.com/auth/callback"],
    "require_pkce": true,
    "allowed_grant_types": ["authorization_code", "refresh_token"],
    "allowed_response_types": ["code"],
    "allowed_scopes": ["openid"],
    "id_token_lifetime": 300
  }'
```

响应里含 `client_id` 与 `client_secret`。

::: danger 密钥只在这一次返回
之后查询客户端得到的是 `***` 掩码。丢了只能调
`POST /api/oidc/clients/:client_id/regenerate-secret` 重新生成 ——
而重新生成会让正在用旧密钥的组件**立刻失效**。
这一步没有便宜的重来。注册前先把回调地址定下来，并把密钥存好。
:::

## 字段

| 字段 | 说明 |
| --- | --- |
| `client_name` | 可读名称，显示在客户端列表里。 |
| `client_type` | `confidential` 或 `public`。 |
| `redirect_uris` | 注册时校验，授权时再校验。精确匹配。 |
| `require_pkce` | 对公开客户端实际恒为真 —— 见下。 |
| `allowed_grant_types` | `authorization_code`、`refresh_token`。 |
| `allowed_response_types` | `code`。 |
| `allowed_scopes` | 至少 `openid`。 |
| `id_token_lifetime` | 秒。**会被静默夹到 300。** |

::: warning `id_token_lifetime` 超过 300 是夹取，不是报错
传 `3600` 会得到 300 且不报错。直接填 `300`，
免得日后有人以为这个参数被忽略了。
:::

## 机密客户端 vs 公开客户端

**机密（confidential）** 客户端持有 `client_secret`。
只要涉及任何服务端组件就用它 —— 按[选择接入方式](./)的说法，这应该是绝大多数情况。

**公开（public）** 客户端不持有密钥。对它们，
**PKCE 是强制的，且只接受 `S256`**。公开客户端不带 `code_challenge`
会在 `/authorize` 被拒，而不是被悄悄降级到更弱的流程。

机密客户端也用 PKCE。它不花什么代价，却关掉了授权码被截获的那个窗口。

## 客户端认证的两种方式

令牌端点支持发现文档里声明的两种：

```bash
# client_secret_post —— 凭证放表单
curl -X POST https://auth.example.com/api/oidc/token \
  -d grant_type=authorization_code -d code=... -d redirect_uri=... \
  -d client_id=... -d client_secret=... -d code_verifier=...

# client_secret_basic —— 凭证放 Authorization 头
#（多数 OIDC 客户端库的默认）
curl -X POST https://auth.example.com/api/oidc/token \
  -u "${CLIENT_ID}:${CLIENT_SECRET}" \
  -d grant_type=authorization_code -d code=... -d redirect_uri=... \
  -d client_id=... -d code_verifier=...
```

**两处同时带凭证会被拒**（`invalid_request`）。SoulAuth 不会「挑一个用」——
那会让「两处 secret 不一致」这种明显异常被静默接受，
而这恰恰是最该被暴露出来的异常。

::: tip 从旧版本升级
`client_secret_basic` 是 2026-08-17 才补上实现的。此前发现文档一直声明支持它，
而令牌端点只解析表单。在更早的实例上，用标准 OIDC 客户端库接入会报
`Client secret required for confidential clients` ——
接入方会反复检查自己的配置，而配置从头到尾都是对的。
:::

## 管理客户端

```
GET    /api/oidc/clients                            列表
POST   /api/oidc/clients                            创建
GET    /api/oidc/clients/:client_id                 读取（密钥掩码）
PUT    /api/oidc/clients/:client_id                 更新
DELETE /api/oidc/clients/:client_id                 停用
POST   /api/oidc/clients/:client_id/regenerate-secret
```

读需要 `soulauth:oidc_clients.read`，写需要 `soulauth:oidc_clients.write`。

`DELETE` 是**停用**而非销毁。已有令牌立即失效，
记录保留，好让引用了该客户端的审计事件仍然有意义。

## 下一步

- [**授权码流程**](./auth-code-flow) —— 用起来。
- [**BFF 模式**](./bff) —— 如果你的前端在浏览器里。
- [**OIDC API 参考**](/zh/reference/oidc) —— 精确的请求与响应结构。
