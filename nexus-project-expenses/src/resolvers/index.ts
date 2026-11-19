import { Resolver } from "@pc-nexus/core";
import { remote } from "@pc-nexus/network";
import type { LedgerView } from "../model/expenses.js";

const resolver = new Resolver();

resolver.define<void, LedgerView>("listExpenses", async context => {
  const { extension, user } = context;
  // 使用 Nexus 调用上下文中的项目 ID，避免由客户端指定查询范围。
  const projectId = (extension?.data?.["project"] as { id?: unknown } | undefined)?.id;
  if (
    extension?.key !== "expenses-function" ||
    extension.target !== "pcm:pjm:project:page" ||
    !user?.id ||
    typeof projectId !== "string" || !projectId
  ) {
    throw new Error("请在「项目经费（Resolver 查询）」页面调用");
  }

  // Remote key 对应 manifest.yaml 的 remotes 条目，用户 OAuth 由该条目的 auth 配置。
  const response = await remote.invoke("node-remote", {
    path: `/projects/${encodeURIComponent(projectId)}/expenses`,
    method: "GET",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`费用查询失败（Gateway ${response.status}）`);

  // Gateway 的 HTTP 状态与 Remote 的业务 HTTP 状态分别检查。
  const { success, value }: {
    success: boolean;
    value?: { status: number; body: LedgerView };
  } = await response.json();
  if (!success || !value) throw new Error("费用查询失败（Gateway）");
  if (value.status < 200 || value.status >= 300) {
    throw new Error(`费用查询失败（Remote ${value.status}）`);
  }
  return value.body;
});

export { resolver };
