import { Router } from "express";
import { Nexus } from "../nexus.js";
import { CATEGORIES } from "../ledger.js";

// A：remote.request(remoteKey) → GET /categories。
// 浏览器直连 Remote，校验 NIT 并确认当前是项目经费页面；不使用 OAuth。
export function categoryRoutes(nexus: Nexus) {
  const router = Router();
  router.get("/categories", async (req, res) => {
    const context = await nexus.verifyNit(req.get("Authorization"));
    res.locals.invocationId = context.invocation.id;
    nexus.projectUser(context);
    res.json({ categories: CATEGORIES });
  });
  return router;
}
