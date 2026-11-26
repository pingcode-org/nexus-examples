# nexus-project-attachments — 项目附件

项目级附件库示例（Angular Custom UI + [ngx-tethys](https://tethys.pingcode.com)）：上传 / 重传 / 重命名 / 下载 / 删除 / 搜索；上传人通过 `references.members` 展示头像。

在以上能力基础上支持**批量下载**：勾选多个附件后，任务进入[异步队列](https://developer.pingcode.com/reference/functions/async)，由 consumer 从 NOS 拉取文件、打包为 ZIP 并写回 NOS，最后在平台 [进程器](https://developer.pingcode.com/reference/interface/capabilities/processor) 中下载；打包过程通过 [realtime](https://developer.pingcode.com/reference/functions/realtime/realtime) 推送进度。其余仍演示 [Storage](https://developer.pingcode.com/reference/functions/storage)（NOS + CES）与 [Resolver](https://developer.pingcode.com/reference/functions/core/resolver) / [invoke](https://developer.pingcode.com/reference/interface/bridge/invoke)。

扩展入口：[项目 - 组件页面](https://developer.pingcode.com/reference/resource/extensions/pjm-project-page)（路由 `attachments`）；批量下载依赖 `pcm:global:main:background` 后台扩展（资源 `background`：Vite 打包的无界面 Custom UI，监听 `events` 并驱动进程器）。

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

然后在企业管理后台的「应用审核」中安装，并在项目组件页面打开「附件」（路由 `attachments`）。

上传若干附件后，可单文件下载，或点「批量下载」打包全部附件，在进程器中查看进度并下载 ZIP。

相关命令：[deploy](https://developer.pingcode.com/reference/cli/deploy)、[distribute](https://developer.pingcode.com/reference/cli/distribute)、[serve](https://developer.pingcode.com/reference/cli/serve)。
