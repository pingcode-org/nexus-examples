import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  afterNextRender,
  signal,
  viewChild,
} from '@angular/core';
import {
  richtext,
  type RichtextContent,
  type RichtextEditorRef,
  type RichtextRendererRef,
} from '@pc-nexus/capabilities';
import { ThyDivider } from 'ngx-tethys/divider';

const INITIAL_CONTENT: RichtextContent = [
  {
    type: 'heading-two',
    children: [{ text: '什么是 Nexus' }],
  },
  {
    type: 'paragraph',
    children: [
      { text: 'Nexus 平台是 PingCode 团队提供的' },
      { text: '开发者平台', bold: true },
      {
        text: '，提供一系列的代码框架、工具集和运行时，让开发者能够在 PingCode 产品上开发出插件应用，以提高产品的扩展能力。',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      { text: '开发者可以使用 ' },
      { text: 'Custom UI', italic: true },
      {
        text: ' 构建应用界面，并直接调用工作项、通知、富文本、成员选择等前端业务能力，而无需重复开发。',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [{ text: '常见能力如下：' }],
  },
  {
    type: 'bulleted-list',
    children: [
      {
        type: 'list-item',
        children: [
          {
            type: 'paragraph',
            children: [{ text: '打开工作项创建和详情弹窗，也可用于产品需求、工单等业务对象' }],
          },
        ],
      },
      {
        type: 'list-item',
        children: [
          {
            type: 'paragraph',
            children: [{ text: '显示与 PingCode 风格一致的通知，并选择企业成员' }],
          },
        ],
      },
      {
        type: 'list-item',
        children: [
          {
            type: 'paragraph',
            children: [{ text: '嵌入富文本编辑器和渲染器，用于展示和编辑内容' }],
          },
        ],
      },
    ],
  },
  {
    type: 'paragraph',
    children: [{ text: '以上能力均可在应用中直接调用，无需重复编写代码。' }],
  },
];

@Component({
  selector: 'app-richtext',
  imports: [ThyDivider],
  templateUrl: './richtext.html',
  styleUrl: './richtext.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RichtextComponent implements OnDestroy {
  private readonly editorIframe = viewChild.required<ElementRef<HTMLIFrameElement>>('editorIframe');
  private readonly rendererIframe =
    viewChild.required<ElementRef<HTMLIFrameElement>>('rendererIframe');

  protected readonly plain = signal('');
  protected readonly html = signal('');

  private editorRef: RichtextEditorRef | null = null;
  private rendererRef: RichtextRendererRef | null = null;
  private content: RichtextContent = INITIAL_CONTENT;
  private destroyed = false;

  constructor() {
    afterNextRender(() => {
      if (this.destroyed) {
        return;
      }
      void this.mount();
    });
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.release();
  }

  private async mount() {
    const editor = await richtext.createEditor(this.editorIframe().nativeElement, {
      content: this.content,
      onContentChange: (doc) => {
        if (this.destroyed) {
          return;
        }
        this.content = doc ?? [];
        this.rendererRef?.update(this.content);
        void this.refreshText();
      },
    });
    if (this.destroyed) {
      editor.destroy();
      return;
    }
    this.editorRef = editor;

    const renderer = await richtext.createRenderer(this.rendererIframe().nativeElement, {
      content: this.content,
    });
    if (this.destroyed) {
      this.release();
      this.destroyRenderer(renderer);
      return;
    }
    this.rendererRef = renderer;
    await this.refreshText();
  }

  private release(): void {
    this.editorRef?.destroy();
    this.destroyRenderer(this.rendererRef);
    this.editorRef = null;
    this.rendererRef = null;
  }

  private destroyRenderer(renderer: RichtextRendererRef | null): void {
    (renderer as { destroy?: () => void } | null)?.destroy?.();
  }

  private async refreshText() {
    const [plain, html] = await Promise.all([
      richtext.toPlainText(this.content),
      richtext.toHtml(this.content),
    ]);
    if (this.destroyed) {
      return;
    }
    this.plain.set(plain);
    this.html.set(html);
  }
}
