# 环境变量

完整清单。那些不好理解的，解释在[配置](/zh/guide/configuration)。

启动时会读工作目录下的 `.env`。仓库自带 `.env.example` 作为起点。

## 必填

| 变量 | 说明 |
| --- | --- |
| `JWT_SECRET` | 至少 32 个字符。`openssl rand -hex 32` |
| `APP_URL` | 你的**公开**地址，不是监听地址 |
| `SMTP_HOST` | 即使关掉邮箱验证也必填 —— 密码重置要用 |
| `SMTP_FROM` | 发件人地址 |

缺任何一项都会让启动中止并指名道姓。

## 生产必填

只要 `APP_URL` **不是**环回地址，下列即为必填：

| 变量 | 说明 |
| --- | --- |
| `OIDC_RSA_PRIVATE_KEY_PATH` | RS256 签名密钥的路径 |
| `OIDC_RSA_PRIVATE_KEY_PEM` | 或内联 PEM（`\n` 会被还原）—— 二选一 |
| `MFA_SECRET_ENCRYPTION_KEY` | `openssl rand -base64 32` |

不配签名密钥，SoulAuth 每次启动生成一把新的，
作废所有已签发的 ID Token，并破坏多副本部署。
不配 MFA 密钥，TOTP 的加密密钥从 `JWT_SECRET` 派生，
于是轮换该 secret 会让所有已存的 TOTP 密钥解不开。

见[生产闸门](/zh/guide/configuration#生产闸门)。

## 服务

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `BIND_ADDR` | `0.0.0.0:8080` | 监听地址 |
| `JWT_EXPIRATION` | `86400` | 会话与 access token 寿命，秒 |
| `PASSWORD_MIN_LENGTH` | `12` | |
| `AUTH_SESSION_CACHE_TTL_SECONDS` | `5` | `0` 表示每个请求都回库校验 |
| `CORS_ALLOWED_ORIGINS` | *(空)* | 逗号分隔；留空只允许 `APP_URL` |
| `TRUST_PROXY_HEADERS` | `false` | 只有确实在受控反向代理之后才置 `true` |

## 数据库

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `DATABASE_URL` | `127.0.0.1:8000` | 加 `https://` 前缀走 TLS |
| `DATABASE_USER` | `root` | 生产上请用受限账号 |
| `DATABASE_PASS` | `root` | |
| `DATABASE_NAMESPACE` | `auth` | 必须与表结构导入目标一致 |
| `DATABASE_NAME` | `main` | 必须与表结构导入目标一致 |
| `DATABASE_CONNECTION_TIMEOUT` | `30` | 秒 |

明文连接指向非环回地址会产生启动告警 ——
那条链路上跑的是数据库口令、密码哈希与会话令牌。

## 账号锁定

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `LOCKOUT_MAX_ATTEMPTS` | `5` | 必须 ≥1 |
| `LOCKOUT_DURATION_MINUTES` | `15` | 必须 ≥1 |
| `LOCKOUT_RESET_WINDOW_MINUTES` | `60` | 多久没新失败就清零 |
| `LOCKOUT_USER_ENABLED` | `true` | 账号维度 |
| `LOCKOUT_IP_ENABLED` | `true` | IP 维度 |

数值项拒绝 0。关掉任一维度都会留下一个具体的洞，
见[暴力破解防护](/zh/guide/lockout#两个维度干的是不同的活)。

## 邮件

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `SMTP_PORT` | `587` | |
| `SMTP_USERNAME` | *(空)* | |
| `SMTP_PASSWORD` | *(空)* | |
| `SMTP_INSECURE` | `false` | `true` 走明文 SMTP —— 仅用于本地 sink |
| `EMAIL_VERIFICATION_ENABLED` | `false` | |

## 前端页面地址

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `LOGIN_PAGE_URL` | `{APP_URL}/login` | `/api/oidc/authorize` 把未登录用户送去哪 |
| `VERIFY_EMAIL_PAGE_URL` | 由 `APP_URL` 推导 | 验证链接的落点 |

## 第三方登录

全部可选；每个 provider 两项要么都配、要么都不配。

| 变量 | 说明 |
| --- | --- |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | |
| `OAUTH_REDIRECT_URL` | 配了任一 provider 就必填 |
| `GOOGLE_OAUTH_BASE_URL` | 端点根地址覆盖 |
| `GITHUB_OAUTH_BASE_URL` | 供 GitHub Enterprise；明文只允许环回 |

一个 provider 都不配时，对应端点返回 `501`。

## 出站代理

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `PROXY_ENABLED` | `false` | |
| `PROXY_URL` | *(空)* | **只影响 OAuth 的 HTTP 请求** —— SMTP 走裸 TCP，不认它 |

## 日志

| 变量 | 默认值 |
| --- | --- |
| `RUST_LOG` | `soulauth=info,tower_http=warn` |

标准的 `tracing-subscriber` `EnvFilter` 语法。

## 下一步

- [**配置**](/zh/guide/configuration) —— 那些棘手项背后的道理。
- [**部署**](/zh/guide/deployment)
