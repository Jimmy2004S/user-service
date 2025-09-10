export type Resp = {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
};

export const json = (statusCode: number, data: unknown): Resp => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
});

export const badRequest = (msg: string) => json(400, { message: msg });
export const unauthorized = (msg = "Unauthorized") =>
  json(401, { message: msg });
export const forbidden = (msg = "Forbidden") => json(403, { message: msg });
export const notFound = (msg = "Not found") => json(404, { message: msg });
export const conflict = (msg = "Conflict") => json(409, { message: msg });
export const ok = (data: unknown) => json(200, data);
export const created = (data: unknown) => json(201, data);
export const noContent = (): Resp => ({ statusCode: 204, body: "" });
