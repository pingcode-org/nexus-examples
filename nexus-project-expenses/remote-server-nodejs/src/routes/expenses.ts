import { Router } from "express";
import { Nexus } from "../nexus.js";
import { Ledger, parseExpense } from "../ledger.js";

// B：Bridge remote.invoke() → expenses-endpoint；D：函数 remote.invoke(remoteKey)。
// 两条链复用 GET 和同一段校验，用户 OAuth 分别由 Endpoint / Remote auth 配置。
export function expenseRoutes(nexus: Nexus, ledger: Ledger) {
  const router = Router();
  router.use("/projects/:projectId/expenses", async (req, res, next) => {
    const context = await nexus.verifyNit(req.get("Authorization"));
    res.locals.invocationId = context.invocation.id;
    const projectId = req.params.projectId;
    res.locals.userId = nexus.projectUser(context, projectId);
    const userToken = req.get("x-nexus-user-token");
    const apiBase = req.get("x-nexus-api-base-url");
    res.locals.project = await nexus.getProject(apiBase, userToken, projectId);
    res.locals.tenant = nexus.tenant(context);
    next();
  });

  // 当前用户的项目身份已验证，下面是本例的费用业务。
  router.get("/projects/:projectId/expenses", (_req, res) => {
    const { tenant, project } = res.locals;
    res.json({ project, ...ledger.list(tenant, project.id) });
  });
  router.post("/projects/:projectId/expenses", (req, res) => {
    const { tenant, project, userId } = res.locals;
    res.json(ledger.create(tenant, project.id, userId, parseExpense(req.body)));
  });
  router.delete("/projects/:projectId/expenses/:id", (req, res) => {
    const { tenant, project, userId } = res.locals;
    res.json(ledger.remove(tenant, project.id, userId, req.params.id as string));
  });
  return router;
}
