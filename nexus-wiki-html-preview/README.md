# nexus-wiki-html-preview — HTML 预览

在 Wiki 页面中插入 HTML 内容块：编辑弹窗左侧输入 HTML，右侧实时预览。演示 React [Custom UI](https://developer.pingcode.com/guide/development/custom-ui-with-react)。扩展入口：[页面 - 文档内容块](https://developer.pingcode.com/reference/resource/extensions/wiki-document-block)。

编辑弹窗通过 [view.submit](https://developer.pingcode.com/reference/interface/bridge/view) 写入 `config.html`。阅读态首次用 `view.getContext()`；之后每次保存宿主派发 `NEXUS_EXTENSION_DATA_CONFIG_CHANGED`（见 [events](https://developer.pingcode.com/reference/interface/bridge/events)），main 订阅后更新渲染。

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

然后在企业管理后台的「应用审核」中安装，并从 Wiki 页面的编辑菜单插入 **HTML 预览**。

输入 `<p>Hello, Nexus</p>`，检查预览效果，保存后重新打开 Wiki 页面，确认渲染的文本仍然可见。

相关命令：[deploy](https://developer.pingcode.com/reference/cli/deploy)、[distribute](https://developer.pingcode.com/reference/cli/distribute)、[serve](https://developer.pingcode.com/reference/cli/serve)。
