import { Component, EventEmitter, inject, Input, OnChanges, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationTarget } from '@pc-nexus/models';
import { LinkFormValue } from './link.model';
import { LinkStore } from './link.store';

type FormErrors = { name?: string; url?: string };

@Component({
  selector: 'app-link-form',
  imports: [FormsModule],
  template: `
    <form class="link-form" (ngSubmit)="submit()">
      <label class="form-field">
        <span class="form-label">名称 <span class="form-required">*</span></span>
        <input
          class="form-input"
          name="name"
          aria-label="链接名称"
          [class.form-input-error]="!!errors().name"
          [attr.aria-invalid]="!!errors().name"
          placeholder="输入名称"
          [ngModel]="name()"
          (ngModelChange)="setName($event)"
        />
        @if (errors().name) { <span class="form-field-error">{{ errors().name }}</span> }
      </label>

      <label class="form-field">
        <span class="form-label">链接地址 <span class="form-required">*</span></span>
        <input
          class="form-input"
          name="url"
          aria-label="链接地址"
          [class.form-input-error]="!!errors().url"
          [attr.aria-invalid]="!!errors().url"
          placeholder="输入链接地址"
          [ngModel]="url()"
          (ngModelChange)="setUrl($event)"
        />
        @if (errors().url) { <span class="form-field-error">{{ errors().url }}</span> }
      </label>

      <div class="form-field generate-field">
        <span class="form-label">生成链接</span>
        <div class="generate-row">
          <span class="select-wrap">
            <select class="form-input native-select" name="target" aria-label="目标类型" [ngModel]="target()" (ngModelChange)="setTarget($event)">
              <option value="workitem">工作项</option>
              <option value="testcase">测试用例</option>
              <option value="page">页面</option>
              <option value="idea">需求</option>
              <option value="ticket">工单</option>
              <option value="project">项目</option>
              <option value="library">知识库</option>
              <option value="space">空间</option>
              <option value="product">产品</option>
            </select>
            <svg class="select-arrow" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M7.97815 11.99732L7.9728 12.00267L2.2998 6.33067L3.1298 5.49967L7.97807731 10.3479473L12.8255 5.49967L13.6565 6.33067L7.9835 12.00267L7.97815 11.99732Z" fill="currentColor" />
            </svg>
          </span>
          <input
            class="form-input"
            name="targetId"
            aria-label="目标 id"
            placeholder="输入目标 id"
            [ngModel]="targetId()"
            (ngModelChange)="setTargetId($event)"
          />
          <button type="button" class="action-btn" [disabled]="generating()" (click)="generate()">
            {{ generating() ? '生成中…' : '生成' }}
          </button>
        </div>
        @if (generateError()) { <p class="page-meta page-meta-error">{{ generateError() }}</p> }
      </div>

      <label class="form-switch-row">
        <span class="form-switch-text">新窗口打开</span>
        <span class="thy-switch">
          <input
            class="thy-switch-input"
            type="checkbox"
            name="openInNewTab"
            [ngModel]="openInNewTab()"
            (ngModelChange)="openInNewTab.set($event)"
          />
          <span class="thy-switch-label"></span>
          <span class="thy-switch-handle"></span>
        </span>
      </label>

      <div class="form-actions">
        <button class="action-btn" type="submit">确定</button>
      </div>
    </form>
  `,
})
export class LinkFormComponent implements OnChanges {
  @Input() initial?: LinkFormValue;
  @Output() readonly submitValue = new EventEmitter<LinkFormValue>();

  private readonly store = inject(LinkStore);

  protected readonly name = signal('');
  protected readonly url = signal('');
  protected readonly openInNewTab = signal(false);
  protected readonly target = signal<NavigationTarget>(NavigationTarget.Workitem);
  protected readonly targetId = signal('');
  protected readonly errors = signal<FormErrors>({});
  protected readonly generateError = signal<string | null>(null);
  protected readonly generating = signal(false);

  ngOnChanges(): void {
    if (!this.initial) return;
    this.name.set(this.initial.name);
    this.url.set(this.initial.url);
    this.openInNewTab.set(this.initial.openInNewTab);
  }

  protected setTarget(value: string): void {
    this.target.set(value as NavigationTarget);
  }

  protected setTargetId(value: string): void {
    this.targetId.set(value);
  }

  protected setName(value: string): void {
    this.name.set(value);
    this.clearError('name');
  }

  protected setUrl(value: string): void {
    this.url.set(value);
    this.clearError('url');
  }

  protected clearError(field: keyof FormErrors): void {
    if (!this.errors()[field]) return;
    this.errors.update((current) => ({ ...current, [field]: undefined }));
  }

  protected submit(): void {
    const nextErrors: FormErrors = {};
    if (!this.name().trim()) nextErrors.name = '名称不能为空';
    if (!this.url().trim()) nextErrors.url = '链接地址不能为空';
    this.errors.set(nextErrors);
    if (nextErrors.name || nextErrors.url) return;
    this.submitValue.emit({
      name: this.name().trim(),
      url: this.url().trim(),
      openInNewTab: this.openInNewTab(),
    });
  }

  protected async generate(): Promise<void> {
    this.generateError.set(null);
    if (!this.targetId().trim()) {
      this.generateError.set('目标 id 不能为空');
      return;
    }
    this.generating.set(true);
    try {
      this.url.set(await this.store.generateUrl(this.target(), this.targetId().trim()));
    } catch (err) {
      this.generateError.set(err instanceof Error ? err.message : String(err));
    } finally {
      this.generating.set(false);
    }
  }
}
