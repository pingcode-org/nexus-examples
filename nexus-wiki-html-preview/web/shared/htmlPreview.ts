export function toSrcDoc(html: string): string {
  const trimmed = html.trim();
  if (!trimmed) {
    return `<!doctype html><html><head><meta charset="utf-8" /></head><body></body></html>`;
  }
  if (/<!doctype html>|<html[\s>]/i.test(trimmed)) {
    return trimmed;
  }
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
  </head>
  <body>${trimmed}</body>
</html>`;
}

export function observeIframeHeight(iframe: HTMLIFrameElement): () => void {
  let observer: ResizeObserver | undefined;

  const sync = () => {
    const root = iframe.contentDocument?.documentElement;
    if (root) iframe.style.height = `${root.scrollHeight}px`;
  };

  const onLoad = () => {
    observer?.disconnect();
    const root = iframe.contentDocument?.documentElement;
    if (!root) return;
    sync();
    observer = new ResizeObserver(sync);
    observer.observe(root);
  };

  iframe.addEventListener("load", onLoad);
  if (iframe.contentDocument?.readyState === "complete") onLoad();

  return () => {
    iframe.removeEventListener("load", onLoad);
    observer?.disconnect();
  };
}
