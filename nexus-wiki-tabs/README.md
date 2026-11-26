# nexus-wiki-tabs — 标签页

在 Wiki 页面中插入标签页。扩展入口：[页面 - 文档内容块](https://developer.pingcode.com/reference/resource/extensions/wiki-document-block)（`layout: bodied`）。

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

然后在企业管理后台的「应用审核」中安装，并从 Wiki 页面的编辑菜单插入 **标签页**。

首次插入时选择或保留模板并保存，在各标签中编写正文，重新打开页面确认标题和正文仍在。再次打开配置弹窗，重命名或调整标签顺序，确认正文仍跟随着对应 id。

相关命令：[deploy](https://developer.pingcode.com/reference/cli/deploy)、[distribute](https://developer.pingcode.com/reference/cli/distribute)、[serve](https://developer.pingcode.com/reference/cli/serve)。
