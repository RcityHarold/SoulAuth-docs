# Actor 身份模型

身份模型由五个对象组成。它们之所以保持分离，是因为任意两个一旦合并，就会毁掉某个性质；而那个性质，后来一定有人依赖。

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

**`subject_key` 由系统生成，而不是派生而来。** 从邮箱地址派生 subject，
是身份系统把自己逼进死角最常见的一种方式：地址一旦变更，要么 subject 跟着变，
毁掉所有历史记录；要么保持不变，那么这个「派生」从一开始就是假的。

**只有 `active` 状态能够认证**，并且无法识别的状态值一律按 suspended 处理，
而不是按 active 处理。状态列中的一个拼写错误应当挡住认证，而不是悄悄放行。

::: tip Resource ID ≠ subject
`ActorIdentity` 既有 record ID，**也有** `subject_key`。它们是两个命名空间。
实现上可以取同一个值，那是一种选择，不是等价关系，任何 API 契约都不该假定它。
:::

## 围绕身份根的对象

<Figure2 locale="zh" />

### HumanAccount：人如何管理自己的登录

`email`、`username`、`username_normalized`、`email_verified`。

修改邮箱改动的是这一行，主体本身不变。正是这层拆分，使得 AI 主体可以完全不具备
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

需要守住的性质是：**身份的存续时间长于它持有的任何一份凭证。**
轮换密钥、丢失密钥、吊销密钥，都不产生新的主体。

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

## 合并任意两个，会失去什么

整套模型的论证，压缩成一张表：

| 如果把…合并 | 你失去 |
|---|---|
| 身份并进账户 | 非人主体不必伪造人类属性也能存在 |
| 身份并进凭证 | 跨密钥轮换的稳定归因 |
| 凭证并进绑定 | 「同一个人、换了 IdP」与「秘密被复制」的区别 |
| 档案并进身份 | 不可变性。改一次显示名就等于改了身份 |
| 客户端并进主体 | 限定任一集成能看到多少 |

## 身份的连续性

周围的一切都在变动时，主体仍然是同一个主体：邮箱变更、用户名变更、密钥轮换、
MFA 启用又关闭、经由不同客户端登录。这些都不构成身份变更。

唯一**不可逆**的方向是：退役的主体永不被重新分配。一个身份可以停止认证；
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
