# nexus-router — 应用内多页路由

一个多页面示例（侧边栏：页面一 / 页面二 / 页面三 / bridge router）。演示使用 [`@pc-nexus/react/router`](https://developer.pingcode.com/guide/development/user-interface-with-route-by-react) 的 `<BrowserRouter>` 实现应用内路由，以及通过 Bridge [`router`](https://developer.pingcode.com/reference/interface/bridge/router)（`navigate` / `open` / `generateUrl` / `reload`）跳转宿主页面。扩展入口：[全局 - 独立应用](https://developer.pingcode.com/reference/resource/extensions/global-app-hub)（React [Custom UI](https://developer.pingcode.com/guide/development/custom-ui-with-react)）。

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

然后在企业管理后台的「应用审核」中安装，并从产品主导航打开 **Router**（或访问 `/nexus/apps/{appId}/{envId}`）。

从侧边栏打开「页面一」和「页面二」，验证应用内导航。再打开「bridge router」，尝试一个宿主跳转操作，验证 Bridge 路径。

相关命令：[deploy](https://developer.pingcode.com/reference/cli/deploy)、[distribute](https://developer.pingcode.com/reference/cli/distribute)、[serve](https://developer.pingcode.com/reference/cli/serve)。
