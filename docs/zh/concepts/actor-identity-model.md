# Actor 身份模型

五个对象。它们保持分开，是因为任意两个合并掉，都会毁掉某个后来有人依赖的性质。

## 锚点

`ActorIdentity` 只回答一个问题——**这是谁，持久地**——此外什么都不回答。

| 字段 | 含义 |
|---|---|
| `subject_key` | 稳定主体。生成的，绝不从邮箱或用户名派生。 |
| `actor_kind` | `human` 或 `ai_actor` |
| `identity_source` | `local`、`external`、`soulseed`——这个身份怎么进来的 |
| `canonical_actor_ref` | 仅 Soulseed 部署：指向别处定义的 actor 的引用 |
| `status` | `active`、`suspended`、`retired` |

表里有两个设计决定值得说清楚。

**`subject_key` 是生成的，不是派生的。** 从邮箱地址派生 subject，是身份系统把自己
逼进死角最常见的一种方式：地址变了，要么 subject 跟着变（毁掉所有历史记录），
要么不变（那这个"派生"从一开始就是假的）。

**只有 `active` 能认证**，而且读不懂的状态值一律当作 suspended 而不是 active。
状态列里一个拼写错误应该挡住认证，而不是悄悄放行。

::: tip Resource ID ≠ subject
`ActorIdentity` 既有 record ID，**也有** `subject_key`。它们是两个命名空间。
实现上可以取同一个值，那是一种选择，不是等价关系，任何 API 契约都不该假定它。
:::

## 围绕它的那些

<Figure2 locale="zh" />

### HumanAccount —— 一个人怎么管理自己的登录

`email`、`username`、`username_normalized`、`email_verified`。

改邮箱改的是这一行，不改这个主体。正是这层拆分，让一个 AI Agent 可以完全不具备
上面任何字段而存在——[AI 原生身份](/zh/concepts/ai-native-identity)。

::: warning 还没有完全拆干净
<Status kind="planned" /> 口令与 TOTP 仍然住在遗留的 `user` 表上，而不是收在一个
凭证对象后面。`HumanAccount` 这层拆分是真的，它背后的凭证收口还没做完。
见[项目状态](/zh/project/status)。
:::

### Credential —— 此刻能拿什么证明这个主体

对 AI 主体而言，这是一张真实存在的独立表：`ai_actor_credential`，存
`public_key`、`algorithm`、`label`、`status`、`last_used_at`。SoulAuth 在那里
只存公钥，所以读到这张表的人不因此获得冒充任何人的能力。

要守住的性质是：**身份的寿命长于它持有的任何凭证。** 轮换一把钥匙、丢了一把钥匙、
吊销一把钥匙——都不产生一个新主体。

### IdentityBinding —— 外部哪个主体与它是同一个

`provider`、`provider_subject`、`binding_type`、`verification_state`、`revoked_at`。

绑定解析的是**对应关系**："GitHub 用户 `4001` 就是这个主体"。它不是凭证，
也不是一次认证。

::: details 为什么只按外部 subject 匹配是个真漏洞
`(provider, provider_subject)` 必须成对匹配。只按 subject 匹配的话，数字 id 为
`4001` 的 GitHub 账号，会与 `sub` 是字符串 `"4001"` 的 Google 账号解析到同一个
主体——一次不需要任何利用代码的跨 provider 账号接管。
:::

### Client —— 是哪个应用在问

已注册的 OIDC 客户端。客户端是协议里的一方，永远不是这次认证的主体。

## 合并之后各自会塌掉什么

这就是整套模型的论证，压缩版：

| 如果把…合并 | 你失去 |
|---|---|
| 身份并进账户 | 非人主体不必伪造人类属性也能存在 |
| 身份并进凭证 | 跨密钥轮换的稳定归因 |
| 凭证并进绑定 | 「同一个人、换了 IdP」与「秘密被复制」的区别 |
| 档案并进身份 | 不可变性——改个显示名就成了改身份 |
| 客户端并进主体 | 限定任一集成能看到多少 |

## 连续性

一个主体在周围一切变动时保持为同一个主体：邮箱变、用户名变、密钥轮换、MFA 开了
又关、登录经由不同客户端进来。这些都不是身份变更。

唯一**不可逆**的方向是：退役的主体永不被重新分配。一个身份可以停止认证；
它的标识符不会在之后被交给另一个人。这也是退役不删记录的原因——记录留着，
唯一索引才继续挡住复用。

::: warning 今天的 `sub` 到底对什么稳定
<Status kind="planned" /> OIDC 的 `sub` 目前带的是遗留 `user` 行的键，不是身份根。
所以它在那一行的生命周期内稳定——弱于模型描述的「永不重新分配」。如果你需要一个
能挺过账号重建的主体标识，`sub` 现在给不了你。这一条作为具名 caveat 记在
[规范注册表](/zh/security/standards-and-conformance)里。
:::

## Standalone 与 Soulseed

Standalone 是默认：SoulAuth 就是整个身份域，`identity_source` 为 `local`，
`canonical_actor_ref` 为空。

在 Soulseed 部署里，canonical actor 由 SoulseedAGI 定义，`canonical_actor_ref` 持有
指向它的引用。SoulAuth 认证那个主体，但不因此获得定义或修改它的能力。这个引用属于
受控 Integration Claim，默认不暴露给第三方 OIDC 客户端。
[Soulseed 与 Mind OS →](/zh/spec/soulseed-and-mind-os)

## 接下来

| | |
|---|---|
| Agent 那条路径的全貌 | [AI 原生身份](/zh/concepts/ai-native-identity) |
| 认证成功**不**授予什么 | [身份与权限的边界](/zh/spec/identity-vs-authority) |
| 这些对象究竟为何存在 | [规范](/zh/spec/) |
