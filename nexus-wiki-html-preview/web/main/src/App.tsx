import "@vitejs/plugin-react/preamble";
import { useEffect, useRef, useState } from "react";
import { events, view } from "@pc-nexus/bridge";
import { NEXUS_EXTENSION_DATA_CONFIG_CHANGED } from "@pc-nexus/models";
import { readBlockConfig } from "../../shared/config.ts";
import { observeIframeHeight, toSrcDoc } from "../../shared/htmlPreview.ts";

type ViewStatus =
  | { kind: "loading" | "empty" | "error"; message: string }
  | { kind: "ready"; html: string };

type HtmlPreviewProps = {
  html: string;
  title: string;
  className: string;
  autoHeight?: boolean;
};

function HtmlPreview({ html, title, className, autoHeight = false }: HtmlPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!autoHeight || !iframe) return;
    return observeIframeHeight(iframe);
  }, [autoHeight, html]);

  return (
    <iframe
      key={html}
      ref={iframeRef}
      className={className}
      title={title}
      sandbox={autoHeight ? "allow-scripts allow-same-origin" : "allow-scripts"}
      srcDoc={toSrcDoc(html)}
    />
  );
}

function statusFromConfig(config: ReturnType<typeof readBlockConfig>): ViewStatus {
  if (!config.html.trim()) {
    return {
      kind: "empty",
      message: "请输入 HTML 内容。",
    };
  }
  return {
    kind: "ready",
    html: config.html,
  };
}

export default function App() {
  const [status, setStatus] = useState<ViewStatus>({
    kind: "loading",
    message: "正在加载 HTML…",
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const context = await view.getContext();
        if (cancelled) return;
        setStatus(statusFromConfig(readBlockConfig(context.extension.data)));
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "获取数据失败。";
          setStatus({ kind: "error", message });
        }
      } finally {
        if (!cancelled) {
          await view.emitReadyEvent();
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const subscription = events.on<{ config?: unknown }>(
      NEXUS_EXTENSION_DATA_CONFIG_CHANGED,
      (payload) => {
        setStatus(statusFromConfig(readBlockConfig({ config: payload?.config })));
      },
    );

    return () => {
      void subscription.then((value) => value?.unsubscribe());
    };
  }, []);

  if (status.kind === "ready") {
    return (
      <div className="preview-frame">
        <HtmlPreview
          html={status.html}
          className="html-preview-frame"
          title="HTML 内容"
          autoHeight
        />
      </div>
    );
  }

  const statusClass =
    status.kind === "error" ? "preview-status preview-status-error" : "preview-status";
  return (
    <div className="preview-frame">
      <p className={statusClass}>{status.message}</p>
    </div>
  );
}
