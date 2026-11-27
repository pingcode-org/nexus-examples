# nexus-workitem-live-viewer — 查看者列表

同一工作项被多人打开时，互相出现在查看者列表里。演示 Nexus [realtime](https://developer.pingcode.com/reference/interface/bridge/realtime)。扩展入口：[工作项 - 详情后台脚本](https://developer.pingcode.com/reference/resource/extensions/pjm-workitem-background)与[工作项 - 详情上下文](https://developer.pingcode.com/reference/resource/extensions/pjm-workitem-context)。

打开工作项详情时 background 即开始心跳上报；右侧属性 **Live Viewer** 横排显示当前查看者。姓名和头像来自 [api.invoke](https://developer.pingcode.com/reference/functions/network/api) 拉取的目录用户信息，用 [thy-avatar](https://tethys.pingcode.com/components/avatar) 渲染。每个标签页有独立 `sessionId`；离开时按该 id 发 `leave`（[view.onClose](https://developer.pingcode.com/reference/interface/bridge/view) 仅 Dialog 可用），未送达则约 15 秒心跳超时后消失。

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

然后在企业管理后台的「应用审核」中安装，并打开一个工作项详情页；右侧属性栏会出现 **Live Viewer**。

验证方法：用两个测试账号打开同一个工作项。保持两个详情页都打开，检查每个账号都能在 **Live Viewer** 中看到对方。关闭其中一个页面，检查其查看者条目是否在约 15 秒内消失。多标签页检查：用同一账号打开该工作项两次并关闭其中一个标签页，另一个标签页仍打开时该账号应保持可见。两个扩展绑定见 [manifest.yaml](./manifest.yaml)。

相关命令：[deploy](https://developer.pingcode.com/reference/cli/deploy)、[distribute](https://developer.pingcode.com/reference/cli/distribute)、[serve](https://developer.pingcode.com/reference/cli/serve)。
