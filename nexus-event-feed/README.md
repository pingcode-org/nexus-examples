# Nexus 事件订阅示例

One timeline per team. Demonstrates [event subscriptions](https://developer.pingcode.com/guide/development/events): lifecycle, [system](https://developer.pingcode.com/guide/development/events-system-trigger), [scheduled](https://developer.pingcode.com/guide/development/events-scheduled-trigger), [webhook](https://developer.pingcode.com/guide/development/events-webhook-trigger), and app. Extension entry: [Global — App hub](https://developer.pingcode.com/reference/resource/extensions/global-app-hub).

Installing the app writes 「应用已安装，初始化完成」. Upgrading it writes 「应用已升级」. Creating or updating a work item writes a system line. POST a build result to the URL shown on the page to write an external line. The `tenMinute` trigger reads pending lines, publishes 汇总完成, then marks the lines as summarized and adds 「本轮收到 N 条事件」. An empty round writes nothing. Reopen the page or turn on **自动刷新** to see the new lines. The page shows one stable webhook URL.

```bash
# Set WEBHOOK_URL to the URL shown on the event feed page.
curl -X POST "$WEBHOOK_URL" \
  -H 'Content-Type: application/json' \
  -d '{"buildNumber":"42","result":"succeeded"}'
```

`result` may also be `failed`. Any other body is stored as an unrecognized request. The handler responds with HTTP 200 and an empty body after the line is stored.

## Prerequisites

Environment, account, and CLI setup: [Getting started](https://developer.pingcode.com/guide/started/setup).

## Quick start

Run these commands from this example directory.

```bash
nexus register nexus-event-feed # first time only
npm install
npm run deploy
nexus distribute -s <your-domain>.pingcode.com -e development
```

Then install from enterprise admin **App review**. Local debug: run `nexus serve` from this directory, with the frontend dev server on port `3110`.

After install, open **事件动态**. Use **复制调用** next to **Webhook 调用地址** to POST a build result. Create or update a work item and reopen the page to see both entries. Then wait for the next 10-minute tick and reopen the page to see 「本轮收到 N 条事件」.

To verify the cross-app subscription, install the publisher app in the same team. Its ID must match the publisher ID in the `summary-completed` trigger in `manifest.yaml`. Have that app publish `summary-completed` with a payload such as `{"scheduleId":"demo-42"}` and allow this app to receive it. Reopen **事件动态** to see 「汇总完成事件已被消费」.

Related commands: deploy, distribute, [serve](https://developer.pingcode.com/reference/cli/serve).
