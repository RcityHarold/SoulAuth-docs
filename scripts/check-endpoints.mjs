// 比对文档里声称的端点数与 SoulAuth 源码里的真实路由表。
//
// 审查期间这个项目的端点总数先后被说成 66 / 68 / 70，没有一个对。
// 手写的数字会漂移，所以让 CI 去数。
//
// 用法：SOULAUTH_SRC=../SoulAuth node scripts/check-endpoints.mjs
// 源码不可达时跳过（退出码 0）—— 文档仓库可以独立构建。
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const SRC = process.env.SOULAUTH_SRC || join(process.cwd(), '..', 'SoulAuth')
if (!existsSync(join(SRC, 'src/main.rs'))) {
  console.log(`⊘ 跳过：${SRC} 下没有 SoulAuth 源码`)
  process.exit(0)
}

const { default: endpoints } = await import('./extract-endpoints.mjs')
const total = endpoints.length

const counts = {}
for (const e of endpoints) counts[e.module] = (counts[e.module] ?? 0) + 1
// oidc 与 oidc_client 在文档里合并成一个 "OIDC" 模块
const merged = {
  auth: counts.auth ?? 0,
  user_management: counts.user_management ?? 0,
  rbac: counts.rbac ?? 0,
  oidc: (counts.oidc ?? 0) + (counts.oidc_client ?? 0),
  security: counts.security ?? 0,
  audit: counts.audit ?? 0,
}

// 文档里写死这些数字的地方
const CLAIMS = [
  { file: 'docs/reference/api.md',    re: /\*\*(\d+) endpoints\*\*/,  expect: total, what: '总数（英文）' },
  { file: 'docs/zh/reference/api.md', re: /\*\*(\d+) 个端点\*\*/,      expect: total, what: '总数（中文）' },
  { file: 'docs/guide/what-is-soulauth.md',    re: /\*\*(\d+) HTTP endpoints/, expect: total, what: '总数（英文首页正文）' },
  { file: 'docs/zh/guide/what-is-soulauth.md', re: /八个模块 (\d+) 个 HTTP 端点/, expect: total, what: '总数（中文首页正文）' },
  { file: 'docs/reference/auth.md',    re: /— (\d+) endpoints/,  expect: merged.auth, what: 'auth' },
  { file: 'docs/zh/reference/auth.md', re: /—— (\d+) 个端点/,     expect: merged.auth, what: 'auth（中文）' },
  { file: 'docs/reference/rbac.md',    re: /— (\d+) endpoints/,  expect: merged.rbac, what: 'rbac' },
  { file: 'docs/zh/reference/rbac.md', re: /—— (\d+) 个端点/,     expect: merged.rbac, what: 'rbac（中文）' },
  { file: 'docs/reference/users.md',    re: /— (\d+) endpoints/, expect: merged.user_management, what: 'users' },
  { file: 'docs/zh/reference/users.md', re: /—— (\d+) 个端点/,    expect: merged.user_management, what: 'users（中文）' },
  { file: 'docs/reference/audit.md',    re: /— (\d+) reporting endpoints/, expect: merged.audit, what: 'audit' },
  { file: 'docs/zh/reference/audit.md', re: /—— (\d+) 个报告端点/,  expect: merged.audit, what: 'audit（中文）' },
  { file: 'docs/reference/security.md',    re: /— (\d+) endpoints/, expect: merged.security, what: 'security' },
  { file: 'docs/zh/reference/security.md', re: /—— (\d+) 个端点/,   expect: merged.security, what: 'security（中文）' },
  { file: 'docs/reference/oidc.md',    re: /^(\d+) endpoints/m,  expect: merged.oidc, what: 'oidc' },
  { file: 'docs/zh/reference/oidc.md', re: /^(\d+) 个端点/m,      expect: merged.oidc, what: 'oidc（中文）' },
]

let bad = 0
for (const { file, re, expect, what } of CLAIMS) {
  if (!existsSync(file)) { console.error(`✖ 缺文件 ${file}`); bad++; continue }
  const m = readFileSync(file, 'utf8').match(re)
  if (!m) { console.error(`✖ ${file}：没找到 ${what} 的数字`); bad++; continue }
  if (Number(m[1]) !== expect) {
    console.error(`✖ ${file}：${what} 写的是 ${m[1]}，源码里是 ${expect}`)
    bad++
  }
}

if (bad) { console.error(`\n${bad} 处端点数与源码不符`); process.exit(1) }
console.log(`✓ 端点数与源码一致（共 ${total} 个）`)
