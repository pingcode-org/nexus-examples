import { Alert, Button, Table } from "antd";
import { useEffect, useState } from "react";
import { dialog } from "@pc-nexus/bridge";
import { connect, type Client } from "./api.js";
import { type Category, type ExpenseInput, type LedgerView } from "./expenses.js";
import "./App.css";

const message = (error: unknown) =>
  error instanceof Error ? error.message : "请求失败，请稍后重试";

const money = new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY" });

async function listExpenses(client: Client) {
  const ledger = await client.list();
  if (!ledger?.project || !Array.isArray(ledger.items)) {
    throw new Error("未收到有效的费用数据");
  }
  return ledger;
}

export default function App() {
  const [client, setClient] = useState<Client | null>(null);
  const [ledger, setLedger] = useState<LedgerView | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [busy, setBusy] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const connection = await connect();
        if (cancelled) return;
        const [dictionary, expenses] = await Promise.allSettled([
          connection.categories(),
          listExpenses(connection),
        ]);
        if (cancelled) return;

        setClient(connection);
        setCategories(dictionary.status === "fulfilled" ? dictionary.value.categories : []);
        setLedger(expenses.status === "fulfilled" ? expenses.value : null);
        const failures = [];
        if (dictionary.status === "rejected") failures.push(`费用类别：${message(dictionary.reason)}`);
        if (expenses.status === "rejected") failures.push(`费用明细：${message(expenses.reason)}`);
        setError(failures.join("；"));
      } catch (err) {
        if (!cancelled) setError(message(err));
      } finally {
        if (!cancelled) setBusy(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, []);

  async function changeExpenses(connection: Client, change: () => Promise<unknown>) {
    setBusy(true);
    setError("");
    try {
      await change();
      setLedger(null);
      try {
        setLedger(await listExpenses(connection));
      } catch (err) {
        setError(`费用已更新，刷新明细失败：${message(err)}`);
      }
    } catch (err) {
      setError(message(err));
    } finally {
      setBusy(false);
    }
  }

  async function openExpenseDialog(connection: Client) {
    setError("");
    setAdding(true);
    try {
      // 弹窗复用 main 资源，通过 view.close 回传表单，由项目页提交。
      await dialog.open({
        resource: "main",
        title: "新增费用",
        size: "medium",
        context: { categories },
        onClose: payload => {
          setAdding(false);
          if (payload) void changeExpenses(connection, () => connection.create(payload as ExpenseInput));
        },
      });
    } catch (err) {
      setAdding(false);
      setError(message(err));
    }
  }

  const editable = client?.readOnly === false;
  const canAdd = !busy && !adding && Boolean(ledger) && categories.length > 0;
  const categoryNames = new Map(categories.map(({ id, name }) => [id, name]));

  return (
    <main className="expenses-page">
      <header className="page-heading">
        <h1>{client?.readOnly ? "项目经费（Resolver 查询）" : "项目经费（远程端点）"}</h1>
      </header>
      <div className="page-content">
        <div className="expense-toolbar">
          <span className="expense-count">{ledger ? `${ledger.items.length} 笔费用` : ""}</span>
          {editable && (
            <Button
              type="primary"
              disabled={!canAdd}
              onClick={() => void openExpenseDialog(client)}
              icon={<span aria-hidden="true">＋</span>}
            >
              新增费用
            </Button>
          )}
        </div>

        {error && !adding && <Alert type="error" title={error} showIcon />}

        {(busy || ledger) && (
          <section aria-label="费用明细">
            <Table
              loading={busy}
              rowKey="id"
              dataSource={ledger?.items ?? []}
              className="expense-table"
              pagination={false}
              locale={{ emptyText: "暂无费用记录。" }}
              scroll={{ x: true }}
            >
              <Table.Column title="日期" dataIndex="incurred_on" />
              <Table.Column title="类别" dataIndex="category" render={category => categoryNames.get(category) ?? category} />
              <Table.Column title="用途" dataIndex="purpose" />
              <Table.Column title="金额" dataIndex="amount_minor" render={amount => money.format(amount / 100)} />
              {editable && (
                <Table.Column
                  title="操作"
                  render={(_, item: LedgerView["items"][number]) =>
                    item.created_by === client.userId && (
                      <Button danger type="link" disabled={busy} onClick={() => {
                        if (window.confirm("删除这笔费用？")) {
                          void changeExpenses(client, () => client.remove(item.id));
                        }
                      }}>删除</Button>
                    )
                  }
                />
              )}
            </Table>
          </section>
        )}
      </div>
    </main>
  );
}
