// 仅导出共享类型；金额转换留在前端，后端编译不依赖 web 目录。
export type {
  ExpenseInput, ExpenseRecord, Category, LedgerView, CategoriesResult,
} from "../../../src/model/expenses.js";

export function parseAmount(value: string): number {
  if (!/^\d{1,11}(\.\d{1,2})?$/.test(value.trim())) {
    throw new Error("金额须为正数，最多两位小数");
  }
  const [whole = "0", fraction = ""] = value.trim().split(".");
  const minor = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(minor) || minor <= 0 || minor > 1_000_000_000_000) {
    throw new Error("金额超出支持范围");
  }
  return minor;
}
