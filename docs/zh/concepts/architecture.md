# 架构

一个 Rust 二进制加一个数据库。下面这几层在源码目录里是分开的，层与层之间的
边界由测试断言，不靠自觉。

## 整体形状

<Figure3 locale="zh" />

这张图画的是**逻辑职责**，既不是调用时序，也不是部署图。图中的一切目前都运行在
同一个进程内。

## 每一部分拒绝做什么

### 协议边缘层

`src/routes/`。OIDC 端点、客户端 API、管理 API 的 HTTP handler，负责把 wire 格式
转成领域调用再转回去。

认证判定不在这一层。handler 里不该出现 `if user.status == Active` 这样的判断，
那属于 `src/services/`。写在 handler 里的规则只对这一条路由生效，
第二条路由漏掉它的时候，没有任何测试会发现。

### 身份域层

`src/models/`。`ActorIdentity` 以及围绕它的其余对象，
参见 [Actor 身份模型](/zh/concepts/actor-identity-model)。

这里不校验任何凭证。「查出这个主体是谁」和「判断调用方是不是他」是两件事，
查询这一侧没有任何代码路径能返回「已认证」。否则任何一个读取主体的端点，
都能被当成登录来用。

### 认证核心层

口令校验、TOTP、AI 主体的挑战—应答、联邦回调、账号锁定。

这里不授予任何权限。返回值说的是「这是哪个主体」，不带权限集合、不带角色。
之后的判断由你的应用自己做。
参见[身份与权限的边界](/zh/spec/identity-vs-authority)。

### 会话与令牌层

会话签发与吊销；OIDC 授权码、访问令牌、带轮换与复用检测的刷新令牌。

会话状态是**派生的，不是存储的**：没有 `status` 列。active 与 expired 都从
`expires_at` 算出来；revoked 用删记录表示。API 对一次会话的任何陈述都是读时算出来的，
没有第二份状态需要跟着同步。

## 代码守住的边界

下面每一条都写出了守住它的那个测试，点开可以看到断言本身。

| 边界 | 守卫 |
|---|---|
| 任何明文 bearer 凭证都不落库。会话、访问令牌、刷新令牌、授权码、口令重置与邮箱验证令牌，全部以 SHA-256 指纹持久化 | <Status kind="tested" guard="conformance::b4b" /> |
| 全 API 只有一种错误形状：稳定机器码加人话，绝不出现空体的裸状态码 | <Status kind="tested" guard="conformance::j6" /> |
| AI 主体路径完全不碰人类账户结构 | <Status kind="tested" guard="conformance::a6" /> |
| 已发布契约里的每个端点、配置项、权限名都在运行代码中存在；反过来，运行代码里也没有契约遗漏的 | <Status kind="tested" guard="conformance::j4" /> |
| 服务无法修改自己的表结构 | schema 导入是运维步骤 |

最后一条没有对应测试，因为没有可断言的对象：SoulAuth 根本不发出 DDL。两个 SQL
文件由部署者导入，服务运行时用的那个数据库账号不需要改表结构的权限。

## 持久化

SurrealDB，一对 namespace 与 database，一同配置。图中的逻辑存储（身份、凭证、
会话、审计）是职责划分，并非各自独立的数据库。

::: warning namespace/database 这一对是个真实的失败模式
把 schema 导进与进程连接时不同的一对，服务照常启动、`/health` 照常返回 `ok`，
直到第一次写入才失败。这个坑开发期踩过，所以 `tests/deployment_walkthrough.sh`
会把部署页真的执行一遍，而不是留着让人读。
:::

## 跑多个实例

就认证而言，SoulAuth 是无状态的：各实例共享数据库，彼此之间不通信。

<Status kind="planned" /> **吊销在副本之间不是瞬时的。** 每个实例会缓存已解析的会话。
登出、改密、停用在处理它的那个实例上立刻生效；其它实例在
`AUTH_SESSION_CACHE_TTL_SECONDS` 之内观察到。限流与锁定计数器**是**共享的，
因为它们住在数据库里。

这段延迟写在明处而不是藏起来。另一种做法是声称全局即时传播，而那种承诺
往往只在事故当中才被发现是假的。

## 架构描述了但本 Release 没有的

<Status kind="planned" /> 物化的 `AuthenticationResult` 类型 · 收口的凭证对象 ·
正式的 assurance 分级 · 建立在 `ActorIdentity` 上的 RBAC · 防篡改的审计链。

完整清单，连同「什么还不成立、为什么」，在[一致性读数](/zh/project/status)里。

## 接下来

| | |
|---|---|
| 那些对象 | [Actor 身份模型](/zh/concepts/actor-identity-model) |
| 怎么部署 | [部署](/zh/operate/deployment) |
| 这些边界为何存在 | [规范](/zh/spec/) |
