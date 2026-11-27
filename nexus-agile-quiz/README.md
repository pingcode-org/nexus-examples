# nexus-agile-quiz — 敏捷开发问答

一个单页敏捷开发问答示例（Scrum / Kanban / 实践）。演示 Nexus [i18n](https://developer.pingcode.com/guide/advanced/translations)、返回结果评价的 [Resolver](https://developer.pingcode.com/reference/functions/core/resolver)，以及通过 [invoke](https://developer.pingcode.com/reference/interface/bridge/invoke) 加载评价。扩展入口：[项目 - 首页导航](https://developer.pingcode.com/reference/resource/extensions/pjm-project-hub)。

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

然后在企业管理后台的「应用审核」中安装，并从项目首页导航打开「敏捷开发问答」（页面 `agile-quiz`）。

回答问题后打开结果，选择「查看评价」加载评价。将宿主语言在中英文之间切换，再重新打开页面，检查标题、题目内容和评价是否已翻译。

相关命令：[deploy](https://developer.pingcode.com/reference/cli/deploy)、[distribute](https://developer.pingcode.com/reference/cli/distribute)、[serve](https://developer.pingcode.com/reference/cli/serve)。
