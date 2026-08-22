import type { Response } from "express";
import type { ApiValidationIssue } from "../errors/RequestValidationError.js";

interface ErrorOptions {
  status?: number;
  message?: string;
  code?: string;
  issues?: ApiValidationIssue[];
}

interface Options {
  status?: number;
}

export interface SuccessOptions extends Options {
  data?: unknown;
  message?: string | null;
}

function sendSuccess(
  res: Response,
  { status = 200, data = null, message = null }: SuccessOptions = {},
) {
  res.status(status).json({ data, message });
}

function sendError(
  res: Response,
  {
    status = 500,
    message = "Request failed.",
    code,
    issues,
  }: ErrorOptions = {},
) {
  return res.status(status).json({
    error: {
      ...(code !== undefined && { code }),
      message,
      ...(issues !== undefined && { issues }),
    },
  });
}

export { sendSuccess, sendError };
