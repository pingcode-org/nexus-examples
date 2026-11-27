import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  model,
  signal,
} from "@angular/core";
import { invoke } from "@pc-nexus/bridge";
import {
  NxBox,
  NxContent,
  NxDynamicTable,
  type NxDynamicTableHead,
  type NxDynamicTableRow,
  NxInput,
  NxLayout,
  NxText,
} from "@pc-nexus/angular";

interface Registration {
  id: string;
  name: string;
  employee_no: string;
  department: string;
  contact: string;
  note: string;
  created_at: number;
  updated_at: number;
}

@Component({
  selector: "app-root",
  templateUrl: "./app.html",
  imports: [NxLayout, NxContent, NxBox, NxInput, NxText, NxDynamicTable],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly registrations = signal<Registration[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal("");
  protected readonly search = model("");

  protected readonly head: NxDynamicTableHead = {
    cells: [
      { key: "name", content: "姓名", width: 16 },
      { key: "employee_no", content: "工号", width: 14 },
      { key: "department", content: "部门", width: 16 },
      { key: "contact", content: "联系方式", width: 24 },
      { key: "note", content: "备注", width: 30 },
    ],
  };

  protected readonly filteredRegistrations = computed(() => {
    const keyword = this.search().trim().toLowerCase();
    const list = this.registrations();
    if (!keyword) return list;
    return list.filter((row) =>
      [row.name, row.employee_no, row.department, row.contact, row.note]
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    );
  });

  protected readonly rows = computed<NxDynamicTableRow[]>(() =>
    this.filteredRegistrations().map((row) => ({
      key: row.id,
      cells: [
        { content: row.name },
        { content: row.employee_no },
        { content: row.department },
        { content: row.contact || "—" },
        { content: row.note || "—" },
      ],
    })),
  );

  private disposed = false;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.disposed = true;
    });
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    this.error.set("");
    try {
      const items = await invoke<undefined, Registration[]>("listRegistrations");
      if (!this.disposed) this.registrations.set(items);
    } catch {
      if (!this.disposed) this.error.set("报名列表加载失败，请重新打开页面。");
    } finally {
      if (!this.disposed) this.loading.set(false);
    }
  }
}
