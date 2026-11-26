import { useEffect, useRef, useState } from "react";
import { view } from "@pc-nexus/bridge";
import { NxBlockContent, NxBox, NxTab, NxTabs, NxText } from "@pc-nexus/react";
import { readTabs, type WikiTab } from "../shared/tabs";

export function App() {
  const [tabs, setTabs] = useState<WikiTab[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [message, setMessage] = useState("正在加载标签…");
  const [loadState, setLoadState] = useState<"loading" | "ready">("loading");
  const readySent = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const context = await view.getContext();
        if (cancelled) return;
        setTabs(readTabs(context.extension.data));
        setActiveIndex(0);
        setMessage("");
      } catch (err) {
        if (!cancelled) {
          setMessage(err instanceof Error ? err.message : "标签加载失败。");
        }
      } finally {
        if (!cancelled) setLoadState("ready");
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (loadState !== "ready" || readySent.current) return;
    readySent.current = true;
    void view.emitReadyEvent();
  }, [loadState, tabs]);

  if (message && tabs.length === 0) {
    return (
      <NxBox>
        <NxText>{message}</NxText>
      </NxBox>
    );
  }

  if (tabs.length === 0) {
    return (
      <NxBox>
        <NxText>还没有标签。请打开配置并保存至少一个标签。</NxText>
      </NxBox>
    );
  }

  const safeIndex = Math.min(activeIndex, tabs.length - 1);

  return (
    <NxBox>
      <NxTabs activeTab={safeIndex} onActiveTabChange={setActiveIndex}>
        {tabs.map((tab) => (
          <NxTab key={tab.id} title={tab.title} />
        ))}
      </NxTabs>
      {tabs.map((tab, index) => (
        <NxBlockContent
          key={tab.id}
          contentId={tab.id}
          hidden={index !== safeIndex}
          className="mb-0"
        />
      ))}
    </NxBox>
  );
}
