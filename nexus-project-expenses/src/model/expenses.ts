// 页面与 Nexus 函数共用的费用响应类型；放在 src 内以兼容 CLI 的后端编译边界。
export interface ExpenseInput {
  amount_minor: number;
  incurred_on: string;
  category: string;
  purpose: string;
}

export interface ExpenseRecord extends ExpenseInput {
  id: string;
  created_by: string;
  created_at: number;
}

export interface Category {
  id: string;
  name: string;
}

export interface LedgerView {
  project: {
    id: string;
    name: string;
  };
  items: ExpenseRecord[];
  total_minor: number;
}

export interface CategoriesResult {
  categories: Category[];
}
