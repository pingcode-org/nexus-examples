import { Injectable, signal } from '@angular/core';
import { router } from '@pc-nexus/bridge';
import { NavigationTarget } from '@pc-nexus/models';
import { INITIAL_LINKS, INITIAL_RECENT_IDS, LinkFormValue, LinkItem } from './link.model';

@Injectable({ providedIn: 'root' })
export class LinkStore {
  private readonly linksState = signal<LinkItem[]>(INITIAL_LINKS);
  private readonly recentIdsState = signal<number[]>(INITIAL_RECENT_IDS);

  readonly links = this.linksState.asReadonly();
  readonly recentIds = this.recentIdsState.asReadonly();
  readonly error = signal<string | null>(null);

  create(value: LinkFormValue): void {
    this.linksState.update((links) => [
      ...links,
      { id: Date.now(), name: value.name, url: value.url, openInNewTab: value.openInNewTab },
    ]);
  }

  update(id: number, value: LinkFormValue): void {
    this.linksState.update((links) => links.map((link) => (link.id === id ? { ...link, ...value } : link)));
  }

  remove(id: number): void {
    this.linksState.update((links) => links.filter((link) => link.id !== id));
    this.recentIdsState.update((ids) => ids.filter((item) => item !== id));
  }

  async openLink(link: LinkItem): Promise<void> {
    this.recentIdsState.update((ids) => [link.id, ...ids.filter((id) => id !== link.id)]);
    this.error.set(null);
    try {
      if (link.openInNewTab) {
        await router.open(link.url);
      } else {
        await router.navigate(link.url);
      }
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : String(err));
    }
  }

  async generateUrl(target: NavigationTarget, id: string): Promise<string> {
    const url = await router.generateUrl({ target, id });
    return url.toString();
  }
}
