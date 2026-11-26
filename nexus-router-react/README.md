# nexus-router — 应用内多页路由

一个简洁的链接管理应用，演示 [`@pc-nexus/react/router`](https://developer.pingcode.com/guide/development/user-interface-with-route-by-react) 的 `<BrowserRouter>` 应用内路由，以及 Bridge [`router`](https://developer.pingcode.com/reference/interface/bridge/router)（`navigate` / `open`）跳转宿主页面。扩展入口：[全局 - 独立应用](https://developer.pingcode.com/reference/resource/extensions/global-app-hub)（React [Custom UI](https://developer.pingcode.com/guide/development/custom-ui-with-react)）。

## 功能

- **最近访问** `/recent` — 卡片展示最近打开的链接，点击卡片可再次打开，最新的排在前面。
- **全部链接** `/links` — 表格展示所有链接，页面顶部为标题与 Tips 提示行，「新建链接」按钮位于 Tips 右侧；点击名称打开链接，按每条链接的「新窗口」设置自动调用 `router.open` 或 `router.navigate`；可编辑、删除。
- **新建链接** `/links/new` — 填写名称、链接地址，用开关设置是否在新窗口打开。
- **编辑链接** `/links/:id` — 通过路径参数定位链接（`useParams()`），修改字段并保存。
- 侧栏 `NavLink` 高亮当前页；根路径与未知路径重定向到「最近访问」。

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

验证：新建一条链接并打开「新窗口」开关，在全部链接表格点击名称确认在新标签打开；再新建一条不打开的链接，确认在当前标签跳转；打开过的链接出现在「最近访问」表格；编辑链接后返回列表看到更新；切换侧栏菜单观察高亮和地址栏变化。

相关命令：[deploy](https://developer.pingcode.com/reference/cli/deploy)、[distribute](https://developer.pingcode.com/reference/cli/distribute)、[serve](https://developer.pingcode.com/reference/cli/serve)。
