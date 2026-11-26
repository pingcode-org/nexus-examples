import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@pc-nexus/angular/router';
import { LinkStore } from './link.store';

@Component({
  selector: 'app-links-page',
  imports: [RouterLink],
  template: `
    <header class="layout-header layout-header-divided">
      <h1 class="layout-header-title">全部链接</h1>
    </header>
    <div class="layout-content-main">
      <div class="tips-row">
        <span class="tips-content">
          <svg class="tips-icon" viewBox="0 0 16 16" aria-hidden="true">
                  <g transform="translate(0 16) scale(0.038 -0.038)" fill="currentColor" fill-rule="evenodd">
                    <path d="M256.1368421052632 23.921052631579L256.1368421052632 23.921052631579L169.6631578947368 23.921052631579C164.2684210526316 23.921052631579 159.9 19.6578947368421 159.9 14.3421052631579C159.9 9.0526315789473 164.2684210526316 4.578947368421 169.6631578947368 4.578947368421L256.1368421052632 4.578947368421C261.4526315789474 4.578947368421 265.9263157894737 9.0526315789473 265.9263157894737 14.3421052631579C265.9263157894737 19.6578947368421 261.4526315789474 23.921052631579 256.1368421052632 23.921052631579M324.6105263157895 197.7631578947369L324.6105263157895 197.7631578947369L324.4 197.7631578947369C313.478947368421 178.5263157894737 297.978947368421 162.1842105263158 279.0315789473684 150.9473684210527C274.2157894736842 148.0526315789474 271.5315789473684 142.6315789473684 271.5315789473684 137.0263157894737L271.2157894736842 137.0263157894737L271.2157894736842 99.6578947368421L154.7157894736842 99.6578947368421L154.7157894736842 137.0263157894737C154.7157894736842 143.7894736842105 150.8473684210526 149.2894736842105 145.3473684210526 151.5789473684211C127.2421052631579 163.1315789473684 111.8210526315789 178.8421052631579 101.4263157894737 197.7631578947369C90.9263157894737 216.2894736842105 85.0842105263158 237.7368421052632 85.0842105263158 260.3947368421052C85.0842105263158 295.6842105263158 99.4526315789474 327.7105263157895 122.5578947368421 350.8157894736842C145.5315789473684 374.0263157894737 177.7947368421052 388.3947368421053 212.8473684210526 388.3947368421053C248.2157894736842 388.3947368421053 280.2684210526316 374.0263157894737 303.2684210526316 350.8157894736842C326.478947368421 327.7105263157895 340.7421052631579 295.6842105263158 340.7421052631579 260.3947368421052C340.7421052631579 237.5263157894737 335.0052631578947 216.0789473684211 324.6105263157895 197.7631578947369M373.2947368421053 260.3947368421052L373.2947368421053 260.3947368421052C373.2947368421053 304.7368421052631 355.3736842105264 344.7894736842105 326.1631578947368 373.9210526315789C297.2421052631579 402.8421052631579 257.1894736842105 421.0526315789474 212.8473684210526 421.0526315789474C168.7421052631579 421.0526315789474 128.4789473684211 402.8421052631579 99.4526315789474 373.9210526315789C70.5315789473684 344.7894736842105 52.6368421052632 304.7368421052631 52.6368421052632 260.3947368421052C52.6368421052632 231.8947368421053 60.0052631578947 205.0526315789474 73.0315789473684 181.8684210526316C85.4 160.6315789473684 102.0578947368421 142.2105263157895 122.1368421052632 128.3947368421053L122.1368421052632 83.3421052631579C122.1368421052632 74.5 129.4263157894737 67 138.2684210526316 67L287.6631578947369 67C296.6105263157895 67 303.6894736842105 74.5 303.6894736842105 83.3421052631579L303.6894736842105 128.3947368421053C323.8736842105263 142.2105263157895 340.7421052631579 160.6315789473684 352.6894736842105 181.8684210526316C365.9 205.2631578947369 373.2947368421053 231.8947368421053 373.2947368421053 260.3947368421052M287.6631578947369 58.0526315789473L287.6631578947369 58.0526315789473L138.2684210526316 58.0526315789473C132.9526315789474 58.0526315789473 128.4789473684211 53.578947368421 128.4789473684211 48.2631578947368C128.4789473684211 42.7631578947368 132.9526315789474 38.5 138.2684210526316 38.5L287.6631578947369 38.5C292.8736842105264 38.5 297.2421052631579 42.7631578947368 297.2421052631579 48.2631578947368C297.2421052631579 53.578947368421 292.8736842105264 58.0526315789473 287.6631578947369 58.0526315789473M264.6631578947368 268.9473684210526C251.6631578947369 255.8421052631579 233.1368421052632 247.6052631578947 212.8473684210526 247.6052631578947C202.8736842105263 247.6052631578947 193.5052631578947 249.5789473684211 184.7684210526316 253.0263157894737C175.8210526315789 256.6578947368421 167.8210526315789 262.1842105263158 161.1631578947368 268.9473684210526C157.4 272.6842105263158 151.1631578947368 272.7894736842105 147.5315789473684 268.9473684210526C143.5578947368421 265.1842105263158 143.5578947368421 258.9473684210526 147.3210526315789 255.421052631579C155.8473684210526 246.8947368421053 166.2421052631579 239.8157894736842 177.4789473684211 235.1315789473684C188.4 230.6578947368421 200.3736842105263 228.1578947368421 212.8473684210526 228.1578947368421C238.4526315789474 228.1578947368421 261.6631578947368 238.5526315789474 278.5315789473684 255.2105263157895C282.3473684210527 258.9473684210526 282.3473684210527 265.1842105263158 278.5315789473684 268.9473684210526C274.7684210526316 272.7894736842105 268.5315789473684 272.7894736842105 264.6631578947368 268.9473684210526" ></path>
                  </g>
                </svg>
          <span class="tips-label">Tips：</span>
          <span>点击名称打开链接，按每条链接的设置打开</span>
        </span>
      </div>

      <div class="link-search-row">
        <span class="search-input-wrap">
          <svg class="search-icon" viewBox="0 0 16 16" aria-hidden="true">
            <path
              d="M6.751 12.303A5.557 5.557 0 011.2 6.751C1.2 3.691 3.69 1.2 6.751 1.2a5.558 5.558 0 015.551 5.551 5.557 5.557 0 01-5.551 5.552M6.751 0a6.751 6.751 0 104.309 11.949l3.855 3.855a.6.6 0 10.849-.849l-3.854-3.853A6.751 6.751 0 006.751 0"
              fill="currentColor"
              fill-rule="evenodd"
            />
          </svg>
          <input
            class="form-input search-input"
            aria-label="搜索链接"
            placeholder="搜索"
            [value]="query()"
            (input)="updateQuery(searchInput.value)"
            #searchInput
          />
          @if (query()) {
            <button type="button" class="search-clear" aria-label="清空搜索" (click)="updateQuery('')">
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <g transform="rotate(45 8.056 8.056)">
                  <path
                    d="M7.456 7.456V-.115h1.2v7.571h7.572v1.2H8.656v7.572h-1.2V8.656H-.115v-1.2h7.571z"
                    fill="currentColor"
                    fill-rule="evenodd"
                  />
                </g>
              </svg>
            </button>
          }
        </span>
        <span class="header-content-info">
          <span class="count-value">{{ visibleLinks().length }}</span>
          <span class="count-unit">个链接</span>
        </span>
        <a class="action-btn search-row-action" routerLink="/links/new" [state]="{ from: listPath() }">
          <svg class="action-btn-plus-icon" viewBox="0 0 16 16" aria-hidden="true">
            <path
              d="M8.578 7.383V1.602a.601.601 0 10-1.2 0v5.781H1.6a.601.601 0 000 1.203h5.777v5.812a.601.601 0 101.2 0V8.586H14.4a.601.601 0 000-1.203H8.578z"
              fill="currentColor"
              fill-rule="evenodd"
            />
          </svg>
          新建
        </a>
      </div>

      <div class="link-table-wrap">
        <table class="link-table">
          <colgroup>
            <col style="width: 18%" />
            <col style="width: 48%" />
            <col style="width: 16%" />
            <col style="width: 18%" />
          </colgroup>
          <thead>
            <tr>
              <th>名称</th>
              <th>链接地址</th>
              <th>打开方式</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            @for (link of visibleLinks(); track link.id) {
              <tr>
                <td>
                  <button type="button" class="link-name-btn" (click)="open(link)">{{ link.name }}</button>
                </td>
                <td class="link-url-cell">{{ link.url }}</td>
                <td>
                  <span [class]="link.openInNewTab ? 'link-badge link-badge-new' : 'link-badge'">
                    {{ link.openInNewTab ? '新窗口' : '当前窗口' }}
                  </span>
                </td>
                <td>
                  <div class="link-card-actions">
                    <a class="link-action" [routerLink]="['/links', link.id]" [state]="{ from: listPath() }">编辑</a>
                    <button type="button" class="link-action link-action-danger" (click)="store.remove(link.id)">删除</button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
        @if (visibleLinks().length === 0) {
          <div class="table-empty">
            <div class="portal-empty">
              <img class="portal-empty-image" src="assets/empty.svg" alt="" />
              <div class="portal-empty-text">暂无数据</div>
            </div>
          </div>
        }
      </div>
      @if (store.error()) { <p class="page-meta page-meta-gap page-meta-error">错误：{{ store.error() }}</p> }
    </div>
  `,
})
export class LinksPage {
  protected readonly store = inject(LinkStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly query = signal(this.route.snapshot.queryParamMap.get('q') ?? '');
  protected readonly visibleLinks = computed(() => {
    const keyword = this.query().trim().toLowerCase();
    return keyword
      ? this.store.links().filter(
          (link) => link.name.toLowerCase().includes(keyword) || link.url.toLowerCase().includes(keyword),
        )
      : this.store.links();
  });
  protected readonly listPath = computed(() => {
    const query = this.query();
    return query ? `/links?q=${encodeURIComponent(query)}` : '/links';
  });

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.query.set(params.get('q') ?? '');
    });
  }

  protected updateQuery(value: string): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: value || null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  protected open(link: Parameters<LinkStore['openLink']>[0]): void {
    void this.store.openLink(link);
  }
}
