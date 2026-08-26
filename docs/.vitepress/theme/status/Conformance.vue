<script setup lang="ts">
import { computed, ref } from 'vue'
import { useData } from 'vitepress'
import { GATES, OPEN_ITEMS, CAPTURED_AT, COMMIT } from './conformance-data'

const { lang } = useData()
const loc = computed<'en' | 'zh'>(() => (lang.value.startsWith('zh') ? 'zh' : 'en'))
const showOpen = ref(false)

// 只累加「计数型」的门。把编译门的 0 加进来不改变数值，但会让人以为
// 这个总数覆盖了所有四行 —— 它没有。
const totalPassed = computed(() =>
  GATES.filter((g) => g.kind === 'count').reduce((n, g) => n + g.passed, 0),
)
const totalFailed = computed(() => GATES.reduce((n, g) => n + g.failed, 0))

const t = {
  en: {
    heading: 'Conformance readout',
    sub: `Captured from a real run at commit ${COMMIT} on ${CAPTURED_AT}.`,
    passed: 'passed',
    failed: 'failed',
    skipped: 'not yet true',
    clean: 'clean',
    dirty: 'not clean',
    openToggle: (n: number) => `${n} invariants asserted but not yet true — show`,
    openHide: 'hide',
    openLead:
      'These are not failures. The assertion is written and runnable; the current implementation does not satisfy it, so it carries an explicit marker naming why. Most are internal structure an integrator never touches — the ones that could affect you say so.',
    reproduce: 'Reproduce it yourself',
  },
  zh: {
    heading: '一致性读数',
    sub: `取自 ${CAPTURED_AT} 在 ${COMMIT} 上的真实运行。`,
    passed: '通过',
    failed: '失败',
    skipped: '尚未成立',
    clean: '干净',
    dirty: '不干净',
    openToggle: (n: number) => `${n} 条已写好但尚未成立的不变式 — 展开`,
    openHide: '收起',
    openLead:
      '它们**不是失败**。断言写好了、能跑，只是当前实现还达不到，所以带着一个写明原因的显式标记。绝大多数是接入方碰不到的内部结构；可能影响到你的那几条，说明里点了名。',
    reproduce: '自己跑一遍',
  },
}
const s = computed(() => t[loc.value])
</script>

<template>
  <section class="cf">
    <header class="cf-head">
      <h3>{{ s.heading }}</h3>
      <p class="cf-sub">{{ s.sub }}</p>
    </header>

    <div class="cf-total">
      <strong>{{ totalPassed }}</strong> {{ s.passed }}
      <span class="cf-sep">·</span>
      <strong :class="{ 'cf-red': totalFailed > 0 }">{{ totalFailed }}</strong> {{ s.failed }}
    </div>

    <!-- 表格在窄屏必须自己横向滚，不能让 body 横滚 -->
    <div class="cf-scroll">
      <table class="cf-table">
        <tbody>
          <tr v-for="g in GATES" :key="g.id">
            <td class="cf-cmd"><code>{{ g.command }}</code></td>
            <td class="cf-num">
              <template v-if="g.kind === 'clean'">
                <span :class="g.failed ? 'cf-red' : 'cf-ok'">{{ g.failed ? s.dirty : s.clean }}</span>
              </template>
              <template v-else>
                <span class="cf-ok">{{ g.passed }}</span>
                <span v-if="g.failed" class="cf-red"> / {{ g.failed }} {{ s.failed }}</span>
                <span v-if="g.ignored" class="cf-dim"> / {{ g.ignored }} {{ s.skipped }}</span>
              </template>
            </td>
            <td class="cf-note">{{ g.note[loc] }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <button class="cf-toggle" type="button" @click="showOpen = !showOpen">
      {{ showOpen ? s.openHide : s.openToggle(OPEN_ITEMS.length) }}
    </button>

    <div v-if="showOpen" class="cf-open">
      <p class="cf-lead">{{ s.openLead }}</p>
      <dl>
        <template v-for="item in OPEN_ITEMS" :key="item.test">
          <dt><code>{{ item.test }}</code></dt>
          <dd>{{ item.reason[loc] }}</dd>
        </template>
      </dl>
    </div>
  </section>
</template>

<style scoped>
.cf {
  margin: 24px 0;
  padding: 18px 20px 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
}
.cf-head h3 { margin: 0; font-size: 16px; border: 0; padding: 0; }
.cf-sub { margin: 2px 0 0; color: var(--vp-c-text-3); font-size: 13px; }

.cf-total {
  margin: 12px 0 14px;
  font-size: 22px;
  line-height: 1.2;
  color: var(--vp-c-text-2);
}
.cf-total strong { color: var(--vp-c-text-1); font-variant-numeric: tabular-nums; }
.cf-sep { margin: 0 8px; color: var(--vp-c-divider); }

.cf-scroll { overflow-x: auto; }
.cf-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.cf-table td {
  padding: 7px 10px 7px 0;
  border-top: 1px solid var(--vp-c-divider);
  vertical-align: top;
}
.cf-cmd { white-space: nowrap; }
.cf-cmd code { font-size: 12.5px; }
.cf-num { white-space: nowrap; font-variant-numeric: tabular-nums; }
.cf-note { color: var(--vp-c-text-2); min-width: 18ch; }

.cf-ok  { color: var(--vp-c-green-1); font-weight: 600; }
.cf-red { color: var(--vp-c-danger-1); font-weight: 600; }
.cf-dim { color: var(--vp-c-text-3); }

.cf-toggle {
  margin-top: 14px;
  padding: 0;
  border: 0;
  background: none;
  color: var(--vp-c-brand-1);
  font-size: 14px;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.cf-open { margin-top: 12px; }
.cf-lead {
  margin: 0 0 12px;
  color: var(--vp-c-text-2);
  font-size: 14px;
  line-height: 1.65;
}
.cf-open dl { margin: 0; }
.cf-open dt { margin-top: 10px; }
.cf-open dt code { font-size: 12.5px; }
.cf-open dd {
  margin: 3px 0 0;
  padding-left: 14px;
  border-left: 2px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  font-size: 14px;
  line-height: 1.6;
}

/* 窄屏把命令与数字叠起来 —— 三列在手机上会挤成一坨。 */
@media (max-width: 620px) {
  .cf-table, .cf-table tbody, .cf-table tr, .cf-table td { display: block; }
  .cf-table td { border-top: 0; padding: 2px 0; }
  .cf-table tr { padding: 10px 0; border-top: 1px solid var(--vp-c-divider); }
  .cf-cmd { white-space: normal; }
}
</style>
