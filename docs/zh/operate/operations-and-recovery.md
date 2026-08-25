# 运维与恢复

## 运行、维护并恢复 SoulAuth 的 Trust

[生产环境检查表](./production-checklist) 回答：这个明确的 Release、Artifact、
Configuration、Topology 和 Feature Set，是否已经具备承载 Production Identity Traffic
的条件？本篇继续回答：

> **上线以后，怎样长期维持这份已经建立的 Trust？**

以及：

> **当 Persistence、Credential、Key、Configuration、IdentityBinding、Runtime 或其它
> Trust Boundary 已经受损时，怎样恢复，而不偷偷改写谁是谁、什么已经失效、以及什么
> 曾经发生过？**

必须首先保持：

```text
Service Recovery
≠
Trust Recovery
```

一个 Process 重新启动（`process running`、`readiness healthy`）只说明 Runtime 重新
具备了某种运行条件。它不能单独证明 ActorIdentity continuity 正确、已撤销 state 没有
复活、IdentityBinding 仍然可信、key / secret trust 已经恢复、downstream consumer
已经接受新的 trust state、Historical Accountability 仍然可解释。

因此，SoulAuth Recovery 真正恢复的是：

> **可解释的 Current Identity / Authentication State，以及连续、诚实的 Historical
> Accountability。**

## 1 · Day-2 Operating Model

Operations 不是系统坏掉以后才开始。一个已经通过 Production Gate 的 Deployment 仍然
持续变化：Configuration 会变化；key / secret 进入新的 lifecycle 阶段；certificate
会过期；backup 不断产生；runtime 会被替换；release 会升级；external dependency 会
退化；security incident 会发生。

```text
Observe
        ↓
Maintain
        ↓
Change
        ↓
Verify
        ↓
Recover when required
        ↓
Revalidate
```

这不是一次性流程，它是 **Production Trust 的持续维护循环**。

## 2 · Containment 优先于 Availability Recovery

当一个故障可能已经破坏 Trust 时，第一目标不是让服务尽快恢复流量，而是**先阻止已经
失去可信性的 Boundary 继续产生新的影响**：

```text
Detect
        ↓
Contain
        ↓
Identify affected trust boundary
        ↓
Recover / revoke / reconcile
        ↓
Verify
        ↓
Revalidate production gates
        ↓
Reopen traffic
```

尤其：如果某个 trust material 可能已经 Compromised，不能为了 Availability 继续使用它
直到"新服务准备好"。必须先判断哪些事实还能被信任。

## 3 · Identity Continuity 不等于 Identity Immutability

Incident 通常不应该通过以下方式解决 Credential、Session、Key 或 Runtime 问题：

```text
delete ActorIdentity → create another ActorIdentity
```

Credential compromise 通常处理 Credential；AuthSession compromise 通常处理 Session；
Client authentication material compromise 通常处理 Client。它们不应该自动变成
ActorIdentity replacement。

```text
Identity Continuity
≠
Identity Immutability
```

保持同一个 ActorIdentity，不意味着永久保留每一个旧 Credential、IdentityBinding、
Lifecycle State 或 Security State。真正错误的关系仍然必须按照对应 Canonical Contract
revoke、correct 或 reconcile。

## 4 · Recovery 不应按照 Database Record 机械执行

Recovery 不能只问"这个数据库对象是什么"，因为同一个 Record 可能同时承载 identity
continuity fact、current lifecycle fact、security-sensitive state、bounded protocol
state。

```text
Database Object Type
≠
Recovery Treatment
```

真正应该问的是：**这个 semantic fact 在 Recovery 以后应该保持、reconcile、
invalidate，还是重新建立？**

## 5 · Recovery 需要回答四个问题

**哪些事实必须保持 Identity Continuity？** 当前恢复是否仍然代表同一个
ActorIdentity？适用的 identifier non-reuse semantics 是否仍然成立？Infrastructure
replacement 不应仅因为 physical deployment 改变，就把原 ActorIdentity 变成一个新的
ActorIdentity。

