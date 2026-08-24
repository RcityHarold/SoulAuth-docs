import { defineConfig } from 'vitepress'

// 部署到 GitHub Pages 的项目页时，base 必须是 `/<repo>/`。
// 换成自定义域名或根路径部署时，把它改成 '/'。
const base = process.env.DOCS_BASE ?? '/SoulAuth-docs/'

const REPO = 'https://github.com/RcityHarold/SoulAuth'

export default defineConfig({
  base,
  title: 'SoulAuth',
  description:
    'An OpenID Connect provider in Rust — identity, sessions, MFA and audit for the Soulseed stack.',
  lastUpdated: true,
  cleanUrls: true,
  ignoreDeadLinks: false,

  head: [
    ['meta', { name: 'theme-color', content: '#5b7cfa' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'SoulAuth' }],
    [
      'meta',
      {
        property: 'og:description',
        content:
          'An OpenID Connect provider in Rust — identity, sessions, MFA and audit for the Soulseed stack.',
      },
    ],
  ],

  // 英文是主版本，落在根路径上；中文在 /zh/ 下。
  locales: {
    root: { label: 'English', lang: 'en-US', link: '/' },
    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      link: '/zh/',
      description: '一个用 Rust 写的 OpenID Connect 提供方 —— 为 Soulseed 技术栈提供身份、会话、MFA 与审计。',
      themeConfig: {
        nav: [
          { text: '指南', link: '/zh/guide/what-is-soulauth', activeMatch: '/zh/guide/' },
          { text: '接入', link: '/zh/integrate/', activeMatch: '/zh/integrate/' },
          { text: '参考', link: '/zh/reference/api', activeMatch: '/zh/reference/' },
        ],
        sidebar: {
          '/zh/guide/': [
            {
              text: '介绍',
              items: [
                { text: 'SoulAuth 是什么', link: '/zh/guide/what-is-soulauth' },
                { text: '在 Soulseed 生态里的位置', link: '/zh/guide/soulseed-ecosystem' },
                { text: '架构', link: '/zh/guide/architecture' },
              ],
            },
            {
              text: '上手',
              items: [
                { text: '快速开始', link: '/zh/guide/quickstart' },
                { text: '配置', link: '/zh/guide/configuration' },
                { text: '部署', link: '/zh/guide/deployment' },
              ],
            },
            {
              text: '运维',
              items: [
                { text: '安全模型', link: '/zh/guide/security-model' },
                { text: '暴力破解防护', link: '/zh/guide/lockout' },
                { text: '审计', link: '/zh/guide/auditing' },
              ],
            },
          ],
          '/zh/integrate/': [
            {
              text: '接入',
              items: [
                { text: '选择接入方式', link: '/zh/integrate/' },
                { text: '注册客户端', link: '/zh/integrate/clients' },
                { text: '授权码流程', link: '/zh/integrate/auth-code-flow' },
                { text: 'BFF 模式', link: '/zh/integrate/bff' },
                { text: '验证 ID Token', link: '/zh/integrate/verifying-tokens' },
              ],
            },
            {
              text: 'Soulseed',
              items: [{ text: 'SoulSeedOS 适配器', link: '/zh/integrate/soulseedos' }],
            },
          ],
          '/zh/reference/': [
            {
              text: 'HTTP API',
              items: [
                { text: '通用约定', link: '/zh/reference/api' },
                { text: '认证', link: '/zh/reference/auth' },
                { text: '用户与档案', link: '/zh/reference/users' },
                { text: 'RBAC', link: '/zh/reference/rbac' },
                { text: 'OIDC', link: '/zh/reference/oidc' },
                { text: '安全', link: '/zh/reference/security' },
                { text: '审计', link: '/zh/reference/audit' },
              ],
            },
            {
              text: '附录',
              items: [
                { text: '环境变量', link: '/zh/reference/environment' },
                { text: '错误', link: '/zh/reference/errors' },
                { text: '权限', link: '/zh/reference/permissions' },
              ],
            },
          ],
        },
        editLink: {
          pattern: 'https://github.com/RcityHarold/SoulAuth-docs/edit/main/docs/:path',
          text: '在 GitHub 上编辑此页',
        },
        docFooter: { prev: '上一页', next: '下一页' },
        outline: { level: [2, 3], label: '本页目录' },
        lastUpdatedText: '最后更新',
        returnToTopLabel: '回到顶部',
        sidebarMenuLabel: '菜单',
        darkModeSwitchLabel: '主题',
        lightModeSwitchTitle: '切换到浅色模式',
        darkModeSwitchTitle: '切换到深色模式',
        langMenuLabel: '切换语言',
        footer: {
          message: '基于 Apache-2.0 许可发布。',
          copyright: 'Copyright © 2026 The SoulAuth Authors',
        },
      },
    },
  },

  themeConfig: {
    logo: { src: '/logo.svg', alt: 'SoulAuth' },
    socialLinks: [{ icon: 'github', link: REPO }],
    search: {
      provider: 'local',
      options: {
        locales: {
          zh: {
            translations: {
              button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
              modal: {
                displayDetails: '显示详情',
                resetButtonTitle: '清除',
                backButtonTitle: '返回',
                noResultsText: '没有找到结果',
                footer: {
                  selectText: '选择',
                  selectKeyAriaLabel: '回车',
                  navigateText: '切换',
                  navigateUpKeyAriaLabel: '上箭头',
                  navigateDownKeyAriaLabel: '下箭头',
                  closeText: '关闭',
                  closeKeyAriaLabel: 'esc',
                },
              },
            },
          },
        },
      },
    },
    outline: { level: [2, 3] },

    nav: [
      { text: 'Guide', link: '/guide/what-is-soulauth', activeMatch: '/guide/' },
      { text: 'Integrate', link: '/integrate/', activeMatch: '/integrate/' },
      { text: 'Reference', link: '/reference/api', activeMatch: '/reference/' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is SoulAuth', link: '/guide/what-is-soulauth' },
            { text: 'Actor Identity Model', link: '/guide/actor-identity-model' },
            { text: 'Identity vs Authority', link: '/guide/identity-vs-authority' },
            { text: 'Role in the Soulseed Ecosystem', link: '/guide/soulseed-ecosystem' },
            { text: 'Architecture', link: '/guide/architecture' },
          ],
        },
        {
          text: 'Getting Started',
          items: [
            { text: 'Quickstart', link: '/guide/quickstart' },
            { text: 'Configuration', link: '/guide/configuration' },
            { text: 'Deployment', link: '/guide/deployment' },
          ],
        },
        {
          text: 'Operating SoulAuth',
          items: [
            { text: 'Security Model', link: '/guide/security-model' },
            { text: 'Brute-force Protection', link: '/guide/lockout' },
            { text: 'Auditing', link: '/guide/auditing' },
          ],
        },
      ],
      '/integrate/': [
        {
          text: 'Integration',
          items: [
            { text: 'Choosing a Path', link: '/integrate/' },
            { text: 'Registering a Client', link: '/integrate/clients' },
            { text: 'The Authorization Code Flow', link: '/integrate/auth-code-flow' },
            { text: 'The BFF Pattern', link: '/integrate/bff' },
            { text: 'Verifying ID Tokens', link: '/integrate/verifying-tokens' },
          ],
        },
        {
          text: 'Soulseed',
          items: [{ text: 'SoulSeedOS Adapter', link: '/integrate/soulseedos' }],
        },
      ],
      '/reference/': [
        {
          text: 'HTTP API',
          items: [
            { text: 'Conventions', link: '/reference/api' },
            { text: 'Authentication', link: '/reference/auth' },
            { text: 'Users & Profiles', link: '/reference/users' },
            { text: 'RBAC', link: '/reference/rbac' },
            { text: 'OIDC', link: '/reference/oidc' },
            { text: 'Security', link: '/reference/security' },
            { text: 'Audit', link: '/reference/audit' },
          ],
        },
        {
          text: 'Appendix',
          items: [
            { text: 'Environment Variables', link: '/reference/environment' },
            { text: 'Errors', link: '/reference/errors' },
            { text: 'Permissions', link: '/reference/permissions' },
          ],
        },
      ],
    },

    editLink: {
      pattern: 'https://github.com/RcityHarold/SoulAuth-docs/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },

    footer: {
      message: 'Released under the Apache-2.0 License.',
      copyright: 'Copyright © 2026 The SoulAuth Authors',
    },
  },
})
