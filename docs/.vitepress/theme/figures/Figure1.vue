<script setup lang="ts">
// Figure 1 · WHERE —— SoulAuth 在更大的系统中处于什么位置。
import { fig1 } from './strings'
import Box from './Box.vue'
const props = defineProps<{ locale: 'en' | 'zh' }>()
const t = fig1[props.locale]
</script>

<template>
  <figure class="figure">
    <div class="dg dg-plate">
      <div class="dg-col">
        <div class="dg-row dg-row--center">
          <div class="dg-narrow" style="flex: 0 1 340px; margin: 0 auto">
            <Box :n="t.llm" variant="plain" />
          </div>
        </div>
        <div class="dg-down"><label>{{ t.intelligence }}</label></div>

        <!-- Mind OS：私有的四层里的前三层 -->
        <div class="dg-row">
          <div class="dg-group" style="flex: 1 1 62%">
            <header><b>{{ t.mindos.name }}</b><span>{{ t.mindos.sub }}</span></header>
            <div class="dg-col">
              <Box :n="t.agi" />
              <div class="dg-updown"><i></i></div>
              <Box :n="t.os" />
              <div class="dg-updown"><i></i></div>
              <Box :n="t.apps" />
            </div>
          </div>

          <!-- SoulAuth 与 SoulseedOS 平级并列，不在 Mind OS 盒子里 -->
          <div class="dg-side"><i></i></div>
          <!-- flex:0 0 auto 而不是默认的 1 1 auto：否则这两个盒子会被拉到
               和左边 Mind OS 一样高，中间大片空白 -->
          <div class="dg-col dg-col--center" style="flex: 1 1 38%">
            <Box :n="t.soulauth" class="dg-fixed" />
            <div class="dg-updown"><i></i></div>
            <Box :n="t.anyapp" variant="plain" class="dg-fixed" />
          </div>
        </div>

        <div class="dg-down"><label>{{ t.bridge.name }} · {{ t.bridge.sub }}</label></div>
        <div class="dg-box dg-box--amber">
          <b>{{ t.pri.name }}</b>
          <span>{{ t.pri.sub }}</span>
          <div class="dg-neq" style="margin-top: 8px">
            <code v-for="i in t.pri.items" :key="i">{{ i }}</code>
          </div>
        </div>

        <div class="dg-notes">
          <div v-for="(nb, i) in t.notes" :key="nb.title">
            <b :data-n="i + 1">{{ nb.title }}</b>
            <p>{{ nb.body }}</p>
          </div>
        </div>
      </div>
    </div>
    <figcaption><strong>{{ t.title }}</strong> — {{ t.caption }}</figcaption>
  </figure>
</template>
