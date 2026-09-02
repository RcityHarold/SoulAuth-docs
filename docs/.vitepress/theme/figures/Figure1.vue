<script setup lang="ts">
// Figure 1 —— 渲染位图原稿。
//
// 这三张图曾经用 Vue 盒子逐个画出来（`Box.vue` + `diagram.css`），
// 目的是让中英两版从同一份 `strings.ts` 生成，「某个语言版本更薄」在结构上
// 不可能发生。现在改回位图：设计侧按 `figures/CHANGES.md` 的规格重绘了六张，
// 版式与信息密度都不是 flex 盒子排得出来的。
//
// 代价说清楚：中英对等不再由结构保证，只能靠人核。`check:figures` 仍然守着
// locale 用对、没有第四张核心图，以及**两个 locale 的图片文件都存在**。
//
// 标题与图注仍从 `strings.ts` 取 —— 那部分是文字，没有理由烧进像素里，
// 烧进去就搜不到、翻译不了、也无法被引用守卫检查。
import { fig1 } from './strings'
import { withBase } from 'vitepress'
const props = defineProps<{ locale: 'en' | 'zh' }>()
const t = fig1[props.locale]
const src = withBase(`/figures/figure-1-soulseed-agi-infrastructure.${props.locale}.png`)
</script>

<template>
  <figure class="figure">
    <img :src="src" :alt="t.title" loading="lazy" decoding="async" />
    <figcaption><strong>{{ t.title }}</strong> — {{ t.caption }}</figcaption>
  </figure>
</template>
