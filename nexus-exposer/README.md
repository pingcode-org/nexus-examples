# nexus-exposer — 活动报名表

活动报名表示例：页面只读展示报名列表（姓名、工号、部门、联系方式、备注）；增删改通过 Nexus [开放自定义 APIs](https://developer.pingcode.com/guide/advanced/expose-custom-apis) 由外部系统调用。使用 Angular [Native UI](https://developer.pingcode.com/guide/development/user-interface-native-ui)，入口为[全局 — 独立应用](https://developer.pingcode.com/reference/resource/extensions/global-app-hub)的「活动报名表」。

对外接口：

- `GET /registrations`（`ncp:read:registration`）
- `POST /registrations`（`ncp:write:registration`）
- `PUT /registrations`（`ncp:write:registration`，body 含 `id`）
- `DELETE /registrations?id=<id>`（`ncp:write:registration`）

请求体字段：`name`、`employee_no`、`department` 必填；`contact`、`note` 可选。调用时须带 `Accept: application/json`（与 manifest `accept` 一致）。

## 前置条件

参见 [入门指南](https://developer.pingcode.com/guide/started/setup)。Node.js >=24。

## 快速开始

参见 [CLI 文档](https://developer.pingcode.com/reference/cli/overview)。

在本示例目录中执行以下命令。

```bash
nexus register nexus-exposer   # 仅首次运行
npm install
npm run deploy
nexus distribute -s <your-domain>.pingcode.com -e development
```

然后在企业管理后台的「应用审核」中安装，并打开「活动报名表」查看列表。按下方步骤用终端调用外部 API 写入报名后，刷新页面即可看到结果。

相关命令：[deploy](https://developer.pingcode.com/reference/cli/deploy)、[distribute](https://developer.pingcode.com/reference/cli/distribute)、[serve](https://developer.pingcode.com/reference/cli/serve)。

## 配置

- **启用 REST API（安装后）**：组织管理员在应用详情中启用 REST API，并复制当前应用环境的 API Base URL（下文 `<API_BASE_URL>`）。
- **创建调用凭据（安装后）**：在凭据管理中添加本应用，按需要授予 `ncp:read:registration` 和/或 `ncp:write:registration`。按[调用自定义 APIs](https://developer.pingcode.com/guide/advanced/call-custom-apis)换取 access token。`<OPEN_API_ORIGIN>` 为 Open API 根地址（如 `https://open.alpha.pingcode.live`）。
- **示例调用（安装后）**：将占位符替换为管理后台提供的值。

```bash
# 换取 token
curl --get '<OPEN_API_ORIGIN>/v1/auth/token' \
  --data-urlencode 'grant_type=client_credentials' \
  --data-urlencode 'client_id=<CLIENT_ID>' \
  --data-urlencode 'client_secret=<CLIENT_SECRET>'

# 列表
curl --request GET \
  --url '<API_BASE_URL>/registrations' \
  --header 'Authorization: Bearer <ACCESS_TOKEN>' \
  --header 'Accept: application/json'

# 新增
curl --request POST \
  --url '<API_BASE_URL>/registrations' \
  --header 'Authorization: Bearer <ACCESS_TOKEN>' \
  --header 'Content-Type: application/json' \
  --header 'Accept: application/json' \
  --data '{"name":"Davis","employee_no":"EMP-001","department":"研发","contact":"davis@example.com","note":"上午场"}'

# 更新
curl --request PUT \
  --url '<API_BASE_URL>/registrations' \
  --header 'Authorization: Bearer <ACCESS_TOKEN>' \
  --header 'Content-Type: application/json' \
  --header 'Accept: application/json' \
  --data '{"id":"<REGISTRATION_ID>","name":"Davis","employee_no":"EMP-001","department":"研发","contact":"davis@example.com","note":"已确认"}'

# 删除
curl --request DELETE \
  --url '<API_BASE_URL>/registrations?id=<REGISTRATION_ID>' \
  --header 'Authorization: Bearer <ACCESS_TOKEN>' \
  --header 'Accept: application/json'
```
