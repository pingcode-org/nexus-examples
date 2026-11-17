import { ChangeDetectionStrategy, Component } from '@angular/core';
import { notify, NotifyType, type NotifyRef } from '@pc-nexus/capabilities';
import { ThyButton } from 'ngx-tethys/button';
import { ThyDivider } from 'ngx-tethys/divider';

@Component({
  selector: 'app-notify',
  imports: [ThyButton, ThyDivider],
  templateUrl: './notify.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotifyComponent {
  protected async success() {
    await notify.success({
      title: 'Success',
      description: '操作成功。',
    });
  }

  protected async info() {
    await notify.info({
      title: 'Info',
      description: '这是一条信息通知。',
    });
  }

  protected async warning() {
    await notify.warning({
      title: 'Warning',
      description: '请留意这条警告。',
    });
  }

  protected async error() {
    await notify.error({
      title: 'Error',
      description: '操作失败。',
    });
  }

  protected async detail() {
    await notify.success({
      title: 'Detail',
      description: '通知可以附带详情。',
      detail: {
        link: 'View',
        content: '这里是详情内容。',
      },
    });
  }

  protected async actions() {
    let ref: NotifyRef | undefined;
    ref = await notify.show({
      title: 'Actions',
      type: NotifyType.Info,
      description: '通知可以附带操作按钮。',
      isAutoClose: false,
      actions: [
        {
          text: '打开',
          icon: 'publish',
          onClick: () => console.log('打开'),
        },
        {
          text: '关闭',
          icon: 'close',
          onClick: () => ref?.close(),
        },
      ],
    });
  }

  protected async autoClose(enabled: boolean) {
    await notify.info({
      title: enabled ? 'Auto Close' : 'Manual Close',
      description: enabled ? '自动关闭。' : '不会自动关闭，需要手动关闭。',
      isAutoClose: enabled,
    });
  }
}
