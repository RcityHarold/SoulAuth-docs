# 快速上手

一个运行中的实例、第一个管理员、一枚可用令牌，大约五分钟。

本页每一条命令都来自 CI 中会执行的脚本
（<Status kind="tested" guard="deployment_walkthrough.sh" />）。若其中任何一条在
你的环境里失败，那是 SoulAuth 或本页的缺陷，请[提个 issue](https://github.com/RcityHarold/SoulAuth/issues)。

## 前置条件

- [SurrealDB](https://surrealdb.com/install) v3
- Rust 工具链（用来构建二进制），或者一个已编好的 `soulauth`
- `curl` 与 `openssl`

::: tip 用 Docker Compose 更快
一条命令顶下面的第 1–4 步：

```bash
git clone https://github.com/RcityHarold/SoulAuth && cd SoulAuth
printf 'JWT_SECRET=%s\nAPP_URL=http://localhost:8080\nSMTP_HOST=127.0.0.1\nSMTP_FROM=noreply@example.com\n' \
  "$(openssl rand -hex 32)" > .env
docker compose up -d
```

随后从[第 5 步](#_5-创建第一个管理员)继续；引导令牌在
`docker compose logs soulauth` 中。

<Status kind="tested" guard="ci.yml::docker" /> CI 每次推送都跑这条路径：起服务、
健康检查、引导、登录、访问受保护端点，再重启一次确认 schema 导入是幂等的。

下面的手工步骤就是 compose 文件跑的内容。不用 compose 部署时照这几步来。
:::

## 1 · 启动数据库

```bash
surreal start --bind 127.0.0.1:8000 --user root --pass root file:soulauth.db
```

如果只需要一个用完即弃的实例，把 `file:soulauth.db` 换成 `memory`。

## 2 · 导入 schema

SoulAuth 不发出任何 DDL，既不建表也不改表，所以它的数据库账号不需要这些权限。
这两个文件由你导入一次：

```bash
export DB="--endpoint http://127.0.0.1:8000 --user root --pass root \
  --namespace auth --database main"

surreal import $DB schema.sql
surreal import $DB initial_data.sql
```

::: warning namespace 与 database 必须对上
这里的 `auth` / `main` 必须与进程连接时使用的那一对完全一致。导入到错误的一对之后，
一切**看起来**都正常：进程照常启动，`/health` 照常返回 `ok`，直到第一次写入才失败。
walkthrough 脚本之所以存在，正是因为这个错误被踩过一次。
:::

## 3 · 配置

```bash
export DATABASE_URL=127.0.0.1:8000
export DATABASE_NAMESPACE=auth
export DATABASE_NAME=main
export DATABASE_USER=root
export DATABASE_PASS=root

export JWT_SECRET=$(openssl rand -hex 32)
export APP_URL=http://localhost:8080
export BIND_ADDR=127.0.0.1:8080
export SMTP_HOST=127.0.0.1
export SMTP_FROM=noreply@example.com
```

`APP_URL` 是**公开地址，不是监听地址**。它决定 OIDC issuer、外发邮件里链接的前缀，
以及会话 cookie 是否带 `Secure`。

`APP_URL` 为环回地址时不会触发生产闸门，因此本页既不需要 OIDC 签名密钥，
也不需要 MFA 加密密钥。同样正因如此，这套配置不能用于生产，
见[生产清单](/zh/operate/production-checklist)。

## 4 · 跑起来

```bash
cargo build && ./target/debug/soulauth
```

```bash
curl http://localhost:8080/health
# {"status":"ok","uptime_seconds":3}
```

## 5 · 创建第一个管理员

没有默认账号，也没有预置口令。一个全新实例会在启动日志里打印一枚一次性引导令牌：

```
WARN No administrator found. Bootstrap token for this process: 7f3a…
     Create the first administrator:
     curl -X POST http://localhost:8080/api/bootstrap/admin ...
```

用它：

```bash
curl -X POST http://localhost:8080/api/bootstrap/admin \
  -H 'Content-Type: application/json' \
  -d '{"token":"7f3a…","email":"you@example.com","username":"admin","password":"CorrectHorse42!"}'
```

```json
{ "user_id": "7ad93d87-…", "email": "you@example.com", "is_admin": true }
```

关于这条路径，有三点值得现在就了解：

- **这道门会永久关闭。** 一旦存在管理员，同一枚令牌即被拒绝，且返回的状态码与
  「令牌错误」完全相同。因此一枚失效令牌无法用来探测某个实例是否已初始化。
- **口令策略不因为「这是第一个用户」而放宽。**
- **全程无需接触数据库。** 从空库走到一个可用的管理员而不必手工修改记录，
  是本项目对自己的硬性要求，不是顺带提供的便利。

## 6 · 拿到令牌

引导响应中不含令牌，需要登录获取：

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com","password":"CorrectHorse42!"}'
```

```json
{
  "token": "eyJhbGciOi…",
  "user": {
    "id": "7ad93d87-…",
    "email": "you@example.com",
    "username": "admin",
    "is_admin": true,
    "verified": true,
    "account_status": "Active",
    "has_password": true,
    "last_login_at": 1787738966,
    "membership_level": "FREE",
    "membership_expiry": null,
    "created_at": "2026-08-26T10:09:26Z"
  }
}
```

```bash
curl http://localhost:8080/api/auth/me -H "Authorization: Bearer $TOKEN"
```

API 侧的认证**只接受** `Authorization: Bearer`。Cookie 确实存在，但它服务于浏览器
与 OIDC 流程，不用于此处。

## 7 · 可选：为 AI 主体建立身份

没有邮箱，没有口令，没有账户：

```bash
# 生成密钥。私钥始终留在 AI 主体一侧。
openssl genpkey -algorithm ed25519 -out agent.pem
PUBKEY=$(openssl pkey -in agent.pem -pubout -outform DER | tail -c 32 | basenc --base64url | tr -d '=')

curl -X POST http://localhost:8080/api/actors \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d "{\"public_key\":\"$PUBKEY\",\"label\":\"nightly-runner\"}"
```

此后该主体分两步完成认证。先领取挑战：

```bash
curl -X POST http://localhost:8080/api/actors/challenge \
  -H 'Content-Type: application/json' -d "{\"actor_id\":\"$ACTOR_ID\"}"
```

```json
{
  "actor_id": "actor_identity:lnhl…",
  "nonce": "sp9kEQQT4evGROocexd1lw0Z5u7Bcmbpuahl9A-iPT4",
  "expires_at": 1787739106,
  "algorithm": "ed25519",
  "payload": "soulauth-ai-actor-auth/v1\nhttp://localhost:8080\nactor_identity:lnhl…\nsp9kEQQ…"
}
```

`payload` 就是要签名的**那串字节**：四行，以 `\n` 连接，结尾不带换行。
之所以由服务端返回，是为了避免每个客户端库都自行实现一遍 canonicalization
并在细节上出错。服务端在验签前会**独立重算**一遍，请求中回传的那一份从不被采信。

签名换会话：

```bash
curl -X POST http://localhost:8080/api/actors/authenticate \
  -H 'Content-Type: application/json' \
  -d "{\"actor_id\":\"$ACTOR_ID\",\"nonce\":\"$NONCE\",\"algorithm\":\"ed25519\",\"signature\":\"$SIG\"}"
```

返回的会话令牌带有 `subject_type: agent`。它可用于 `/api/actors/me`，
在人类端点上会被**明确拒绝**。这条边界是刻意设计的，也已
[写明](/zh/concepts/ai-native-identity)。

## 你现在有了什么

一个运行中的身份提供方、一个管理员、一枚会话令牌。你**还没有**的是一套生产部署：
没有 TLS，没有 OIDC 签名密钥，数据库使用 root 凭证，SMTP 主机多半也没在监听。

## 接下来

| | |
|---|---|
| 接一个 Web 应用 | [授权码流程](/zh/integrate/authorization-code-flow) |
| 在它面向任何人之前先加固 | [生产清单](/zh/operate/production-checklist) |
| 搞清楚一枚令牌授予与不授予什么 | [身份与权限的边界](/zh/spec/identity-vs-authority) |
| 精确知道本 Release 支持什么 | [项目状态](/zh/project/status) |
