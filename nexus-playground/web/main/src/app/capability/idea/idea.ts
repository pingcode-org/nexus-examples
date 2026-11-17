import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { idea, notify, type Idea, type NotifyRef } from '@pc-nexus/capabilities';
import { ThyButton } from 'ngx-tethys/button';
import { ThyDivider } from 'ngx-tethys/divider';
import { ThyInputDirective } from 'ngx-tethys/input';
import { ThySelect, type ThySelectOptionModel } from 'ngx-tethys/select';
import { listNamed, type NamedItem } from '../../shared/list';

@Component({
  selector: 'app-idea',
  imports: [FormsModule, ThyButton, ThyDivider, ThyInputDirective, ThySelect],
  templateUrl: './idea.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IdeaComponent {
  protected readonly title = signal('示例需求');
  protected readonly productId = signal<string | null>(null);
  protected readonly products = signal<NamedItem[]>([]);
  protected readonly productOptions = computed<ThySelectOptionModel[]>(() =>
    this.products().map((item) => ({ value: item.id, label: item.name })),
  );

  constructor() {
    void listNamed('/v2/ship/products').then((items) => {
      this.products.set(items);
      if (items[0]) {
        this.productId.set(items[0].id);
      }
    });
  }

  protected setTitle(event: Event) {
    this.title.set((event.target as HTMLInputElement).value);
  }

  protected setProductId(value: string | number | null) {
    this.productId.set(value == null || value === '' ? null : String(value));
  }

  protected async openCreate() {
    await idea.openCreate({
      onSuccess: (payload) => this.created(payload),
    });
  }

  protected async openCreateWithDefaults() {
    const title = this.title().trim();
    const productId = this.productId();
    await idea.openCreate({
      defaultValues: {
        ...(title ? { title } : {}),
        ...(productId ? { product_id: productId } : {}),
      },
      onSuccess: (payload) => this.created(payload),
    });
  }

  private async created(payload: Idea) {
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
    await idea.openDetail(id);
  }
}
