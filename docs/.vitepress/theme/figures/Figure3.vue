<script setup lang="ts">
// Figure 3 · HOW —— SoulAuth 内部有哪些长期稳定的 Logical Responsibilities。
import { fig3 } from './strings'
import Box from './Box.vue'
const props = defineProps<{ locale: 'en' | 'zh' }>()
const t = fig3[props.locale]
const planeVariant = ['purple', 'red', 'amber']
</script>

<template>
  <figure class="figure">
    <div class="dg dg-plate">
      <div class="dg-col">
        <div class="dg-row">
          <Box v-for="c in t.clients" :key="c.name" :n="c" variant="plain" />
        </div>
        <div class="dg-down"></div>
        <Box :n="t.edge" />
        <div class="dg-down"></div>

        <!-- 主责任链在左，三个横切平面在右 -->
        <div class="dg-row" style="align-items: flex-start">
          <div class="dg-group" style="flex: 1 1 64%">
            <header><b>{{ t.core.name }}</b></header>
            <div class="dg-col">
              <div class="dg-group" style="background: #fff">
                <header><b>{{ t.identityDomain.name }}</b></header>
                <div class="dg-col">
                  <Box :n="t.actorIdentity" variant="accent" />
                  <div class="dg-row">
                    <Box :n="t.humanAccount" variant="plain" />
                    <Box :n="t.identityBinding" variant="plain" />
                    <Box :n="t.credential" variant="plain" />
                  </div>
                </div>
              </div>
              <div class="dg-down"></div>
              <Box :n="t.authCore" />
              <div class="dg-down"></div>
              <Box :n="t.authSession" />
              <div class="dg-down"></div>
              <Box :n="t.tokenFed" />
              <div class="dg-down"></div>
              <Box :n="t.output" variant="green" />
            </div>
          </div>

          <div class="dg-col" style="flex: 1 1 36%">
            <div
              v-for="(p, i) in t.planes"
              :key="p.name"
              class="dg-plane"
              :class="`dg-plane--${planeVariant[i]}`"
            >
              <b>{{ p.name }}</b>
              <ul>
                <li v-for="it in p.items" :key="it.name">
                  <b>{{ it.name }}</b><template v-if="it.sub"> · {{ it.sub }}</template>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="dg-down"></div>
        <div class="dg-row">
          <Box :n="t.anyapp" variant="plain" />
          <Box :n="t.soulseedOS" variant="plain" />
        </div>

        <div class="dg-group" style="margin-top: 10px">
          <header><b>{{ t.persistence.name }}</b><span>{{ t.persistence.sub }}</span></header>
          <div class="dg-neq">
            <code v-for="s in t.stores" :key="s.name">{{ s.name }}</code>
          </div>
          <div class="dg-neq" style="margin-top: 8px">
            <code v-for="s in t.infra" :key="s.name">{{ s.name }}</code>
          </div>
        </div>

        <div class="dg-neq">
          <code v-for="x in t.neq" :key="x">{{ x }}</code>
        </div>
      </div>
    </div>
    <figcaption><strong>{{ t.title }}</strong> — {{ t.caption }}</figcaption>
  </figure>
</template>
