# 快速开始

大约五分钟，跑起一个带管理员账号的 SoulAuth。

这里全部在 `localhost` 上走明文 HTTP —— SoulAuth 只对环回地址允许这么做。
往外暴露之前，先看[生产闸门](./deployment#生产闸门)。

## 前置条件

- **Rust** 1.75 或更高（建议用 `rustup`）
- **SurrealDB** 3.x —— [安装说明](https://surrealdb.com/install)
- **OpenSSL**，用来生成密钥
- **curl**，以及 `jq` 之类的 JSON 格式化工具（可选，方便跟着做）

::: tip 为什么是 SurrealDB
SoulAuth 所有东西都放在一个数据库里 —— 用户、会话、令牌、角色、审计。
没有第二个数据存储要运维。表结构以两个 SQL 文件的形式随仓库发布。
:::

## 1. 拿源码

```bash
git clone https://github.com/RcityHarold/SoulAuth.git
cd SoulAuth
```

## 2. 起 SurrealDB

```bash
surreal start --bind 127.0.0.1:8000 --user root --pass root file:/tmp/soulauth-db
```

让它跑着，另开一个终端。确认它活着：

```bash
curl -f http://127.0.0.1:8000/health && echo " SurrealDB OK"
```

## 3. 导入表结构

导入用的 namespace / database **必须**和应用之后连接的一致。
先把它们导出成变量是最省事的对齐办法：

```bash
export DATABASE_URL=127.0.0.1:8000
export DATABASE_NAMESPACE=auth
export DATABASE_NAME=main
export DATABASE_USER=root
export DATABASE_PASS=root

surreal import --endpoint "http://$DATABASE_URL" \
    --user "$DATABASE_USER" --pass "$DATABASE_PASS" \
    --namespace "$DATABASE_NAMESPACE" --database "$DATABASE_NAME" schema.sql

surreal import --endpoint "http://$DATABASE_URL" \
    --user "$DATABASE_USER" --pass "$DATABASE_PASS" \
    --namespace "$DATABASE_NAMESPACE" --database "$DATABASE_NAME" initial_data.sql
```

::: warning 参数是 `--endpoint`，不是 `--conn`
旧版 SurrealDB 文档用的是 `--conn`。3.x 上是 `--endpoint`，
传错了会报一句没什么帮助的错。
:::

`schema.sql` 定义表与索引。`initial_data.sql` 播种内置角色与权限 ——
其中包括 `role:admin`，SoulAuth 启动时会检查它，
以区分「表结构从没导过」和「库里本来就是空的」。

## 4. 配置

只有四项必填。复制示例文件然后填：

```bash
cp .env.example .env
```

至少要设：

```bash
JWT_SECRET=$(openssl rand -hex 32)   # 至少 32 个字符
APP_URL=http://localhost:8080         # 公开地址，不是监听地址
SMTP_HOST=127.0.0.1
SMTP_FROM=noreply@localhost
```

::: tip `APP_URL` 不是监听地址
`APP_URL` 是客户端访问你的地址。它决定 OIDC issuer、外发邮件里链接的前缀，
以及会话 cookie 带不带 `Secure`。监听地址是 `BIND_ADDR`，默认 `0.0.0.0:8080`。
:::

其余变量都有可用默认值，完整清单见[环境变量参考](/zh/reference/environment)。

这一趟不需要邮件：`EMAIL_VERIFICATION_ENABLED` 默认 `false`，
没有邮件服务器也能注册成功。SoulAuth 仍要求 `SMTP_HOST` 与 `SMTP_FROM`
**被设置**，但这两个值只在它真的要发信时才用。

## 5. 构建并运行

```bash
cargo build --release
./target/release/soulauth
```

验一下：

```bash
curl http://localhost:8080/health
# → {"status":"ok","uptime_seconds":3}
```

如果启动失败，报错会告诉你要改什么 —— SoulAuth 在绑定端口之前
就会校验配置和表结构。比如表结构没导入，它会把该跑的 `surreal import`
命令原样打出来，连它实际在看的 namespace 和 database 一起。

## 6. 注册一个用户

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","username":"admin","password":"CorrectHorse42!"}'
```

密码策略：**至少 12 个字符**，且包含大写、小写、数字、符号
**四类中的三类**。最小长度可用 `PASSWORD_MIN_LENGTH` 调整。

登录：

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"CorrectHorse42!"}'
```

拿到一个令牌，用它：

```bash
TOKEN=<粘贴令牌>
curl http://localhost:8080/api/auth/me -H "Authorization: Bearer $TOKEN"
```

## 7. 给自己授予管理员

注册**不会**发放管理权限。第一个管理员必须直接在库里授予 ——
这是刻意的：否则「谁第一个注册」就成了拿到系统全部权限的条件。

```bash
curl -u "$DATABASE_USER:$DATABASE_PASS" \
  -H "surreal-ns: $DATABASE_NAMESPACE" -H "surreal-db: $DATABASE_NAME" \
  --data "LET \$u = (SELECT VALUE id FROM user WHERE email = 'admin@example.com')[0];
          CREATE user_role CONTENT {
            user_id: \$u, role_id: role:admin,
            assigned_at: 0, assigned_by: user:system
          };" \
  "http://$DATABASE_URL/sql"
```

然后**重新登录** —— 令牌本身不带角色，旧令牌不会感知这次变更：

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"CorrectHorse42!"}'
```

确认：

```bash
curl http://localhost:8080/api/auth/me -H "Authorization: Bearer $NEW_TOKEN"
# → "is_admin": true
```

现在你有一个带管理员的可用实例了。

::: tip 这些步骤是被测过的
仓库里的 `tests/deployment_walkthrough.sh` 会从零执行上面这一整串，
最后断言 `is_admin: true`。上面任何一步哪天不灵了，CI 会先挂。
:::

## 下一步

- [**配置**](./configuration) —— 其余环境变量都干什么。
- [**注册客户端**](/zh/integrate/clients) —— 用 OIDC 接入你的第一个应用。
- [**部署**](./deployment) —— TLS、反向代理、多副本，以及生产闸门。
- [**安全模型**](./security-model) —— 面向公网之前该打开哪些开关。
