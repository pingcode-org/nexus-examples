# nexus-event-feed — 事件订阅示例

每个团队共享一条事件时间线。演示[事件订阅](https://developer.pingcode.com/guide/development/events)：生命周期、[系统事件](https://developer.pingcode.com/guide/development/events-system-trigger)、[定时事件](https://developer.pingcode.com/guide/development/events-scheduled-trigger)、[Webhook 事件](https://developer.pingcode.com/guide/development/events-webhook-trigger)和应用事件。扩展入口：[全局 - 应用中心](https://developer.pingcode.com/reference/resource/extensions/global-app-hub)。

安装应用时写入「应用已安装，初始化完成」，升级时写入「应用已升级」。创建或更新工作项会写入一条系统事件。向页面显示的调用地址 POST 构建结果，会写入一条外部事件。`tenMinute` 触发器读取待汇总事件，发布「汇总完成」，将这些事件标记为已汇总，并追加「本轮收到 N 条事件」。没有事件的轮次不会写入内容。重新打开页面或开启「自动刷新」即可看到新事件。页面会展示一个固定的 Webhook 调用地址。

```bash
# 将 WEBHOOK_URL 设为事件动态页面显示的地址。
curl -X POST "$WEBHOOK_URL" \
  -H 'Content-Type: application/json' \
  -d '{"buildNumber":"42","result":"succeeded"}'
```

`result` 也可以是 `failed`。其他请求体会按无法识别的请求保存。事件写入后，处理器返回 HTTP 200 和空响应体。

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

然后在企业管理后台的「应用审核」中安装（没有 `nexus install` 命令）。

安装后打开「事件动态」。点击「Webhook 调用地址」旁的「复制调用」POST 一条构建结果。创建或更新工作项后重新打开页面，即可看到两条事件。然后等待下一个 10 分钟触发，再次打开页面查看「本轮收到 N 条事件」。可选的跨应用 `summary-completed` 订阅见[配置](#配置)。

相关命令：[deploy](https://developer.pingcode.com/reference/cli/deploy)、[distribute](https://developer.pingcode.com/reference/cli/distribute)、[serve](https://developer.pingcode.com/reference/cli/serve)。

## 配置

- **发布方应用 ID**（部署前，可选）：在 `manifest.yaml` 中，`summary-completed` 触发器监听 `nae:app:<publisher-app-id>:summary-completed`。将 `<publisher-app-id>` 设为发布方应用的 UUID，或保留示例 UUID 并使用相同 id 的发布方。两个应用需安装在同一团队，发布方以 `{"scheduleId":"demo-42"}` 之类的载荷发布 `summary-completed`，并允许本应用接收。重新打开「事件动态」可看到「汇总完成事件已被消费」。
