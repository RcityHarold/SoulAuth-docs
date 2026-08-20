# 在 Soulseed 生态里的位置

SoulAuth 是一个通用的 OpenID Connect 提供方，你完全可以用它而这辈子不再听到
「Soulseed」这个词。但它是作为某个特定系统的基础设施被造出来的，
这个出身解释了它最反常的一个设计决定：**SoulAuth 拒绝当授权服务器。**

这一页讲清 SoulAuth 站在哪、它被禁止做什么，
以及为什么即使你不跑这套栈的其余部分，这份克制也值得抄。

## 一段话讲完这套栈

**SoulSeed-AGI** 是认知内核。**SoulSeedOS** 是跑在它上面的操作系统，
按编号平面组织 —— P1 到 P4，每个平面拥有一类事实。
SoulAuth 既不属于内核，也不属于 OS。它是**以 provider 形式接入 SoulSeedOS
的基础设施组件**。

用主宰裁决（`P0-DECISION-09`）的原话说：

> SoulAuth 在 SoulseedOS V2 中归位为 **P3 Identity, Authority & Credential
> Plane** 的官方 **Identity / Authentication / Session / MFA / OIDC / SSO
> Provider**。

这份清单要仔细读。它很长，而其中每一个词说的都是
*确立某人是谁，并让这个确立持续有效*。清单里**没有**的那个词，是**授权**。

## 永久不等式

同一份裁决给出四条永久成立的不等式，它们是这条边界最锋利的概括：

```text
Auth-local RBAC Role        ≠  OS Canonical Role / Standing
Auth-local Permission       ≠  OS PermissionGrant
SoulAuth membership_level   ≠  OS Permission、≠ Mandate、≠ Standing
AuthSession                 ≠  OS Second Wing Session
                            ≠  ConnectorSession
                            ≠  Browser Runtime Session
```

SoulAuth *确实*有角色和权限 —— 它必须有，总得有东西决定谁能停用别人的账号、
谁能读审计日志。但这些对象管的是 **SoulAuth 自己的管理面，仅此而已**。
这就是为什么 SoulAuth 里每个权限名都带 `soulauth:` 前缀：

```text
soulauth:users.write
soulauth:security.write
soulauth:audit.read
```

前缀不是装饰。它是一条由 `DEC-10-05` 规定的命名空间断言，
让边界在每个调用点上都是可见的：一个以 `soulauth:` 开头的权限串，
无论流经多少个系统，都不可能被错认成 OS 级授权。

## 唯一合法通路

那么，当一个 SoulAuth 角色**确实应该**影响某人在 OS 里能做什么时呢？
只有一条路：

> 若 SoulAuth 的 role / permission / membership_level 需要影响 OS 能力或行动
> 资格，必须作为 **claim / entitlement material** 进入 OS Permission Service
> 或 Governance，由 OS 生成带 **Scope、Purpose、Validity** 的
> `PermissionGrant`、`AccessTicket` 或相应治理结果。

以及整条边界所依托的那句话：

> SoulAuth 的角色与权限进入 OS 时，其法位是**输入材料**，不是**授权结论**。

```
   SoulAuth                          SoulSeedOS
   ────────                          ──────────
   role: soulauth:users.write
   membership_level: pro       ──▶   AuthClaimMaterial
   已验证的身份                       (PORT-P3-019)
                                          │
                                          ▼
                                   Permission Service
                                   / Governance
                                          │
                                          ▼
                                   PermissionGrant
                                   AccessTicket
                                   ⟨Scope, Purpose, Validity⟩
```

跨过边界的是**材料**。*结论*在对岸做出，由为它负责的那个组件做出。

## SoulAuth 绝不能写的东西

上面那条的后果是一份硬性禁止清单。SoulAuth 不产出、也绝不能被改成产出：

- `permission_grant_v1` —— OS 的 canonical 权限记录
- `Mandate` —— 持续性的行动授权
- `Lease` —— 有时限的资源占用
- `GuardianDecision` —— 治理裁决
- `Receipt` —— 已发生动作的举证记录

`membership_level` 要单独说一句。它看起来像权限等级，也很容易被当成权限等级。
它不是：`P0-DECISION-09 §4.7` 把它归给 **Product Entitlement / Billing /
Marketplace**。它描述的是用户*付了什么钱*，不是用户*被允许做什么*。
两个不同的系统、两种不同的故障模式、两套不同的审计义务。

同理，租户与组织的 membership 也**不归** SoulAuth（`DEC-10-03`）——
它们属于 P2 Tenant Governance 与 Organization Governance。
SoulAuth 不持有 canonical membership。

## 接入契约

SoulSeedOS 消费 SoulAuth 时，线上契约由 `P0-DECISION-10` 定死：

| 事项 | 裁决 |
| --- | --- |
| **ID Token** | RS256，对着 JWKS **本地**验签。 |
| **寿命** | **≤ 300 秒**。推荐 300，高安全场景 120。 |
| **`sid` claim** | **必填**（`DEC-10-06`）—— 协同登出全靠它。 |
| **Refresh Token** | **OS 从不持有**。 |
| **吊销** | Phase 0 接受由短寿命带来的有界陈旧；introspection 是 Phase 1 的事。 |
| **AccessTicket 与 PermissionGrant** | 两个独立对象。前者是短期准入凭证，后者是持久的授权源事实。 |

从这张表里掉出来两个实际后果。

**适配器几乎不发网络请求。** OS 侧的 `soulseed-adapter-soulauth` 只取 JWKS
然后本地验签，仅此而已。身份校验不会把 SoulAuth 放到每个请求的关键路径上 ——
这意味着 SoulAuth 短暂不可用，降级的是新登录，不是整个系统。

**纯 SPA 接不进来。** 因为 OS 不持有 refresh token，就必须有别的东西持有它，
而那个东西必须是机密客户端。你需要一个 BFF。这不是 Soulseed 的特殊癖好 ——
它就是当前的 OAuth 安全最佳实践 —— 只不过在这里它是契约要求，而非建议。
见 [BFF 模式](/zh/integrate/bff)。

## 如果你根本不用 SoulSeedOS，这一页有什么用

把专有名词抹掉，剩下一条通用原则：

**认证和授权的故障形态不同，所以它们应当被分开拥有。**

认证的 bug 放错人进来。授权的 bug 让对的人做了错的事。两者的爆炸半径不同、
检测特征不同、该由谁复核也不同。当一个服务同时拥有两者，
你业务权限模型的每一次改动都变成对登录系统的改动，
而「谁授权了这件事」的审计轨迹会和「谁登录了」缠在一起。

多数身份产品会模糊这条线，因为模糊掉演示效果好。SoulAuth 守着它，
是因为它服务的那个系统，把「是什么授权了这个动作」当作**事后要经得起追究的证据**。

你当然可以拿 SoulAuth 的 RBAC 管你自己应用的权限，没人拦你。
只是 `soulauth:` 前缀会一直待在你的权限串里，提醒你越过了一条被刻意画下的线。

## 下一步

- [**SoulSeedOS 适配器**](/zh/integrate/soulseedos) —— 具体接线。
- [**验证 ID Token**](/zh/integrate/verifying-tokens) —— 本地验签逐步说明。
- [**安全模型**](./security-model) —— SoulAuth 在自己这侧防的是什么。
