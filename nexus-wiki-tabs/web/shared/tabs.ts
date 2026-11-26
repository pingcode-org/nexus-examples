export type WikiTab = {
  id: string;
  title: string;
};

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function readTabs(data: unknown): WikiTab[] {
  const root = isRecord(data) ? data : {};
  const source = isRecord(root.config) ? root.config : root;
  if (!Array.isArray(source.tabs)) return [];

  const seen = new Set<string>();
  const tabs: WikiTab[] = [];
  for (const item of source.tabs) {
    if (!isRecord(item)) continue;
    if (
      typeof item.id !== "string" ||
      item.id.length === 0 ||
      seen.has(item.id)
    ) {
      continue;
    }
    if (typeof item.title !== "string") continue;
    seen.add(item.id);
    tabs.push({ id: item.id, title: item.title });
  }
  return tabs;
}
