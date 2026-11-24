import { useEffect, useState } from "react";
import { dialog, view } from "@pc-nexus/bridge";
import type { DocumentBlockSubmitPayload } from "@pc-nexus/models";
import {
  NxBox,
  NxButton,
  NxButtonGroup,
  NxContent,
  NxInput,
  NxLayout,
  NxSelect,
  NxText,
  NxDivider,
} from "@pc-nexus/react";
import { readTabs, isRecord, type WikiTab } from "../shared/tabs";

type TabTemplate = "requirement" | "meeting" | "blank";

type TabTemplateItem = {
  id: TabTemplate;
  label: string;
  titles: string[];
};

type WikiTabsConfig = {
  template?: TabTemplate;
  tabs: WikiTab[];
};

const MAX_TABS = 8;

const TAB_TEMPLATES: TabTemplateItem[] = [
  { id: "requirement", label: "需求说明", titles: ["概述", "细节", "验收标准"] },
  { id: "meeting", label: "会议纪要", titles: ["议程", "讨论", "待办"] },
  { id: "blank", label: "自定义", titles: ["标签 1"] },
];

const TAB_TEMPLATES_MAP: Record<TabTemplate, TabTemplateItem> =
  Object.fromEntries(
    TAB_TEMPLATES.map((item) => [item.id, item]),
  ) as Record<TabTemplate, TabTemplateItem>;

const DEFAULT_TEMPLATE: TabTemplate = "requirement";

function createTab(title: string): WikiTab {
  return { id: crypto.randomUUID(), title };
}

function createTabsFromTemplate(template: TabTemplate): WikiTab[] {
  return TAB_TEMPLATES_MAP[template].titles.map((title) => createTab(title));
}

function readTemplate(data: unknown): TabTemplate | undefined {
  const root = isRecord(data) ? data : {};
  const source = isRecord(root.config) ? root.config : root;
  return typeof source.template === "string" && source.template in TAB_TEMPLATES_MAP ? source.template as TabTemplate : undefined;
}

export function App() {
  const [tabs, setTabs] = useState<WikiTab[]>([]);
  const [template, setTemplate] = useState<TabTemplate>(DEFAULT_TEMPLATE);
  const [isEdit, setIsEdit] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const context = await view.getContext();
      if (cancelled) return;
      const existing = readTabs(context.extension.data);
      if (existing.length > 0) {
        setTabs(existing);
        setTemplate(readTemplate(context.extension.data) ?? DEFAULT_TEMPLATE);
        setIsEdit(true);
      } else {
        setTemplate(DEFAULT_TEMPLATE);
        setTabs(createTabsFromTemplate(DEFAULT_TEMPLATE));
        setIsEdit(false);
      }
      setLoading(false);
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const hasEmptyTitle = tabs.some((tab) => tab.title.trim().length === 0);
  const canSave = !loading && !saving && tabs.length > 0 && !hasEmptyTitle;
  const canAddTab = !loading && !saving && tabs.length < MAX_TABS;
  const templateOptions = TAB_TEMPLATES.map((item) => ({
    value: item.id,
    label: item.label,
  }));

  function onTemplateChange(template: TabTemplate) {
    setTemplate(template);
    setTabs(createTabsFromTemplate(template));
    setErrorMessage("");
  }

  function moveTab(tabs: WikiTab[], index: number, delta: number): WikiTab[] {
    const next = index + delta;
    if (next < 0 || next >= tabs.length) return tabs;
    const copy = tabs.slice();
    const [item] = copy.splice(index, 1);
    if (!item) return tabs;
    copy.splice(next, 0, item);
    return copy;
  }

  async function onDelete(tab: WikiTab) {
    if (tabs.length <= 1 || saving) return;
    await dialog.confirm({
      title: "删除标签",
      content: `删除「${tab.title.trim() || "未命名"}」后，这个标签里的正文也会一起删掉。`,
      operationType: "danger",
      onConfirm: async () => {
        setTabs((current) => current.filter((item) => item.id !== tab.id));
      },
    });
  }

  async function onSave() {
    if (!canSave) {
      if (hasEmptyTitle) setErrorMessage("标签标题不能为空。");
      return;
    }

    const [first, ...rest] = tabs;
    if (!first) return;

    setSaving(true);
    setErrorMessage("");
    const normalized = [first, ...rest].map((tab) => ({
      id: tab.id,
      title: tab.title.trim(),
    }));
    const payload: DocumentBlockSubmitPayload<WikiTabsConfig> = {
      config: {
        template,
        tabs: normalized,
      },
      body: [{ id: first.id }, ...rest.map((tab) => ({ id: tab.id }))],
    };

    try {
      await view.submit(payload);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "标签保存失败。");
      setSaving(false);
    }
  }

  async function onCancel() {
    await view.close();
  }

  return (
    <NxLayout>
      <NxContent className="px-8 pb-4">
        {!isEdit ? (
          <NxBox>
            <NxText>选择模板</NxText>
            <NxSelect
              className="mt-2"
              value={template}
              size="large"
              options={templateOptions}
              disabled={saving}
              onValueChange={(value) => onTemplateChange(value as TabTemplate)}
            />
          </NxBox>
        ) : null}

        {!isEdit ? <NxDivider color="lighter" className="mb-3"></NxDivider> : null}

        <NxBox className="flex justify-content-between align-items-center">
          <NxText>标签</NxText>
          <NxButton
            appearance="link"
            icon="plus"
            disabled={!canAddTab}
            onClick={() => setTabs((current) => [...current, createTab("新标签")])}
          >
            添加标签
          </NxButton>
        </NxBox>

        {tabs.map((tab, index) => (
          <NxBox key={tab.id} className="flex align-items-center mt-2">
            <NxInput
              className="flex-grow-1"
              size="large"
              value={tab.title}
              placeholder="标签标题"
              disabled={saving}
              onValueChange={(title) => {
                setTabs((current) =>
                  current.map((item) => (item.id === tab.id ? { ...item, title } : item)),
                );
              }}
            />


            <NxButtonGroup className="ml-2" size="large" appearance="outline">
              <NxButton
                icon="arrow-up"
                disabled={index === 0 || saving}
                onClick={() => setTabs((current) => moveTab(current, index, -1))}
              />
              <NxButton
                icon="arrow-down"
                disabled={index === tabs.length - 1 || saving}
                onClick={() => setTabs((current) => moveTab(current, index, 1))}
              />
            </NxButtonGroup>

            <NxButton
              appearance="link"
              icon="trash"
              size="large"
              color="danger"
              disabled={tabs.length === 1 || saving}
              onClick={() => void onDelete(tab)}
            />
          </NxBox>
        ))}

        {hasEmptyTitle ? (
          <NxBox className="mt-2">
            <NxText color="danger">标签标题不能为空。</NxText>
          </NxBox>
        ) : null}


        {errorMessage ? (
          <NxBox className="mt-2">
            <NxText color="danger">{errorMessage}</NxText>
          </NxBox>
        ) : null}

        <NxDivider color="lighter"></NxDivider>

        <NxBox className="flex justify-content-end align-items-center">
          <NxButton appearance="outline" disabled={saving} onClick={() => void onCancel()}>
            取消
          </NxButton>
          <NxButton
            className="ms-2"
            color="primary"
            disabled={!canSave}
            onClick={() => void onSave()}
          >
            保存
          </NxButton>
        </NxBox>
      </NxContent>
    </NxLayout>
  );
}
