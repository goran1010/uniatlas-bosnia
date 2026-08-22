import { sendSuccess } from "../utils/response.js";
import type { Request, Response } from "express";

function status(_req: Request, res: Response) {
  sendSuccess(res, {
    data: {
      status: "ok",
    },
    message: "Server is healthy",
  });
}

export { status };