**哪些 Current Lifecycle / Security Facts 必须 Reconcile？** 一个 historical
snapshot 中的 `active` 并不能证明 Recovery 时它仍然应该 active：

```text
Historical State
≠
Automatically Current State
```

当前 Lifecycle / Security Fact 必须根据 incident timeline、later security events、
current domain contract 重新判断。

**哪些 One-time / Ephemeral Facts 不得复活？** 已经 consumed、expired、revoked 或
otherwise invalidated 的 bounded protocol / security state，不能因为 restore 旧
snapshot 重新成为可用状态：

```text
Historical Restore
≠
Permission to Resurrect Expired / Revoked / Consumed State
```

**哪些 Historical Facts 必须保持可解释？** Audit / historical accountability 的
Recovery 目标不是"所有 bytes 又出现了"，而是**系统仍然能够解释哪些历史有 Evidence、
哪里存在 Gap、Recovery 本身发生了什么**。如果某段历史已经无法证明，这个 Gap 本身
必须保持可见。

## 6 · Recovery Treatment at a glance

| Semantic Fact | Recovery Intent |
| --- | --- |
| **ActorIdentity continuity** | 保持同一 ActorIdentity，不因 Infrastructure 重建而重新创造 |
| **Current lifecycle / security state** | restore 后根据 later facts 与 Current Contract 重新 reconcile |
| **One-time / bounded state** | 已失效的 state 不能通过 historical restore 静默复活 |
| **Historical accountability** | 保持 Attribution 与 Evidence，可见地表达任何 Gap 或 Recovery Boundary |

这张表描述 Recovery 语义，它不是新的 machine-readable Recovery Type Registry。

## 7 · Database Restore 不等于 SoulAuth Recovery

完整 Recovery 不只依赖 Persistence，它还必须位于一个可解释的运行 Context 中：

```text
Recovered Durable State
+ Compatible Release
+ Compatible Configuration
+ Required Key / Secret Material
+ Applicable Schema / Storage Contract
+ Applicable Protocol Trust Context
+ Network / Deployment Boundary
```

```text
Database Restore           ≠  SoulAuth Recovery
Infrastructure Replacement ≠  Issuer Migration
```

把 database 恢复到另一台 machine，不意味着 ActorIdentity 应该变化 —— 除非 Operator
明确执行的就是一场 Trust Migration。

## 8 · Backup 应从 Recovery Requirement 反推

正确顺序是：

```text
Recovery Requirements
        ↓
Semantic Facts that must survive
        ↓
Required Consistency Boundary
        ↓
Backup Scope
        ↓
Key / Secret Dependencies
        ↓
Retention
        ↓
Restore Verification
```

而不是：

```text
database dump exists → system is recoverable
```

Backup 设计应该回答：**Recovery 最终需要恢复什么 Trust，而不是"我们手头能 dump
什么"。**

## 9 · Backup Set 必须拥有可解释的 Consistency Boundary

不同 state 可能来自不同 runtime / persistence scope，它们的 recovery point 不一定
完全相同。这不意味着 SoulAuth 必须使用一个 global transaction 覆盖所有 state，但
Recovery 必须能够解释：**这份 Backup Set 里的不同 facts 分别对应哪个 recovery
boundary，以及它们之间的不一致如何处理。**

```text
Backup Consistency
≠
One Global Database Transaction
```

## 10 · Backup Availability 不等于 Backup Integrity

```text
Backup Availability
≠
Backup Integrity
```

Restore 以前至少需要确认 backup 完整性、source、intended recovery point、release /
schema compatibility、applicable protection。一个损坏、来源不明或不兼容的 Backup，
不能因为"是最近的一份"就自动进入 Production Trust Domain。

## 11 · Valid Backup 不等于 Trusted Recovery Point

这是 Incident Recovery 中最关键的区别之一：

```text
Valid Backup
≠
Trusted Recovery Point
```

