// 从 SoulAuth 源码的 axum 路由表抽端点清单。
//
// 为什么不手写：这个项目的端点总数在审查期间漂移过三次（66/68/70）。
// 手写的清单迟早会和代码分叉，而分叉的 API 文档比没有文档更糟。
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const SRC = process.env.SOULAUTH_SRC || join(process.cwd(), '..', 'SoulAuth')

// main.rs 里的挂载点：模块内的相对路径要加上这个前缀
function readMounts() {
  const main = readFileSync(join(SRC, 'src/main.rs'), 'utf8')
  const mounts = []
  for (const m of main.matchAll(/\.nest\("([^"]+)",\s*routes::(\w+)::(\w+)\(\)\)/g)) {
    mounts.push({ prefix: m[1], module: m[2], fn: m[3] })
  }
  for (const m of main.matchAll(/\.merge\(routes::(\w+)::(\w+)\(\)\)/g)) {
    mounts.push({ prefix: '', module: m[1], fn: m[2] })
  }
  return mounts
}

// 一个 router 函数体内的 .route("path", method(handler)) 调用。
// 同一个 path 可以链多个 method：.route("/x", get(a).post(b))
function readRoutes(module, fnName) {
  const src = readFileSync(join(SRC, `src/routes/${module}.rs`), 'utf8')
  const start = src.indexOf(`fn ${fnName}(`)
  if (start < 0) throw new Error(`${module}::${fnName} not found`)
  // 函数体到下一个顶层 `\n}` 为止
  const end = src.indexOf('\n}', start)
  const body = src.slice(start, end)
  const out = []
  for (const m of body.matchAll(/\.route\(\s*"([^"]+)"\s*,\s*([^)]*\([^)]*\)(?:\s*\.\s*\w+\([^)]*\))*)/g)) {
    const path = m[1]
    for (const v of m[2].matchAll(/\b(get|post|put|patch|delete|head|options)\s*\(\s*([\w:]+)/g)) {
      out.push({ path, method: v[1].toUpperCase(), handler: v[2] })
    }
  }
  return out
}

const endpoints = []

// main.rs 里直接挂在根 Router 上的路由（不经过任何 nest/merge）。
// /health 就是这样挂的 —— 它刻意注册在限流层之后，见 main.rs 的注释。
{
  const main = readFileSync(join(SRC, 'src/main.rs'), 'utf8')
  for (const m of main.matchAll(/\.route\("([^"]+)",\s*(\w+)\((\w+)\)\)/g)) {
    endpoints.push({ path: m[1], method: m[2].toUpperCase(), handler: m[3], module: 'main' })
  }
}

for (const { prefix, module, fn } of readMounts()) {
  for (const r of readRoutes(module, fn)) {
    const full = (prefix + r.path).replace(/\/$/, '') || '/'
    endpoints.push({ ...r, module, path: full })
  }
}
// 同一 path 在不同模块挂到同一前缀（oidc + oidc_client 都挂 /api/oidc）
endpoints.sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method))
export default endpoints

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(JSON.stringify(endpoints, null, 2))
  console.error(`总计 ${endpoints.length} 个端点`)
}
