# 部署

这一页讲把 SoulAuth 真正跑起来：TLS、反向代理、数据库账号、多副本，
以及那些能阻止一个配错的实例启动的检查。

只想在本地跑起来，用[快速开始](./quickstart)。

## 前置条件

- 一个你能连上的 **SurrealDB 3.x** 实例
- 一个**终结 TLS 的反向代理** —— SoulAuth 按设计只说明文 HTTP
- 一个**前端**。SoulAuth 是纯 API：不带登录页、不带授权同意页、
  不带账号设置界面。

## 生产闸门

部署前最该知道的一件事：当 `APP_URL` 不是环回地址时，
没有 OIDC 签名密钥和 MFA 加密密钥，SoulAuth **拒绝启动**。

```bash
export APP_URL=https://auth.example.com
export OIDC_RSA_PRIVATE_KEY_PATH=/etc/soulauth/oidc-signing.pem
export MFA_SECRET_ENCRYPTION_KEY=$(openssl rand -base64 32)
```

理由在[配置](./configuration#生产闸门)。简言之，这两个默认值都会
悄悄摧毁已签发的凭证 —— 每次启动换一把签名密钥会作废所有 ID Token；
而 MFA 密钥从 `JWT_SECRET` 派生，意味着轮换 JWT secret 就永久锁死每个 MFA 用户。

签名密钥生成一次，分发到每个副本：

```bash
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 \
  -out /etc/soulauth/oidc-signing.pem
chmod 600 /etc/soulauth/oidc-signing.pem
```

## 反向代理与 TLS

SoulAuth 不终结 TLS。前面放 nginx、Caddy、Traefik 或云上的负载均衡。

```nginx
server {
    listen 443 ssl http2;
    server_name auth.example.com;

    ssl_certificate     /etc/letsencrypt/live/auth.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/auth.example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

然后让 SoulAuth 只绑环回，并信任代理的请求头：

```bash
BIND_ADDR=127.0.0.1:8080
APP_URL=https://auth.example.com
TRUST_PROXY_HEADERS=true
```

::: danger `TRUST_PROXY_HEADERS` 必须与可达性一致
`TRUST_PROXY_HEADERS=true` 让 SoulAuth 相信 `X-Forwarded-For`。
如果 SoulAuth *同时*还能被直连 —— 容器端口发布到宿主机、安全组开得太宽 ——
任何客户端都能把这个头设成任意值，从而完全绕开 IP 限流和 IP 锁定。
要么绑环回，要么确保唯一的入网路径就是那个代理。
:::

## 数据库账号

别用 `root` 跑 SoulAuth。建一个限定在其 namespace / database 内的专用账号：

```sql
DEFINE USER soulauth ON DATABASE PASSWORD '<生成的口令>' ROLES EDITOR;
```

`EDITOR` 给数据读写但不给改表结构的权限。SoulAuth 不在运行期建表，
表结构是事先导入的。

走 TLS 只要加前缀：

```bash
DATABASE_URL=https://db.internal:8000
```

明文连接指向非环回地址会产生启动告警。那条连接上跑的是数据库口令、
Argon2 密码哈希和会话令牌。

## 部署步骤

1. **启动 SurrealDB** 并确认可达：

   ```bash
   surreal start --bind 127.0.0.1:8000 --user root --pass "$DB_PASS" \
       file:/var/lib/surrealdb
   curl -f http://127.0.0.1:8000/health && echo " SurrealDB OK"
   ```

2. **准备环境变量。** 把 namespace 和 database 导成变量，
   保证导入目标与运行目标不会分叉：

   ```bash
   export DATABASE_URL=127.0.0.1:8000
   export DATABASE_NAMESPACE=auth
   export DATABASE_NAME=main
   export DATABASE_USER=soulauth
   export DATABASE_PASS="$DB_PASS"
   export JWT_SECRET=$(openssl rand -hex 32)
   export APP_URL=https://auth.example.com
   export SMTP_HOST=smtp.example.com
   export SMTP_FROM=noreply@example.com
   export OIDC_RSA_PRIVATE_KEY_PATH=/etc/soulauth/oidc-signing.pem
   export MFA_SECRET_ENCRYPTION_KEY=$(openssl rand -base64 32)
   ```

3. **导入表结构**，直接复用上面的变量：

   ```bash
   surreal import --endpoint "http://$DATABASE_URL" \
       --user "$DATABASE_USER" --pass "$DATABASE_PASS" \
       --namespace "$DATABASE_NAMESPACE" --database "$DATABASE_NAME" schema.sql

   surreal import --endpoint "http://$DATABASE_URL" \
       --user "$DATABASE_USER" --pass "$DATABASE_PASS" \
       --namespace "$DATABASE_NAMESPACE" --database "$DATABASE_NAME" initial_data.sql
   ```

   ::: warning 是 `--endpoint`，不是 `--conn`
   `--conn` 是 SurrealDB 的旧写法，在 3.x 上会报一句没什么帮助的错。
   :::

4. **构建：**

   ```bash
   cargo build --release
   ```

5. **运行：**

   ```bash
   ./target/release/soulauth
   ```

6. **验证：**

   ```bash
   curl https://auth.example.com/health
   # → {"status":"ok","uptime_seconds":12}
   ```

7. **建立第一个管理员。** 注册不发放管理权限 —— 第一个必须在库里授予，
   这样「谁第一个注册」才不会成为拿到全部权限的条件：

   ```bash
   curl -X POST https://auth.example.com/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","username":"admin","password":"CorrectHorse42!"}'

   curl -u "$DATABASE_USER:$DATABASE_PASS" \
     -H "surreal-ns: $DATABASE_NAMESPACE" -H "surreal-db: $DATABASE_NAME" \
     --data "LET \$u = (SELECT VALUE id FROM user WHERE email = 'admin@example.com')[0];
             CREATE user_role CONTENT {
               user_id: \$u, role_id: role:admin,
               assigned_at: 0, assigned_by: user:system
             };" \
     "http://$DATABASE_URL/sql"
   ```

   之后**重新登录** —— 令牌不带角色 —— 再确认 `GET /api/auth/me`
   返回 `"is_admin": true`。

::: tip 这套流程是可执行的
`tests/deployment_walkthrough.sh` 会从零跑一遍步骤 1–7 并断言
`is_admin: true`。从不被执行的文档一定会漂移；这一份漂移时 CI 会挂。
:::

## 跑多副本

两件事要注意：

**共享 OIDC 签名密钥。** 每个副本必须加载同一份 PEM，
否则副本 A 签发的令牌在副本 B 的 JWKS 下验不过。

**限流需要共享后端。** 计数器默认按进程，
所以 N 个副本会把每个实际限额乘以 N。

账号锁定存在数据库里，已经是共享的。会话同理。

## 健康检查

```
GET /health  →  {"status":"ok","uptime_seconds":12}
```

`/health` 注册在限流层*之后*，因此豁免限流 —— 探针在压力下返回 429
会被判成进程已死并触发重启，那会把限流器变成故障放大器。

## 升级

升级前先看仓库里的 `DEPLOYMENT.md` 有没有版本相关的迁移步骤。
近期的一次修订把 API 响应统一成了裸对象，
原先会去剥 `data` 信封的客户端需要更新。

## 下一步

- [**安全模型**](./security-model) —— 上线前检查清单。
- [**暴力破解防护**](./lockout) —— 调参与解锁。
- [**审计**](./auditing) —— 记了什么，怎么读。
