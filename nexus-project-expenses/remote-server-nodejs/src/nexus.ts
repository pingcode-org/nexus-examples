import { createRemoteJWKSet, jwtVerify } from "jose";
import { HttpError } from "./http.js";

// 与 NIT 的 context 结构保持一致，不转换为另一套调用上下文。
export interface NexusContext {
  app: { id: string };
  environment: { id: string; type: string };
  team: { id: string };
  installation: { id: string };
  invocation: { id: string };
  user?: { id: string };
  extension?: {
    key: string;
    target: string;
    data?: { project?: { id: string } };
  };
  event?: { trigger?: { key: string; type: string } };
}

// 本仓库实现的服务端辅助类；官方 Bridge API 的调用见 web/main/src/api.ts。
export class Nexus {
  private config = loadConfig();
  private keys = createRemoteJWKSet(new URL(this.config.jwksUrl), {
    timeoutDuration: 2000,
  });

  async verifyNit(authorization: string | undefined): Promise<NexusContext> {
    if (!authorization?.startsWith("Bearer ")) {
      throw new HttpError(401, "缺少 Nexus 调用令牌");
    }
    try {
      const { payload } = await jwtVerify<{ context: NexusContext }>(
        authorization.slice(7),
        this.keys,
        {
          algorithms: ["RS256"],
          issuer: "nexus/invocation-token",
          audience: "nexus",
          requiredClaims: ["exp", "context"],
        },
      );
      const context = payload.context;
      if (
        typeof context?.app?.id !== "string" || !context.app.id ||
        context.environment?.type !== this.config.environment ||
        !context.environment.id || !context.team?.id ||
        !context.installation?.id || !context.invocation?.id
      ) {
        throw new HttpError(401, "NIT 缺少必要上下文或环境不匹配");
      }
      return context;
    } catch (error) {
      if (error instanceof HttpError) throw error;
      throw new HttpError(401, "无法验证 Nexus 调用身份，请检查 JWKS 和令牌有效期", { cause: error });
    }
  }

  // 项目经费的业务授权示例：更换扩展点时，应调整 key、target 和 context 字段。
  projectUser(context: NexusContext, requestedProjectId?: string) {
    const extension = context.extension;
    const projectId = extension?.data?.project?.id;
    const userId = context.user?.id;
    const allowedPage = extension?.key === "expenses-remote" ||
      extension?.key === "expenses-function";
    const onProjectPage = allowedPage && extension?.target === "pcm:pjm:project:page";
    const sameProject = requestedProjectId === undefined || requestedProjectId === projectId;
    if (!onProjectPage || !userId || !projectId || !sameProject) {
      throw new HttpError(403, "请求与当前项目页面不匹配");
    }
    return userId;
  }

  // 费用业务使用的隔离键；来源都是已验签的 NIT context。
  tenant(context: NexusContext) {
    return JSON.stringify([
      context.app.id,
      context.environment.id,
      context.team.id,
      context.installation.id,
    ]);
  }

  // token 是 Nexus 下发的用户/应用 OAuth 令牌，不是 Authorization 中的 NIT。
  async getProject(apiBase: string | undefined, token: string | undefined, projectId: string) {
    if (apiBase?.replace(/\/+$/, "") !== this.config.apiBase) {
      throw new HttpError(403, "平台 API 地址与配置不一致");
    }
    if (!token) throw new HttpError(403, "缺少 Nexus OAuth 令牌，请检查 Remote / Endpoint auth 和 scope");

    let response: Response;
    try {
      response = await fetch(`${this.config.apiBase}/v2/pjm/projects/${encodeURIComponent(projectId)}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        redirect: "error",
        signal: AbortSignal.timeout(2500),
      });
    } catch (error) {
      throw new HttpError(503, "暂时无法访问 PingCode", { cause: error });
    }
    if (!response.ok) {
      let status = 502;
      if (response.status === 401) status = 401;
      else if ([403, 404].includes(response.status)) status = 403;
      throw new HttpError(status, `当前身份无法读取项目（PingCode ${response.status}）`);
    }

    const project = await response.json().catch(() => null);
    if (project?.id !== projectId || typeof project.name !== "string") {
      throw new HttpError(502, "项目接口返回了无效数据");
    }
    // 以平台读取结果判定访问权限，示例不额外限制项目业务状态。
    return { id: projectId, name: project.name as string };
  }
}

function loadConfig() {
  const required = (key: string) => {
    const value = process.env[key]?.trim();
    if (!value) throw new Error(`缺少配置 ${key}`);
    return value;
  };
  const platformUrl = (key: string) => {
    const url = new URL(required(key));
    const loopback = ["localhost", "127.0.0.1"].includes(url.hostname);
    if (
      (url.protocol !== "https:" && !(url.protocol === "http:" && loopback)) ||
      url.username || url.password || url.search || url.hash
    ) {
      throw new Error(`${key} 必须为 HTTPS 地址，本地测试仅允许 loopback HTTP`);
    }
    return url.href.replace(/\/+$/, "");
  };
  return {
    environment: process.env["NEXUS_ENVIRONMENT"] || "development",
    jwksUrl: platformUrl("NEXUS_JWKS_URL"),
    apiBase: platformUrl("PINGCODE_API_BASE_URL"),
  };
}