一个 Backup 可以完整、未损坏、schema compatible，但它可能已经包含 malicious Client
state、wrong IdentityBinding、compromised Credential、unauthorized administrative
mutation。

所以选择 Recovery Point 时必须结合 **Incident Timeline**，真正要问：

> **这个 Recovery Point 位于我们仍然信任的历史边界之内吗？**

## 12 · Backup Possession 不等于 Key / Secret Authority

恢复受保护 state 可能同时需要 backup data、required key / secret material、
compatible release、compatible configuration。但：

```text
Backup Possession
≠
Unrestricted Key / Secret Authority
```

Backup 与 Key / Secret Material 应该拥有**明确、独立的访问保护边界**。在恢复一个
受保护 state 以前，必须确认 Recovery 所需的 trust material 可以按照 Current Contract
安全获得。

## 13 · Canonical Recovery Sequence

Restore 不应该是 `restore snapshot → start process → open traffic`。更准确的高层
Recovery Sequence 是：

1. **Contain** —— 冻结或限制受影响的 environment，阻止不可信状态继续扩大。
2. **Establish Incident Timeline** —— 哪条 Boundary 受影响？从什么时候开始可能不
   可信？
3. **Select a Trusted Recovery Point** —— 选择仍然可以信任的 historical boundary。
4. **Establish Compatible Recovery Context** —— release、configuration、schema、
   required trust material、applicable protocol / deployment context。
5. **Restore Required Durable Facts** —— 恢复真正需要进入 recovery scope 的 state。
6. **Reconcile Current Trust** —— 重新判断 ActorIdentity、IdentityBinding、
   Credential、lifecycle、current security state 中受本 Incident 影响的事实。
7. **Invalidate Unsafe Historical State** —— 确保不该复活的 expired / revoked /
   consumed / distrusted state 没有回来。
8. **Validate and Re-run Production Gates** —— 执行 positive / negative validation，
   并重新验证受影响的 Production Gates。

只有完成以后，才重新开放相应 Production Traffic。

## 14 · Snapshot State 不等于 Current Trusted State

假设 Recovery Point 来自 30 分钟前。这 30 分钟里可能已经发生 Credential revoke、
Actor suspend、AuthSession change、Client mutation、IdentityBinding revoke、Security
Policy change 或其它 security-sensitive operation。Historical Snapshot 不知道这些后来
发生的事实：

```text
Snapshot State
≠
Current Trusted State
```

Restore 以后，受影响 state 必须根据 Incident Timeline 决定：

```text
remain valid   revalidate   invalidate   reconstruct
```

不能只因为 backup 中写着 active，就自动恢复成 active。

## 15 · Containment 可以扩大，但必须是明确 Incident Decision

如果 Current Trusted State 无法安全重建，Operator 可以选择比最小范围更保守的
Containment：扩大 session invalidation scope、暂停某个 client、暂停某个 actor、
distrust 某个 trust material。

但**扩大 Blast Radius 必须是明确的 Incident Decision**，不能成为所有 Recovery 默认
"全部撤销"的隐藏规则，尤其不能越过
[认证与会话](../reference/authentication-and-sessions) 与
[OIDC 与 Client](../reference/oidc-and-clients) 真正定义的 Artifact Freshness /
Revocation Contract。

## 16 · Restored IdentityBinding 不自动等于 Current Binding

```text
Restored IdentityBinding
≠
Current IdentityBinding by definition
```

一个 SoulAuth Backup 恢复了某条 Binding，只能证明这个 relation 曾经存在于该 Recovery
Point。它不能证明 External Identity Source 今天仍然承认同样关系、Soulseed Canonical
Actor 当前仍然与之对应、后来没有发生 revoke / rebind。所以受影响的 IdentityBinding
必须按照 Current Binding Contract 重新判断。

而且 Recovery 不能通过 email、display name、client identifier 等进行 best-effort
identity matching。

## 17 · Preserve Identity Continuity 不等于 Preserve Every Old State

