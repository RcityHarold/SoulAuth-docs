<script setup lang="ts">
// Figure 2 · WHO —— 谁是 Actor。
//
// 相对位图版补上的两处：
//   1. Soulseed Canonical Actor 不再用一条虚线直连 ActorIdentity，而是明确
//      经过 IdentityBinding —— 语料 06 §4 / 08 §6 要求的就是这个对象。
//   2. 四条 Canonical Invariant 直接画在图里，而不是只留在旁注。
import { fig2 } from './strings'
import Box from './Box.vue'
const props = defineProps<{ locale: 'en' | 'zh' }>()
const t = fig2[props.locale]
</script>

<template>
  <figure class="figure">
    <div class="dg dg-plate">
      <div class="dg-col">
        <!-- 两种 Actor Kind 汇入同一个身份根 -->
        <div class="dg-row">
          <Box :n="t.human" />
          <Box :n="t.aiactor" />
        </div>
        <div class="dg-down"></div>

        <Box :n="t.actorIdentity" variant="accent" />
        <div class="dg-down"></div>

        <!-- 只有 Credential 在认证路径上。HumanAccount 与 IdentityBinding 是
             围绕身份根的周边对象，不喂给 Authentication Core —— 所以它们不进
             这条竖向主链，另起一组放在下面。 -->
        <div class="dg-row">
          <Box :n="t.humanCredential" />
          <Box :n="t.aiCredential" />
        </div>
        <div class="dg-down"></div>

        <div class="dg-group">
          <header><b>{{ t.core.name }}</b><span>{{ t.core.sub }}</span></header>
          <div class="dg-row">
            <Box v-for="it in t.core.items" :key="it.name" :n="it" />
          </div>
        </div>
        <div class="dg-down"></div>

        <Box :n="t.output" variant="green" />
        <div class="dg-down"></div>
        <div class="dg-row">
          <Box :n="t.anyapp" variant="plain" />
          <Box :n="t.soulseedOS" variant="plain" />
        </div>

        <!-- 围绕 ActorIdentity 的周边对象，以及跨域关系必须经过的 IdentityBinding -->
        <div class="dg-group" style="margin-top: 4px">
          <header><b>{{ t.around.name }}</b><span>{{ t.around.sub }}</span></header>
          <!-- 拆两行：四个盒子挤一行会把 IdentityBinding 这类长词折得很难看 -->
          <div class="dg-row">
            <Box :n="t.humanAccount" variant="plain" />
          </div>
          <div class="dg-row dg-row--center" style="margin-top: 10px">
            <Box :n="t.actorIdentity2" variant="dashed" />
            <div class="dg-side dg-side--dashed"><i></i></div>
            <Box :n="t.identityBinding" variant="dashed" />
            <div class="dg-side dg-side--dashed"><i></i></div>
            <Box :n="t.soulseedActor" variant="dashed" />
          </div>
          <p class="dg-aside" style="margin-top: 8px">{{ t.bindingOptional }}</p>
        </div>

        <div class="dg-neq">
          <code v-for="x in t.neq" :key="x">{{ x }}</code>
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
