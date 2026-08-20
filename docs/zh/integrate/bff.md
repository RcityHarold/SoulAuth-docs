# BFF 模式

如果你的前端跑在浏览器或手机上，你需要在它和 SoulAuth 之间放一个
Backend-for-Frontend。这一页讲为什么，以及这个 BFF 必须做对哪些事。

## 为什么纯 SPA 接不进来

三条约束叠加：

1. **浏览器代码无法持有 `client_secret`。** 任何发到客户端的东西都是公开的。
   注册成 `public` 客户端是承认了这一点，但没有解决它。
2. **浏览器里的 refresh token 是敌意环境里的长效凭证。**
   `localStorage` 对任何 XSS 都可读；cookie 要想 `HttpOnly` 就得有服务端。
3. **ID Token 被硬夹在 300 秒。** 持有方必须每五分钟续期一次、
   无限期地续下去，会话才能持续。这个上限不是偶然，
   它假定了存在一个服务端会话持有者。

第三条是决定性的。哪怕一个写得完美的 SPA，也得每五分钟续一次期，
这意味着要在浏览器里存 refresh token 并在那里跑轮换逻辑 ——
而这正是那个短寿命设计想要消除的事。

## BFF 是什么

一个薄薄的服务端组件，它：

- 持有 `client_secret` 和 refresh token，
- 跑授权码流程，
- 给浏览器发一个 `HttpOnly`、`Secure`、`SameSite` 的会话 cookie，
- 代理或鉴权前端发来的 API 调用。

浏览器只拿着一个会话 cookie，从不接触 OIDC 令牌。

```
  浏览器  ──cookie──▶  BFF  ──OIDC──▶  SoulAuth
                        │
                        └──▶  你的各个 API
```

## 职责

### 持有密钥

只在服务端，从环境变量或密钥管理服务读。

### 拥有回调地址

把 BFF 的回调注册为客户端的 `redirect_uri`。浏览器被重定向到那里，
由 BFF 兑换授权码，前端永远看不到那个 code。

### 串行化刷新

这是多数 BFF 实现出错的地方。

Refresh token 每次使用都轮换，重放一个已轮换的会被当作被盗 ——
SoulAuth 会吊销该用户在该客户端上的整个令牌族。所以：

- **每个会话同时只有一次刷新。** 两个并发请求都发现令牌过期、
  于是都去刷新，结果是用户被登出。
- **超时不要盲目重试。** 超时不代表刷新失败，可能是成功了而响应丢了。
  这时重试就是在重放一个已轮换的令牌。先判定结果，再决定是否重发。

一个按会话的互斥锁，加上一次「上次那下到底成没成」的检查，就是全部解法 ——
但它必须存在。

### 本地验签

取一次 JWKS，缓存起来，在进程内验签。每个请求都不要有网络调用。
→ [验证 ID Token](./verifying-tokens)

### 协同登出

清掉你自己的会话 cookie，**并且**带上 `id_token_hint`
调 SoulAuth 的 RP 发起登出。少了第二步，SoulAuth 那边的会话还活着：
用户点「登录」会被静默地直接送回登录态，看起来就像登出坏了。

## 会话寿命

你的 cookie 会话和 OIDC 令牌寿命是两回事。常见的搭配：

- BFF 会话 cookie：数小时到数天，`HttpOnly` + `Secure` + `SameSite=Lax`。
- SoulAuth ID Token：300 秒，由 BFF 静默续期。
- SoulAuth refresh token：决定会话的最长上限。

用户体验到的是一段长会话，底下的令牌都是短寿命且不断轮换的。

## 登录页仍然是你的

`/api/oidc/authorize` 要求用户已有 SoulAuth 会话。没有的话他们会落在
`LOGIN_PAGE_URL` 上并带着 `return_to`，而那个页面得**你**来提供：
调 `POST /api/auth/login`，然后重定向到 `return_to`。

从概念上说这个页面属于 SoulAuth 的源，而不是你的 BFF ——
它是输入 SoulAuth 凭据的地方。相应地设置 `LOGIN_PAGE_URL`，
并把它的源加进 `CORS_ALLOWED_ORIGINS`。

## 检查清单

- [ ] `client_secret` 只在服务端
- [ ] 回调已注册为客户端的 `redirect_uri`
- [ ] 每次请求生成 `state`，回来时校验
- [ ] PKCE 用 `S256`
- [ ] 刷新按会话串行化
- [ ] 刷新超时不盲目重试
- [ ] JWKS 已缓存，验签在本地
- [ ] `iss`、`aud`、`exp` 与签名全都校验
- [ ] 会话 cookie 带 `HttpOnly` + `Secure` + `SameSite`
- [ ] 登出既清 cookie **也**调 RP 发起登出
- [ ] 登录页已实现，`LOGIN_PAGE_URL` 已设置

## 下一步

- [**验证 ID Token**](./verifying-tokens)
- [**SoulSeedOS 适配器**](./soulseedos) —— 一个 BFF 形态的真实接入。
