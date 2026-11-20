import { randomUUID } from "node:crypto";
import { HttpError } from "./http.js";

export const CATEGORIES = [
  { id: "purchase", name: "采购" },
  { id: "travel", name: "交通" },
  { id: "service", name: "服务" },
  { id: "other", name: "其他" },
];

export interface ExpenseInput {
  amount_minor: number;
  incurred_on: string;
  category: string;
  purpose: string;
}

export interface Expense extends ExpenseInput {
  id: string;
  created_by: string;
  created_at: number;
}

export function parseExpense(value: unknown): ExpenseInput {
  const { amount_minor, incurred_on, category, purpose } = (value ?? {}) as Partial<ExpenseInput>;
  const validAmount = typeof amount_minor === "number" && Number.isSafeInteger(amount_minor) &&
    amount_minor >= 1 && amount_minor <= 1_000_000_000_000;
  const validDate = typeof incurred_on === "string" && /^\d{4}-\d{2}-\d{2}$/.test(incurred_on) &&
    Number.isFinite(Date.parse(incurred_on)) &&
    new Date(incurred_on).toISOString().slice(0, 10) === incurred_on;
  const validCategory = typeof category === "string" && CATEGORIES.some(item => item.id === category);
  const validPurpose = typeof purpose === "string" && purpose.trim().length > 0 &&
    purpose.trim().length <= 500;
  if (!validAmount || !validDate || !validCategory || !validPurpose) {
    throw new HttpError(422, "请填写有效的日期、金额、类别和用途（最多 500 字）");
  }
  return { amount_minor, incurred_on, category, purpose: purpose.trim() };
}

// 示例账本：每次新增生成 ID，删除直接移除记录，数据仅保存在内存中。
export class Ledger {
  private ledgers = new Map<string, Map<string, Expense>>();

  private records(tenant: string, projectId: string) {
    const key = JSON.stringify([tenant, projectId]);
    let entries = this.ledgers.get(key);
    if (!entries) {
      entries = new Map();
      this.ledgers.set(key, entries);
    }
    return entries;
  }

  list(tenant: string, projectId: string) {
    const items = [...this.records(tenant, projectId).values()].reverse().map(item => ({ ...item }));
    return { items, total_minor: items.reduce((sum, item) => sum + item.amount_minor, 0) };
  }

  create(tenant: string, projectId: string, userId: string, input: ExpenseInput) {
    const created = {
      ...input,
      id: randomUUID(),
      created_by: userId,
      created_at: Math.floor(Date.now() / 1000),
    };
    this.records(tenant, projectId).set(created.id, created);
    return { ...created };
  }

  remove(tenant: string, projectId: string, userId: string, id: string) {
    const entries = this.records(tenant, projectId);
    const expense = entries.get(id);
    if (!expense) throw new HttpError(404, "费用记录不存在");
    if (expense.created_by !== userId) throw new HttpError(403, "只能删除本人创建的费用");
    entries.delete(id);
    return { deleted: true };
  }
}
