# 配置

<ContractNote file="configuration.yaml" />

配置**只来自进程环境变量**。启动时读工作目录下的 `.env`。没有配置文件格式、
没有远程配置、也没有运行期重载——改任何东西都意味着重启进程。

## 生产闸门

有两项设置，它们的默认值一旦被真实部署用上，会**悄悄摧毁已经签发的凭证**。
SoulAuth 不是告警，而是**拒绝启动**：

当 `APP_URL` 不是环回地址时，`OIDC_RSA_PRIVATE_KEY_PATH`（或 `_PEM`）与
`MFA_SECRET_ENCRYPTION_KEY` 成为必填。

这就是[快速上手](/zh/start/quickstart)为什么两项都不需要——
同样也是快速上手那套配置为什么不构成一次部署。

## `APP_URL` 不是监听地址

`APP_URL` 是**公开地址**。它决定：

- OIDC `issuer`——必须逐字符一致，否则每个客户端的发现校验都会失败；
- 外发邮件里链接的前缀；
- 会话 cookie 是否带 `Secure`；
- 上面那道生产闸门是否生效。

`BIND_ADDR` 才是进程实际监听的地址。任何在代理之后的部署里，这两者都不同。

## 全部配置项

<ConfigTable />

## 接下来

| | |
|---|---|
| 把一次部署做对 | [生产清单](/zh/operate/production-checklist) |
| 每项设置在防什么 | [安全模型](/zh/security/security-model) |
