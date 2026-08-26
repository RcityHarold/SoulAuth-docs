import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import Figure1 from './figures/Figure1.vue'
import Figure2 from './figures/Figure2.vue'
import Figure3 from './figures/Figure3.vue'
import Status from './status/Status.vue'
import Conformance from './status/Conformance.vue'
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

    // 状态徽章与一致性读数。
    //
    // 这两个组件把项目的诚实纪律做成**看得见的东西**：六个状态词本来只是
    // GA-07 §12 的一段定义，挂成徽章之后，读者点一下就知道「支持」这句话
    // 到底是哪一级、由哪条断言守着。未成立的部分连同原因一起摆出来，
    // 比只展示绿色更能回答「你凭什么这么说」。
    app.component('Status', Status)
    app.component('Conformance', Conformance)
  },
} satisfies Theme
