# Nexus Remote 调用示例 · 项目经费

以项目经费为场景，演示 Nexus 应用如何通过 Manifest 中的 Remote 配置调用独立部署的 Node.js 或 Java 服务。React Custom UI 提供两个入口，使用同一套费用接口。

- **项目经费（远程端点）**。通过 Remote key 从浏览器直连费用类别，通过扩展绑定的 Endpoint 查询、新增和删除费用。
- **项目经费（Resolver 查询）**。页面调用 Nexus Resolver，Resolver 再通过 Remote key 查询费用。

Manifest 还演示了如何将项目更新事件转发给 Remote 后端。

## 前置条件

环境、账号和 CLI 配置见 [环境配置指南](https://developer.pingcode.com/guide/started/setup)。

## 快速开始

本示例需要单独部署一个 Remote 后端，Node.js 和 Java 任选其一。部署后，无论选择哪个后端，都在 [manifest.yaml](manifest.yaml) 中将 `node-remote` 的 `baseUrl` 改为该后端的 HTTPS 地址，并将相同的来源（协议、主机和端口）填入 `permissions.external.fetch.client`。前端、Resolver 和事件 Endpoint 都引用 `node-remote`。实际地址须能被 Nexus 平台和浏览器访问。

- [Node.js 服务](remote-server-nodejs/README.md)
- [Java 服务](remote-server-java/README.md)

在本示例目录中执行以下命令。

```bash
nexus register <app-name>   # 仅首次运行
npm install
npm run deploy
nexus distribute -s <your-domain>.pingcode.com -e development
```

企业管理员在「应用审核」中安装后，打开项目的「项目经费（远程端点）」页面（路由 `expenses-remote`）。

相关命令见 [deploy](https://developer.pingcode.com/reference/cli/deploy)、[distribute](https://developer.pingcode.com/reference/cli/distribute) 和 [serve](https://developer.pingcode.com/reference/cli/serve)。本地启动见 [本地开发与调试](docs/local-development.md)。

## 本地调试

按 [本地开发与调试](docs/local-development.md) 配置资源端口后，`npm start` 启动 Vite 和 `nexus serve`。费用请求仍使用已部署的 Manifest 和独立部署的 Remote 后端。仅阅读代码时可以保留示例地址。运行费用功能前需替换地址并部署应用。

## 验证示例

- **项目经费（远程端点）**。类别由浏览器通过 Remote key 直连，费用增删查通过 Manifest 绑定的 Endpoint 转发。新增一笔费用后，列表会自动更新。
- **项目经费（Resolver 查询）**（路由 `expenses-function`）。页面调用 Nexus 函数，函数再通过 Remote key 查询同一账本。打开后应看到刚新增的记录。

- **项目更新事件与 API 回调**。修改测试项目名称，查看 Remote 服务日志。出现 `Nexus project event`，且包含调用 ID、项目 ID 和更新后的名称，表示项目事件已到达 Remote，后端也已通过 PingCode API 读取到项目详情。

费用保存在所选后端的内存中，重启后清空。
