# 浏览器与 BFF

浏览器保不住秘密。本页的一切都由这一句推出来。

## 二选一

| | Backend for Frontend | 公开客户端 + PKCE |
|---|---|---|
| 客户端类型 | `confidential` | `public` |
| 令牌放在哪 | 你的服务器 | 浏览器 |
| 浏览器持有 | 一个会话 cookie | 令牌本身 |
| 需要服务器 | 是 | 否 |
| XSS 暴露面 | 会话 cookie（若非 `HttpOnly`） | **全部令牌** |

**有服务器就选 BFF。** 不是因为另一种坏掉了——公开客户端加 PKCE 是正当且有规范的
模式——而是因为令牌托管在浏览器里意味着任何 XSS 都变成令牌失窃，
而你自己代码写得多小心，都挡不住一个被投毒的依赖。

## BFF

浏览器和你的服务器说话，你的服务器和 SoulAuth 说话。令牌从不进入 JavaScript。

```
浏览器 ──cookie──▶ 你的 BFF ──令牌──▶ SoulAuth
```

1. 你服务器上的 `GET /login` 生成 `state` 与 PKCE 对，与浏览器会话关联存好，
   然后重定向到 `/api/oidc/authorize`。
2. 你服务器上的 `GET /callback` 比对 `state`，换码
   （[第 4 步](/zh/integrate/authorization-code-flow)），把令牌存在**服务端**。
3. 你的服务器设自己的会话 cookie：

```js
res.cookie('session', sessionId, {
  httpOnly: true,   // JavaScript 读不到
  secure: true,     // 只走 HTTPS
  sameSite: 'lax',  // 能挺过 OIDC 回跳；'strict' 不行
  path: '/',
})
```

`sameSite: 'lax'` 是刻意的。`'strict'` 会在从身份提供方跨站回跳时丢掉 cookie，
症状是一个登录死循环——本地能跑，生产上失败。

::: warning BFF 不是令牌代理
不要加一个把访问令牌交给浏览器的端点，也不要把浏览器传来的任意请求带着令牌转发上游。
这两件事中的任何一件，都会把这个模式本来要消除的暴露面原样还回来。

暴露你自己的端点。让 BFF 决定每个端点被允许做什么。
:::

## 公开客户端 + PKCE

没有服务器，所以没有密钥。注册时用 `"client_type": "public"`，
令牌端点不带 `client_secret`。

流程其余部分完全相同——PKCE 是让它安全的东西，而且在这里是强制的而不是可选的。

存储方式，从"没那么糟"到"最糟"：

- **只放内存。** 刷新页面就没了；用户靠身份提供方的会话重新认证，
  这个过程通常他自己都察觉不到。
- **`sessionStorage`。** 能挺过刷新，作用域限于这个标签页。页面上任何脚本都能读。
- **`localStorage`。** 什么都能挺过，包括攻击者的脚本。避免。

::: danger 在这里 XSS 等于完全失守
令牌在浏览器里时，没有任何缓解措施能挺过脚本执行——严格的 CSP 提高了门槛，
但不消除暴露。这就是你在接受的交换，它应该是一个决定，而不是一个默认值。
:::

## CORS

`CORS_ALLOWED_ORIGINS` 是显式白名单。默认为空，且不接受通配符——
通配符加上凭证，意味着任何站点都能带着你用户的 `Authorization` 头调用 SoulAuth。

```bash
CORS_ALLOWED_ORIGINS=https://app.example.com,https://admin.example.com
```

BFF 根本不需要它：浏览器只和你自己的源说话。

## 登出

是两件事，只做一件用户会察觉：

```js
// 1. 结束你自己的会话
res.clearCookie('session')

// 2. 结束 SoulAuth 的会话
res.redirect(`${SOULAUTH}/api/oidc/logout` +
  `?id_token_hint=${idToken}&post_logout_redirect_uri=${encodeURIComponent(RETURN_URL)}`)
```

漏掉第二步，下一次登录会静默复用仍然有效的身份提供方会话——用户点"登出"、
点"登录"，然后没被问任何问题就回到了同一个账号。看起来就像登出没生效。

`post_logout_redirect_uris` 必须登记在客户端上，与 `redirect_uris` 同样是精确匹配。

## 接下来

| | |
|---|---|
| 流程本身 | [授权码流程](/zh/integrate/authorization-code-flow) |
| 校验你收到的东西 | [校验令牌](/zh/integrate/verify-tokens) |
