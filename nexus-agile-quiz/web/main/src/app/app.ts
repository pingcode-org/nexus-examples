import { UpperCasePipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from "@angular/core";
import { invoke } from "@pc-nexus/bridge";
import { TranslatePipe } from "./i18n/translate.pipe";
import { type OptionId, pickQuestions, type QuestionDef } from "./questions";

type AnswerState = "idle" | "wrong" | "correct";

interface Review {
  label: string;
  tip: string;
}

@Component({
  selector: "app-root",
  imports: [TranslatePipe, UpperCasePipe],
  templateUrl: "./app.html",
  styleUrl: "./app.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly questions = signal(pickQuestions());
  protected readonly index = signal(0);
  protected readonly answerState = signal<AnswerState>("idle");
  protected readonly selected = signal<OptionId | null>(null);
  protected readonly finished = signal(false);
  protected readonly results = signal<Array<"correct" | "wrong" | null>>([]);
  protected readonly review = signal<Review | null>(null);
  protected readonly reviewLoading = signal(false);
  protected readonly reviewError = signal(false);

  protected readonly question = computed<QuestionDef>(
    () => this.questions()[this.index()]!,
  );

  protected readonly correctCount = computed(
    () => this.results().filter((r) => r === "correct").length,
  );

  protected readonly score = computed(() => {
    const total = this.questions().length;
    if (total === 0) {
      return 0;
    }
    return Math.round((this.correctCount() / total) * 100);
  });

  protected stepState(i: number): "pending" | "correct" | "wrong" {
    const result = this.results()[i];
    if (result === "correct" || result === "wrong") {
      return result;
    }
    return "pending";
  }

  protected onPick(optionId: OptionId) {
    if (this.answerState() !== "idle" || this.finished()) {
      return;
    }

    this.selected.set(optionId);
    const ok = optionId === this.question().correct;
    const state: AnswerState = ok ? "correct" : "wrong";
    this.answerState.set(state);
    this.results.update((list) => {
      const next = [...list];
      next[this.index()] = state;
      return next;
    });
  }

  protected onNext() {
    const next = this.index() + 1;
    if (next >= this.questions().length) {
      this.finished.set(true);
      return;
    }
    this.index.set(next);
    this.answerState.set("idle");
    this.selected.set(null);
  }

  protected async onReview() {
    if (this.reviewLoading() || this.review()) {
      return;
    }
    this.reviewLoading.set(true);
    this.reviewError.set(false);
    try {
      // 调用名须与 resolver.define("getReview") 一致。
      const result = await invoke<{ score: number }, Review>("getReview", {
        score: this.score(),
      });
      this.review.set(result);
    } catch {
      this.reviewError.set(true);
    } finally {
      this.reviewLoading.set(false);
    }
  }

  protected onReplay() {
    this.questions.set(pickQuestions());
    this.index.set(0);
    this.answerState.set("idle");
    this.selected.set(null);
    this.finished.set(false);
    this.results.set([]);
    this.review.set(null);
    this.reviewLoading.set(false);
    this.reviewError.set(false);
  }
}
