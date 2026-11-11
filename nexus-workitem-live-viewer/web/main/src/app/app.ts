import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { view } from '@pc-nexus/bridge';
import { ThyAvatar, ThyAvatarList } from 'ngx-tethys/avatar';
import {
  errorMessage,
  isBackgroundTarget,
  runDisplay,
  runPresence,
  toViewers,
  type ViewerSession,
} from './presence';

const AVATAR_SIZE = 24;

@Component({
  selector: 'app-root',
  imports: [ThyAvatar, ThyAvatarList],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly destroyRef = inject(DestroyRef);

  protected readonly avatarSize = AVATAR_SIZE;
  protected readonly isDisplay = signal(false);
  protected readonly error = signal('');
  private readonly selfUserId = signal('');
  private readonly sessions = signal<ViewerSession[]>([]);
  protected readonly viewers = computed(() => toViewers(this.sessions(), this.selfUserId()));

  constructor() {
    void this.start();
  }

  private async start(): Promise<void> {
    let active = true;
    this.destroyRef.onDestroy(() => {
      active = false;
    });

    try {
      const context = await view.getContext();
      if (!active) {
        return;
      }

      // Background: publish presence as soon as the work item detail page opens.
      if (isBackgroundTarget(context.extension.target)) {
        await runPresence({
          isActive: () => active,
          onDestroy: (stop) => {
            this.destroyRef.onDestroy(stop);
          },
        });
        return;
      }

      const userId = context.user?.id;
      if (!userId) {
        throw new Error('当前页面没有登录用户');
      }

      this.selfUserId.set(userId);
      this.isDisplay.set(true);

      await runDisplay({
        userId,
        isActive: () => active,
        onDestroy: (stop) => {
          this.destroyRef.onDestroy(stop);
        },
        onSessions: (sessions) => {
          this.sessions.set(sessions);
        },
      });
    } catch (startError: unknown) {
      if (active) {
        this.isDisplay.set(true);
        this.error.set(errorMessage(startError));
      }
    }
  }
}