如果确认恢复的仍然是同一个 ActorIdentity，Recovery 不能仅仅因为 Infrastructure 变化
而创建新的 ActorIdentity。但：

```text
Preserve ActorIdentity Continuity
≠
Preserve Every Historical State
```

错误的 IdentityBinding、lifecycle state、Credential state、security state 仍然应该被
修正。这是 `Identity Continuity ≠ Identity Immutability` 在 Recovery 阶段最重要的
实际含义。

## 18 · Audit Recovery 不允许伪造连续历史

如果 Audit capability 发生降级、丢失或 Recovery，不能事后制造一段"看起来从未中断"的
history：

```text
Audit Reconciliation
≠
Retroactive Fabrication of Uninterrupted History
```

如果某个 interval 无法被可靠证明，Gap 本身必须保持可见。Recovery 应该记录：当前能够
证明到哪里；哪一段存在 Known Gap；Recovery 本身什么时候发生；哪些 Out-of-band
Evidence 存在。

如果 Current Release 还正式支持某种 cryptographic Audit Integrity Profile，再根据那个
Profile 额外验证对应 Integrity Boundary。[认证防护](../security/authentication-protection)
与 [审计](../reference/audit) 没有声明的 chain、checkpoint、segment 机制，本篇不自行
创造。

## 19 · Trust-material Operations：Rotation、Loss 与 Compromise 分开

```text
Rotation  ≠  Loss  ≠  Compromise
```

这三种情况不能共用一个 Runbook。

**Planned Rotation** 表示当前 Trust Material 仍然处于受控状态，我们有计划地把系统
迁移到新的 material：

```text
introduce new material
        ↓
move new use to it
        ↓
retain old verification / read capability only where the contract requires
        ↓
retire old material
        ↓
verify continuity
```

注意：不是所有 Key / Secret 都必须支持 overlap，Exact lifecycle 由对应 Security /
Protocol Contract 定义。

**Loss** 表示 Authorized Operator 无法获得所需 material，但没有证据证明 attacker
已经获得。主要问题是：哪些能力丢失？哪些受保护 state 还能解释？是否能重新建立当前
Trust？它和 Compromise 完全不同。

**Compromise** 表示 attacker 可能已经获得或控制某项 trust material：

```text
contain
        ↓
stop / restrict affected trust
        ↓
introduce new trusted state
        ↓
reassess affected artifacts / state
        ↓
propagate trust change where required
        ↓
verify compromised trust is rejected
```

```text
Normal Rotation Overlap
≠
Compromised-material Trust Continuation
```

Routine Rotation 中合法的旧 material overlap，不能机械复制到 Compromise Response。

## 20 · Server-side Trust Change 不等于 Downstream Trust 已更新

```text
SoulAuth Trust Material Changed
≠
Downstream Trust Updated
```

SoulAuth 内部已经完成 rotation，不表示 Client、Resource Server 或其它 Consumer 已经
获得新的 Trust View。因此某些 Incident 只有在受影响 Consumer 也正确看到新的 declared
trust state 以后，才真正完成。

## 21 · 不同 Trust Material 拥有不同 Blast Radius

不同 security function 使用的 material，不能因为都叫"key"或"secret"就被当成同一种
东西：

```text
Transport Trust Material    ≠  Protocol Signing Material
TLS Certificate Rotation    ≠  Protocol Signing-key Rotation
Cryptographic Key Lifecycle ≠  Operational Secret Lifecycle
```

一个 material Compromise 影响多大，必须根据真正依赖它的 Security Property 判断，
不能自动推导"一个 key 出事 → 整个 Identity System 全部失效"。

## 22 · Credential、Session、Client 与 Actor 拥有不同 Containment Scope

Incident Response 不能把所有问题都扩大成 Actor lifecycle termination：

```text
Credential Revocation  ≠  Actor Retirement
AuthSession Revocation ≠  Actor Retirement
Client Containment     ≠  Actor Retirement
Actor Suspension       ≠  Actor Retirement
```

