// 守住三张 Canonical Figure 的三件事。
//
// 图从位图改成组件以后，会悄悄坏掉的东西变了。以前担心的是「文件丢了」，
// 现在担心的是这三类 —— 全都不会让构建变红：
//
//   1. 语言串了：中文页写成 <Figure2 locale="en" />，页面正常渲染，只是
//      读者看到的是英文图。
//   2. 两个 locale 的内容不对等：这正是位图版 Figure 1 出过的问题 ——
//      英文版有三条底部注释，中文版一条都没有。TypeScript 能保证键一致，
//      保证不了数组长度一致（notes 三条 vs 两条它不会报错）。
//   3. 冒出第四张核心图：语料《Final Refinement Constitution》§18 把公共
//      核心图锁死为 WHERE / WHO / HOW 三张。
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fig1, fig2, fig3 } from '../docs/.vitepress/theme/figures/strings.ts'

const failures = []

// ── 1 & 3：用法与语言 ────────────────────────────────────────────────
function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.md') ? [p] : []
  })
}

const seen = new Set()
let uses = 0

for (const file of walk('docs')) {
  if (file.includes('.vitepress')) continue
  const isZh = file.startsWith('docs/zh/')
  const want = isZh ? 'zh' : 'en'
  const text = readFileSync(file, 'utf8')

  for (const m of text.matchAll(/<Figure(\d+)\s+locale="(en|zh)"\s*\/>/g)) {
    uses++
    const [, num, locale] = m
    if (!['1', '2', '3'].includes(num)) {
      failures.push(`${file}: Figure${num} —— 公共核心图只有三张`)
    }
    if (locale !== want) {
      failures.push(`${file}: <Figure${num} locale="${locale}"> 应为 "${want}"`)
    }
    seen.add(`${num}.${locale}`)
  }

  // 漏写 locale 会让组件拿 undefined 取字符串，整张图空掉
  for (const m of text.matchAll(/<Figure(\d+)(?![\s\S]{0,40}locale=)/g)) {
    failures.push(`${file}: <Figure${m[1]}> 没有 locale prop`)
  }
}

for (const n of ['1', '2', '3']) {
  for (const l of ['en', 'zh']) {
    if (!seen.has(`${n}.${l}`)) failures.push(`Figure${n} 的 ${l} 版没有任何页面使用`)
  }
}

// ── 2：两个 locale 的结构必须完全对等 ───────────────────────────────
//
// TypeScript 只保证键一致。这里逐层比对，把「中文少了一条注释」这类
// 只有人眼能发现的差异变成 CI 能发现的差异。
function shape(v, path, out) {
  if (Array.isArray(v)) {
    out.push(`${path}[]=${v.length}`)
    v.forEach((x, i) => shape(x, `${path}[${i}]`, out))
  } else if (v && typeof v === 'object') {
    for (const k of Object.keys(v).sort()) shape(v[k], `${path}.${k}`, out)
  } else {
    // 只记「有没有值」，不记值本身 —— 文案本来就该不同
    out.push(`${path}=${v === undefined || v === '' ? 'empty' : 'set'}`)
  }
  return out
}

for (const [name, fig] of [['fig1', fig1], ['fig2', fig2], ['fig3', fig3]]) {
  const en = shape(fig.en, name, [])
  const zh = shape(fig.zh, name, [])
  const onlyEn = en.filter((x) => !zh.includes(x))
  const onlyZh = zh.filter((x) => !en.includes(x))
  for (const x of onlyEn) failures.push(`${name}: 仅 en 有 ${x}`)
  for (const x of onlyZh) failures.push(`${name}: 仅 zh 有 ${x}`)
}

if (failures.length) {
  for (const f of failures) console.error(`✖ ${f}`)
  process.exit(1)
}
console.log(`✓ 三张 Canonical Figure：${uses} 处引用语言均正确，中英结构完全对等`)
