---
layout: home

hero:
  name: SoulAuth
  text: 为「必须说清是谁动的手」的系统提供身份
  tagline: >-
    用 Rust 写的 OpenID Connect 提供方。注册、会话、MFA、RBAC
    与可追溯的审计轨迹 —— 一个二进制，一个数据库。
  image:
    src: /logo.svg
    alt: SoulAuth
  actions:
    - theme: brand
      text: 快速开始
      link: /zh/guide/quickstart
    - theme: alt
      text: SoulAuth 是什么？
      link: /zh/guide/what-is-soulauth
    - theme: alt
      text: GitHub
      link: https://github.com/RcityHarold/SoulAuth

features:
  - icon: 🔐
    title: 一个真正的 OIDC 提供方
    details: >-
      授权码流程，公开客户端强制 PKCE；RS256 签名的 ID Token 经 JWKS 发布；
      刷新令牌轮换并检测重放；发现文档可直接对接任何合规客户端。
    link: /zh/integrate/auth-code-flow
    linkText: 看流程
  - icon: 🧩
    title: 该有的都有，不是半成品
    details: >-
      邮箱密码、Google 与 GitHub 登录、带重放防护的 TOTP 双因素、密码重置、
      会话列表与吊销。八个模块 74 个端点 —— 不是一个要你自己补完的框架。
    link: /zh/reference/api
    linkText: 浏览 API
  - icon: 🛡️
    title: 按「输入是敌意的」来写
    details: >-
      按路由限流、可调可解的账号与 IP 锁定、Argon2 密码哈希、加密存储的 TOTP
      密钥，以及在 OIDC 通路上同样生效的账号状态校验 —— 不只在登录那一下。
    link: /zh/guide/security-model
    linkText: 读安全模型
  - icon: 🧾
    title: 审计是结构，不是附加
    details: >-
      每一个安全相关动作都会落审计，包括空操作。仪表盘、活动汇总与安全报告
      都是一等端点，不需要你去扒日志。
    link: /zh/guide/auditing
    linkText: 看审计
  - icon: 🌱
    title: Soulseed 生态的基础设施组件
    details: >-
      SoulAuth 是 SoulSeedOS P3 平面的 Identity / Authentication / Session /
      MFA / OIDC 提供方。它回答「这是谁」—— 并刻意止步于「他可以做什么」。
    link: /zh/guide/soulseed-ecosystem
    linkText: 理解这条边界
  - icon: ⚙️
    title: 第一天就能运维
    details: >-
      四个必填环境变量、配错就拒绝启动的生产闸门、报错里直接给出可粘贴修复命令的
      schema 自检，以及一份会在 CI 里真跑的部署走查 —— 文档没法悄悄烂掉。
    link: /zh/guide/deployment
    linkText: 部署它
---