## 23 · Revocation Effect 不等于 Revocation Freshness

一个 revocation action 发生以后，SoulAuth current server-side state 可以立即改变。
但：

```text
Revocation Effect
≠
Universal Immediate Downstream Invalidation
```

downstream Consumer 什么时候观察到变化，取决于 Artifact representation、validation
strategy、lifetime、online / offline validation、Resource Contract、declared freshness
semantics。因此：

```text
Credential Revocation   ≠  Universal Immediate Access-token Revocation
AuthSession Revocation  ≠  Universal Immediate Access-token Revocation
Actor Suspension        ≠  Universal Immediate Access-token Invalidation
```

本篇可以告诉 Operator **哪一个 upstream state 已经改变**，但不能超过 Token /
Protocol Contract 承诺所有 Downstream Artifact 什么时候停止被接受。

## 24 · Configuration Drift 是 Day-2 Operation

Production Configuration 会随着时间发生变化。Operations 必须能够识别：当前 Runtime
Configuration 是否仍然位于最近一次 approved Production Sign-off Scope 中。

```text
Approved Production Configuration
        ↓
Change over time
        ↓
Potential Drift
```

发现 Drift 以后：`detect → review → correct or approve → revalidate affected gates`。

本篇不要求 GitOps、IaC 或 Configuration Revision 一定存在，只要求 **Production
Operations 能够知道当前 Configuration 是否仍然是被批准的 Configuration。**

## 25 · Configuration Applied Successfully 不等于 Production Trust 仍然有效

一个 Config change 被 parser 接受、runtime 重新加载、process 仍然 healthy，都不能
单独证明 Production Trust 没有改变：

```text
Configuration Applied Successfully
≠
Production Trust Still Valid
```

受控 change 至少需要：

```text
prepare → validate → apply → verify runtime health
→ verify affected protocol / security behavior → observe
→ re-run affected Production Gates
```

Exact configuration lifecycle 继续由 [配置](../reference/configuration) 定义。

## 26 · Issuer Migration 不等于 Hostname Rename

如果 Current Protocol Profile 使用 Issuer：

```text
Issuer Migration
≠
Hostname Rename
```

Issuer Change 可能影响 downstream trust、protocol metadata、subject semantics、token
validation、client / resource configuration，因此不能按照普通 network rename 处理，
它必须进入 **explicit Trust Migration**。Exact Protocol Semantics 继续由
[OIDC 与 Client](../reference/oidc-and-clients) 定义。

## 27 · Upgrade 前先确认 Compatibility

升级不是 `replace binary → hope it works`。高层流程应该是：

```text
read current release compatibility
        ↓
verify backup / recovery readiness
        ↓
establish migration ownership
        ↓
apply required migration
        ↓
upgrade runtime
        ↓
verify readiness
        ↓
verify protocol / security behavior
        ↓
re-run affected Production Gates
```

具体 migration command、schema tool 或 deployment mechanism 由 Current Release
Runbook 定义。本篇只冻结：**Upgrade 必须受 Compatibility Contract 约束。**

## 28 · Replicated Deployment 不等于 Mixed-version Compatibility

```text
Replicated Deployment
≠
Mixed-version Compatibility
```

Current Release 支持 multi-replica，不代表 old / new runtime 可以同时在同一个
Production Trust Domain 中服务。只有 Release Compatibility Contract 明确允许，才能
进行对应 Rolling Upgrade。

## 29 · Schema Mutation 必须拥有明确 Ownership

如果 Upgrade 需要修改 Persistence Schema 或其它 shared state，不能默认每个 Replica
在 startup 时都可以独立进行 mutation：

```text
Schema Mutation requires explicit ownership / coordination
```

本篇不规定 migration job、leader 或 operator command 究竟使用哪一种方式，只要求
**它必须是声明的 Release Contract，而不是各 Replica 自行猜测。**

## 30 · Rollback 不等于 Recovery

