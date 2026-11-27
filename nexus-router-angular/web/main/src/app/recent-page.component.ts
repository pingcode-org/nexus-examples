import { Component, computed, inject } from '@angular/core';
import { LinkItem } from './link.model';
import { LinkStore } from './link.store';

@Component({
  selector: 'app-recent-page',
  template: `
    <header class="layout-header layout-header-divided">
      <h1 class="layout-header-title">最近访问</h1>
    </header>
    <div class="layout-content-main">
      @if (links().length === 0) {
        <p class="empty-state">还没有访问记录，去「全部链接」打开一条链接吧。</p>
      } @else {
        <div class="recent-grid">
          @for (link of links(); track link.id) {
            <button type="button" class="recent-card" (click)="open(link)">
              <span class="recent-card-name">{{ link.name }}</span>
              <span class="recent-card-url">{{ link.url }}</span>
            </button>
          }
        </div>
      }
      @if (store.error()) { <p class="page-meta page-meta-gap page-meta-error">错误：{{ store.error() }}</p> }
    </div>
  `,
})
export class RecentPage {
  protected readonly store = inject(LinkStore);
  protected readonly links = computed(() =>
    this.store.recentIds()
      .map((id) => this.store.links().find((link) => link.id === id))
      .filter((link): link is LinkItem => !!link),
  );

  protected open(link: LinkItem): void {
    void this.store.openLink(link);
  }
}
