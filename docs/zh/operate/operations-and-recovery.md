# 运维与恢复

日常工作：轮换、备份，以及出事之后怎么办。

## 备份

只有一样东西要备份——SurrealDB 数据目录。身份、凭证、会话、客户端、审计行都在里面。

```bash
systemctl stop soulauth
tar czf soulauth-$(date +%F).tar.gz /var/lib/surrealdb/
systemctl start soulauth
```

有两样东西**在数据库之外**，而恢复时同样必需：

- `JWT_SECRET`
- OIDC 签名密钥（`OIDC_RSA_PRIVATE_KEY_PATH`）与 `MFA_SECRET_ENCRYPTION_KEY`

没有它们就恢复数据库，结果是所有会话失效、所有已签发的 ID Token 验不过，
而且**所有已存的 TOTP 密钥无法解密**。把它们放在你存秘密的地方，并且真的测一次
能不能取回来。

## 轮换密钥

### `JWT_SECRET`

轮换它会让所有会话失效——所有人被登出。这是预期代价，不是故障。

::: danger 先轮换 MFA 密钥，否则别动
如果 `MFA_SECRET_ENCRYPTION_KEY` 从未被显式设置，MFA 密钥是**从 `JWT_SECRET` 派生**
的。此时轮换 `JWT_SECRET` 会把每个 MFA 用户永久锁死——他们存着的 TOTP 密钥再也
解不开，除了让他们重新绑定之外没有恢复手段。

在你动 `JWT_SECRET` 之前，先设一个专用的 `MFA_SECRET_ENCRYPTION_KEY`。
非环回的 `APP_URL` 已经强制要求它，闸门存在的理由正是这个。
:::

### OIDC 签名密钥

轮换它会让在途的 ID Token 失效。客户端靠重新拉取 JWKS 恢复——它们在看到未知 `kid`
时会这么做，所以如果可能，让新旧密钥并存至少一个令牌生命周期。

### 客户端密钥

```bash
curl -X POST $SOULAUTH/api/oidc/clients/$CLIENT_ID/regenerate-secret \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

只返回一次。旧密钥立刻停止工作，所以要在同一个维护窗口里把新密钥部署到客户端。

## 被锁定的账号

```bash
# 谁被锁了
curl $SOULAUTH/api/security/lockout -H "Authorization: Bearer $ADMIN_TOKEN"

# 解锁（幂等——没被锁时返回 false）
curl -X POST $SOULAUTH/api/security/unlock \
  -H "Authorization: Bearer $ADMIN_TOKEN" -H 'Content-Type: application/json' \
  -d '{"identifier":"user@example.com","lockout_type":"User"}'
```

两个维度都能解——`User` 与 `Ip`。上锁与解锁都写审计；只记上锁会留下一串永远没有
下文的事件。

需要 `soulauth:security.write`。

## 停用一个主体

```bash
curl -X PUT $SOULAUTH/api/users/$USER_ID/status \
  -H "Authorization: Bearer $ADMIN_TOKEN" -H 'Content-Type: application/json' \
  -d '{"account_status":"Suspended"}'
```

停用挡住的是**未来**的认证。其它副本上已有的会话最多还能用
`AUTH_SESSION_CACHE_TTL_SECONDS`。如果这件事要紧，重启那些副本。

历史不被改写：过去的认证、审计行与归因都保留。一个被停用的主体是「不能再认证」，
不是「从未存在过」。

## 怀疑凭证泄露

**某个用户的口令。** 停用、强制重置、恢复。改密时他的会话会失效。

**某个客户端密钥。** 重新生成。已有的访问令牌在过期前仍然有效——那个窗口是
`access_token_lifetime`，默认 3600 秒。

**某个 AI 主体的密钥。** 吊销那一枚凭证。主体保留身份和其它仍然有效的密钥——
允许多枚密钥的全部理由就在这里。

```bash
curl -X DELETE $SOULAUTH/api/actors/$ACTOR_ID/credentials/$CREDENTIAL_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**`JWT_SECRET`。** 先读上面那条轮换警告，再轮换。所有人被登出。

**数据库。** 会话、访问令牌、刷新令牌、授权码、重置与验证令牌全部以 SHA-256 指纹
存储，所以读一次数据库拿不到任何可用凭证。
<Status kind="tested" guard="conformance::b4b" /> 口令是 Argon2。TOTP 密钥是加密的
——用的那把密钥，如果你从未显式设置，来自 `JWT_SECRET` 派生。

## 清理

后台任务每小时跑一次：过期会话、过期重置令牌、过期 OIDC 制品、陈旧限流行、
陈旧锁定记录。不需要你调度什么。

审计行**不**清理。需要保留期限的话，那是你的策略。

## 监控

```bash
curl $SOULAUTH/health                     # 公开
curl $SOULAUTH/api/audit/system-health \
  -H "Authorization: Bearer $ADMIN_TOKEN"  # 需要 soulauth:security.read
```

值得告警的：`login_failed` 速率、`account_locked` 速率、管理端点上的
`permission_denied`，以及进程日志里任何 `panicked`。

## 接下来

| | |
|---|---|
| 诊断具体故障 | [排查](/zh/operate/troubleshooting) |
| 审计日志能证明什么、不能证明什么 | [审计](/zh/reference/audit) |