```text
Binary Rollback            ≠  State Rollback
State Rollback             ≠  Safe Trust Recovery
Restore Old Configuration  ≠  Restore Old Trust Safely
```

因为 External Reality 可能已经变化：key 已经 rotated 或 compromised；issuer 已经
迁移；IdentityBinding 已经 revoke；client configuration 已经变化；security policy
已经变化。所以：

> **代码能回到昨天，不意味着 Trust 也能回到昨天。**

## 31 · Replica Failover 不等于 Historical Restore

Routine Failover（`Replica A unavailable → Replica B continues`）的目标是延续
current state；Historical Restore（`current state lost → older recovery point
restored`）意味着系统 state 回到了过去：

```text
Replica Failover
≠
Historical State Restore
```

后者需要完整的 trust reconciliation。

## 32 · Graceful Drain 不等于 Protocol Correctness

Replica maintenance 可以采用 `remove / drain → settle bounded in-flight work →
operate → verify readiness → rejoin traffic`。但：

```text
Graceful Drain
≠
Protocol Correctness
```

Traffic management 只解决请求往哪里走，它不能证明 cross-replica AuthSession、
one-time state、token / protocol continuity 真的正确 —— Exact behavior 继续由
Current Runtime / Protocol Contract 证明。

## 33 · 无法建立 Security-critical Fact 时不能 Implicit Allow

如果 Persistence、key / secret material 或其它 security-critical dependency 发生
故障，受影响的 Operation 不能把 Unknown State 解释成"那就允许"：

```text
Unable to Establish Required Security Fact
≠
Implicit Allow
```

但这不代表一个 Persistence Failure 会让世界上所有此前合法签发的 Artifact 同时失效。
已经签发 Artifact 的 Downstream Acceptance 继续服从自己的 validation / freshness
contract。

## 34 · Required Trust Material 不可用时，不要临时创造新 Trust

如果一个 Operation 需要某个 key / secret material，但 Runtime 无法获得，不应该为了
恢复 Availability 临时随机生成另一套 material 继续运行 —— 否则会创造一个新的、不受控
的 Trust Domain。正确行为取决于 material purpose、current operation、existing trusted
local state、recovery policy。因此：

> **Availability pressure 不能成为创造临时 Trust 的理由。**

## 35 · Unsafe Time 会破坏 Time-bound Security Semantics

如果 system time 进入无法信任的状态，依赖时间的 Security Decision 也可能无法继续
可信成立。应根据 Current Contract：

```text
detect unsafe time
→ restrict affected operation / runtime
→ restore trusted time
→ revalidate time-bound behavior
→ return to service
```

本篇不定义具体 clock technology 或 skew threshold，这些由相应 Protocol / Security
Contract 定义。

## 36 · Feature Dependency Failure 不自动等于 Whole-service Failure

如果 Current Release 支持 Feature Isolation：

```text
Feature-specific Dependency Failure
≠
Whole Identity Service Failure
```

例如某个 optional provider 失败，应首先影响真正依赖该 provider 的 feature，而不应该
无条件使所有完全独立的 Authentication Path 都停止。但**是否能够隔离失败**本身必须由
Current Release / Runtime Contract 支持。

## 37 · Restore Verification 是周期性 Operation

Production 第一次上线前做过一次 Restore Test，不意味着未来永远可恢复。因此：

> **Restore Verification 应该作为周期性 Day-2 Operation 继续执行。**

频率由 RPO / RTO、organizational risk、change rate、Operations Policy 决定。

## 38 · Emergency Administrative Path（if one exists）

本篇不要求每个 SoulAuth Production Deployment 必须创建 Break-glass 能力。如果
Current Release 或组织部署确实存在正式 Emergency Administrative Path，它必须继续服从
Canonical Identity / Authority Boundary：

```text
Emergency Access  ≠  Permanent Alternate Admin Path
Emergency Access  ≠  Identity Semantics Bypass
```

