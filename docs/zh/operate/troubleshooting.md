# 排查

按你可能遇到的先后顺序排列。

## 能启动、`/health` 正常，第一次写入失败

schema 导进了与进程连接时不同的 namespace/database 对。

```bash
surreal sql --endpoint http://127.0.0.1:8000 --user root --pass root \
  --namespace auth --database main --json <<< 'SELECT VALUE id FROM role:admin;'
```

什么都没返回，说明种子不在你刚查的这一对里。用与 `DATABASE_NAMESPACE` /
`DATABASE_NAME` 匹配的 `--namespace` / `--database` 重新导入。

这是最常见的部署故障，而且几乎不可见：进程启动、健康检查通过、
直到一次写入才有人抱怨。

## 拒绝启动

报错会指名是哪一项。最常撞到的三个：

| 报错提到 | 修法 |
|---|---|
| `JWT_SECRET … must be at least 32 characters` | `openssl rand -hex 32` |
| `OIDC_RSA_PRIVATE_KEY_PEM … required when APP_URL is not a loopback address` | 生成并持久化一把签名密钥 |
| `MFA_SECRET_ENCRYPTION_KEY … required when APP_URL is not a loopback address` | `openssl rand -base64 32` |

后两条只在 `APP_URL` 不再是环回地址时出现——也就是你第一次真正部署的时候。
这是刻意的：两个默认值都"能用"，直到它们摧毁凭证。

## 日志里没有引导令牌

它只在**不存在管理员**时打印。已经有了的话，日志说的是另一句：

```
INFO Bootstrap path closed: an administrator already exists
```

令牌以 `warn` 级别打印，所以能挺过默认日志过滤。两句都没看到，说明你看的是
另一个进程或一份被过滤的日志。

## 换码时报 `invalid_grant`

按这个顺序查：

- **`Client secret required for confidential client`**——客户端注册成了
  `confidential` 而你没送密钥。
- **`redirect_uri` 不同**，与授权请求里那个哪怕差一个字符。精确匹配，不做归一化。
- **码已被使用。** 它是一次性的，而且消费发生在其它一切之前。
- **码已过期。**
- **`code_verifier` 对不上。** 几乎总是 base64url 的 padding 没去掉，
  或者 `+`/`/` 没换成 `-`/`_`。

## 客户端库拒绝发现文档

`issuer` 必须与客户端预期的逐字符相等。对比一下：

```bash
curl -s $SOULAUTH/.well-known/openid-configuration | grep issuer
```

和你的 `APP_URL`。通常就是某一边多了个尾斜杠。

## 登出看起来没生效

你清了自己的会话，但没清 SoulAuth 的。下一次登录会静默复用仍然有效的身份提供方
会话，于是用户没被问任何问题就回到了同一个账号。

重定向到 `end_session_endpoint` 并带上 `id_token_hint`。见
[浏览器与 BFF](/zh/integrate/browser-and-bff#登出)。

## 用户被停用后还登着

短时间内是预期的。每个实例缓存已解析的会话；其它副本在
`AUTH_SESSION_CACHE_TTL_SECONDS`（默认 5）之内观察到变化。要立刻生效就重启副本。

<Status kind="planned" /> 跨副本的瞬时吊销没有实现，
[项目状态](/zh/project/status)如实写着这一点，而不是让本页暗示相反的事。

## 测试时被限流

登录端点按 IP 限流，账号在反复失败后会被锁。两者都在数据库里，
所以重启进程不会清掉它们。

```bash
curl -X POST $SOULAUTH/api/security/unlock \
  -H "Authorization: Bearer $ADMIN_TOKEN" -H 'Content-Type: application/json' \
  -d '{"identifier":"user@example.com","lockout_type":"User"}'
```

## 邮件从来收不到

发信失败只记日志、不抛出——这是刻意的，免得一台坏掉的 SMTP 主机把"忘记密码"
变成 500，或者通过时间差泄露某个地址是否已注册。代价是它很安静。

```bash
grep -i 'smtp\|mail' /var/log/soulauth.log
```

即使关闭验证，`SMTP_HOST` 与 `SMTP_FROM` 仍是必填，因为重置要发信。

## 期望 `401` 却拿到 `403`

两种不同含义：

- **缺权限。** 响应体带
  `{"error":"missing_permission","required_permission":"…"}`。
- **主体类型不对。** AI 主体的会话打人类端点，或人类会话打 `/api/actors/me`。
  两者都明确拒绝，而不是含混失败。

## 所有请求都从同一个地址被 `429`

在代理之后而没设 `TRUST_PROXY_HEADERS=true`，于是每个请求看起来都来自代理，
一个客户端的失败会把所有人限流。

打开它——但**只有在** SoulAuth 无法被直连时。如果能，这个头就是可伪造的，
限流会彻底失效。

## 怎么读错误

每个非 OIDC 错误都带一个稳定的机器码：

```json
{ "error": "account_locked", "message": "…", "locked_until_seconds": 743 }
```

按 `error` 分支，永远不要按 `message`。码的清单在 `contracts/openapi.yaml` 里。
OIDC 端点用的是 RFC 6749 的形状——
[API 约定](/zh/reference/api-conventions#错误)。

## 还是卡住

跑一遍那几套测试——它们对照契约检查系统，通常比读日志更快定位问题：

```bash
cargo test
./tests/integration.sh
./tests/deployment_walkthrough.sh
```

然后[提一个 issue](https://github.com/RcityHarold/SoulAuth/issues)。

## 接下来

| | |
|---|---|
| 恢复流程 | [运维与恢复](/zh/operate/operations-and-recovery) |
| 已知限制 | [项目状态](/zh/project/status) |
