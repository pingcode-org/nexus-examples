import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { testcase, notify, type Testcase, type NotifyRef } from '@pc-nexus/capabilities';
import { ThyButton } from 'ngx-tethys/button';
import { ThyDivider } from 'ngx-tethys/divider';
import { ThyInputDirective } from 'ngx-tethys/input';
import { ThySelect, type ThySelectOptionModel } from 'ngx-tethys/select';
import { listNamed, type NamedItem } from '../../shared/list';

@Component({
  selector: 'app-testcase',
  imports: [FormsModule, ThyButton, ThyDivider, ThyInputDirective, ThySelect],
  templateUrl: './testcase.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestcaseComponent {
  protected readonly title = signal('示例测试用例');
  protected readonly libraryId = signal<string | null>(null);
  protected readonly libraries = signal<NamedItem[]>([]);
  protected readonly libraryOptions = computed<ThySelectOptionModel[]>(() =>
    this.libraries().map((item) => ({ value: item.id, label: item.name })),
  );

  constructor() {
    void listNamed('/v2/testhub/libraries').then((items) => {
      this.libraries.set(items);
      if (items[0]) {
        this.libraryId.set(items[0].id);
      }
    });
  }

  protected setTitle(event: Event) {
    this.title.set((event.target as HTMLInputElement).value);
  }

  protected setLibraryId(value: string | number | null) {
    this.libraryId.set(value == null || value === '' ? null : String(value));
  }

  protected async openCreate() {
    await testcase.openCreate({
      onSuccess: (payload) => this.created(payload),
    });
  }

  protected async openCreateWithDefaults() {
    const title = this.title().trim();
    const libraryId = this.libraryId();
    await testcase.openCreate({
      defaultValues: {
        ...(title ? { title } : {}),
        ...(libraryId ? { library_id: libraryId } : {}),
      },
      onSuccess: (payload) => this.created(payload),
    });
  }

  private async created(payload: Testcase) {
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
    await testcase.openDetail(id);
  }
}
