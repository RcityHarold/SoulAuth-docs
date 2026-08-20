# SoulSeedOS 适配器

SoulSeedOS 如何消费 SoulAuth。先读
[在 Soulseed 生态里的位置](/zh/guide/soulseed-ecosystem) ——
这一页是接线，那一页是道理。

## 适配器是什么

`soulseed-adapter-soulauth` 是 **OS 侧**的一个 Rust crate。它刻意很小：
两个源文件、一个验证器、一个 JWKS 提供者。

```
soulseed-adapter-soulauth
├── lib.rs        SoulAuthVerifier、SoulAuthConfig、JwksProviderPort
└── jwks_http.rs  HttpJwksProvider —— 唯一碰网络的组件
```

它对 `jsonwebtoken` 的依赖被声明为**只用 decode 路径**，并附注了理由：
OS 从不签发令牌。这个限制是结构性的，不是约定俗成。

## 它做什么

1. 从 SoulAuth 取 JWKS（带节流，且只在遇到未知 `kid` 时取）。
2. 在本地验 RS256 签名。
3. 校验 `iss`、`aud`、`exp`。
4. 要求 `sid` 存在且非空。
5. 产出 claim material，交给 OS 去解释。

全部表面就这些。身份校验是一次本地计算，
所以 SoulAuth 不在 OS 每个请求的关键路径上。

## 配置

`SoulAuthConfig` 接受 issuer、client id 和一个时钟宽容度。构造器会校验：

```rust
SoulAuthConfig::new(issuer, client_id, leeway_seconds)?
```

::: tip leeway 有硬上限，在构造器里强制
一个可调且无上限的 leeway 等价于根本没有过期检查 —— 过期令牌照收。
这个上限写在唯一能构造出该配置的构造器里，
所以没法靠直接字面构造结构体来绕过。
:::

## `sid` 是生产门禁红线

适配器把 `sid` 建模成 `Option<String>`，然后**显式拒绝** `None` 那一支。

在 SoulAuth 已经保证不签发缺 `sid` 的 ID Token 的前提下，这看起来多余。
它不多余：「签发方承诺总会带上它」和「验证方要求必须有它」
是两个彼此独立的保证，而验证方的职责是在签发方换成另一个构建、
另一个版本、甚至根本不是 SoulAuth 时依然成立。

`DEC-10-06` 规定 `sid` 必填。协同登出依赖它。

## JWKS 刷新节流

未知 `kid` 触发刷新，刷新受最小间隔节流，且刷新次数对外可观测。
不做节流的话，一串携带伪造 `kid` 的令牌就成了针对 SoulAuth JWKS
端点的放大攻击。

## 适配器守住的边界

适配器把一个验过的 ID Token 转成 **claim material** —— 然后就停下。

```
SoulAuth ID Token  ──验签──▶  AuthClaimMaterial  ──▶  OS Permission Service
                              (PORT-P3-019)                    │
                                                               ▼
                                                        PermissionGrant
                                                    ⟨Scope, Purpose, Validity⟩
```

适配器从不产出 `permission_grant_v1`、`Mandate`、`Lease`、
`GuardianDecision` 或 `Receipt`。那些是 OS 从材料中得出的**结论**，
由为它们负责的组件做出。

另外两条相关边界：

- **`membership_level` 不是权限。** 它属于 Product Entitlement / Billing /
  Marketplace（`P0-DECISION-09 §4.7`）。它记录某人付了什么钱，
  不是某人可以做什么。
- **租户与组织 membership 不归 SoulAuth**（`DEC-10-03`）——
  它们在 P2 Tenant Governance 与 Organization Governance。

## 契约一览

| 事项 | 取值 | 出处 |
| --- | --- | --- |
| 签名算法 | RS256 | `DEC-10-01` |
| 验签方式 | 本地，对着 JWKS | `DEC-10-01` |
| ID Token 寿命 | ≤300 秒（默认 300，高安全 120） | `DEC-10-01` |
| OS 持有 refresh token | **从不** | `DEC-10-01` |
| `sid` | 必填 | `DEC-10-06` |
| 权限命名空间 | `soulauth:` 前缀 + 结构化打标 | `DEC-10-05` |
| AccessTicket 与 PermissionGrant | 两个独立对象 | `DEC-10-02` |

## 吊销，以及你正在接受的那点陈旧

Phase 0 没有 introspection 端点。吊销靠过期传播：
一个被停用账号的令牌会在 ID Token 寿命内失效，也就是 ≤300 秒的陈旧窗口。
introspection 是 Phase 1 的事。

这一点值得直说，因为它是系统的一条真实性质，而不是一个留待日后被发现的缺口。
在 SoulAuth 这一侧，停用是**立即**生效的 —— 会话被删、OIDC 令牌被吊销、
鉴权缓存被失效。那个有界窗口只针对已经在消费方手里的令牌。

## 因为 OS 不持有 refresh token，所以你需要 BFF

OS 自己无法续期。必须有东西持有 refresh token 并维持会话，
而那个东西必须是机密客户端。见 [BFF 模式](./bff)。

## 下一步

- [**在 Soulseed 生态里的位置**](/zh/guide/soulseed-ecosystem) —— 道理。
- [**验证 ID Token**](./verifying-tokens) —— 非 Rust 消费方怎么做。
- [**BFF 模式**](./bff)
