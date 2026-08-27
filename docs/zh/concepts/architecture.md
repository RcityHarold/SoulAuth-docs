# 架构

一个 Rust 二进制、一个数据库，以及一组**被强制执行**而不是被建议的边界。

## 形状

<Figure3 locale="zh" />

这张图画的是**逻辑职责**。它不是调用时序，也不是部署图——今天图里的一切都跑在
同一个进程里。

## 每一部分拒绝做什么

一套架构里有意思的往往是那些限制，所以：

### 协议边缘

OIDC 端点、客户端 API、管理 API 的 HTTP handler。它把 wire 格式转成领域调用再转回去。

它不做认证判定。一个 handler 如果自己判断「这看着没问题」，就等于把一条认证规则
放在了没有任何测试会去看的地方。

### 身份域

`ActorIdentity` 与围绕它的那些对象——[模型在这里](/zh/concepts/actor-identity-model)。

它不校验凭证。解析「一个主体是谁」与验证「我是他这句话此刻是否成立」是**两个问题**；
回答第一个的对象必须没有能力回答第二个，否则每一条读路径都成了潜在的认证绕过。

### 认证核心

口令校验、TOTP、AI 主体的挑战—应答、联邦回调、账号锁定。

它不授予权限。出来的是一句关于身份的陈述，仅此而已——
[身份与权限的边界](/zh/spec/identity-vs-authority)。

### 会话与令牌

会话签发与吊销；OIDC 授权码、访问令牌、带轮换与复用检测的刷新令牌。

会话状态是**派生的，不是存储的**：没有 `status` 列。active 与 expired 都从
`expires_at` 算出来；revoked 用删记录表示。API 对一次会话的任何陈述都是读时计算的，
所以不存在第二个会漂移的事实源。

## 代码守住的边界

它们被强制执行，不是理想。每条都写出守住它的那个测试。

| 边界 | 守卫 |
|---|---|
| 任何明文 bearer 凭证都不落库——会话、访问令牌、刷新令牌、授权码、口令重置与邮箱验证令牌，全部以 SHA-256 指纹持久化 | <Status kind="tested" guard="conformance::b4b" /> |
| 全 API 只有一种错误形状：稳定机器码加人话，绝不出现空体的裸状态码 | <Status kind="tested" guard="conformance::j6" /> |
| AI 主体路径完全不碰人类账户结构 | <Status kind="tested" guard="conformance::a6" /> |
| 已发布契约里的每个端点、配置项、权限名都在运行代码里存在——反过来运行代码里也没有契约漏掉的 | <Status kind="tested" guard="conformance::j4" /> |
| 服务无法修改自己的表结构 | schema 导入是运维步骤 |

最后一条没有测试，因为它是结构性的：SoulAuth 不发出任何 DDL。两个 SQL 文件由部署者
导入。一个认证服务持有改写自身表结构的权限，是本项目不越过的边界。

## 持久化

SurrealDB，一对 namespace 与 database，一起配置。图里的逻辑存储——身份、凭证、
会话、审计——是职责划分，不是独立的数据库。

::: warning namespace/database 这一对是个真实的失败模式
把 schema 导进与进程连接时不同的一对，服务照常启动、`/health` 照常返回 `ok`，
直到第一次写入才失败。这就是部署路径为什么配了一个可执行的 walkthrough，
而不只是散文。
:::

## 跑多个实例

就认证而言是无状态的：实例共享数据库，彼此不通信。

<Status kind="planned" /> **吊销在副本之间不是瞬时的。** 每个实例会缓存已解析的会话。
登出、改密、停用在处理它的那个实例上立刻生效；其它实例在
`AUTH_SESSION_CACHE_TTL_SECONDS` 之内观察到。限流与锁定计数器**是**共享的，
因为它们住在数据库里。

这段延迟被明说而不是藏起来，因为另一种做法——声称全局即时传播——正是那种
只会在事故当中才被发现是假的承诺。

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
