import express from "express";
import { Nexus } from "./nexus.js";
import { Ledger } from "./ledger.js";
import { HttpError, allowBrowserRequests, requireJson, notFound, handleError } from "./http.js";
import { categoryRoutes } from "./routes/categories.js";
import { expenseRoutes } from "./routes/expenses.js";
import { projectEventRoutes } from "./routes/project-events.js";

// 本文件只启动 HTTP 服务。阅读 Nexus Remote 示例请从下面三个路由文件开始。
const nexus = new Nexus();
const ledger = new Ledger();
const app = express();
app.use(
  allowBrowserRequests,
  requireJson,
  express.json({
    verify: (_req, _res, body) => {
      if (!body.length) throw new HttpError(400, "请求 JSON 无效");
    },
  }),
);
app.use(categoryRoutes(nexus)); // A：浏览器直连，验签并校验项目页面，不使用 OAuth。
app.use(expenseRoutes(nexus, ledger)); // B：平台转发，以用户身份回调。
app.use(projectEventRoutes(nexus)); // C：平台事件，以应用身份回调。
app.use(notFound, handleError);

const port = Number(process.env["PORT"] || 3200);
const host = process.env["LISTEN_HOST"] || "127.0.0.1";
const server = app.listen(port, host, () => {
  console.info(`Remote service listening on http://${host}:${port}`);
});
process.once("SIGINT", () => server.close());
process.once("SIGTERM", () => server.close());
