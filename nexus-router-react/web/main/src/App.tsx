import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import { NavigationTarget, router } from "@pc-nexus/bridge";
import {
  BrowserRouter,
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "@pc-nexus/react/router";
import emptyIllustration from "./assets/empty.svg";
import "./app.css";

interface LinkItem {
  id: number;
  name: string;
  url: string;
  openInNewTab: boolean;
}

const INITIAL_LINKS: LinkItem[] = [
  { id: 1, name: "开放平台", url: "https://developer.pingcode.com", openInNewTab: false },
  { id: 2, name: "开发者中心", url: "https://developer.pingcode.com/console", openInNewTab: false },
  { id: 3, name: "Bridge Router 文档", url: "https://developer.pingcode.com/reference/interface/bridge/router", openInNewTab: true },
  { id: 4, name: "CLI 文档", url: "https://developer.pingcode.com/reference/cli/overview", openInNewTab: true },
];

const INITIAL_RECENT_IDS = [2, 1, 3];

const NAV_ITEMS = [
  { to: "/recent", label: "最近访问" },
  { to: "/links", label: "全部链接" },
] as const;

function getReturnPath(location: ReturnType<typeof useLocation>) {
  return (location.state as { from?: string } | null)?.from ?? "/links";
}

function AppLayout({
  title,
  tips,
  extra,
  children,
}: {
  title: string;
  tips?: string;
  extra?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="layout layout-has-sidebar">
      <aside className="layout-sidebar sidebar-theme-light">
        <div className="sidebar-content">
          <div className="sidebar-brand">链接</div>
          <nav className="sidebar-menu" aria-label="应用内导航">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => (isActive ? "menu-item menu-item-active" : "menu-item")}
              >
                <span className="menu-item-name">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
      <main className="layout-content">
        <header className="layout-header layout-header-divided">
          <h1 className="layout-header-title">{title}</h1>
        </header>
        <div className="layout-content-main">
          {tips ? (
            <div className="tips-row">
              <div className="tips-content">
                <svg className="tips-icon" viewBox="0 0 16 16" aria-hidden="true">
                  <g transform="translate(0 16) scale(0.038 -0.038)" fill="currentColor" fillRule="evenodd">
                    <path d="M256.1368421052632 23.921052631579L256.1368421052632 23.921052631579L169.6631578947368 23.921052631579C164.2684210526316 23.921052631579 159.9 19.6578947368421 159.9 14.3421052631579C159.9 9.0526315789473 164.2684210526316 4.578947368421 169.6631578947368 4.578947368421L256.1368421052632 4.578947368421C261.4526315789474 4.578947368421 265.9263157894737 9.0526315789473 265.9263157894737 14.3421052631579C265.9263157894737 19.6578947368421 261.4526315789474 23.921052631579 256.1368421052632 23.921052631579M324.6105263157895 197.7631578947369L324.6105263157895 197.7631578947369L324.4 197.7631578947369C313.478947368421 178.5263157894737 297.978947368421 162.1842105263158 279.0315789473684 150.9473684210527C274.2157894736842 148.0526315789474 271.5315789473684 142.6315789473684 271.5315789473684 137.0263157894737L271.2157894736842 137.0263157894737L271.2157894736842 99.6578947368421L154.7157894736842 99.6578947368421L154.7157894736842 137.0263157894737C154.7157894736842 143.7894736842105 150.8473684210526 149.2894736842105 145.3473684210526 151.5789473684211C127.2421052631579 163.1315789473684 111.8210526315789 178.8421052631579 101.4263157894737 197.7631578947369C90.9263157894737 216.2894736842105 85.0842105263158 237.7368421052632 85.0842105263158 260.3947368421052C85.0842105263158 295.6842105263158 99.4526315789474 327.7105263157895 122.5578947368421 350.8157894736842C145.5315789473684 374.0263157894737 177.7947368421052 388.3947368421053 212.8473684210526 388.3947368421053C248.2157894736842 388.3947368421053 280.2684210526316 374.0263157894737 303.2684210526316 350.8157894736842C326.478947368421 327.7105263157895 340.7421052631579 295.6842105263158 340.7421052631579 260.3947368421052C340.7421052631579 237.5263157894737 335.0052631578947 216.0789473684211 324.6105263157895 197.7631578947369M373.2947368421053 260.3947368421052L373.2947368421053 260.3947368421052C373.2947368421053 304.7368421052631 355.3736842105264 344.7894736842105 326.1631578947368 373.9210526315789C297.2421052631579 402.8421052631579 257.1894736842105 421.0526315789474 212.8473684210526 421.0526315789474C168.7421052631579 421.0526315789474 128.4789473684211 402.8421052631579 99.4526315789474 373.9210526315789C70.5315789473684 344.7894736842105 52.6368421052632 304.7368421052631 52.6368421052632 260.3947368421052C52.6368421052632 231.8947368421053 60.0052631578947 205.0526315789474 73.0315789473684 181.8684210526316C85.4 160.6315789473684 102.0578947368421 142.2105263157895 122.1368421052632 128.3947368421053L122.1368421052632 83.3421052631579C122.1368421052632 74.5 129.4263157894737 67 138.2684210526316 67L287.6631578947369 67C296.6105263157895 67 303.6894736842105 74.5 303.6894736842105 83.3421052631579L303.6894736842105 128.3947368421053C323.8736842105263 142.2105263157895 340.7421052631579 160.6315789473684 352.6894736842105 181.8684210526316C365.9 205.2631578947369 373.2947368421053 231.8947368421053 373.2947368421053 260.3947368421052M287.6631578947369 58.0526315789473L287.6631578947369 58.0526315789473L138.2684210526316 58.0526315789473C132.9526315789474 58.0526315789473 128.4789473684211 53.578947368421 128.4789473684211 48.2631578947368C128.4789473684211 42.7631578947368 132.9526315789474 38.5 138.2684210526316 38.5L287.6631578947369 38.5C292.8736842105264 38.5 297.2421052631579 42.7631578947368 297.2421052631579 48.2631578947368C297.2421052631579 53.578947368421 292.8736842105264 58.0526315789473 287.6631578947369 58.0526315789473M264.6631578947368 268.9473684210526C251.6631578947369 255.8421052631579 233.1368421052632 247.6052631578947 212.8473684210526 247.6052631578947C202.8736842105263 247.6052631578947 193.5052631578947 249.5789473684211 184.7684210526316 253.0263157894737C175.8210526315789 256.6578947368421 167.8210526315789 262.1842105263158 161.1631578947368 268.9473684210526C157.4 272.6842105263158 151.1631578947368 272.7894736842105 147.5315789473684 268.9473684210526C143.5578947368421 265.1842105263158 143.5578947368421 258.9473684210526 147.3210526315789 255.421052631579C155.8473684210526 246.8947368421053 166.2421052631579 239.8157894736842 177.4789473684211 235.1315789473684C188.4 230.6578947368421 200.3736842105263 228.1578947368421 212.8473684210526 228.1578947368421C238.4526315789474 228.1578947368421 261.6631578947368 238.5526315789474 278.5315789473684 255.2105263157895C282.3473684210527 258.9473684210526 282.3473684210527 265.1842105263158 278.5315789473684 268.9473684210526C274.7684210526316 272.7894736842105 268.5315789473684 272.7894736842105 264.6631578947368 268.9473684210526" />
                  </g>
                </svg>
                <span className="tips-label">Tips：</span>
                <span>{tips}</span>
              </div>
              {extra ? <div className="tips-extra">{extra}</div> : null}
            </div>
          ) : null}
          {children}
        </div>
      </main>
    </div>
  );
}

