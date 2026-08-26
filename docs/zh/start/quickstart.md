# 快速上手

一个跑起来的实例、第一个管理员、一枚可用令牌——大约五分钟。

本页每一条命令都来自 CI 里会跑的脚本
（<Status kind="tested" guard="deployment_walkthrough.sh" />）。如果哪条在你那儿
失败了，那是 SoulAuth 或本页的缺陷，不是需要你自己绕过去的事。
[告诉我们。](https://github.com/RcityHarold/SoulAuth/issues)

## 你需要

- [SurrealDB](https://surrealdb.com/install) v3
- Rust 工具链（用来构建二进制），或者一个已编好的 `soulauth`
- `curl` 与 `openssl`

::: details 想用 Docker Compose？
仓库里有 `docker-compose.yml`，一条命令拉起 SurrealDB、导入 schema、启动 SoulAuth。
它是 <Status kind="implemented" />——文件存在、经过人工复核，但
**还没有人完整执行过一遍**，所以本页不把它当作已验证的路径。

本仓库在一次「部署文档照着做跑不通」的事故之后定了条规矩：
*可执行的文档必须真的被执行过*。等有人完整跑通，这一节会从脚注变成第一步。
:::

## 1 · 启动数据库

```bash
surreal start --bind 127.0.0.1:8000 --user root --pass root file:soulauth.db
```

想要一个用完即弃的实例，把 `file:soulauth.db` 换成 `memory`。

## 2 · 导入 schema

SoulAuth 不自己建表。一个认证服务持有修改自身表结构的权限，是本项目不越过的
一条边界，所以这两个文件由你导入，一次：

```bash
export DB="--endpoint http://127.0.0.1:8000 --user root --pass root \
  --namespace auth --database main"

surreal import $DB schema.sql
surreal import $DB initial_data.sql
```

::: warning namespace 与 database 必须对上
这里的 `auth` / `main` 必须与进程连接时用的那一对完全一致。导进错误的一对之后，
一切**看起来**都正常——进程照常启动、`/health` 照常返回 `ok`——直到第一次写入失败。
那条 walkthrough 脚本的存在，正是因为这个错踩过一次。
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

`APP_URL` 是环回地址就不会触发生产闸门——这也是本页为什么既不需要 OIDC 签名密钥，
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

这条路径有三件事现在就值得知道：

- **它会永久关闭。** 一旦存在管理员，同一枚令牌就会被拒——而且返回的状态码与
  「令牌错误」完全相同，所以一枚失效令牌无法被用来探测某个实例是否已初始化。
- **口令策略不因为「这是第一个用户」而放宽。**
- **你全程不碰数据库。** 从空库走到一个可用的管理员而无需手工改记录，是本项目
  对自己的硬要求，不是顺手做的便利。

## 6 · 拿到令牌

引导响应里不含令牌——去登录：

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

API 侧的认证**只认** `Authorization: Bearer`。Cookie 是有的，但它服务浏览器与
OIDC 流程，不用于这里。

## 7 · 可选——给一个 AI Agent 身份

没有邮箱，没有口令，没有账户：

```bash
# 生成密钥。私钥那一半从不离开 Agent。
openssl genpkey -algorithm ed25519 -out agent.pem
PUBKEY=$(openssl pkey -in agent.pem -pubout -outform DER | tail -c 32 | basenc --base64url | tr -d '=')

curl -X POST http://localhost:8080/api/actors \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d "{\"public_key\":\"$PUBKEY\",\"label\":\"nightly-runner\"}"
```

之后这个 Agent 分两步认证。先领挑战：

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

`payload` 就是要签的**那串字节**——四行，`\n` 连接，结尾无换行。把它返回出来，
是为了不让每个客户端库都自己实现一遍 canonicalization 再微妙地实现错。
服务端在验签前会**独立重算**一遍，你回传的那份从不被信任。

签名换会话：

```bash
curl -X POST http://localhost:8080/api/actors/authenticate \
  -H 'Content-Type: application/json' \
  -d "{\"actor_id\":\"$ACTOR_ID\",\"nonce\":\"$NONCE\",\"algorithm\":\"ed25519\",\"signature\":\"$SIG\"}"
```

拿回来的会话令牌带着 `subject_type: agent`。它在 `/api/actors/me` 上可用，
在人类端点上会被**明确拒绝**——这条边界是刻意的，也是
[写明了的](/zh/concepts/ai-native-identity)。

## 你现在有了什么

一个跑着的身份提供方、一个管理员、一枚会话令牌。你**没有**的是一套生产部署：
没有 TLS、没有 OIDC 签名密钥、数据库用的是 root 凭证，SMTP 那台大概率没在听。

## 接下来

| | |
|---|---|
| 接一个 Web 应用 | [授权码流程](/zh/integrate/authorization-code-flow) |
| 在它面向任何人之前先加固 | [生产清单](/zh/operate/production-checklist) |
| 搞清楚一枚令牌授予与不授予什么 | [身份与权限的边界](/zh/spec/identity-vs-authority) |
| 精确知道本 Release 支持什么 | [项目状态](/zh/project/status) |
