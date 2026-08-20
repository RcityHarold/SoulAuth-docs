// 校验站内链接的 #锚点 是否真的存在。
//
// VitePress 的 ignoreDeadLinks 只查页面存在与否，**不查锚点**。
// 中文标题生成的 id 会做转写（逗号被换成 `-`、空格变 `-`），
// 手写锚点极易差一个字符，而症状只是「点了没反应」—— 不会有任何构建报错。
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const DIST = 'docs/.vitepress/dist'

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (p.endsWith('.html')) out.push(p)
  }
  return out
}

const pages = walk(DIST)
// 每个页面提供的 id 集合
const ids = new Map()
for (const p of pages) {
  const html = readFileSync(p, 'utf8')
  ids.set(
    '/' + relative(DIST, p).replace(/\\/g, '/').replace(/\.html$/, ''),
    new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))
  )
}

let bad = 0
for (const p of pages) {
  const from = '/' + relative(DIST, p).replace(/\\/g, '/').replace(/\.html$/, '')
  const html = readFileSync(p, 'utf8')
  for (const m of html.matchAll(/href="(\/[^"#]*)#([^"]+)"/g)) {
    let [, path, anchor] = m
    path = decodeURIComponent(path).replace(/\/$/, '') || '/index'
    anchor = decodeURIComponent(anchor)
    const target = ids.get(path) ?? ids.get(path + '/index')
    if (!target) continue // 页面存在与否交给 VitePress 的死链检查
    if (!target.has(anchor)) {
      console.error(`✖ ${from}  →  ${path}#${anchor}`)
      bad++
    }
  }
}

if (bad) {
  console.error(`\n${bad} 个锚点指向不存在的位置`)
  process.exit(1)
}
console.log('✓ 所有站内锚点都能对上')
