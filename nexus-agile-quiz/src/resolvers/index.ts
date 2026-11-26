import { i18n, Resolver, type SupportedLocaleCode } from "@pc-nexus/core";

const resolver = new Resolver();

type ScoreLevel = "excellent" | "close" | "steady" | "refine" | "start";

interface ReviewPayload {
  score?: number;
}

interface Review {
  label: string;
  tip: string;
}

function getLevel(score: number): ScoreLevel {
  if (score >= 100) return "excellent";
  if (score >= 80) return "close";
  if (score >= 60) return "steady";
  if (score >= 40) return "refine";
  return "start";
}

function asText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

resolver.define<ReviewPayload, Review>(
  "getReview",
  async (context, payload) => {
    const raw = Number(payload?.score);
    const score = Number.isFinite(raw) ? Math.min(100, Math.max(0, raw)) : 0;
    const level = getLevel(score);
    const locale: SupportedLocaleCode =
      context.user?.locale ?? context.team.locale;
    const translator = await i18n.createTranslator(locale);
    return {
      label: asText(translator.translate(`quiz.reviews.${level}.label`)),
      tip: asText(translator.translate(`quiz.reviews.${level}.tip`)),
    };
  },
);

export { resolver };
