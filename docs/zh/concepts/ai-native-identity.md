# AI 原生身份

在 SoulAuth 里，AI 主体（AI actor）是独立主体：拥有自己的身份，持有自己的凭证，
自己完成证明。背后不存在人类账户。

<Status kind="supported" /> <Status kind="tested" guard="conformance::a6" />

## 要解决的问题

[为什么是 SoulAuth](/zh/start/what-is-soulauth) 开头那条查不出责任人的审计日志，
是三个问题一起发作的样子。它们看起来是三件事，根子是同一个：身份、账户、凭证
被合成了一样东西。

- 机器人的身份被塑造成人的形状，模型里没有任何东西能区分「一个人登录了」
  和「一个自动化流程运行了」；
- 凭证就是身份本身，口令一旦失控，这个主体也就永久失去了；
- 归因指向的是一行由人创建、又由多人共用的记录。

把这三个对象拆开，上面三条同时消失。

## 涉及的对象

| 对象 | 对 AI 主体而言 |
|---|---|
| `ActorIdentity` | 存在。`actor_kind` 为 `ai_actor`，拥有自己持久的 `subject_key`。 |
| `HumanAccount` | **不存在。** 没有邮箱，没有用户名，没有口令。 |
| Credential | 一枚或多枚 Ed25519 公钥。SoulAuth 只保存公钥。 |
| 会话 | 与人类主体共用同一套。`session` 表本来就以身份根为键，而非 user 行。 |

第二行是全部要点所在。它由测试断言，不是靠承诺：一致性套件会检查 AI 认证路径的
代码中不出现 `human_account`、`password`、`email`、`username`。

<Figure2 locale="zh" />

## 认证流程

整个流程分两步。私钥始终留在 AI 主体一侧，网络上传输的只有一次性签名。

### 第一步：领取挑战

```bash
curl -X POST $SOULAUTH/api/actors/challenge \
  -H 'Content-Type: application/json' \
  -d '{"actor_id":"actor_identity:lnhl…"}'
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

### 第二步：提交签名，换取会话

```bash
curl -X POST $SOULAUTH/api/actors/authenticate \
  -H 'Content-Type: application/json' \
  -d '{"actor_id":"…","nonce":"…","algorithm":"ed25519","signature":"…"}'
```

返回的会话令牌，claims 中带有 `subject_type: agent`。

## 被签名的内容

四行，以 `\n` 连接，结尾不带换行：

```text
soulauth-ai-actor-auth/v1        ← 域分隔符，含版本号
http://localhost:8080            ← issuer
actor_identity:lnhl…             ← 主体
sp9kEQQT4evGROoc…                ← nonce
```

四行各自承担一项职责：

- 第一行保证这枚签名只能用于「AI 主体向 SoulAuth 证明身份」这一件事。版本号写在
  串里，因此改动 payload 结构会在构造上让旧签名失效。
- 第二行阻止跨部署重放。若无此行，从部署 A 抓到的挑战可以拿到部署 B 去用，
  只要两边碰巧存在同名主体。
- 第三行把证明绑定到唯一一个主体，第四行绑定到唯一一次尝试。

::: tip payload 为何由服务端给出
客户端自行拼接这四行当然可行，但一旦拼错，表现出来的只是「签名验不过」，
属于最难排查的一类问题。因此服务端直接返回这串字节，客户端只需签名。

这样做不泄露任何信息：payload 中没有秘密，而服务端在验签前会独立重算一遍，
请求中回传的那一份从不参与校验。

被签名内容里刻意不使用 JSON。JSON 没有唯一的字节表示，键序、空白、转义、
数字写法都可能变化，因此「先序列化再签名」总要额外引入一套 canonicalization 规范。
四行纯文本不存在这个问题。
:::

## 重放、轮换与吊销

**挑战在验签之前就被消费。** 若先验签、成功后再标记已用，同一枚 nonce 的两个并发
请求会同时通过。代价是一次失败也会消耗掉这枚挑战，而这正是期望的行为：允许对同一
枚 nonce 反复尝试签名，等于把它变成爆破目标。

**多枚密钥可以同时有效。** 安全轮换依赖于此：先添加新密钥，确认 AI 主体能用它完成
认证，再吊销旧的。

**吊销只改状态，不删记录。** 记录一旦删除，审计中「这次认证使用的是哪一枚密钥」
就失去了答案。

## 本 Release 的边界

<Status kind="planned" /> **AI 主体的会话不携带任何权限。** RBAC 目前仍建立在 user
行之上，因此 AI 主体的令牌可用于 `/api/actors/me`，在人类端点上会被拒绝，
返回明确的 403 而非含混的 401。这条拒绝写在提取器里：`AuthedUser` 先看
`subject_type`，是 agent 就直接返回 `Forbidden`，根本不去查那一行。
没有这道检查的话，它会以「用户不存在」的形式失败；而哪天某条查询路径恰好能解析到
一行，它就开始放行了。

<Status kind="planned" /> **AI 主体不参与 OIDC 流程。** `/authorize` 认的是浏览器会话。

这两条限制同时记录在机器可读的[规范注册表](/zh/security/standards-and-conformance)中，
不只写在本页。

## 容易产生的误解

::: details 这不是 RFC 7523，不是 mTLS，也不是 client credentials
这份证明不是 JWT（RFC 7523），不涉及传输层客户端证书（RFC 8705），不经过
`/api/oidc/token`（client credentials grant），也不对 HTTP 请求本身签名
（RFC 9421）。它是 SoulAuth 自有的机制，注册表中明确写出了这一点，
以免有人误以为某个既有标准在起作用。
:::

::: details 「AI 主体」不是关于该主体本性的主张
赋予某个对象身份，说的是它可被识别、可被追责，不涉及自主性、能动性或内在体验。
身份系统不是就此表态的地方，本项目也不表态。
:::

::: details 机器身份不等同于 AI 主体
服务账号、API key、workload identity 回答的是「哪个程序在调用」。`ActorIdentity`
回答的是「这是哪一个主体」，且该回答跨越时间、与它当下持有哪份凭证无关。
更换密钥不应产生新的主体。
:::

::: details 地位平等不意味着实现相同
人类主体与 AI 主体共享同一套身份契约，但不共享认证方式、生命周期与账户属性，
也不应共享。
:::

## 接下来

| | |
|---|---|
| 注册一个 AI 主体并观察其认证过程 | [快速上手 第 7 步](/zh/start/quickstart) |
| 完整的对象模型 | [Actor 身份模型](/zh/concepts/actor-identity-model) |
| 一枚会话令牌不授予什么 | [身份与权限的边界](/zh/spec/identity-vs-authority) |