Emergency Path 不能成为 identifier reuse、arbitrary IdentityBinding fabrication、
silent audit deletion、unsupported direct identity-state rewrite 的许可证。应优先
使用 supported administration、backup / restore、release migration、declared
maintenance contract。Ad-hoc Persistence Mutation 不应该成为普通 Recovery
Technique。

## 39 · Audit Degradation 必须保持 Gap 可见

如果 Audit capability 暂时不可用，Recovery 以后不能假装这段 History 一直完整：

```text
Audit Reconciliation
≠
Retroactive Fabrication
```

Operations 至少应该确保：degradation 被识别；out-of-band incident evidence 在必要时
被保留；audit capability 恢复；known gap 保持可见；recovery event 本身被记录。无法
证明的历史不能通过后写 Event 被"修复成从未断过"。

## 40 · Recovery Validation = Positive + Negative

Recovery 真正不同于普通 Readiness Check 的地方是：

> **不仅验证应该工作的东西重新工作，还必须验证不该复活的东西仍然没有复活。**

### Positive Validation

- [ ] Runtime 满足当前 health / readiness requirement。
- [ ] Recovery Context 与目标 Production state 一致。
- [ ] required durable state 内部一致。
- [ ] required key / secret references 仍然可解释。
- [ ] ActorIdentity continuity 保持成立。
- [ ] 受影响 IdentityBinding 已经 reconcile。
- [ ] Current lifecycle / security state 满足对应 Contract。
- [ ] Applicable production protocol smoke tests 通过。
- [ ] representative downstream consumers 接受 intended trust state。
- [ ] Historical Accountability 仍然可解释。
- [ ] Recovery Operation 本身已经留下 required evidence。

### Negative Validation

- [ ] 应继续 revoked 的 Credential 仍不能建立新的 Authentication。
- [ ] 应继续 invalid 的 AuthSession 仍然 invalid。
- [ ] 已经 expired / consumed 的 one-time state 没有因为 Restore 复活。
- [ ] 已 revoked 的 IdentityBinding 没有静默变回 current。
- [ ] 已 distrust 的 trust material 不会在声明禁止的 scope 内继续被接受。
- [ ] wrong-resource / wrong-context artifact 仍然被拒绝，在对应 profile 适用时。
- [ ] downstream consumer 已经看到 Incident 要求的新 trust state，在相关 contract
      要求时。

这类 Negative Validation 是 **Recovery Validation 与普通"服务恢复正常"之间最重要的
区别之一**。

## 41 · Negative Validation 仍然服从 Freshness Contract

Recovery 不能把正确的 bounded freshness 误判成 failure。例如某项 upstream revocation
发生以后，如果 Current Token Contract 明确允许某类已签发 Artifact 在有限时间内继续
本地验证，那么这种行为本身不自动是 Recovery Failure。真正验证的是：**当前行为是否
仍然严格符合已经冻结的 Revocation / Freshness Contract。**

## 42 · Recovery 后重新运行受影响的 Production Gates

任何 Recovery、Trust Migration、security incident 或 Material Change，只要影响了
Production Sign-off 依赖的 assumption 或 evidence，就必须重新执行
[生产环境检查表](./production-checklist) 中受影响的 Production Gates：

```text
Recovery / Material Change
        ↓
Identify invalidated assumptions
        ↓
Re-run affected Production Gates
```

不是每次都机械重新跑全部 Gate，也不是 Runtime 重新 Ready 以后什么都不用重新验证。

## 43 · Readiness Healthy 不等于 Recovery Complete

```text
Readiness Healthy
≠
Recovery Complete
```

Readiness 恢复说明 Runtime 重新满足接 Traffic 的某些运行条件。Recovery Complete 还
要求：ActorIdentity continuity 可解释；Current security state 正确；revoked /
consumed state 没有错误复活；downstream trust 已经达到 intended state；Historical
Accountability 能够解释 Recovery 前后发生了什么；受影响 Production Gates 已经重新
通过。只有这些重新成立，才能真正宣布 Trust Recovery 完成。

