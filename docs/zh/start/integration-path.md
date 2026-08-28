# 接入路径

共有四条接入路径，按正在构建的系统类型选择。

| 你在做的 | 用 | 从哪开始 |
|---|---|---|
| 有服务器的 Web 应用 | **BFF**。令牌留在服务器一侧，浏览器只持有 cookie | [浏览器与 BFF](/zh/integrate/browser-and-bff) |
| 没有后端的 SPA 或原生应用 | **公开客户端 + PKCE** | [浏览器与 BFF](/zh/integrate/browser-and-bff#公开客户端加-pkce) |
| 接收令牌的 API | **资源服务器**。只校验，不获取 | [校验令牌](/zh/integrate/verify-tokens) |
| 自动化任务或 AI 主体 | **AI 主体**。持有一把密钥，而不是一个账户 | [AI 原生身份](/zh/concepts/ai-native-identity) |

已经支持 OIDC 的系统（Grafana、Kubernetes 面板、各类现成应用）不需要写任何代码：
[注册一个客户端](/zh/integrate/register-a-client)，把发现 URL 给它，完事。

## 首先要回答的问题

**这个组件能否保管秘密？**

服务器可以，浏览器不行，用户能够解包的移动端二进制同样不行。这一个答案决定了
选 `confidential` 还是 `public`，而这个选择又决定了其余一切。

判断偏向保守一侧（把服务器当作 public）只损失一点安全余量；判断偏向另一侧，
则等于把一个秘密公开了。

## 四条路径的共同要求

- **PKCE**，只收 `S256` —— public 客户端强制，confidential 客户端默认开启。
  两种都别关。
- **重定向 URI 精确匹配。** 没有通配符，没有前缀。
- **换码前先比 `state`。** 它就是 CSRF 防护。
- **每枚 ID Token 都校验 `iss` 与 `aud`**，并且 `alg` 由你自己钉死。
- **用户键在 `(iss, sub)` 上**，绝不只用 `sub`，也绝不用邮箱。

## AI 主体的不同之处

AI 主体不走 OIDC。它持有一枚 Ed25519 密钥，对一次性挑战签名，
不需要账户，不需要口令，也没有重定向。

<Status kind="planned" /> AI 主体的会话只能访问 `/api/actors/me`，因为 RBAC 仍然
建立在人类账户行之上。如果它需要调用受权限管控的端点，本 Release 还做不到；
[项目状态](/zh/project/status)如实记录了这一点，本页不作相反的暗示。

## 接下来

| | |
|---|---|
| 先跑起来一个 | [快速上手](/zh/start/quickstart) |
| 注册客户端 | [注册客户端](/zh/integrate/register-a-client) |
