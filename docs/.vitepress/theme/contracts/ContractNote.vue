<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import { source, commitUrl } from './source'

// `file` 仍然接收：check-contracts 靠它确认每个渲染契约数据的页面都声明了来源，
// 页面上不再显示文件名 —— 读者需要的是「取自哪个 commit」，不是渲染管线怎么工作的。
defineProps<{ file: string }>()
const { lang } = useData()
const zh = computed(() => lang.value.startsWith('zh'))
const date = computed(() => source.committedAt.slice(0, 10))
</script>

<template>
  <div class="cn">
    <template v-if="zh">
      契约快照
      <a :href="commitUrl()" target="_blank" rel="noreferrer"><code>{{ source.short }}</code></a>
      · {{ date }}
      <strong v-if="source.dirty" class="cn-warn">⚠ 取自有未提交改动的工作区</strong>
    </template>
    <template v-else>
      Contract snapshot
      <a :href="commitUrl()" target="_blank" rel="noreferrer"><code>{{ source.short }}</code></a>
      · {{ date }}
      <strong v-if="source.dirty" class="cn-warn">⚠ taken from a dirty working tree</strong>
    </template>
  </div>
</template>

<style scoped>
.cn {
  margin: 0 0 22px;
  padding: 10px 14px;
  border-left: 3px solid var(--vp-c-brand-1);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 13.5px;
  line-height: 1.65;
}
.cn code { font-size: 12.5px; }
.cn-warn { display: block; margin-top: 4px; color: var(--vp-c-danger-1); }
</style>
