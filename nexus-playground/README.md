# Playground

A workspace page for using Nexus capabilities in context. Demonstrates Nexus [Capability APIs](https://developer.pingcode.com/reference/interface/capabilities). Extension entry: [工作台 - 首页导航](https://developer.pingcode.com/reference/resource/extensions/global-workspace-page).

## Prerequisites

See [Getting started](https://developer.pingcode.com/guide/started/setup).

## Quick start

See [CLI](https://developer.pingcode.com/reference/cli/overview).

```bash
nexus register nexus-playground   # first time only
npm install
npm run deploy
nexus distribute -s <your-domain>.pingcode.com -e development
```

Then install from enterprise admin **App review** and open **Playground** on the workspace home navigation (route `playground`).

Related commands: [deploy](https://developer.pingcode.com/reference/cli/deploy), [distribute](https://developer.pingcode.com/reference/cli/distribute), [serve](https://developer.pingcode.com/reference/cli/serve).
