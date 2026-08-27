# 认证防护

守住登录路径的那些机制，以及怎么调它们。

## 口令存储

Argon2，每个口令独立盐。`PASSWORD_MIN_LENGTH` 默认 12，处处强制——
包括引导路径，它不会因为"这是第一个用户"就放宽策略。

## 时序

对一个不存在的地址登录，会去校验一个启动时算好的**哑哈希**，所以耗时与真实尝试
相同。没有这一步，响应时间回答「这个地址注册了吗」比任何错误信息都更可靠。

## 锁定

两个互相独立的维度，都存在数据库里，因此跨副本共享：

```bash
LOCKOUT_MAX_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=15
LOCKOUT_RESET_WINDOW_MINUTES=60
LOCKOUT_USER_ENABLED=true    # 按账号
LOCKOUT_IP_ENABLED=true      # 按来源地址
```

`LOCKOUT_RESET_WINDOW_MINUTES` 是失败次数累积的窗口。按默认值，分散在两小时里的
五次失败不会锁账号；十分钟内的五次会。

被锁的响应是 `429`，带 `locked_until_seconds`，客户端因此可以显示倒计时而不是靠猜。

::: tip 这几项本来就是给你改的
面向公众的服务与内部管理工具的容忍度确实不同。内部工具收紧 `MAX_ATTEMPTS`
代价很小；面向公众的服务放宽 `DURATION_MINUTES`，能避免把一次忘记密码变成一张工单。
:::

管理员可以解开任一维度——
[运维与恢复](/zh/operate/operations-and-recovery#被锁定的账号)。

## 限流

按 IP 施加于认证端点，与锁定相互独立。锁定保护一个账号，限流保护这个端点。

计数器在数据库里，所以能挺过重启，也跨副本共享。这一点在测试时常让人意外：
重启进程并不会清掉它们。

::: danger 在代理之后，这件事取决于一个设置
不设 `TRUST_PROXY_HEADERS=true`，每个请求看起来都来自代理，一个客户端的失败会把
所有人限流。

设了它而 SoulAuth 又能被直连，客户端伪造 `X-Forwarded-For` 就能彻底绕开限流与
IP 锁定。

绑在环回上，让代理成为唯一入口，然后再打开它。
:::

## 二次验证

TOTP 加备用码。

**密钥**用 ChaCha20-Poly1305 在 `MFA_SECRET_ENCRYPTION_KEY` 下加密。
必须可逆——算验证码需要密钥。

**备用码**是 Argon2 哈希，逐条校验。它们不需要可逆，因为没有任何地方要读回来。

**重放**靠按用户持久化最后被接受的 TOTP 步长来阻止。同一个验证码不能用两次，
包括在另一个副本上——因为那个水位线在数据库里。

**两步流程**在第一步返回的是一枚短期挑战令牌而不是会话。只有第二步才签发会话，
所以单靠一个正确口令永远拿不到可用凭证。

::: warning 派生密钥这个陷阱
<Status kind="planned" /> 未设置 `MFA_SECRET_ENCRYPTION_KEY` 时，密钥从 `JWT_SECRET`
派生并打印告警。此后轮换 `JWT_SECRET` 会让所有已存的 TOTP 密钥无法解密——
每个 MFA 用户被锁死，除了重新绑定没有恢复手段。

只在环回地址上的开发里可能走到：非环回的 `APP_URL` 缺专用密钥就拒绝启动。
:::

## 会话

以 SHA-256 指纹存储，从不存令牌本身。
<Status kind="tested" guard="conformance::b4b" />

登出、改密、停用账号时立刻吊销——在处理它的那个实例上。其它副本在
`AUTH_SESSION_CACHE_TTL_SECONDS`（默认 5）之内观察到。<Status kind="planned" />

`logout-all` 一次吊销一个主体的所有会话。

不绑定 IP 或设备。这两样挡住合法用户（尤其在移动网络上）的次数比挡住攻击者更多，
所以都不强加。

## Agent 认证

AI 主体从不发送可复用的秘密。它对服务端签发的一次性挑战签名：

- 在验签**之前**被消费，所以并发使用不可能都成功；
- 绑定到一个主体和一个 issuer，所以不能被重放到别处；
- 有效期 120 秒；
- 只有 Ed25519——单元素白名单，因为可协商的算法正是签名方案被降级的途径。

[被签名的那四行](/zh/concepts/ai-native-identity)

## 审计

每个认证事件都记录：成功、带归类原因的失败、锁定、解锁、权限拒绝、限流违规。

写入从不阻塞请求，也从不包含凭据。

::: warning 不防篡改
<Status kind="planned" /> 一张普通表。没有哈希链，没有 checkpoint。
对运维有用；不是证据。
:::

## 接下来

| | |
|---|---|
| 具体攻击 | [威胁模型](/zh/security/threat-model) |
| 为生产调参 | [生产清单](/zh/operate/production-checklist) |
