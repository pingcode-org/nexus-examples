# nexus-workitem-dod-validator — 工作项 DoD 校验

可配置的工作项完成定义（DoD）校验器：在状态流转时检查已登记工时、子任务完成情况与关联测试用例数量。演示通过 React [Native UI](https://developer.pingcode.com/guide/development/native-ui-with-react) 配置校验规则。扩展入口：[工作项 - 工作流验证](https://developer.pingcode.com/reference/resource/extensions/pjm-workitem-validator)（`pcm:pjm:workitem:validator`）。

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

然后在企业管理后台的「应用审核」中安装，并将校验器加入工作流规则（见[配置](#配置)）；校验不通过的状态流转会显示「DoD 校验未通过」。

相关命令：[deploy](https://developer.pingcode.com/reference/cli/deploy)、[distribute](https://developer.pingcode.com/reference/cli/distribute)、[serve](https://developer.pingcode.com/reference/cli/serve)。

## 配置

- **工作流规则**：安装应用后，打开项目 → 项目设置 → 工作项类型 → 工作流 / 状态流转规则 → 添加规则 → 选择「DoD 校验」→ 打开三条 DoD 规则并保存。
