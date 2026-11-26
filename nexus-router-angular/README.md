# nexus-router-angular — Angular 路由示例

一个链接管理示例，演示 Angular Custom UI 中的 [`@pc-nexus/angular/router`](https://developer.pingcode.com/guide/development/user-interface-with-route-by-angular) 应用内路由，以及 Bridge [`router`](https://developer.pingcode.com/reference/interface/bridge/router) 跳转宿主页面。功能和 UI 对齐 `nexus-router`。扩展入口：[全局 - 独立应用](https://developer.pingcode.com/reference/resource/extensions/global-app-hub)。

## 前置条件

参见 [入门指南](https://developer.pingcode.com/guide/started/setup)。

## 快速开始

参见 [CLI 文档](https://developer.pingcode.com/reference/cli/overview)。

在本示例目录中执行以下命令。

```bash
nexus register nexus-router-angular   # 仅首次运行
npm install
npm run deploy
nexus distribute -s <your-domain>.pingcode.com -e development
```

然后在企业管理后台的「应用审核」中安装，并从产品主导航打开 **Router**。

相关命令：[deploy](https://developer.pingcode.com/reference/cli/deploy)、[distribute](https://developer.pingcode.com/reference/cli/distribute)、[serve](https://developer.pingcode.com/reference/cli/serve)。
