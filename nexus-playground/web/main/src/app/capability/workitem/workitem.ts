import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { workitem, notify, type Workitem, type NotifyRef } from '@pc-nexus/capabilities';
import { ThyButton } from 'ngx-tethys/button';
import { ThyDivider } from 'ngx-tethys/divider';
import { ThyInputDirective } from 'ngx-tethys/input';
import { ThySelect, type ThySelectOptionModel } from 'ngx-tethys/select';
import { listNamed, type NamedItem } from '../../shared/list';

@Component({
  selector: 'app-workitem',
  imports: [FormsModule, ThyButton, ThyDivider, ThyInputDirective, ThySelect],
  templateUrl: './workitem.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkitemComponent {
  protected readonly title = signal('示例工作项');
  protected readonly projectId = signal<string | null>(null);
  protected readonly projects = signal<NamedItem[]>([]);
  protected readonly projectOptions = computed<ThySelectOptionModel[]>(() =>
    this.projects().map((item) => ({ value: item.id, label: item.name })),
  );

  constructor() {
    void listNamed('/v2/pjm/projects').then((items) => {
      this.projects.set(items);
      if (items[0]) {
        this.projectId.set(items[0].id);
      }
    });
  }

  protected setTitle(event: Event) {
    this.title.set((event.target as HTMLInputElement).value);
  }

  protected setProjectId(value: string | number | null) {
    this.projectId.set(value == null || value === '' ? null : String(value));
  }

  protected async openCreate() {
    await workitem.openCreate({
      onSuccess: (payload) => this.created(payload),
    });
  }

  protected async openCreateWithDefaults() {
    const title = this.title().trim();
    const projectId = this.projectId();
    await workitem.openCreate({
      defaultValues: {
        ...(title ? { title } : {}),
        ...(projectId ? { project_id: projectId } : {}),
      },
      onSuccess: (payload) => this.created(payload),
    });
  }

  private async created(payload: Workitem) {
    let ref: NotifyRef | undefined;
    ref = await notify.success({
      title: '创建成功',
      description: payload.title,
      isAutoClose: false,
      actions: [
        {
          text: '打开',
          icon: 'publish',
          onClick: () => {
            ref?.close();
            void this.openDetail(payload.short_id || payload.id);
          },
        },
      ],
    });
  }

  private async openDetail(id: string) {
    await workitem.openDetail(id);
  }
}
