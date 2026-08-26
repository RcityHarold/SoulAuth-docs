import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import Figure1 from './figures/Figure1.vue'
import Figure2 from './figures/Figure2.vue'
import Figure3 from './figures/Figure3.vue'
import './custom.css'
import './figures/diagram.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // 三张 Canonical Figure。只有这三张 —— 语料《Final Refinement
    // Constitution》§18 把公共核心图锁死为 WHERE / WHO / HOW 三张，
    // 其余图必须是局部解释图，不得冒充 Canonical Architecture Figure。
    app.component('Figure1', Figure1)
    app.component('Figure2', Figure2)
    app.component('Figure3', Figure3)
  },
} satisfies Theme
