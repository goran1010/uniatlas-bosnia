import { sendError } from "../utils/response.js";

import type { Request, Response, NextFunction } from "express";

function isNotAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return next();

  return sendError(res, {
    status: 403,
    message: "Already logged in: log out first.",
  });
}

export { isNotAuthenticated };
