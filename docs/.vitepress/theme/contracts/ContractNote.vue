<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import { source, commitUrl } from './source'

const props = defineProps<{ file: string }>()
const { lang } = useData()
const zh = computed(() => lang.value.startsWith('zh'))
const date = computed(() => source.committedAt.slice(0, 10))
</script>

<template>
  <div class="cn">
    <template v-if="zh">
      本页内容由 <code>contracts/{{ file }}</code> 渲染，不是手写的。
      快照取自 <a :href="commitUrl()" target="_blank" rel="noreferrer"><code>{{ source.short }}</code></a>（{{ date }}）。
      契约与运行代码的一致性由 <code>tests/conformance.rs</code> 的 j1–j10 双向断言。
      <strong v-if="source.dirty" class="cn-warn">⚠ 快照取自有未提交改动的工作区。</strong>
    </template>
    <template v-else>
      This page is rendered from <code>contracts/{{ file }}</code>; none of it is
      hand-written. Snapshot taken at
      <a :href="commitUrl()" target="_blank" rel="noreferrer"><code>{{ source.short }}</code></a> ({{ date }}).
      Contract and running code are held in agreement by j1–j10 in
      <code>tests/conformance.rs</code>.
      <strong v-if="source.dirty" class="cn-warn">⚠ Snapshot taken from a dirty working tree.</strong>
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
