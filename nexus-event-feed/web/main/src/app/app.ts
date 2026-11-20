import { DatePipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  resource,
  signal,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { invoke } from "@pc-nexus/bridge";
import { notify, workitem } from "@pc-nexus/capabilities";
import { ThyButton } from "ngx-tethys/button";
import { ThyInputDirective, ThyInputGroup } from "ngx-tethys/input";
import { ThyAlert } from "ngx-tethys/alert";
import { ThyEmpty } from "ngx-tethys/empty";
import { ThySwitch } from "ngx-tethys/switch";
import { ThyTable, ThyTableColumnComponent } from "ngx-tethys/table";
import { ThyTooltipDirective } from "ngx-tethys/tooltip";
import { detailLabels, eventNameLabels, sourceLabels, type Activity, type FeedResponse } from "./feed";

@Component({
  selector: "app-root",
  imports: [
    DatePipe,
    FormsModule,
      ThyButton,
    ThyInputDirective,
    ThyInputGroup,
    ThyAlert,
    ThyEmpty,
    ThySwitch,
    ThyTable,
    ThyTableColumnComponent,
    ThyTooltipDirective,
  ],
  templateUrl: "./app.html",
  styleUrl: "./app.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private refreshTimer: number | undefined;

  protected readonly autoRefresh = signal(false);

  constructor() {
    inject(DestroyRef).onDestroy(() => window.clearInterval(this.refreshTimer));
  }

  protected readonly feedResource = resource({
    // 调用名须与后端 Resolver 注册的 getEventFeed 一致。
    loader: () => invoke<void, FeedResponse>("getEventFeed"),
  });

  protected readonly feed = computed(() => (this.feedResource.hasValue() ? this.feedResource.value() : null));

  protected readonly introLines = [
    "安装、升级、工作项变更，以及提交到页面地址的构建结果，都会记入时间线。",
    "每十分钟汇总并写调度记录，可打开自动刷新。",
  ];

  protected setAutoRefresh(enabled: boolean): void {
    this.autoRefresh.set(enabled);
    window.clearInterval(this.refreshTimer);
    this.refreshTimer = undefined;
    if (!enabled) {
      return;
    }
    this.feedResource.reload();
    this.refreshTimer = window.setInterval(() => this.feedResource.reload(), 5_000);
  }

  protected async copyCurl(url: string): Promise<void> {
    const command = curlCommand(url);
    try {
      await navigator.clipboard.writeText(command);
    } catch {
      const area = document.createElement("textarea");
      area.value = command;
      document.body.appendChild(area);
      area.select();
      const copied = document.execCommand("copy");
      area.remove();
      if (!copied) {
        await notify.error({ title: "复制失败" });
        return;
      }
    }
    await notify.success({ title: "已复制示例命令" });
  }

  protected sourceText(activity: Activity): string {
    return sourceLabels[activity.source];
  }

  protected statusText(activity: Activity): string {
    return activity.summaryStatus === "pending" ? "待汇总" : "已汇总";
  }

  protected eventName(activity: Activity): string {
    const named = eventNameLabels[activity.detail["eventName"] ?? ""] ?? eventNameLabels[activity.detail["eventKey"] ?? ""];
    if (named) {
      return named;
    }
    if (activity.source === "scheduled") {
      return "定时触发";
    }
    if (activity.source === "webhook") {
      return "构建结果";
    }
    if (activity.source === "app") {
      return "汇总完成";
    }
    if (activity.source === "lifecycle") {
      return "应用安装";
    }
    return "";
  }

  protected detailRows(activity: Activity): { key: string; label: string; value: string }[] {
    return Object.entries(activity.detail)
      .filter(([key]) => key !== "identifier" && key !== "workItemId" && key !== "eventName")
      .map(([key, value]) => ({
        key,
        label: key === "title" ? "工作项" : (detailLabels[key] ?? key),
        value: key === "result" ? this.buildResult(value) : value,
      }));
  }

  protected async openWorkItem(activity: Activity): Promise<void> {
    const identifier = activity.detail["identifier"] || activity.detail["workItemId"];
    if (!identifier) {
      return;
    }
    await workitem.openDetail(identifier);
  }

  private buildResult(value: string): string {
    if (value === "succeeded") {
      return "成功";
    }
    if (value === "failed") {
      return "失败";
    }
    return value;
  }
}

function curlCommand(url: string): string {
  const quoted = `'${url.replaceAll("'", "'\\''")}'`;
  return `curl -X POST ${quoted} -H 'Content-Type: application/json' -d '{"buildNumber":"42","result":"succeeded"}'`;
}
