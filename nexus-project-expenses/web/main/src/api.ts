import { invoke, remote, view } from "@pc-nexus/bridge";
import type { CategoriesResult, ExpenseInput, ExpenseRecord, LedgerView } from "./expenses.js";

export async function connect() {
  const context = await view.getContext();
  const project = context.extension?.data?.["project"] as { id?: unknown } | undefined;
  if (
    typeof project?.id !== "string" || !project.id ||
    !context.user?.id || !["expenses-remote", "expenses-function"].includes(context.extension?.key)
  ) {
    throw new Error("请在 PingCode 项目的经费页面打开此应用");
  }
  // Remote 会校验请求路径中的项目 ID 是否与 NIT 上下文一致。
  const path = `/projects/${encodeURIComponent(project.id)}/expenses`;
  const readOnly = context.extension.key === "expenses-function";

  return {
    userId: context.user.id,
    readOnly,

    // remote.request 按 Manifest 的 Remote key 从浏览器直连。
    async categories() {
      const response = await remote.request("node-remote", {
        path: "/categories",
        method: "GET",
        headers: {
          Accept: "application/json",
          "ngrok-skip-browser-warning": "1",
        },
      });
      return readResponse<CategoriesResult>(response);
    },

    // remote.invoke 由当前扩展绑定的 Endpoint 转发，用户 OAuth 由 Endpoint 配置。
    async list() {
      // Resolver 从 Nexus 上下文读取项目 ID。
      if (readOnly) return invoke<void, LedgerView>("listExpenses");
      const response = await remote.invoke({ path, method: "GET" });
      return readResponse<LedgerView>(response);
    },
    async create(expense: ExpenseInput) {
      if (readOnly) throw new Error("函数页面仅支持查询");
      const response = await remote.invoke({
        path,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expense),
      });
      return readResponse<ExpenseRecord>(response);
    },
    async remove(id: string) {
      if (readOnly) throw new Error("函数页面仅支持查询");
      const response = await remote.invoke({
        path: `${path}/${encodeURIComponent(id)}`,
        method: "DELETE",
      });
      return readResponse<{ deleted: boolean }>(response);
    },
  };
}
export type Client = Awaited<ReturnType<typeof connect>>;

async function readResponse<T>(response: Response): Promise<T> {
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new Error("远程服务返回了无效响应，请检查服务配置");
  }
  if (!response.ok) {
    const message = (data as { error?: { message?: string } } | null)?.error?.message;
    throw new Error(message || `远程请求失败（${response.status}）`);
  }
  return data as T;
}
