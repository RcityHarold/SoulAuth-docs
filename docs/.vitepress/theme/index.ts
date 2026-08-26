import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import Figure from './Figure.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('Figure', Figure)
  },
} satisfies Theme
