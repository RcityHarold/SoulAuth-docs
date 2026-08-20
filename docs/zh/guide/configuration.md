# 配置

SoulAuth 完全通过环境变量配置（启动时会读工作目录下的 `.env`）。
必填四项，其余都有能用的默认值。

穷举清单在[环境变量参考](/zh/reference/environment)；
这一页解释那些光看名字看不出行为的。

## 四项必填

```bash
JWT_SECRET=          # ≥32 个字符 —— openssl rand -hex 32
APP_URL=             # 你的公开地址
SMTP_HOST=
SMTP_FROM=
```

缺任何一项，进程都会在启动时退出并指名道姓。

即使 `EMAIL_VERIFICATION_ENABLED=false`，`SMTP_HOST` 和 `SMTP_FROM` 仍是必填，
因为密码重置也要发信。这两个值只在真的要发信时才用，
所以本地开发填 `127.0.0.1` / `noreply@localhost` 就够。

## `APP_URL` 管的事比你以为的多

这一个变量驱动四种彼此独立的行为：

1. **OIDC issuer。** 客户端会拿它校验 `iss` claim。
   改 `APP_URL` 会让所有在途的 ID Token 失效。
2. **外发邮件里的链接前缀。** 验证链接和重置链接都由它拼出来。
3. **Cookie 的 `Secure` 标志。** 值是 `https://` 则会话 cookie 带 `Secure`，
   `http://` 则不带。
4. **生产闸门。** `APP_URL` 指向非环回地址会把 SoulAuth 切到生产模式，
   届时另有两个变量变成必填（见下）。

它**不是**监听地址。监听地址是 `BIND_ADDR`，默认 `0.0.0.0:8080`。
在反向代理后面这两者不同：`BIND_ADDR=127.0.0.1:8080`、
`APP_URL=https://auth.example.com`。

## 生产闸门

当 `APP_URL` 指向环回以外的任何地方，
除非下面两项都配上，否则 SoulAuth **拒绝启动**：

```bash
OIDC_RSA_PRIVATE_KEY_PATH=/etc/soulauth/oidc-signing.pem
# ……或内联 PEM，\n 会被还原成换行：
OIDC_RSA_PRIVATE_KEY_PEM=

MFA_SECRET_ENCRYPTION_KEY=   # openssl rand -base64 32
```

这两个默认值都是*方便的*，也都是*在生产上错的*：

- 不配签名密钥，SoulAuth 每次启动生成一把新 RSA 密钥。
  此前签发的每一个 ID Token 都不再能验证，副本之间也互不认账。
- 不配 `MFA_SECRET_ENCRYPTION_KEY`，TOTP 的加密密钥从 `JWT_SECRET` 派生。
  而轮换 `JWT_SECRET` 是一个寻常且被推荐的操作 —— 一旦轮换，
  所有已存的 TOTP 密钥都解不开，每一个开了 MFA 的用户都被锁在自己账号外面。

生成：

```bash
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 \
  -out /etc/soulauth/oidc-signing.pem
openssl rand -base64 32   # → MFA_SECRET_ENCRYPTION_KEY
```

在启动时失败、而不是在凌晨三点失败，就是这道闸门的全部意义。

## 会话与令牌

```bash
JWT_EXPIRATION=86400                  # 秒；会话与 access token 寿命
AUTH_SESSION_CACHE_TTL_SECONDS=5      # 0 = 每个请求都回库校验
PASSWORD_MIN_LENGTH=12
```

`AUTH_SESSION_CACHE_TTL_SECONDS` 约束的是**在 SoulAuth 之外**被吊销的会话
还能被接受多久。走 SoulAuth 的吊销 —— 登出、改状态、重置密码 ——
会立即让缓存失效，不受这个 TTL 拖延。

## 信任代理请求头

```bash
TRUST_PROXY_HEADERS=false
```

**只有**当 SoulAuth 确实跑在你掌控的反向代理之后，才设成 `true`。
打开后 SoulAuth 从 `X-Forwarded-For` 读客户端 IP。而当 SoulAuth 可被直连时，
这个头是攻击者可控的 —— 客户端 IP 又正是 IP 限流与 IP 锁定的键。
错误地打开它，等于把「随意更换表观地址」的能力交给攻击者。

## 数据库

```bash
DATABASE_URL=127.0.0.1:8000
DATABASE_USER=root
DATABASE_PASS=root
DATABASE_NAMESPACE=auth
DATABASE_NAME=main
DATABASE_CONNECTION_TIMEOUT=30
```

`DATABASE_URL` 加 `https://` 前缀即走 TLS。明文连接指向非环回地址时，
SoulAuth 会在启动时告警：这条链路上跑的是数据库口令、密码哈希与会话令牌。

namespace 和 database 必须与你导入表结构时用的一致。
SoulAuth 启动时会检查种子里的 `role:admin`，缺失时直接打印该跑的
`surreal import` 命令 —— 连它实际在看的 namespace 和 database 一起 ——
而不是抛一个泛泛的连接错误。

## CORS

```bash
CORS_ALLOWED_ORIGINS=
```

逗号分隔。留空表示只允许 `APP_URL` 自身。因为 SoulAuth 是纯 API、
你的登录页是另一个源，所以这一项通常需要设。

## 暴力破解防护

```bash
LOCKOUT_MAX_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=15
LOCKOUT_RESET_WINDOW_MINUTES=60
LOCKOUT_USER_ENABLED=true
LOCKOUT_IP_ENABLED=true
```

三个数值项都拒绝 0 —— `LOCKOUT_MAX_ATTEMPTS=0` 会让每个账号第一次尝试就被锁。
关掉任一维度都会以特定方式削弱防护，见[暴力破解防护](./lockout)。

## 第三方登录

可选。每个 provider 两项要么都配，要么都不配：

```bash
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
OAUTH_REDIRECT_URL=       # 配了任一 provider 就必填

# 端点根地址覆盖 —— 例如 GitHub Enterprise。
# 明文值只允许指向环回地址。
GOOGLE_OAUTH_BASE_URL=
GITHUB_OAUTH_BASE_URL=
```

一个 provider 都不配时，对应端点返回 `501 Not Implemented`，
而不是一个让人摸不着头脑的失败。

## 出站代理

```bash
PROXY_ENABLED=false
PROXY_URL=
```

**只影响 OAuth 的 HTTP 请求**。SMTP 走裸 TCP，不认这个设置。

## 日志

```bash
RUST_LOG=soulauth=info,tower_http=warn
```

标准的
[`tracing` 过滤器](https://docs.rs/tracing-subscriber/latest/tracing_subscriber/filter/struct.EnvFilter.html)
语法。

## 下一步

- [**环境变量参考**](/zh/reference/environment) —— 完整表格。
- [**部署**](./deployment) —— 把上面这些落到实处。
