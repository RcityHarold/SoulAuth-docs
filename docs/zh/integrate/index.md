# 选择接入方式

把 SoulAuth 放到应用前面有三种接法。按你的应用**是什么**来选，
而不是按哪个看起来最省事 —— 选错通常会在几周后以一个认证 bug 的形式浮现。

## 三种接法

### 1. OIDC + 机密客户端 —— 默认选项

你的应用有服务端。服务端持有 `client_secret`，跑授权码流程，保管 refresh token。

**适用于：** 传统 Web 应用、API 网关，以及任何你掌控其后端的东西。

→ [授权码流程](./auth-code-flow)

### 2. OIDC + Backend-for-Frontend

你的应用是单页应用或移动端。它无法安全持有密钥，
所以由一个薄薄的服务端组件代它持有，并向前端暴露一个会话 cookie。

**适用于：** SPA、移动 App，以及任何 SoulSeedOS 接入。

::: warning 纯 SPA 接不进来
浏览器里的代码无法安全持有 `client_secret`，也不适合长期保管 refresh token。
而 ID Token 被硬夹在 300 秒，意味着持有方必须能在五分钟内续期 ——
这个上限本身就假定了有一个服务端会话持有者。
把客户端注册成 `public` 解决不了这件事，只是把问题挪了个地方。
:::

→ [BFF 模式](./bff)

### 3. 直接调 API

跳过 OIDC。自己调 `/api/auth/login` 拿令牌，
然后以 `Authorization: Bearer` 发出去。

**适用于：** 内部工具、脚本，以及你自己的管理后台。
当 SoulAuth 的身份**只**被它自己消费时，这也是对的选择 ——
加一层协议买不到任何东西。

**不要用它**自己搭多应用 SSO。那正是 OIDC 已经在做且做对了的事。

→ [认证 API](/zh/reference/auth)

## 每个 OIDC 接入都需要的三项参数

正好三个值：

```text
issuer     = APP_URL 去掉尾斜杠
jwks_uri   = {APP_URL}/api/oidc/jwks
client_id  = 客户端注册响应里的 client_id
```

::: danger `issuer` 必须逐字一致
尾斜杠、`www` 前缀、端口号 —— 差一个字符，所有令牌校验都会 401。
把发现文档里的 `issuer` 字段照抄过来，别自己拼：

```bash
curl -s https://auth.example.com/.well-known/openid-configuration | jq -r .issuer
```
:::

## 三条会咬人的行为

这三条从协议上看不出来，而且每一条的症状都出现在离病因很远的地方。

### 重放 refresh token 会把用户登出

Refresh token 是一次性的，每次刷新都轮换。提交一个已经轮换掉的旧令牌
会被当作被盗的证据，SoulAuth 会吊销**该用户在该客户端上的全部令牌**。

对 BFF 的实际后果：**网络超时后重试刷新，可能把你的用户踢下线。**
按会话串行化刷新，不要并发刷。超时时先确认上一次是否已经成功，再决定是否重发。

### 客户端密钥配错不会消耗授权码

客户端认证失败时授权码仍然有效。改对密钥，用同一个 code 还能换成功。
你可以按「改配置后重试」来写错误处理，不必让用户重走一遍登录。

### `/api/oidc/authorize` 认的是会话 cookie，不是 bearer 令牌

BFF 把用户重定向到授权端点时，用户得先有 SoulAuth 的登录态。
没有的话会被引导到 `LOGIN_PAGE_URL`（默认 `{APP_URL}/login`）并带上
`return_to`。你的登录页必须调 `POST /api/auth/login`，然后把浏览器送回
`return_to`。

## 接入后的验证顺序

每一步都能独立证伪，坏在哪就能在哪发现：

```bash
# ① issuer 是你配的那个
curl -s https://auth.example.com/.well-known/openid-configuration | jq -r .issuer

# ② JWKS 走 https 能取到，且有 kid
curl -s https://auth.example.com/api/oidc/jwks | jq -r '.keys[0].kid'

# ③ 走一次完整登录，把 ID Token 拆开看
echo "$ID_TOKEN" | cut -d. -f2 | base64 -d 2>/dev/null | jq '{iss, aud, sid, exp}'
```

第 ③ 步：`aud` 必须等于你的 `client_id`，`iss` 必须逐字等于你配的 issuer，
`sid` 必须非空。

::: tip `sid` 为空说明你拿错了令牌
SoulAuth 在取不到认证会话引用时**拒签**，从不签发缺 `sid` 的 ID Token。
所以 `sid` 为空只可能是你在看 access token，而不是 ID Token。
:::

## 下一步

- [**注册客户端**](./clients)
- [**授权码流程**](./auth-code-flow)
- [**BFF 模式**](./bff)
- [**SoulSeedOS 适配器**](./soulseedos)