## 44 · Operations & Recovery at a glance

| Boundary | Meaning |
| --- | --- |
| **Service Recovery ≠ Trust Recovery** | Process 恢复不证明 Identity / Security State 已经正确 |
| **Identity Continuity ≠ Identity Immutability** | 保持同一 ActorIdentity 不等于保留每个旧状态 |
| **Database Restore ≠ SoulAuth Recovery** | 恢复数据只是完整 Recovery 的一部分 |
| **Backup Exists ≠ Recovery Works** | 没有 Restore Verification 就没有 Recovery Evidence |
| **Backup Availability ≠ Backup Integrity** | 文件存在不证明它可安全恢复 |
| **Valid Backup ≠ Trusted Recovery Point** | 完整 Backup 仍可能包含 Incident 后的错误 Trust |
| **Historical State ≠ Current Trusted State** | Snapshot 中的 active 不代表今天仍 active |
| **Historical Restore ≠ State Resurrection** | expired / revoked / consumed state 不能静默复活 |
| **Restored IdentityBinding ≠ Current Binding** | Binding 必须按 Current Contract 重新判断 |
| **Preserve Identity Continuity ≠ Preserve Every Old State** | Wrong lifecycle / security state 仍可修正 |
| **Rotation ≠ Loss ≠ Compromise** | 三种 Trust-material 事件需要不同 Response |
| **Normal Rotation Overlap ≠ Compromise Continuation** | 泄露 material 不能机械沿用普通 overlap |
| **Credential / Session Containment ≠ Actor Retirement** | Incident scope 不能无限放大 |
| **Revocation Effect ≠ Revocation Freshness** | 上游 state 改变与下游观察时间分开 |
| **Replica Failover ≠ Historical Restore** | 一个延续现在，一个把状态拉回过去 |
| **Replicated ≠ Mixed-version Compatible** | 多 Replica 不自动支持 rolling upgrade |
| **Binary Rollback ≠ State Rollback** | 软件版本与业务安全状态不同 |
| **State Rollback ≠ Safe Trust Recovery** | 历史 state 不能不经 reconciliation 直接恢复 |
| **Emergency Access ≠ Identity Semantics Bypass** | 紧急权限不能重写 Canonical Domain |
| **Audit Reconciliation ≠ Retroactive Fabrication** | Gap 不能被伪造成从未存在 |
| **Readiness Healthy ≠ Recovery Complete** | Runtime 恢复不等于 Trust 完全恢复 |

## Exact Contract Source

本篇定义 **Day-2 Operating Discipline、Trusted Recovery Point、Restore /
Reconciliation 顺序、Trust-material Incident 分类、Revocation / Containment
Boundary、Configuration Change、Upgrade / Rollback Discipline，以及 Recovery
Validation**。

它不自行定义 exact backup command、exact restore command、specific key-management
system、specific key versioning scheme、specific schema migration tool、formal
break-glass implementation、Refresh Token lifecycle、AIActor authentication method、
Audit cryptographic integrity mechanism、replica coordination store。这些 Exact 事实
必须来自 Runtime、Release Compatibility Contract、Config Registry、Authentication /
Token / Audit References、[项目状态](../project/status) 与 Engineering Runbooks。

Operations documentation 可以组织这些 Contract，它不能替它们创造新的 Current
Capability。

## 下一步

```text
部署          Can SoulAuth run correctly?
        ↓
生产环境检查表  Can this exact deployment prove it is production-ready?
        ↓
运维与恢复     How do we maintain and recover that trust over time?
```

下一份进入 [故障排查](./troubleshooting)。它将不再讨论"正确架构应该是什么"，而是从
Operator 真正看到的症状出发：**Authentication 为什么失败？问题究竟发生在 Issuer、
Client、Redirect、Token、Session、Proxy、Persistence、Key、Clock、External Provider
还是 Soulseed Integration Boundary？**
