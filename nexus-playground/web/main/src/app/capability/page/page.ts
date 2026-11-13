import { ChangeDetectionStrategy, Component } from '@angular/core';
import { page, notify, type Page, type NotifyRef } from '@pc-nexus/capabilities';
import { ThyButton } from 'ngx-tethys/button';

@Component({
  selector: 'app-page',
  imports: [ThyButton],
  templateUrl: './page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageComponent {
  protected async openCreate() {
    await page.openCreate({
      onSuccess: (payload) => this.created(payload),
    });
  }

  private async created(payload: Page) {
    let ref: NotifyRef | undefined;
    ref = await notify.success({
      title: '创建成功',
      description: payload.name,
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
    await page.openDetail(id);
  }
}
