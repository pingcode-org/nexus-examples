import { Component, computed, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { invoke, router } from "@pc-nexus/bridge";
import { ThyButton } from "ngx-tethys/button";
import { ThyInputDirective } from "ngx-tethys/input";

interface GithubProfile {
  login: string;
  name: string;
  avatarUrl: string;
  bio: string;
  company: string;
  location: string;
  profileUrl: string;
  publicRepos: number;
}

type GithubLookup =
  | { status: "unbound" }
  | { status: "ready"; profile: GithubProfile }
  | { status: "not_found"; username: string }
  | { status: "rate_limited"; username: string };

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | GithubLookup;

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "无法绑定 GitHub 用户";
}

@Component({
  selector: "app-root",
  imports: [FormsModule, ThyButton, ThyInputDirective],
  templateUrl: "./app.html",
  styleUrl: "./app.scss",
})
export class App {
  protected readonly draft = signal("");
  protected readonly profile = signal<GithubProfile | null>(null);
  protected readonly state = signal<LoadState>({ status: "loading" });

  protected readonly loading = computed(() => this.state().status === "loading");
  protected readonly binding = signal(false);
  protected readonly actionLabel = computed(() => (this.profile() ? "重新绑定" : "绑定"));
  protected readonly statusMessage = computed(() => {
    const current = this.state();
    if (current.status === "loading") {
      return { kind: "info" as const, text: "正在读取绑定信息…" };
    }
    if (current.status === "unbound") {
      return { kind: "info" as const, text: "请先绑定 GitHub 账号以查看个人资料。" };
    }
    if (current.status === "error") {
      return { kind: "error" as const, text: current.message };
    }
    if (current.status === "not_found") {
      return { kind: "error" as const, text: "找不到这个 GitHub 用户。" };
    }
    if (current.status === "rate_limited") {
      return { kind: "error" as const, text: "GitHub 公开接口请求过于频繁，请稍后再试。" };
    }
    return null;
  });

  constructor() {
    void this.loadBinding();
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    if (!this.loading() && !this.binding()) {
      void this.bindUsername(this.draft());
    }
  }

  protected onOpenProfile(event: Event, url: string): void {
    event.preventDefault();
    void router.open(url);
  }

  private async loadBinding(): Promise<void> {
    try {
      // invoke 的调用名必须与后端 resolver.define 注册的名称一致。
      const next = await invoke<Record<string, never>, GithubLookup>("getGithubUser", {});
      this.applyLookup(next);
    } catch (error: unknown) {
      this.state.set({ status: "error", message: errorMessage(error) });
    }
  }

  private async bindUsername(name: string): Promise<void> {
    const trimmed = name.trim();
    if (!trimmed) {
      this.state.set({ status: "error", message: "请输入 GitHub 用户名" });
      return;
    }
    this.binding.set(true);
    try {
      const next = await invoke<{ username: string }, GithubLookup>("getGithubUser", {
        username: trimmed,
      });
      this.applyLookup(next);
    } catch (error: unknown) {
      this.state.set({ status: "error", message: errorMessage(error) });
    } finally {
      this.binding.set(false);
    }
  }

  private applyLookup(next: GithubLookup): void {
    if (next.status === "ready") {
      this.profile.set(next.profile);
      this.draft.set("");
    }

    this.state.set(next);
  }
}
