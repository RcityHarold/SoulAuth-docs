# Actor 身份模型

一个主体拆成五个对象存放。下面按对象来：每个存哪些字段，跟身份根是什么关系。

## 身份锚点

`ActorIdentity` 只回答一个问题：**这是谁，且持久不变**。除此之外它什么都不回答。

| 字段 | 含义 |
|---|---|
| `subject_key` | 稳定的 subject 值。生成的，绝不从邮箱或用户名派生。 |
| `actor_kind` | `human` 或 `ai_actor` |
| `identity_source` | `local`、`external`、`soulseed`。标明这个身份的来源 |
| `canonical_actor_ref` | 仅 Soulseed 部署：指向别处定义的 actor 的引用 |
| `status` | `active`、`suspended`、`retired` |

表里有两个设计决定值得说清楚。

**`subject_key` 由系统生成，不从别处派生。** 假如它是从邮箱地址算出来的，
那么用户改一次地址就只有两种结果。要么 subject 跟着变：改动之前写下的每一条审计行
都指向一个再也解析不出东西的标识符，而所有把用户键在 `sub` 上的下游应用，
看到的是一个陌生人。要么它不变，那这个值从来就不是「派生」，
只是一个名字起得有误导性的存储字段。

**只有 `active` 状态能够认证**，并且无法识别的状态值一律按 suspended 处理，
而不是按 active 处理。状态列中的一个拼写错误应当挡住认证，而不是悄悄放行。

::: tip Resource ID ≠ subject
`ActorIdentity` 既有 record ID，**也有** `subject_key`。它们是两个命名空间。
实现上可以取同一个值，那是一种选择，不是等价关系，任何 API 契约都不该假定它。
:::

## 围绕身份根的对象

<Figure2 locale="zh" />

下面四个对象都挂在 `actor_identity` 上，而且都是可选的。

**没有与 `HumanAccount` 对应的 `AIActor` 对象。** 一个 AI 主体就是一条
`actor_kind = ai_actor` 的 `actor_identity`，名下没有 `human_account` 行 ——
库里也确实只有 `actor_identity`、`human_account`、`ai_actor_credential`、
`ai_actor_challenge` 四张表，没有第五张。人类那一侧多出一行来放邮箱和用户名，
非人那一侧不需要，所以不建。

### HumanAccount：人如何管理自己的登录

`email`、`username`、`username_normalized`、`email_verified`。

修改邮箱改的是这一行，主体本身不变。有了这层拆分，AI 主体才可以完全不具备
上述任何字段而存在，参见 [AI 原生身份](/zh/concepts/ai-native-identity)。

::: warning 还没有完全拆干净
<Status kind="planned" /> 口令与 TOTP 仍然住在遗留的 `user` 表上，而不是收在一个
凭证对象后面。`HumanAccount` 这层拆分是真的，它背后的凭证收口还没做完。
见[项目状态](/zh/project/status)。
:::

### Credential：此刻能用什么证明这个主体

对 AI 主体而言，这是一张真实存在的独立表：`ai_actor_credential`，存
`public_key`、`algorithm`、`label`、`status`、`last_used_at`。SoulAuth 在那里
只存公钥，所以这张表就算被读走，也冒充不了谁。

**身份比它持有的任何一份凭证活得久。** 轮换密钥、丢失密钥、吊销密钥，
都不产生新的主体，所以旧密钥时期写下的审计行，解析出来仍然是同一个。

### IdentityBinding：外部哪个主体与它是同一个

`provider`、`provider_subject`、`binding_type`、`verification_state`、`revoked_at`。

绑定解析的是**对应关系**：「GitHub 用户 `4001` 就是这个主体」。它既不是凭证，
也不是一次认证。

::: details 为什么只按外部 subject 匹配是个真漏洞
`(provider, provider_subject)` 必须成对匹配。只按 subject 匹配的话，数字 id 为
`4001` 的 GitHub 账号会与 `sub` 为字符串 `"4001"` 的 Google 账号解析到同一个主体。
这是一次跨 provider 的账号接管，不需要任何利用代码，只需要标识符恰好撞上。
:::

### Client：是哪个应用在发起请求

已注册的 OIDC 客户端。客户端是协议里的一方，永远不是这次认证的主体。

## 身份的连续性

下面这些都不改变主体：改邮箱、改用户名、轮换密钥、开了 MFA 又关掉、
从不同客户端登录。

退役是唯一不可逆的一步：退役的主体永不被重新分配。一个身份可以停止认证；
它的标识符不会在之后被交给另一个人。退役之所以不删记录，原因也在这里：记录留着，
唯一索引才继续挡住复用。

::: warning 今天的 `sub` 到底对什么稳定
<Status kind="planned" /> OIDC 的 `sub` 目前带的是遗留 `user` 行的键，不是身份根。
因此它只在那一行的生命周期内稳定，弱于模型描述的「永不重新分配」。如果需要一个
能挺过账号重建的 subject 标识，`sub` 现在给不了你。这一条作为具名 caveat 记在
[规范注册表](/zh/security/standards-and-conformance)里。
:::

## Standalone 与 Soulseed

Standalone 是默认：SoulAuth 就是整个身份域，`identity_source` 为 `local`，
`canonical_actor_ref` 为空。

在 Soulseed 部署里，canonical actor 由 SoulseedAGI 定义，`canonical_actor_ref` 持有
指向它的引用。SoulAuth 认证那个主体，但既不能定义它，也不能修改它。这个引用属于
受控 Integration Claim，默认不暴露给第三方 OIDC 客户端。
[Soulseed 与 Mind OS →](/zh/spec/soulseed-and-mind-os)

## 接下来

| | |
|---|---|
| Agent 那条路径的全貌 | [AI 原生身份](/zh/concepts/ai-native-identity) |
| 认证成功**不**授予什么 | [身份与权限的边界](/zh/spec/identity-vs-authority) |
| 这些对象究竟为何存在 | [规范](/zh/spec/) |
