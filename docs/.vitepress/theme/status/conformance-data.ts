// 一致性读数。
//
// **这份数据是从真实测试输出誊来的，不是估计。** 生成依据见每项的 `command`。
// 它上站的理由不是好看：一个开源认证项目最该被追问的是「你凭什么这么说」，
// 而把未成立的部分连同原因一起摆出来，比只展示绿色更能回答这个问题。
//
// 更新纪律：跑完那四条命令，把数字誊过来，同时更新 `capturedAt`。
// 不要手改单个数字 —— 那正是这份读数存在要防止的事。

export const CAPTURED_AT = '2026-08-28'
export const COMMIT = '55ce8c1'

export interface Gate {
  id: string
  command: string
  /**
   * `count` —— 通过多少条断言。
   * `clean` —— 只有「干净 / 不干净」两态。
   *
   * 编译门属于后者：它没有"通过了几条"这回事，硬塞一个 0 进去，读者看到的是
   * 「cargo check：0 passed」，恰好读成"一条都没过"。
   */
  kind: 'count' | 'clean'
  passed: number
  failed: number
  ignored?: number
  note: { en: string; zh: string }
}

export const GATES: Gate[] = [
  {
    id: 'compile',
    kind: 'clean',
    command: 'cargo check --all-targets',
    passed: 0,
    failed: 0,
    note: {
      en: 'Zero errors, zero warnings. The repository treats dead code as a warning and does not silence it per-site.',
      zh: '零错误、零警告。本仓库把 dead code 当警告处理，且不逐处开 allow 掩盖。',
    },
  },
  {
    id: 'unit',
    kind: 'count',
    command: 'cargo test --bins',
    passed: 170,
    failed: 0,
    note: {
      en: 'Pure logic: canonicalisation, replay negatives, hashing, record-id normalisation.',
      zh: '纯逻辑：规范化、重放否定用例、哈希、record id 归一。',
    },
  },
  {
    id: 'conformance',
    kind: 'count',
    command: 'cargo test --test conformance',
    passed: 54,
    failed: 0,
    ignored: 10,
    note: {
      en: 'Architecture invariants asserted against schema and source. The ten ignored ones are listed below — each names what is not yet true.',
      zh: '对照 schema 与源码断言架构不变式。被跳过的十条列在下面，每条写明「什么还不成立」。',
    },
  },
  {
    id: 'integration',
    kind: 'count',
    command: './tests/integration.sh',
    passed: 353,
    failed: 0,
    note: {
      en: 'End-to-end against a real SurrealDB and a real server process, including a second replica for cross-replica rate limiting.',
      zh: '对真实 SurrealDB 与真实服务进程跑端到端，含第二副本用于验证跨副本限流合账。',
    },
  },
  {
    id: 'deployment',
    kind: 'clean',
    command: './tests/deployment_walkthrough.sh',
    passed: 0,
    failed: 0,
    note: {
      en: 'The deployment page executed from an empty database to a usable administrator. Zero failing steps. It is a gate, not a demo: CI runs it on every push, and it once caught three defects that reading the page could not.',
      zh: '把部署页从空库执行到一个可用的管理员，失败步骤为 0。它是闸门不是演示：CI 每次推送都跑，而它曾经一次抓出三处只靠读发现不了的缺陷。',
    },
  },
]

export interface OpenItem {
  test: string
  reason: { en: string; zh: string }
}

/**
 * 尚未成立的不变式。
 *
 * 它们**不是失败**，是明确标注的未完成项：断言写好了、能跑，但当前实现还达不到，
 * 所以标了 `#[ignore]` 并写明原因。删掉一条 `#[ignore]` 删不动，就说明那件事没真做完。
 *
 * 绝大多数是内部结构问题，外部调用方碰不到（比如有没有 Repository 抽象）。
 * 会影响到你的那几条，在下面的说明里点名了。
 */
export const OPEN_ITEMS: OpenItem[] = [
  {
    test: 'a2_actor_identity_is_not_credential',
    reason: {
      en: 'Password lives as a column on `user`; TOTP lives in `user_mfa`. Credentials are not yet consolidated behind one object.',
      zh: '口令是 `user` 的一个列，TOTP 在 `user_mfa`。凭证尚未收口到单一对象后面。',
    },
  },
  {
    test: 'b2_identity_outlives_any_credential',
    reason: {
      en: 'No `credential` table yet — credentials are spread across `user.password`, `user_mfa` and `password_reset_token`.',
      zh: '还没有 `credential` 表 —— 凭证散在 `user.password`、`user_mfa`、`password_reset_token` 三处。',
    },
  },
  {
    test: 'h3_binding_is_not_credential',
    reason: {
      en: 'Same root cause: external identity binding and credential are not yet separate objects.',
      zh: '同一根因：外部身份绑定与凭证尚未拆成两个对象。',
    },
  },
  {
    test: 'b3_authentication_result_is_uniform',
    reason: {
      en: 'Authentication result is an internal runtime fact with no materialised type. What reaches you is the session token and the OIDC projection — those are stable.',
      zh: '认证结果是内部 runtime fact，没有物化类型。到你手上的是会话令牌与 OIDC 投影，那两样是稳定的。',
    },
  },
  {
    test: 'b5_key_material_is_segregated',
    reason: {
      en: 'In local development, the MFA encryption key derives from `JWT_SECRET` when unset. Production is gated: a non-loopback `APP_URL` without `MFA_SECRET_ENCRYPTION_KEY` refuses to start.',
      zh: '本地开发时，未配置的 MFA 加密密钥从 `JWT_SECRET` 派生。生产有硬闸门：`APP_URL` 非环回且缺 `MFA_SECRET_ENCRYPTION_KEY` 时进程拒绝启动。',
    },
  },
  {
    test: 'f1_audit_attributes_to_actor',
    reason: {
      en: 'Audit rows are attributed by `user_id`. AIActor authentication already attributes to the identity root; human paths have not been migrated.',
      zh: '审计仍以 `user_id` 归因。AIActor 认证已经归因到身份根，人类路径尚未迁移。',
    },
  },
  {
    test: 'f4_audit_is_tamper_evident',
    reason: {
      en: 'The audit log is an ordinary table — no hash chain, no checkpoint. **Do not treat it as tamper-evident.**',
      zh: '审计日志就是一张普通表 —— 没有哈希链、没有 checkpoint。**不要把它当作防篡改证据。**',
    },
  },
  {
    test: 'a8_membership_is_not_identity',
    reason: {
      en: '`membership_level` / `membership_expiry` hang off `user`, and the operations overview hard-codes pricing.',
      zh: '`membership_level` / `membership_expiry` 挂在 `user` 上，运营总览里还硬编码了定价。',
    },
  },
  {
    test: 'h2_actor_identity_is_not_profile',
    reason: {
      en: '`user_profile` is keyed by `user_id` rather than referencing the identity root.',
      zh: '`user_profile` 以 `user_id` 为键，而不是引用身份根。',
    },
  },
  {
    test: 'g1_repositories_are_separated_by_domain',
    reason: {
      en: 'Internal structure only: one `Database` struct serves every domain instead of per-domain repositories. Invisible from outside.',
      zh: '纯内部结构：一个 `Database` 结构通吃全域，而不是按域拆 Repository。从外部看不见。',
    },
  },
]
