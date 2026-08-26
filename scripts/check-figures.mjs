// 守住三张 Canonical Figure 的两件事：文件真的在，以及语言别串了。
//
// 语料《Final Refinement Constitution》§18 把公共核心图锁死为三张：
// Figure 1 (WHERE) / Figure 2 (WHO) / Figure 3 (HOW)。每张有中英两版。
//
// 会悄悄坏掉的是这两类：
//
//   1. 引用了 public/ 里不存在的图 —— VitePress 不解析 <img src>，构建照样
//      是绿的，坏图只在浏览器里才看得见。
//   2. 中文页引了 .en.webp（或反过来）—— 页面能渲染，图也显示，只是读者
//      看到的是另一种语言。这种错不会有任何报错。
//
// 同时禁止第四张核心图混进来：能用五行文字讲清楚的就不画图，其余图必须是
// 局部解释图，不冒充 Canonical Architecture Figure。
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const CANONICAL = [
  'figure-1-soulseed-agi-infrastructure',
  'figure-2-actor-centred-identity-model',
  'figure-3-soulauth-architecture',
]

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? walk(path) : path.endsWith('.md') ? [path] : []
  })
}

const failures = []
let refs = 0

for (const file of walk('docs')) {
  if (file.includes('.vitepress')) continue
  const isZh = file.startsWith('docs/zh/')
  const text = readFileSync(file, 'utf8')

  for (const m of text.matchAll(/\/figures\/([A-Za-z0-9._-]+)\.(en|zh)\.webp/g)) {
    refs++
    const [ref, base, locale] = [m[0], m[1], m[2]]

    if (!CANONICAL.includes(base)) {
      failures.push(`${file}: ${base} 不在三张 Canonical Figure 之列`)
    }
    const want = isZh ? 'zh' : 'en'
    if (locale !== want) {
      failures.push(`${file}: 引用了 .${locale}. 版，该页应为 .${want}.`)
    }
    if (!existsSync(join('docs/public', ref))) {
      failures.push(`${file}: docs/public${ref} 不存在`)
    }
  }
}

// 每张图的两个语言版本都必须落地，否则某个语言的页面迟早引到空。
for (const base of CANONICAL) {
  for (const locale of ['en', 'zh']) {
    const p = `docs/public/figures/${base}.${locale}.webp`
    if (!existsSync(p)) failures.push(`缺资源 ${p}`)
    if (!existsSync(`figures/${base}.${locale}.png`)) {
      failures.push(`缺 master figures/${base}.${locale}.png`)
    }
  }
}

if (failures.length) {
  for (const f of failures) console.error(`✖ ${f}`)
  process.exit(1)
}

console.log(`✓ ${CANONICAL.length} 张 Canonical Figure（中英各一版）齐备，${refs} 处引用语言均正确`)
