# 项目经费 Remote 服务（Node.js）

本服务是项目经费示例的 Node.js 后端，提供费用类别、费用增删查和项目更新事件处理。费用保存在内存中，重启后清空。

## 前置条件

需要 Node.js 24 或更高版本。

## 配置

将本目录的 [`.env.example`](.env.example) 复制为 `.env`，按目标 Nexus 环境填写以下两项。

| 变量 | 说明 |
| --- | --- |
| `NEXUS_JWKS_URL` | Nexus 的公钥集地址，用于验证调用令牌（NIT）。 |
| `PINGCODE_API_BASE_URL` | 受信任的 PingCode API 基址。正式环境填写 `https://open.pingcode.com/ex`，其他环境填写 Nexus 下发的实际基址，并保留 `/ex` 等路径。 |

服务默认使用 `development` 环境，监听 `127.0.0.1:3200`。需要调整时，设置 `NEXUS_ENVIRONMENT`、`LISTEN_HOST` 或 `PORT`。用户和应用 OAuth 令牌由 Nexus 随请求传入。

## 启动服务

在本目录执行：

```sh
npm ci
npm run build
npm start
```

也可以在示例根目录运行 `docker compose up -d --build remote-nodejs`，容器端口会映射到本机 `127.0.0.1:3201`。

## 接入 Nexus

独立部署服务后，将实际 HTTPS 地址填入 Manifest 对应 Remote 的 `baseUrl`，并将该地址的来源加入 `permissions.external.fetch.client`，供浏览器直连费用类别。该地址需能被 Nexus 平台和浏览器访问。 [Manifest 配置](../manifest.yaml)

类别、费用和项目事件的 HTTP 入口见[接口实现](src/routes/)，令牌验证和 PingCode API 回调见[鉴权实现](src/nexus.ts)。应用部署和验证步骤见[项目经费示例](../README.md)。
