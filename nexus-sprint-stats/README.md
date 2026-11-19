# nexus-sprint-stats — 迭代统计

一个带指标卡片和工作项完成表格的迭代详情页。演示 Nexus [Resolver](https://developer.pingcode.com/reference/functions/core/resolver) 和通过 [`api.invoke`](https://developer.pingcode.com/guide/development/network-calling-apis-from-backend) 调用 [PingCode REST API](https://developer.pingcode.com/restapi/pingcode/overview)。扩展入口：[迭代页面](https://developer.pingcode.com/reference/resource/extensions/pjm-sprint-page)。

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

然后在企业管理后台的「应用审核」中安装，打开迭代详情页即可查看「迭代统计」页面。

打开一个含工作项的迭代，将页面显示的统计数字与该迭代的工作项核对。

相关命令：[deploy](https://developer.pingcode.com/reference/cli/deploy)、[distribute](https://developer.pingcode.com/reference/cli/distribute)、[serve](https://developer.pingcode.com/reference/cli/serve)。
