# 安全模型

SoulAuth 防什么、怎么防，以及什么留给你。

## 静态凭据

| 密文 | 存储方式 |
| --- | --- |
| 密码 | Argon2 哈希 |
| TOTP 密钥 | ChaCha20-Poly1305，密钥来自 `MFA_SECRET_ENCRYPTION_KEY` |
| OIDC 客户端密钥 | 哈希存储；明文只在创建时返回一次，之后再也拿不到 |
| 会话与 OIDC 令牌 | 按签发原样存储 |

最后一行是被接受的限制，不是疏忽：在它改变之前，
数据库读权限等价于会话接管。这一条列在仓库的
[`SECURITY.md`](https://github.com/RcityHarold/SoulAuth/blob/main/SECURITY.md)
里。请相应地收紧数据库账号，并加密备份。

## 密码策略

至少 `PASSWORD_MIN_LENGTH` 个字符（默认 12），
且包含大写、小写、数字、符号四类中的三类。

改密会吊销一切：所有会话、所有 OIDC access token、所有 refresh token。
一次让攻击者的会话继续活着的改密，不叫改密。

## 账号状态处处生效

`Active`、`Suspended`、`Inactive`、`Deleted` 只在一个函数里被解释 ——
`User::ensure_usable()`，它在会话通路和 OIDC 通路上都会被调用。

OIDC 那一半比听起来更要紧。在它存在之前，停用一个账号对已经持有 refresh token
的接入方毫无作用：它会无限地轮换出新的 access token 和 ID Token。
停用只在登录页上生效，别处都不生效。

现在把账号设成任何非 `Active` 状态，还会同时：

- 立即让鉴权缓存失效，
- 删除该用户的会话行，
- 吊销发给他的每一个 OIDC 令牌。

## 双因素认证

TOTP，有两条性质值得点名：

- **密钥加密存储**，且密钥与 `JWT_SECRET` 相互独立，
  所以轮换 JWT secret 不会摧毁它们。
- **重放水位线**记录了最后一次被接受的时间步。
  一个验证码在其有效窗口内不能被用第二次 —— 在链路上截获一个码的攻击者，
  无法重用它。

## 暴力破解防护

两个彼此独立的维度，都可配置，也都能被管理员解除。
详见[暴力破解防护](./lockout)。

失败计数在单个事务里自增并带冲突重试，
所以并发的登录尝试无法靠竞态越过阈值。

## 限流

按路由模板分桶，以客户端 IP 为键。用模板这件事很重要：
把 `/api/auth/verify-email/:token` 按具体路径分桶，
会让每个 token 各占一个计数器，等于什么都没限。

两条运维提示：

- `/health` 被刻意豁免。
- 凭证端点计在共享的 SurrealDB 桶上，限额跨副本成立。一般 API 的默认规则
  按设计留在进程内 —— 见[暴力破解防护](./lockout#限流在下面垫着)。

## OIDC 加固

- **公开客户端强制 PKCE**，只接受 `S256`。
  公开客户端不带 `code_challenge` 会在 `/authorize` 被拒 —— 不是降级放行。
- **Refresh token 轮换**，重放一个已用过的会作废整个令牌族。
- **授权码在并发下也是一次性的** —— 同时兑换两次恰好成功一次。
- **回调地址被校验**，在客户端注册时校验一次，在授权时再校验一次。
- **ID Token 用 RS256**，由消费方对着 JWKS 本地验签。

## 传输

SoulAuth 说明文 HTTP，指望前面有一个终结 TLS 的代理。
有两处，这从部署细节变成了安全决定：

- **`APP_URL` 的 scheme 决定 cookie 的 `Secure` 标志。**
  生产上填 `http://` 意味着会话 cookie 不带 `Secure`。
- **`TRUST_PROXY_HEADERS` 必须与实际情况一致。**
  它为 `true` 而 SoulAuth 又能被直连时，客户端可以伪造 `X-Forwarded-For`，
  基于 IP 的防护随即失效。见[部署](./deployment#反向代理与-tls)。

数据库连接也该走 TLS —— 给 `DATABASE_URL` 加 `https://` 前缀。
明文连接指向非环回地址时 SoulAuth 会在启动时告警。

## 审计轨迹

每个安全相关动作都会落一条事件，**包括空操作**。
对一个本来就没被锁的账号调解锁，同样会记一条 `lockout_cleared`，
`was_locked: false` —— 因为「有管理员试图解锁这个账号」才是值得留下的事实，
与结果无关。

进入审计详情的标识符若含控制字符会被拒。
这些值会在终端里被读；在那里放行 ANSI 转义就是一条日志注入通道。

## 抗枚举

注册、登录、密码重置、重发验证信的响应，都不区分「这个地址存在」
和「不存在」。锁定状态对未知地址同样累积，出于同一理由。

## 留给你的部分

这些 SoulAuth 不做，也不假装做：

- **TLS 终结** —— 你的代理。
- **你应用的授权** —— 见[在 Soulseed 生态里的位置](./soulseed-ecosystem)。
  SoulAuth 的 RBAC 管的是 SoulAuth。
- **密钥管理** —— 环境变量按原样读取，没有 vault 集成。
- **数据库加固** —— 最小权限账号、加密备份、网络隔离。
- **边缘的机器人防护** —— 没有 CAPTCHA，没有设备指纹。

## 报告漏洞

见
[`SECURITY.md`](https://github.com/RcityHarold/SoulAuth/blob/main/SECURITY.md)。
它同时附有当前的依赖告警表，并对每一条给出可达性评估 ——
而不是一份 `cargo audit` 的原始输出。

## 下一步

- [**暴力破解防护**](./lockout)
- [**审计**](./auditing)
- [**验证 ID Token**](/zh/integrate/verifying-tokens)
