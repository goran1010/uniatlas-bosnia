import type { Response } from "express";

interface Options {
  status?: number;
}

export interface SuccessOptions extends Options {
  data?: unknown;
  message?: string | null;
}

export interface ErrorOptions extends Options {
  message?: string;
}

function sendSuccess(
  res: Response,
  { status = 200, data = null, message = null }: SuccessOptions = {},
) {
  res.status(status).json({ data, message });
}

function sendError(
  res: Response,
  { status = 500, message = "Request failed." }: ErrorOptions = {},
) {
  res.status(status).json({
    error: {
      message,
    },
  });
}

export { sendSuccess, sendError };
