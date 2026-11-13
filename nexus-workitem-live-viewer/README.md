# nexus-workitem-live-viewer

同一工作项被多人打开时，互相出现在查看者列表里。演示 Nexus [realtime](https://developer.pingcode.com/reference/interface/bridge/realtime)，以及 [工作项 - 详情后台脚本](https://developer.pingcode.com/reference/resource/extensions/pjm-workitem-background) 与 [工作项 - 详情上下文](https://developer.pingcode.com/reference/resource/extensions/pjm-workitem-context)。

打开工作项详情时 background 即开始心跳上报；右侧属性 **Live Viewer** 横排显示当前查看者。姓名和头像来自 [api.invoke](https://developer.pingcode.com/reference/functions/network/api) 拉取的目录用户信息，用 [thy-avatar](https://tethys.pingcode.com/components/avatar) 渲染。每个标签页有独立 `sessionId`；离开时按该 id 发 `leave`（[view.onClose](https://developer.pingcode.com/reference/interface/bridge/view) 仅 Dialog 可用），未送达则约 15 秒心跳超时后消失。

## Prerequisites

See [Getting started](https://developer.pingcode.com/guide/started/setup).

## Quick start

See [CLI](https://developer.pingcode.com/reference/cli/overview).

Run these commands from this example directory.

```bash
nexus register <app-name>   # first time only
npm install
npm run deploy
nexus distribute -s <your-domain>.pingcode.com -e development
```

Then install from enterprise admin **App review** and open a work item detail page; **Live Viewer** appears in the right property sidebar.

To verify, open the same work item with two test accounts. Keep both detail pages open and check that each account sees the other in **Live Viewer**. Close one page and check that its viewer entry disappears within about 15 seconds. For a multi-tab check, open the item twice with the same account and close one tab. The account should remain visible while the other tab is open. See the two extension bindings in [manifest.yaml](./manifest.yaml).

Related commands: [deploy](https://developer.pingcode.com/reference/cli/deploy), [distribute](https://developer.pingcode.com/reference/cli/distribute), [serve](https://developer.pingcode.com/reference/cli/serve).
