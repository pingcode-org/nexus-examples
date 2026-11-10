import { Alert, Button, Form, Input, Select } from "antd";
import { view } from "@pc-nexus/bridge";
import { useEffect, useState } from "react";
import { parseAmount, type Category, type ExpenseInput } from "./expenses.js";

const today = () =>
  new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 10);

export default function ExpenseDialog() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void view.getContext().then(context => {
      const data = context.extension?.data?.["dialog"] as { categories?: Category[] } | undefined;
      if (!data?.categories?.length) throw new Error("未收到费用类别");
      setCategories(data.categories);
    }).catch(err => setError(err instanceof Error ? err.message : "无法读取弹窗上下文"));
  }, []);

  async function close(expense?: ExpenseInput) {
    setClosing(true);
    try {
      await view.close(expense);
    } catch (err) {
      setError(err instanceof Error ? err.message : "关闭弹窗失败");
      setClosing(false);
    }
  }

  function submit(values: { date: string; amount: string; category: string; purpose: string }) {
    if (closing || !categories.length) return;
    setError("");
    try {
      const expense = {
        incurred_on: values.date,
        amount_minor: parseAmount(values.amount),
        category: values.category,
        purpose: values.purpose.trim(),
      };
      void close(expense);
    } catch (err) {
      setError(err instanceof Error ? err.message : "请检查费用信息");
    }
  }

  return (
    <main>
      {error && <Alert type="error" title={error} showIcon />}
      <Form
        layout="vertical"
        initialValues={{ date: today() }}
        disabled={closing || !categories.length}
        onFinish={submit}
      >
        <Form.Item name="date" label="日期" rules={[{ required: true, message: "请选择日期" }]}>
          <Input type="date" />
        </Form.Item>
        <Form.Item name="amount" label="金额（元）" rules={[{ required: true, message: "请输入金额" }]}>
          <Input inputMode="decimal" maxLength={14} />
        </Form.Item>
        <Form.Item name="category" label="类别" rules={[{ required: true, message: "请选择类别" }]}>
          <Select options={categories.map(({ id, name }) => ({ value: id, label: name }))} />
        </Form.Item>
        <Form.Item name="purpose" label="用途" rules={[{ required: true, whitespace: true, message: "请填写费用用途" }]}>
          <Input maxLength={500} />
        </Form.Item>
        <div className="expense-form-actions">
          <Button type="primary" htmlType="submit" loading={closing}>保存费用</Button>
        </div>
      </Form>
    </main>
  );
}
