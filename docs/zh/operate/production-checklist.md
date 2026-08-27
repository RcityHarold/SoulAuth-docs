# 生产清单

快速上手刻意让你用最少的决定跑起来。这一页是那个状态与「能面向真实用户」之间的差距。

## 进程拒绝替你做的事

下面三条不是建议——弄错了 SoulAuth **不会启动**。

### `JWT_SECRET` 至少 32 字符

```bash
openssl rand -hex 32
```

短了就启动失败，并指名道姓地说是哪一项。

### 非环回的 `APP_URL` 强制要求另外两把密钥

把 `APP_URL` 设成任何非环回地址，下面两项立刻变成必填：

```bash
# 持久的 OIDC 签名密钥——没有它，每次重启都会让所有已签发的 ID Token 失效，
# 而且各副本用不同的密钥签名。
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out oidc-signing.pem
export OIDC_RSA_PRIVATE_KEY_PATH=/etc/soulauth/oidc-signing.pem

# 专用的 MFA 密钥——否则它从 JWT_SECRET 派生，这意味着轮换 JWT_SECRET
# 会把每个 MFA 用户永久锁在门外。
export MFA_SECRET_ENCRYPTION_KEY=$(openssl rand -base64 32)
```

两个默认值都"能用"，也都会在之后悄悄摧毁凭证。对于一个失效方式延迟且不可逆的
默认值，拒绝启动才是正确行为。

### 非环回主机上拒绝明文 HTTP

`APP_URL=http://auth.example.com` 会在启动时失败。用 `https://`。

## 把 `APP_URL` 弄对

它是**公开地址**，不是监听地址，而且它决定四件事：

- OIDC `issuer`——必须逐字符一致，否则每个客户端的发现校验都失败；
- 外发邮件里链接的前缀；
- 会话 cookie 是否带 `Secure`（`https://` → 带）；
- 上面那道生产闸门是否生效。

```bash
APP_URL=https://auth.example.com     # 公开
BIND_ADDR=127.0.0.1:8080             # 在代理之后
```

`APP_URL` 与客户端预期的 `issuer` 差一个尾斜杠，是真实且真的很难排查的失败。

## 数据库

快速上手用 `root:root` 走明文。两者都不该进生产。

```bash
DATABASE_URL=https://db.internal:8000     # https:// 启用 TLS
DATABASE_USER=soulauth
DATABASE_PASS=<生成的>
DATABASE_NAMESPACE=auth
DATABASE_NAME=main
```

给服务一个限定在那个 namespace/database 内的账号，不要用 `root`。
明文连接非环回数据库会打印一次告警——把它当错误处理。

::: warning schema 必须导进进程连接的那一对
导入时 `DATABASE_NAMESPACE` / `DATABASE_NAME` 弄错，会得到一个能启动、
`/health` 返回 `ok`、直到第一次写入才失败的服务。这就是仓库里配了一个
**可执行**的部署 walkthrough 而不只是散文的原因。
:::

## 在代理之后

```bash
TRUST_PROXY_HEADERS=true
```

::: danger 只有在 SoulAuth 无法被直连时才开
开了它，`X-Forwarded-For` 就会被信任。只要有任何途径能不经过你的代理直达 SoulAuth，
客户端就能伪造这个头，径直绕开 IP 限流与 IP 锁定。

绑在环回或内网接口上，让代理成为唯一入口。
:::

## CORS

默认为空。不接受通配符——通配符加凭证，等于让任何站点都能带着你用户的
`Authorization` 头调用 SoulAuth。

```bash
CORS_ALLOWED_ORIGINS=https://app.example.com,https://admin.example.com
```

BFF 架构完全不需要它：浏览器只和你自己的源说话。

## 调锁定阈值

默认是 5 次、15 分钟、60 分钟窗口，用户与 IP 两个维度都开。面向公众的服务与内部
工具在这件事上的容忍度确实不同——这几项本来就是给你改的。

```bash
LOCKOUT_MAX_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=15
LOCKOUT_RESET_WINDOW_MINUTES=60
LOCKOUT_USER_ENABLED=true
LOCKOUT_IP_ENABLED=true
```

计数器在数据库里，所以是跨副本共享的，不是每个进程各算各的。

## 邮件必须真的能发

即使关闭邮箱验证，`SMTP_HOST` 与 `SMTP_FROM` 仍是必填，因为口令重置要发信。

发信失败只记日志，不抛出。这是刻意的——一台坏掉的 SMTP 主机不能把"忘记密码"
变成 500，也不能让响应时间差泄露某个地址是否已注册。代价是配错了它是**静默的**。
在你相信它能用之前，先给自己发一封重置信。

## 跑多个实例

就认证而言无状态；实例共享数据库，彼此从不通信。

- 每个副本需要**相同的** `JWT_SECRET`、OIDC 签名密钥与 `MFA_SECRET_ENCRYPTION_KEY`。
  签名密钥不同意味着一个副本签发的令牌在另一个副本的 JWKS 上验不过。
- 限流与锁定是共享的，因为它们在数据库里。
- **吊销不是瞬时的。** 每个实例缓存已解析的会话；其它实例在
  `AUTH_SESSION_CACHE_TTL_SECONDS`（默认 5）之内观察到。调小它能更快传播，
  代价是更多数据库读。

## 开放之前

```bash
curl https://auth.example.com/health
curl https://auth.example.com/.well-known/openid-configuration   # issuer 等于 APP_URL 吗？
```

- [ ] `JWT_SECRET` 已生成、≥ 32 字符、每个副本一致
- [ ] OIDC 签名密钥落盘、每个副本一致
- [ ] `MFA_SECRET_ENCRYPTION_KEY` 已显式设置
- [ ] `APP_URL` 是 `https://` 且与发现文档的 `issuer` 一致
- [ ] 数据库走 TLS，用限定账号而非 `root`
- [ ] schema 导进了进程使用的那一对 namespace/database
- [ ] `TRUST_PROXY_HEADERS` **仅在**无法直连时开启
- [ ] `CORS_ALLOWED_ORIGINS` 显式列出
- [ ] 一封口令重置邮件确实收到了
- [ ] 第一个管理员经由引导令牌创建，而不是改数据库
- [ ] 备份覆盖 SurrealDB 数据目录

## 你仍然暴露在什么之下

把这件事说清楚，是部署工作的一部分：

<Status kind="planned" /> **审计日志不防篡改。** 一张普通表，没有哈希链。
不要拿它当证据。

<Status kind="planned" /> **吊销在副本之间有延迟**，最多一个缓存 TTL。

**Docker Compose 只适合开发。** CI 端到端跑它，所以它能用——但它的数据库凭证是默认值，也没有 TLS。它不是一次部署。

完整清单：[项目状态](/zh/project/status)。

## 接下来

| | |
|---|---|
| 日常运维 | [运维与恢复](/zh/operate/operations-and-recovery) |
| 出问题时 | [排查](/zh/operate/troubleshooting) |
