# nexus-project-attachments — 项目附件

项目级附件库示例（Angular Custom UI + [ngx-tethys](https://tethys.pingcode.com)）：列表上传 / 重传 / 重命名 / 下载 / 删除；按关键词搜索；列表按上传时间倒序。上传只记录账号 id，列表通过 `references.members` 返回人员资料（含头像）。演示 Nexus [Storage](https://developer.pingcode.com/reference/functions/storage)（[NOS 管理对象](https://developer.pingcode.com/reference/functions/storage/nos-objects) 经 [store.upload / store.download](https://developer.pingcode.com/reference/interface/bridge/store) + [CES](https://developer.pingcode.com/reference/functions/storage/ces)）与 [Resolver](https://developer.pingcode.com/reference/functions/core/resolver) / [invoke](https://developer.pingcode.com/reference/interface/bridge/invoke)。扩展入口：[项目 - 组件页面](https://developer.pingcode.com/reference/resource/extensions/pjm-project-page)（路由 `attachments`）。

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

然后在企业管理后台的「应用审核」中安装，并在项目组件页面打开「附件」（路由 `attachments`）。

上传一个测试文件，确认它出现在列表中，然后下载并打开下载副本。

相关命令：[deploy](https://developer.pingcode.com/reference/cli/deploy)、[distribute](https://developer.pingcode.com/reference/cli/distribute)、[serve](https://developer.pingcode.com/reference/cli/serve)。
