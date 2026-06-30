import type { Response } from "express";

interface Options {
  status?: number;
}

interface SuccessOptions extends Options {
  data?: unknown;
  message?: string | null;
}

interface ErrorOptions extends Options {
  message?: string;
}

function sendSuccess(
  res: Response,
  { status = 200, data = null, message = null }: SuccessOptions = {},
) {
  return res.status(status).json({ data, message });
}

function sendError(
  res: Response,
  { status = 400, message = "Request failed." }: ErrorOptions = {},
) {
  return res.status(status).json({
    error: {
      message,
    },
  });
}

export { sendSuccess, sendError };
