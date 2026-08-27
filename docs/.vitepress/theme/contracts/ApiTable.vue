<script setup lang="ts">
import { computed, ref } from 'vue'
import { useData } from 'vitepress'
import OPENAPI from '../../data/contracts/openapi.json'
import { inlineMarkdown } from './inline'

const props = defineProps<{
  /** 只渲染这个 tag 下的端点；留空则全部。 */
  tag?: string
}>()

const { lang } = useData()
const zh = computed(() => lang.value.startsWith('zh'))

interface Row {
  method: string
  path: string
  operationId: string
  description?: string
  schemes: string[]
  permission?: string
}

const METHOD_ORDER = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

const rows = computed<Row[]>(() => {
  const out: Row[] = []
  const paths = (OPENAPI as any).paths ?? {}
  for (const [path, methods] of Object.entries<any>(paths)) {
    for (const [method, op] of Object.entries<any>(methods)) {
      if (props.tag && !(op.tags ?? []).includes(props.tag)) continue
      out.push({
        method: method.toUpperCase(),
        path,
        operationId: op.operationId,
        // 见 ConfigTable：zh 优先 `_zh`，回落英文。
        description: (zh.value ? op['description_zh'] : undefined) ?? op.description,
        // `security: []` 是「显式公开」，与「没写 security」不同 —— 前者是
        // 声明，后者是遗漏。契约里两者都不该出现在同一份表里而不加区分。
        schemes: (op.security ?? []).flatMap((s: any) => Object.keys(s)),
        permission: (op['x-required-permissions'] ?? [])[0],
      })
    }
  }
  return out.sort(
    (a, b) =>
      a.path.localeCompare(b.path) ||
      METHOD_ORDER.indexOf(a.method) - METHOD_ORDER.indexOf(b.method),
  )
})

const SCHEME_LABEL: Record<string, { en: string; zh: string; hint: { en: string; zh: string } }> = {
  bearerAuth: {
    en: 'session token',
    zh: '会话令牌',
    hint: {
      en: 'Authorization: Bearer — from POST /api/auth/login or POST /api/actors/authenticate',
      zh: 'Authorization: Bearer —— 来自 POST /api/auth/login 或 POST /api/actors/authenticate',
    },
  },
  oidcAccessToken: {
    en: 'OIDC access token',
    zh: 'OIDC 访问令牌',
    hint: {
      en: 'Authorization: Bearer — from POST /api/oidc/token. Not interchangeable with a session token.',
      zh: 'Authorization: Bearer —— 来自 POST /api/oidc/token。与会话令牌不可互换。',
    },
  },
  browserSession: {
    en: 'browser cookie',
    zh: '浏览器 cookie',
    hint: {
      en: 'soulauth_session cookie. Absent means a redirect to the login page, not a 401.',
      zh: 'soulauth_session cookie。没有它是重定向到登录页，不是 401。',
    },
  },
}

const openRow = ref<string | null>(null)
function toggle(id: string) {
  openRow.value = openRow.value === id ? null : id
}
</script>

<template>
  <div class="api">
    <div class="api-count">
      {{ rows.length }} {{ zh ? '个端点' : rows.length === 1 ? 'endpoint' : 'endpoints' }}
    </div>
    <div class="api-scroll">
      <table class="api-table">
        <thead>
          <tr>
            <th>{{ zh ? '端点' : 'Endpoint' }}</th>
            <th>{{ zh ? '需要' : 'Requires' }}</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="r in rows" :key="r.operationId">
            <tr :class="{ 'api-open': openRow === r.operationId }">
              <td class="api-ep">
                <button class="api-btn" type="button" @click="toggle(r.operationId)">
                  <span class="api-m" :class="`api-m--${r.method.toLowerCase()}`">{{ r.method }}</span>
                  <code class="api-p">{{ r.path }}</code>
                </button>
              </td>
              <td class="api-req">
                <span v-if="!r.schemes.length" class="api-pub">{{ zh ? '公开' : 'public' }}</span>
                <template v-else>
                  <span
                    v-for="s in r.schemes"
                    :key="s"
                    class="api-scheme"
                    :title="SCHEME_LABEL[s]?.hint[zh ? 'zh' : 'en'] ?? s"
                    >{{ SCHEME_LABEL[s]?.[zh ? 'zh' : 'en'] ?? s }}</span
                  >
                  <code v-if="r.permission" class="api-perm">{{ r.permission }}</code>
                </template>
              </td>
            </tr>
            <tr v-if="openRow === r.operationId" class="api-detail">
              <td colspan="2">
                <p v-if="r.description" v-html="inlineMarkdown(r.description)" />
                <p v-else class="api-nodesc">
                  {{ zh
                    ? '契约里这一条还没有描述。它不是遗漏的能力，是遗漏的文字 —— 端点本身由 j4 守着确实存在。'
                    : 'No description in the contract yet. That is missing prose, not a missing capability — j4 guarantees the endpoint exists.' }}
                </p>
                <code class="api-oid">operationId: {{ r.operationId }}</code>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.api { margin: 18px 0 26px; }
.api-count { margin-bottom: 8px; color: var(--vp-c-text-3); font-size: 13px; }
.api-scroll { overflow-x: auto; }
.api-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.api-table th {
  padding: 6px 10px 6px 0;
  border-bottom: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-3);
  font-size: 12px;
  font-weight: 500;
  text-align: left;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.api-table td { padding: 0; border-bottom: 1px solid var(--vp-c-divider); vertical-align: top; }

.api-btn {
  display: flex;
  align-items: baseline;
  gap: 10px;
  width: 100%;
  padding: 8px 10px 8px 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.api-m {
  flex: 0 0 auto;
  min-width: 4.2em;
  font-family: var(--vp-font-family-mono);
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.03em;
}
.api-m--get { color: #2f7d5b; }
.api-m--post { color: #3b5bd0; }
.api-m--put { color: #a4610a; }
.api-m--delete { color: #b4342c; }
.dark .api-m--get { color: #5fbf92; }
.dark .api-m--post { color: #8ba3f5; }
.dark .api-m--put { color: #d9a05b; }
.dark .api-m--delete { color: #e88a82; }
.dark .api-m--get { color: #5fbf92; }
.dark .api-m--post { color: #8ba3f5; }
.dark .api-m--put { color: #d9a05b; }
.dark .api-m--delete { color: #e88a82; }

.api-p { padding: 0; background: none; font-size: 13px; overflow-wrap: break-word; }
.api-req { padding: 8px 0 8px 10px; white-space: nowrap; }
.api-pub { color: var(--vp-c-text-3); font-size: 13px; }
.api-scheme { color: var(--vp-c-text-2); font-size: 13px; border-bottom: 1px dotted var(--vp-c-divider); cursor: help; }
.api-perm { display: block; margin-top: 2px; padding: 0; background: none; font-size: 11.5px; color: var(--vp-c-text-3); }

.api-detail td { padding: 0 0 12px 10px; }
.api-detail p { margin: 0 0 6px; color: var(--vp-c-text-2); font-size: 14px; line-height: 1.6; }
.api-nodesc { color: var(--vp-c-text-3); font-style: italic; }
.api-oid { padding: 0; background: none; font-size: 11.5px; color: var(--vp-c-text-3); }

@media (max-width: 620px) {
  .api-table thead { display: none; }
  .api-table tr { display: block; }
  .api-table td { display: block; }
  .api-req { padding: 0 0 8px 10px; white-space: normal; }
}
</style>
