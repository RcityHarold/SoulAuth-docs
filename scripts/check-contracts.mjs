// 契约快照守卫。
//
// `docs/.vitepress/data/contracts/*.json` 是 SoulAuth 仓库 `contracts/*.yaml`
// 的派生快照。派生数据的风险很具体：**它看起来和准确数据一模一样。**
// 一份三个月前的端点表不会显得可疑，读者会照着它调。
//
// 这个脚本不能判断快照是不是最新的（源仓库不在这里），它守的是另外三件事：
//
//   ① 四份注册表齐全、是合法 JSON、且不是空壳；
//   ② SOURCE.json 记录了来源 commit，且不是从有未提交改动的工作区取的
//      —— 那种快照对应的东西在 git 历史里根本找不到；
//   ③ 每个引用 <ApiTable> 之类组件的页面，都同时放了 <ContractNote>
//      —— 渲染出契约数据却不说它来自哪个 commit，正是上面那个风险本身。

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const DATA = join(ROOT, 'docs/.vitepress/data/contracts')
const DOCS = join(ROOT, 'docs')

const REGISTRIES = {
  'openapi.json': (d) => Object.keys(d.paths ?? {}).length,
  'permissions.json': (d) => (d.permissions ?? []).length,
  'configuration.json': (d) => (d.groups ?? []).reduce((n, g) => n + (g.keys?.length ?? 0), 0),
  'standards.json': (d) => (d.specifications ?? []).length,
}

const errors = []

// ① 注册表
const sizes = {}
for (const [file, count] of Object.entries(REGISTRIES)) {
  const p = join(DATA, file)
  if (!existsSync(p)) {
    errors.push(`缺少 ${file} —— 跑 \`python3 scripts/sync-contracts.py\``)
    continue
  }
  let data
  try {
    data = JSON.parse(readFileSync(p, 'utf8'))
  } catch (e) {
    errors.push(`${file} 不是合法 JSON：${e.message}`)
    continue
  }
  const n = count(data)
  sizes[file] = n
  if (n === 0) errors.push(`${file} 解析出 0 条 —— 结构变了，渲染组件会静默出一张空表`)
}

// ② 来源
const srcPath = join(DATA, 'SOURCE.json')
if (!existsSync(srcPath)) {
  errors.push('缺少 SOURCE.json —— 没有来源 commit，读者无从判断这份数据有多新')
} else {
  const src = JSON.parse(readFileSync(srcPath, 'utf8'))
  if (!src.commit || src.commit.length < 40) errors.push('SOURCE.json 里没有完整 commit')
  if (src.dirty) {
    errors.push(
      'SOURCE.json 标记 dirty —— 快照取自有未提交改动的工作区，' +
        '它对应的契约在 git 历史里找不到。提交 SoulAuth 那边的改动后重新同步。',
    )
  }
}

// ③ 英文可渲染字段里不得出现 CJK
//
// 契约是本仓库的产物，描述天然是中文写的。Reference 区改成从契约渲染之后，
// 那些中文会**原样流到英文页面上** —— 而这在 HTML 层面的检查里完全看不出来：
// 元素数量对、来源标记对，只有真的看一眼才会发现整页是中文。
//
// 约定：`description` / `note` / `scope` 等主字段是英文，中文放同名 `*_zh`。
const CJK = /[\u4e00-\u9fff]/
const LOCALISED = new Set(['description', 'note', 'scope', 'summary', 'detail', 'title'])
function scan(node, path, out) {
  if (Array.isArray(node)) {
    node.forEach((v, i) => scan(v, `${path}[${i}]`, out))
  } else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (k.endsWith('_zh')) continue
      scan(v, `${path}.${k}`, out)
    }
  } else if (typeof node === 'string' && CJK.test(node)) {
    out.push(path)
  }
}
for (const file of Object.keys(REGISTRIES)) {
  const p = join(DATA, file)
  if (!existsSync(p)) continue
  const found = []
  scan(JSON.parse(readFileSync(p, 'utf8')), file, found)
  for (const where of found.slice(0, 5)) {
    errors.push(
      `${where} 是中文 —— 主字段必须是英文，中文放同名 \`_zh\` 字段。` +
        '否则它会原样渲染到英文页面上。',
    )
  }
  if (found.length > 5) errors.push(`${file} 另有 ${found.length - 5} 处同类问题`)
}

// ④ 页面必须声明来源
const RENDERERS = ['<ApiTable', '<ConfigTable', '<PermissionTable', '<StandardsTable']
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.vitepress') continue
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (name.endsWith('.md')) out.push(p)
  }
  return out
}
let pages = 0
for (const file of walk(DOCS)) {
  const body = readFileSync(file, 'utf8')
  if (!RENDERERS.some((r) => body.includes(r))) continue
  pages++
  if (!body.includes('<ContractNote')) {
    errors.push(
      `${relative(DOCS, file)} 渲染了契约数据但没有 <ContractNote> —— ` +
        '页面上必须写出这份数据来自哪个 commit',
    )
  }
}

if (errors.length) {
  console.error('✗ 契约快照检查未通过：\n')
  for (const e of errors) console.error('  • ' + e)
  process.exit(1)
}
console.log(
  `✓ 契约快照：${sizes['openapi.json']} 路径 / ${sizes['permissions.json']} 权限 / ` +
    `${sizes['configuration.json']} 配置项 / ${sizes['standards.json']} 规范，` +
    `${pages} 个渲染页面均已声明来源`,
)
