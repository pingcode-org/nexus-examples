# nexus-external-profile — GitHub 账号绑定

一个个人设置页面（Angular Custom UI + [ngx-tethys](https://tethys.pingcode.com/)），可将 GitHub 用户名**绑定**到当前 PingCode 用户并展示其公开资料。首次访问时提示输入 GitHub 用户名并绑定；绑定成功后，用户名会保存，按钮变为「重新绑定」。演示 Nexus [fetch.request](https://developer.pingcode.com/reference/functions/network/fetch)、[KVS](https://developer.pingcode.com/reference/functions/storage/kvs)、[外部权限](https://developer.pingcode.com/reference/manifest/permissions-external)和[内容权限](https://developer.pingcode.com/reference/manifest/permissions-content)。扩展入口：[账号 - 个人设置](https://developer.pingcode.com/reference/resource/extensions/global-personal-setting)。

页面通过 [invoke](https://developer.pingcode.com/reference/interface/bridge/invoke) 调用 Resolver。空载荷会加载已保存的绑定，或在不请求 GitHub 的情况下返回 `unbound`。提交用户名后，通过 `fetch.request` 查询 `GET https://api.github.com/users/{username}`（无需 token），成功后用 `kvs.set` 在 `pcp:storage:app` 下按 PingCode 用户保存。头像从 `avatars.githubusercontent.com` 加载。GitHub 匿名请求对每个出口 IP 限制为每小时 60 次，因此成功的查询结果会缓存 10 分钟。绑定 / 重新绑定失败不会覆盖已保存的用户名。

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

然后在企业管理后台的「应用审核」中安装，打开账号设置 →「外部资料」→「GitHub 个人资料」（路由 `github`）。

绑定一个公开的 GitHub 用户名并重新打开页面，检查已绑定的资料仍然显示。

相关命令：[deploy](https://developer.pingcode.com/reference/cli/deploy)、[distribute](https://developer.pingcode.com/reference/cli/distribute)、[serve](https://developer.pingcode.com/reference/cli/serve)。
