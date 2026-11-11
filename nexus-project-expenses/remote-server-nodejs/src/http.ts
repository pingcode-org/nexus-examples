import type { Request, Response, NextFunction } from "express";

export class HttpError extends Error {
  constructor(public status: number, message: string, options?: ErrorOptions) {
    super(message, options);
  }
}

export function allowBrowserRequests(req: Request, res: Response, next: NextFunction) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Authorization, Content-Type, Traceparent, ngrok-skip-browser-warning",
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();
  next();
}

export function requireJson(req: Request, _res: Response, next: NextFunction) {
  if (req.method === "POST" && !req.is("application/json")) {
    throw new HttpError(415, "请使用 application/json 请求体");
  }
  next();
}

export function notFound(_req: Request, _res: Response, _next: NextFunction) {
  throw new HttpError(404, "接口不存在");
}

export function handleError(
  error: Error & { status?: number },
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  const status = error.status ?? 500;
  const message = error instanceof HttpError
    ? error.message
    : "请求失败，请检查 JSON 格式和服务配置";
  // 在 HTTP 边界统一记录失败；只使用验签后保存的调用 ID，不输出令牌或完整异常。
  const cause = error.cause instanceof Error ? error.cause.name : error.name;
  console.warn("Nexus request failed", JSON.stringify({
    method: req.method,
    path: req.path,
    invocationId: res.locals.invocationId ?? "unverified",
    status,
    message,
    cause,
  }));
  res.status(status).json({ error: { message } });
}
