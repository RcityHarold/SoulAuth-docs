# 配置

配置**只来自进程环境变量**。启动时读工作目录下的 `.env`。没有配置文件格式、
没有远程配置、也没有运行期重载——改任何东西都意味着重启进程。

## 生产环境闸门

有两项设置，它们的默认值一旦被真实部署用上，会**悄悄摧毁已经签发的凭证**。
SoulAuth 不是告警，而是**拒绝启动**：

当 `APP_URL` 不是环回地址时，`OIDC_RSA_PRIVATE_KEY_PATH`（或 `_PEM`）与
`MFA_SECRET_ENCRYPTION_KEY` 成为必填。

[快速上手](/zh/start/quickstart)用的是 `http://localhost:8080`，属于环回地址，
所以那两项都不必配 —— 也因此那套配置不能直接拿去部署。

## `APP_URL` 与监听地址的区别

`APP_URL` 是**公开地址**。它决定：

- OIDC `issuer`——必须逐字符一致，否则每个客户端的发现校验都会失败；
- 外发邮件里链接的前缀；
- 会话 cookie 是否带 `Secure`；
- 上面那道生产闸门是否生效。

`BIND_ADDR` 才是进程实际监听的地址。任何在代理之后的部署里，这两者都不同。

## 配置项清单

<ConfigTable />

## 接下来

| | |
|---|---|
| 把一次部署做对 | [生产清单](/zh/operate/production-checklist) |
| 每项设置在防什么 | [安全模型](/zh/security/security-model) |
