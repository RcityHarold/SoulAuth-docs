<script setup lang="ts">
// 三张 Canonical Figure 的统一渲染。
//
// 存在的理由是 base 前缀：VitePress 会自动给 <img src> 加上 base，但不会
// 给 <a href> 加。直接手写 HTML 的话，图能显示，点开却 404 —— 而且只在
// 部署到子路径（GitHub Pages 项目页）时才 404，本地 dev 一切正常。
// 所以两处都过 withBase()，不留一处靠手写。
import { withBase } from 'vitepress'

defineProps<{
  src: string
  alt: string
  title: string
  caption?: string
}>()
</script>

<template>
  <figure class="figure">
    <a :href="withBase(src)" target="_blank" rel="noopener">
      <img :src="withBase(src)" :alt="alt" />
    </a>
    <figcaption>
      <strong>{{ title }}</strong><template v-if="caption"> — {{ caption }}</template>
    </figcaption>
  </figure>
</template>