function LinksPage({
  links,
  removeLink,
  openLink,
  error,
}: {
  links: LinkItem[];
  removeLink: (id: number) => void;
  openLink: (link: LinkItem) => void;
  error: string | null;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const query = searchParams.get("q") ?? "";
  const listPath = `${location.pathname}${location.search}`;
  const keyword = query.trim().toLowerCase();
  const visibleLinks = keyword
    ? links.filter(
        (link) => link.name.toLowerCase().includes(keyword) || link.url.toLowerCase().includes(keyword),
      )
    : links;

  return (
    <AppLayout title="全部链接" tips="点击名称打开链接，按每条链接的设置打开">
      <div className="link-search-row">
        <span className="search-input-wrap">
          <svg className="search-icon" viewBox="0 0 16 16" aria-hidden="true">
            <path
              d="M6.751 12.303A5.557 5.557 0 011.2 6.751C1.2 3.691 3.69 1.2 6.751 1.2a5.558 5.558 0 015.551 5.551 5.557 5.557 0 01-5.551 5.552M6.751 0a6.751 6.751 0 104.309 11.949l3.855 3.855a.6.6 0 10.849-.849l-3.854-3.853A6.751 6.751 0 006.751 0"
              fill="currentColor"
              fillRule="evenodd"
            />
          </svg>
          <input
            className="form-input search-input"
            aria-label="搜索链接"
            placeholder="搜索"
            value={query}
            onChange={(event) => {
              const value = event.target.value;
              setSearchParams(value ? { q: value } : {});
            }}
          />
          {query ? (
            <button
              type="button"
              className="search-clear"
              aria-label="清空搜索"
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.delete("q");
                setSearchParams(next);
              }}
            >
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <g transform="rotate(45 8.056 8.056)">
                  <path
                    d="M7.456 7.456V-.115h1.2v7.571h7.572v1.2H8.656v7.572h-1.2V8.656H-.115v-1.2h7.571z"
                    fill="currentColor"
                    fillRule="evenodd"
                  />
                </g>
              </svg>
            </button>
          ) : null}
        </span>
        <span className="header-content-info">
          <span className="count-value">{visibleLinks.length}</span>
          <span className="count-unit">个链接</span>
        </span>
        <Link className="action-btn search-row-action" to="/links/new" state={{ from: listPath }}>
          <svg className="action-btn-plus-icon" viewBox="0 0 16 16" aria-hidden="true">
            <path
              d="M8.578 7.383V1.602a.601.601 0 10-1.2 0v5.781H1.6a.601.601 0 000 1.203h5.777v5.812a.601.601 0 101.2 0V8.586H14.4a.601.601 0 000-1.203H8.578z"
              fill="currentColor"
              fillRule="evenodd"
            />
          </svg>
          新建
        </Link>
      </div>
      <div className="link-table-wrap">
        <table className="link-table">
          <colgroup>
            <col style={{ width: "18%" }} />
            <col style={{ width: "48%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "18%" }} />
          </colgroup>
          <thead>
            <tr>
              <th>名称</th>
              <th>链接地址</th>
              <th>打开方式</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {visibleLinks.map((link) => (
              <tr key={link.id}>
                <td>
                  <button type="button" className="link-name-btn" onClick={() => openLink(link)}>
                    {link.name}
                  </button>
                </td>
                <td className="link-url-cell">{link.url}</td>
                <td>
                  <span className={link.openInNewTab ? "link-badge link-badge-new" : "link-badge"}>
                    {link.openInNewTab ? "新窗口" : "当前窗口"}
                  </span>
                </td>
                <td>
                  <div className="link-card-actions">
                    <Link className="link-action" to={`/links/${link.id}`} state={{ from: listPath }}>
                      编辑
                    </Link>
                    <button
                      type="button"
                      className="link-action link-action-danger"
                      onClick={() => removeLink(link.id)}
                    >
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visibleLinks.length === 0 ? (
          <div className="table-empty">
            <div className="portal-empty">
              <img className="portal-empty-image" src={emptyIllustration} alt="" />
              <div className="portal-empty-text">暂无数据</div>
            </div>
          </div>
        ) : null}
      </div>
      {error ? <p className="page-meta page-meta-gap page-meta-error">错误：{error}</p> : null}
    </AppLayout>
  );
}

function RecentPage({
  links,
  recentIds,
  openLink,
}: {
  links: LinkItem[];
  recentIds: number[];
  openLink: (link: LinkItem) => void;
}) {
  const recentLinks = recentIds
    .map((id) => links.find((link) => link.id === id))
    .filter((link): link is LinkItem => Boolean(link));

  return (
    <AppLayout title="最近访问">
      {recentLinks.length === 0 ? (
        <p className="empty-state">还没有访问记录，去「全部链接」打开一条链接吧。</p>
      ) : (
        <div className="recent-grid">
          {recentLinks.map((link) => (
            <button type="button" className="recent-card" key={link.id} onClick={() => openLink(link)}>
              <span className="recent-card-name">{link.name}</span>
              <span className="recent-card-url">{link.url}</span>
            </button>
          ))}
        </div>
      )}
    </AppLayout>
  );
}

interface LinkFormValue {
  name: string;
  url: string;
  openInNewTab: boolean;
}

const TARGET_OPTIONS = [
  { value: NavigationTarget.Workitem, label: "工作项" },
  { value: NavigationTarget.Testcase, label: "测试用例" },
  { value: NavigationTarget.Page, label: "页面" },
  { value: NavigationTarget.Idea, label: "需求" },
  { value: NavigationTarget.Ticket, label: "工单" },
  { value: NavigationTarget.Project, label: "项目" },
  { value: NavigationTarget.Library, label: "知识库" },
  { value: NavigationTarget.Space, label: "空间" },
  { value: NavigationTarget.Product, label: "产品" },
] as const;

function LinkForm({
  initial,
  onSubmit,
  submitLabel,
}: {
  initial?: LinkFormValue;
  onSubmit: (value: LinkFormValue) => void;
  submitLabel: string;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [url, setUrl] = useState(initial?.url ?? "");
  const [openInNewTab, setOpenInNewTab] = useState(initial?.openInNewTab ?? false);
  const [target, setTarget] = useState<NavigationTarget>(NavigationTarget.Workitem);
  const [targetId, setTargetId] = useState("");
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; url?: string }>({});

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: { name?: string; url?: string } = {};
    if (!name.trim()) nextErrors.name = "名称不能为空";
    if (!url.trim()) nextErrors.url = "链接地址不能为空";
    setErrors(nextErrors);
    if (nextErrors.name || nextErrors.url) return;
    onSubmit({ name: name.trim(), url: url.trim(), openInNewTab });
  };

  const generate = async () => {
    setGenerateError(null);
    setGenerated(false);
    if (!targetId.trim()) {
      setGenerateError("目标 id 不能为空");
      return;
    }
    setGenerating(true);
    try {
      const generated = await router.generateUrl({ target, id: targetId.trim() });
      setUrl(generated.toString());
      setGenerated(true);
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : String(err));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <form className="link-form" onSubmit={handleSubmit}>
      <label className="form-field">
        <span className="form-label">
          名称 <span className="form-required">*</span>
        </span>
        <input
          className={errors.name ? "form-input form-input-error" : "form-input"}
          aria-label="链接名称"
          aria-invalid={Boolean(errors.name)}
          placeholder="输入名称"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            if (errors.name) setErrors((current) => ({ ...current, name: undefined }));
          }}
        />
        {errors.name ? <span className="form-field-error">{errors.name}</span> : null}
      </label>
      <label className="form-field">
        <span className="form-label">
          链接地址 <span className="form-required">*</span>
        </span>
        <input
          className={errors.url ? "form-input form-input-error" : "form-input"}
          aria-label="链接地址"
          aria-invalid={Boolean(errors.url)}
          placeholder="输入链接地址"
          value={url}
          onChange={(event) => {
            setUrl(event.target.value);
            if (errors.url) setErrors((current) => ({ ...current, url: undefined }));
          }}
        />
        {errors.url ? <span className="form-field-error">{errors.url}</span> : null}
      </label>
      <div className="form-field generate-field">
        <span className="form-label">生成链接</span>
        <div className="generate-row">
          <span className="select-wrap">
            <select
              className="form-input native-select"
              aria-label="目标类型"
              value={target}
              onChange={(event) => {
                setTarget(event.target.value as NavigationTarget);
                setGenerated(false);
              }}
            >
              {TARGET_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <svg className="select-arrow" viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M7.97815 11.99732L7.9728 12.00267L2.2998 6.33067L3.1298 5.49967L7.97807731 10.3479473L12.8255 5.49967L13.6565 6.33067L7.9835 12.00267L7.97815 11.99732Z"
                fill="currentColor"
              />
            </svg>
          </span>
          <input
            className="form-input"
            aria-label="目标 id"
            placeholder="输入目标 id"
            value={targetId}
            onChange={(event) => {
              setTargetId(event.target.value);
              setGenerated(false);
            }}
          />
          <button type="button" className="action-btn" disabled={generating} onClick={() => void generate()}>
            {generating ? "生成中…" : "生成"}
          </button>
        </div>
        {generateError ? <p className="page-meta page-meta-error">{generateError}</p> : null}
        {generated ? <p className="page-meta generate-success">已生成链接，可继续编辑地址</p> : null}
      </div>
      <div className="form-field">
        <label className="form-switch-row">
          <span className="form-switch-text">新窗口打开</span>
          <label className="thy-switch">
            <input
              type="checkbox"
              className="thy-switch-input"
              checked={openInNewTab}
              onChange={(event) => setOpenInNewTab(event.target.checked)}
            />
            <span className="thy-switch-label" />
            <span className="thy-switch-handle" />
          </label>
        </label>
      </div>
      <div className="form-actions">
        <button className="action-btn" type="submit">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

function NewLinkPage({ createLink }: { createLink: (value: LinkFormValue) => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const from = getReturnPath(location);

  return (
    <AppLayout title="新建链接">
      <LinkForm
        submitLabel="确定"
        onSubmit={(value) => {
          createLink(value);
          navigate(from);
        }}
      />
    </AppLayout>
  );
}

function EditLinkPage({
  links,
  updateLink,
}: {
  links: LinkItem[];
  updateLink: (id: number, value: LinkFormValue) => void;
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const from = getReturnPath(location);
  const link = links.find((item) => item.id === Number(id));

  if (!link) {
    return (
      <AppLayout title="编辑链接">
        <p className="empty-state">
          找不到该链接。<Link to="/links">返回列表</Link>
        </p>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="编辑链接">
      <LinkForm
        initial={{ name: link.name, url: link.url, openInNewTab: link.openInNewTab }}
        submitLabel="确定"
        onSubmit={(value) => {
          updateLink(link.id, value);
          navigate(from);
        }}
      />
    </AppLayout>
  );
}

export default function App() {
  const [links, setLinks] = useState<LinkItem[]>(INITIAL_LINKS);
  const [recentIds, setRecentIds] = useState<number[]>(INITIAL_RECENT_IDS);
  const [error, setError] = useState<string | null>(null);

  const openLink = async (link: LinkItem) => {
    setRecentIds((current) => [link.id, ...current.filter((id) => id !== link.id)]);
    setError(null);
    try {
      if (link.openInNewTab) {
        await router.open(link.url);
      } else {
        await router.navigate(link.url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const createLink = (value: LinkFormValue) => {
    setLinks((current) => [
      ...current,
      { id: Date.now(), name: value.name, url: value.url, openInNewTab: value.openInNewTab },
    ]);
  };

  const updateLink = (id: number, value: LinkFormValue) => {
    setLinks((current) =>
      current.map((link) => (link.id === id ? { ...link, ...value } : link)),
    );
  };

  const removeLink = (id: number) => {
    setLinks((current) => current.filter((link) => link.id !== id));
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/recent" replace />} />
        <Route
          path="/recent"
          element={<RecentPage links={links} recentIds={recentIds} openLink={openLink} />}
        />
        <Route
          path="/links"
          element={
            <LinksPage links={links} removeLink={removeLink} openLink={openLink} error={error} />
          }
        />
        <Route path="/links/new" element={<NewLinkPage createLink={createLink} />} />
        <Route
          path="/links/:id"
          element={<EditLinkPage links={links} updateLink={updateLink} />}
        />
        <Route path="*" element={<Navigate to="/recent" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
