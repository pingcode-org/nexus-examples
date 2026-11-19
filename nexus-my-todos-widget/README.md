# nexus-my-todos-widget — 我的待办

一个 PingCode 仪表盘上的个人待办列表示例，演示通过 Resolver 和 CES 持久化待办数据。查看模式下，每次新增、勾选和删除都会通过 `save` Resolver 立即保存（[CES](https://developer.pingcode.com/reference/functions/storage/ces) 实体 `todos`），并按部件配置显示：显示条数（`10` / `20` / `50`）以及是否显示已完成项。编辑模式只设置该配置，点击「确定」即调用 [`view.submit()`](https://developer.pingcode.com/reference/interface/bridge/view)。扩展入口：[工作台 - 仪表盘部件](https://developer.pingcode.com/reference/resource/extensions/global-dashboard-widget)。

## 前置条件

参见 [入门指南](https://developer.pingcode.com/guide/started/setup)。

## 快速开始

参见 [CLI 文档](https://developer.pingcode.com/reference/cli/overview)。

在本示例目录中执行以下命令。

```bash
nexus register <app-name>   # 仅首次运行
npm install
npm run deploy
nexus distribute -s <your-domain>.pingcode.com -e development
```

然后在企业管理后台的「应用审核」中安装，并在仪表盘上添加「我的待办」部件。

添加一条测试待办，重新加载仪表盘，确认待办仍在列表中。

相关命令：[deploy](https://developer.pingcode.com/reference/cli/deploy)、[distribute](https://developer.pingcode.com/reference/cli/distribute)、[serve](https://developer.pingcode.com/reference/cli/serve)。
