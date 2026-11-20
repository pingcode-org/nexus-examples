import { Router } from "express";
import { Nexus } from "../nexus.js";
import { HttpError } from "../http.js";

// C：event.triggers → project-events → POST /events/project。
// 平台投递事件，project-events.auth.appToken 提供应用令牌。
export function projectEventRoutes(nexus: Nexus) {
  const router = Router();
  router.post("/events/project", async (req, res) => {
    const context = await nexus.verifyNit(req.get("Authorization"));
    res.locals.invocationId = context.invocation.id;
    const trigger = context.event?.trigger;
    if (trigger?.key !== "project-updated" || trigger.type !== "system") {
      throw new HttpError(403, "仅接收 Nexus 项目事件");
    }
    const projectId = req.body?.payload?.data?.id;
    if (
      req.body?.event_type !== "pce:pjm:project:updated" ||
      typeof projectId !== "string" || !projectId
    ) {
      throw new HttpError(422, "无效的项目更新事件");
    }
    const appToken = req.get("x-nexus-app-token");
    const apiBase = req.get("x-nexus-api-base-url");
    const project = await nexus.getProject(apiBase, appToken, projectId);
    console.info("Nexus project event", context.invocation.id, project.id, project.name);
    res.json({ received: true, project });
  });
  return router;
}
