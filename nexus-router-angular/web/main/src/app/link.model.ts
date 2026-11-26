export interface LinkItem {
  id: number;
  name: string;
  url: string;
  openInNewTab: boolean;
}

export interface LinkFormValue {
  name: string;
  url: string;
  openInNewTab: boolean;
}

export const INITIAL_LINKS: LinkItem[] = [
  { id: 1, name: "开放平台", url: "https://developer.pingcode.com", openInNewTab: false },
  { id: 2, name: "开发者中心", url: "https://developer.pingcode.com/console", openInNewTab: false },
  { id: 3, name: "Bridge Router 文档", url: "https://developer.pingcode.com/reference/interface/bridge/router", openInNewTab: true },
  { id: 4, name: "CLI 文档", url: "https://developer.pingcode.com/reference/cli/overview", openInNewTab: true },
];

export const INITIAL_RECENT_IDS = [2, 1, 3];
