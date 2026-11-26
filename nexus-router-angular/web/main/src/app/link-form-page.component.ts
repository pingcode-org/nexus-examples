import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@pc-nexus/angular/router';
import { LinkFormComponent } from './link-form.component';
import { LinkFormValue } from './link.model';
import { LinkStore } from './link.store';

const template = `
  <header class="layout-header layout-header-divided">
    <h1 class="layout-header-title">{{ title() }}</h1>
  </header>
  <div class="layout-content-main">
    @if (isEdit && !link()) {
      <p class="empty-state">找不到该链接。<a routerLink="/links">返回列表</a></p>
    } @else {
      <app-link-form [initial]="initial()" (submitValue)="submit($event)" />
    }
  </div>
`;

abstract class LinkFormPageBase {
  protected readonly store = inject(LinkStore);
  protected readonly router = inject(Router);
  protected readonly route = inject(ActivatedRoute);
  protected readonly from = (history.state?.from as string | undefined) ?? '/links';

  protected abstract readonly isEdit: boolean;
  protected readonly title = computed(() => (this.isEdit ? '编辑链接' : '新建链接'));
  protected readonly link = computed(() => {
    if (!this.isEdit) return undefined;
    const id = Number(this.route.snapshot.paramMap.get('id'));
    return this.store.links().find((item) => item.id === id);
  });
  protected readonly initial = computed<LinkFormValue | undefined>(() => {
    const link = this.link();
    return link ? { name: link.name, url: link.url, openInNewTab: link.openInNewTab } : undefined;
  });

  protected submit(value: LinkFormValue): void {
    const link = this.link();
    if (this.isEdit && link) {
      this.store.update(link.id, value);
    } else if (!this.isEdit) {
      this.store.create(value);
    }
    void this.router.navigateByUrl(this.from);
  }
}

@Component({ selector: 'app-new-link-page', imports: [LinkFormComponent], template })
export class NewLinkPage extends LinkFormPageBase {
  protected readonly isEdit = false;
}

@Component({ selector: 'app-edit-link-page', imports: [LinkFormComponent, RouterLink], template })
export class EditLinkPage extends LinkFormPageBase {
  protected readonly isEdit = true;
}
