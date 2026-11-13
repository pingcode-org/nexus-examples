# 本地开发与调试

本指南在 `nexus-project-expenses` 目录执行。Node.js 和 Java 服务任选一个；它们使用独立内存，重启、重建或切换服务后，费用不会保留。不要在两个服务同时占用同一个本机端口。

## 准备配置

从所选服务目录的 `.env.example` 手动创建 `.env`。已有配置请直接检查或编辑，不要用示例文件覆盖。字段见 [Node.js 配置](../remote-server-nodejs/README.md#配置)或 [Java 配置](../remote-server-java/README.md#配置)。

## 直接启动 Node.js

需要 Node.js 24+。在应用目录执行：

```sh
npm --prefix remote-server-nodejs ci
npm --prefix remote-server-nodejs run start:dev
```

默认监听 `127.0.0.1:3200`；按 `Ctrl+C` 停止。修改代码后重新构建并启动，修改 `.env` 后重启。其他设置见 [Node.js 服务说明](../remote-server-nodejs/README.md)。

## 直接启动 Java

需要 JDK 21+；首次构建需要下载 Maven 和依赖。进入 Java 服务目录执行：

```sh
cd remote-server-java
./mvnw -B --no-transfer-progress package
java -jar target/remote-server-java-1.0.0.jar
```

默认监听 `127.0.0.1:3200`；按 `Ctrl+C` 停止。之后回到应用目录执行下文命令。其他设置见 [Java 服务说明](../remote-server-java/README.md)。

## 使用 Docker 启动

在应用目录按需选择一个服务。构建和运行由 Docker 完成：

```sh
docker compose up -d --build remote-nodejs
docker compose ps remote-nodejs
```

Node.js 容器映射到 `127.0.0.1:3201`。Java 容器使用：

```sh
docker compose up -d --build remote-java
docker compose ps remote-java
```

Java 容器映射到 `127.0.0.1:3202`。只启动所选服务时只需准备其 `.env`；Compose 需要支持 `env_file.required`。容器内监听 `0.0.0.0:3200`，宿主机端口仅绑定回环地址。

查看 Java 日志和停止服务：

```sh
docker compose logs -f remote-java
docker compose stop remote-java
```

查看或停止 Node.js 时将服务名改为 `remote-nodejs`。日志命令按 `Ctrl+C` 退出，不会停止容器；停止或重建容器会清空该服务的内存数据。修改代码后重新执行对应的 `up -d --build`；修改 `.env` 后执行 `docker compose up -d --force-recreate <服务名>`。

## 检查本机 API

本机 API 检查无需 Nexus CLI，也无需修改 Manifest 或部署应用。

启动所选后端，用无令牌请求检查服务是否响应，正常情况下返回 `401`。以下是 Java 容器示例；Node.js 容器改为 `3201`，直接启动服务则改为实际端口（默认 `3200`）：

```sh
curl -i http://127.0.0.1:3202/categories
```

## 完整页面调试

本节需要 Nexus CLI，以及能被 Nexus 平台和浏览器访问的 API 服务。

1. 本例的前端、Resolver 和 Endpoint 使用 `node-remote`，项目更新事件也经 Endpoint 转发到同一 Remote。无论选择 Node.js 还是 Java 服务，都把 Nexus 平台和浏览器都能访问的 HTTPS 地址写入 `manifest.yaml` 中 `key: node-remote` 的 `baseUrl`，并把同一来源写入 `permissions.external.fetch.client`。本机回环地址（如 `http://127.0.0.1:3200`）不能写入 `baseUrl`。`java-remote` 未被当前调用引用，单独修改它不会切换服务。

   `nexus.json` 的 `serve.resources` 配置前端资源端口，不配置 Remote 服务转发。

   `NEXUS_JWKS_URL`（Nexus 公钥集地址）或 `PINGCODE_API_BASE_URL`（PingCode 平台 API 基址）变化时，更新所选服务的 `.env` 并重启。上述 HTTPS 地址变化时，更新 `node-remote` 的 `baseUrl` 和 `permissions.external.fetch.client`。项目 ID 动态获取，无需配置页面 Origin。

2. 按 [快速开始](../README.md#快速开始) 在应用目录执行 `npm install`、`npm run deploy`，再执行 `nexus distribute -s <your-domain>.pingcode.com -e development`。尚未注册时先执行该节的 `nexus register`。首次使用由企业管理员在「应用审核」中安装；应用已经安装时，部署完成后直接打开下面的页面。

3. 在项目中打开已部署的「项目经费（远程端点）」，按 [验证示例](../README.md#验证示例)确认类别列表和费用增删查。修改项目名称后，在所选 Remote 日志中确认出现 `Nexus project event`，再把项目名称改回。然后打开「项目经费（Resolver 查询）」，确认能看到同一笔记账。页面使用构建后的资源；需要修改前端并热更新时，再使用下一节 HMR。

停止或重建 Remote 后内存费用清空。

## 前端 HMR（进阶）

仅本节的前端热更新流程需要创建 `nexus.json`，使用构建后的前端资源时无需额外创建。先完成部署与安装，再在应用根目录创建该文件；已有文件时合并以下配置并保留其他配置：

```json
{
  "serve": {
    "resources": {
      "main": { "port": 3100 }
    }
  }
}
```

`main` 对应 Manifest 的资源 key，端口对应 Vite 的 `server.port`。运行 `npm start` 同时启动 Vite 和 `nexus serve`。Node.js 或 Java Remote 独立部署，通过 Manifest 中 `node-remote` 的 `baseUrl` 访问。

### Vite 注入内容与 CSP

Vite React 开发入口会注入一段内联 refresh preamble，CSS 热更新也会创建 `style` 元素。本例 Manifest 的 `permissions.content.scripts` 只允许这段脚本的 SHA-256，`permissions.content.styles` 允许开发样式注入。脚本哈希与锁文件中的 React 插件版本及本例开发根路径对应。

升级 `@vitejs/plugin-react` 后，在应用目录核对哈希：

```sh
node --input-type=module -e 'import react from "@vitejs/plugin-react"; import { createHash } from "node:crypto"; console.log("sha256-" + createHash("sha256").update(react.preambleCode.replace("__BASE__", "/")).digest("base64"))'
```

如果哈希变化，更新 Manifest 中的值；修改开发根路径时也要核对实际 HTML。Manifest 改动需重新部署，并重启修改前已运行的 `nexus serve`，页面才能使用新的策略。Vite 的 React 插件负责注入 preamble，`main.tsx` 只保留 React 应用入口。

这些内容权限用于本例的开发注入。仅使用生产构建产物时，可移除相应 `content` 配置，再构建、部署并验证。

在项目页面确认能显示样式，修改前端文字或 CSS 后能热更新，控制台没有内联脚本或样式的 CSP 拦截。停止调试时在 `npm start` 的终端按一次 `Ctrl+C`，Vite 和 `nexus serve` 会一起停止，然后再停止所选 Remote。

## 排查

先查看所选 Remote 服务日志。两种后端统一输出 `Nexus request failed`，使用 `method/path` 定位请求、`status/message` 判断失败原因、`cause` 查看异常类型。

| 状态或提示                    | 检查位置                                                                        |
| ----------------------------- | ------------------------------------------------------------------------------- |
| `401` / 缺少调用令牌          | 请求是否经过 Nexus；本机无令牌探测返回 `401` 是预期行为                         |
| `401` / 验签或上下文失败      | `NEXUS_JWKS_URL`、令牌有效期、签名、issuer、audience，以及环境配置              |
| `403` / 项目或身份不匹配      | 当前扩展 key、target、项目路径、用户／应用权限、Remote / Endpoint auth 与 scope |
| `403` / 平台 API 地址不一致   | `PINGCODE_API_BASE_URL` 是否与平台下发地址一致，是否保留 `/ex` 等基础路径       |
| `502` / 项目响应无效          | 平台 API 地址、版本和项目响应的 `id/name`                                       |
| `503` / 暂时无法访问 PingCode | 网络、超时、TLS 或重定向；示例不跟随重定向                                      |
| `404` / 费用不存在            | 记录是否已经删除；本例删除直接移除记录                                          |
| `422` / 输入无效              | 日期、整数分金额、类别和用途是否有效                                            |

验签成功后，可用 `invocationId` 关联同一次调用；验签失败时为 `unverified`。排查无需输出令牌、完整异常或平台响应。

其他本地开发问题：

- `connect-src` 拦截 Remote：检查 `permissions.external.fetch.client` 与实际远程地址一致，并重新部署。
- HMR 的 `script-src` / `style-src` 拦截：按上节核对 preamble 哈希和开发样式权限，重新部署 Manifest 并重启旧的 `nexus serve`。
- `port 3100 is not listening`：检查 Vite 是否启动及实际监听端口，确认 `nexus.json` 资源端口一致。
- Docker 无法连接：先启动 Docker Desktop 或 OrbStack，再检查 `docker version`。
