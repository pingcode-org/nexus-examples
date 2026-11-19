# nexus-hello-world-react-native-ui — Hello World

一个单页 Hello World 示例，演示 React [Native UI](https://developer.pingcode.com/guide/development/native-ui-with-react)。扩展入口：[项目 - 组件页面](https://developer.pingcode.com/reference/resource/extensions/pjm-project-page)。

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

然后在企业管理后台的「应用审核」中安装，并在项目组件页面打开 **Hello World**（路由 `hello-world`）。页面应显示 `greeting` Resolver 返回的 `Hello, Nexus`。

相关命令：[deploy](https://developer.pingcode.com/reference/cli/deploy)、[distribute](https://developer.pingcode.com/reference/cli/distribute)、[serve](https://developer.pingcode.com/reference/cli/serve)。
