import { sendSuccess } from "../utils/response.js";
import type { Request, Response } from "express";

class APIController {
  status(_req: Request, res: Response) {
    return sendSuccess(res, {
      data: {
        status: "ok",
      },
      message: "API server is running",
    });
  }
}

const apiController = new APIController();

export { apiController };
