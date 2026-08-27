# AI 原生身份

这里的 AI Agent 是**独立主体**：它有身份、持有凭证、自己证明自己。背后没有一个
人类账户。

<Status kind="supported" /> <Status kind="tested" guard="conformance::a6" />

## 它解决的问题

任何系统里你都能给机器人弄个身份——建个用户、编个邮箱、设个口令、丢进一个组。
这套一直能用，直到有人翻审计日志问一句**这事是谁干的？**，而诚实的答案是
"2023 年某人建的服务账号，密码在某条 Slack 消息里"。

那里出了三件事，其实是同一个错：

- 机器人的身份长得跟人一样，模型里没有任何东西能区分「一个人登录了」
  与「一个自动化流程跑了」。
- 凭证**就是**身份——口令一旦失控，这个主体就永久丢了。
- 归因指向的是一行由人创建、又由人共用的记录。

SoulAuth 把这几个对象拆开，让上面任何一条都不再是被迫的。

## 几个对象

| 对象 | 对 AI Agent 而言 |
|---|---|
| `ActorIdentity` | 存在。`actor_kind: ai_actor`，有自己持久的 `subject_key`。 |
| `HumanAccount` | **不存在。** 没有邮箱、没有用户名、没有口令。 |
| Credential | 一枚或多枚 Ed25519 公钥。SoulAuth 只持有公钥那一半。 |
| Session | 普通会话——`session` 表本来就以身份根为键，不是以 user 行为键。 |

第二行是全部要点所在，而且它是**被断言的**而不是被承诺的：一致性套件会检查
AI 认证路径的代码里根本不出现 `human_account`、`password`、`email`、`username`。

<Figure2 locale="zh" />

## 它怎么认证

两步。Agent 的私钥从不离开 Agent，网络上也从不流动任何可复用的东西。

### 1 · 领一枚挑战

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

### 2 · 签名，换会话

```bash
curl -X POST $SOULAUTH/api/actors/authenticate \
  -H 'Content-Type: application/json' \
  -d '{"actor_id":"…","nonce":"…","algorithm":"ed25519","signature":"…"}'
```

拿回来的会话令牌，claims 里带着 `subject_type: agent`。

## 到底签的是什么

四行，`\n` 连接，结尾无换行：

```text
soulauth-ai-actor-auth/v1        ← 域分隔符，带版本号
http://localhost:8080            ← issuer
actor_identity:lnhl…             ← 这个主体
sp9kEQQT4evGROoc…                ← 这枚 nonce
```

每一行都在承重：

- **第 1 行**保证为这件事做的签名，永远不可能被当成将来某件事的签名。版本号写在
  串里，所以改动 payload 结构会在构造上让旧签名失效。
- **第 2 行**挡住「从部署 A 抓到的挑战拿去 B 重放」——只要两边碰巧有同名 actor。
- **第 3 行**把证明绑到唯一一个主体，**第 4 行**绑到唯一一次尝试。

::: tip 为什么 payload 由服务端给出
让每个客户端库自己拼那四行当然可以，但拼错时的表现是「签名就是验不过」，
这是最难排查的那类问题。所以服务端直接把字节给出来。

这不泄露任何东西：payload 里没有秘密，而服务端在验签前会**独立重算一遍**，
你回传的那份从不被使用。
:::

被签名内容里刻意没有任何 JSON。JSON 没有唯一的字节表示——键序、空白、转义、
数字写法都能变——所以「先序列化再签名」总要额外拖进一套 canonicalization 规范。
四行文本不会和自己不一致。

## 重放、轮换、吊销

**挑战在验签之前就被消费掉。** 不是之后。先验签会留下一个窗口：同一枚 nonce 的
两个并发请求都能通过。代价是一次失败也烧掉这枚挑战——而这正是想要的，
允许客户端对同一枚 nonce 反复试签名，等于把它做成靶子。

**多枚密钥可以同时有效。** 安全轮换靠的就是这个：先加新钥，确认 Agent 用它能认证，
再吊销旧的。

**吊销改的是状态，不删记录。** 否则审计里「那次动作用的是哪把钥匙」就没了答案。

## 本 Release 做不到的

<Status kind="planned" /> **Agent 会话不带任何权限。** RBAC 仍然挂在人类账户行上，
所以 Agent 令牌在 `/api/actors/me` 上可用，在人类端点上会被拒——而且是明确的 403，
不是含混的 401。这个拒绝是刻意的：让一枚令牌因为某个提取器碰巧能解析它而悄悄通过，
比一条清晰的边界糟得多。

<Status kind="planned" /> **Agent 不出现在 OIDC 流程里。** `/authorize` 认的是
浏览器会话。

这两条限制都写在机器可读的[规范注册表](/zh/security/standards-and-conformance)里，
不只写在这一页。

## 常见误解

::: details 这不是 RFC 7523、不是 mTLS、也不是 client credentials
这份证明不是 JWT（7523），不涉及传输层客户端证书（8705），不经过
`/api/oidc/token`（client credentials grant），也不签名 HTTP 请求本身（RFC 9421）。
它是 SoulAuth 自有的机制，注册表里明写了这一点，免得有人以为某个标准在起作用。
:::

::: details 「AI actor」不是关于这个 Agent 本性的主张
给一样东西身份，说的是它可被识别、可被追责。它不说明自主性、能动性或内在体验。
身份系统不是对这些表态的地方，本项目也不表态。
:::

::: details 机器身份不自动就是 AIActor
服务账号、API key、workload identity 回答的是「哪个程序在调用」。
`ActorIdentity` 回答的是「这是哪个主体，跨越时间，且与它当下持有哪份凭证无关」。
换一次密钥不得产生一个新主体。
:::

::: details 地位平等不等于实现相同
人类主体与 AI 主体共享同一套身份契约。它们不共享认证方式、生命周期或账户属性
——也不应该共享。
:::

## 接下来

| | |
|---|---|
| 注册一个，看它认证 | [快速上手 第 7 步](/zh/start/quickstart) |
| 完整的对象模型 | [Actor 身份模型](/zh/concepts/actor-identity-model) |
| 一枚会话令牌**不**授予什么 | [身份与权限的边界](/zh/spec/identity-vs-authority) |
