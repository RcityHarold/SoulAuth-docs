# 接入路径

四条路。按你在做什么来选。

| 你在做的 | 用 | 从哪开始 |
|---|---|---|
| 有服务器的 Web 应用 | **BFF**——令牌留在你服务器上，浏览器只拿 cookie | [浏览器与 BFF](/zh/integrate/browser-and-bff) |
| 没有后端的 SPA 或原生应用 | **公开客户端 + PKCE** | [浏览器与 BFF](/zh/integrate/browser-and-bff#公开客户端-pkce) |
| 接收令牌的 API | **资源服务器**——只校验，不获取 | [校验令牌](/zh/integrate/verify-tokens) |
| 自动化 Agent 或任务 | **AI 主体**——一把密钥，不是一个账户 | [AI 原生身份](/zh/concepts/ai-native-identity) |

已经会说 OIDC 的东西——Grafana、Kubernetes 面板、某个现成应用——根本不需要写代码：
[注册一个客户端](/zh/integrate/register-a-client)，把发现 URL 给它，完事。

## 最该先问的那个问题

**这个东西保得住秘密吗？**

服务器可以。浏览器不行，用户能解包的移动端二进制也不行。这一个答案决定了
`confidential` 还是 `public`，而它又决定了其余一切。

往安全那边判错（把服务器当成 public）只损失一点安全余量。往另一边判错，
你就把一个秘密公开了。

## 每条路都一样的部分

- **PKCE 强制**，只有 `S256`，公开与机密客户端一视同仁。
- **重定向 URI 精确匹配。** 没有通配符，没有前缀。
- **换码前先比 `state`。** 它就是 CSRF 防护。
- **每枚 ID Token 都校验 `iss` 与 `aud`**，并且 `alg` 由你自己钉死。
- **用户键在 `(iss, sub)` 上**，绝不只用 `sub`，也绝不用邮箱。

## Agent 不一样

AI 主体根本不走 OIDC。它持有一枚 Ed25519 密钥，对一次性挑战签名——
没有账户、没有口令、没有重定向。

<Status kind="planned" /> 它的会话只到得了 `/api/actors/me`：RBAC 仍然挂在人类账户行
上。如果你的 Agent 需要调用受权限管控的端点，那还没有——
[项目状态](/zh/project/status)如实写着这一点，而不是让本页暗示相反的事。

## 接下来

| | |
|---|---|
| 先跑起来一个 | [快速上手](/zh/start/quickstart) |
| 注册客户端 | [注册客户端](/zh/integrate/register-a-client) |
