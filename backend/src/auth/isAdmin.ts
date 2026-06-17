import { sendError } from "../utils/response.js";

import type { Request, Response, NextFunction } from "express";

function isAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.user.role === "ADMIN") return next();

    return sendError(res, {
      status: 403,
      message: "Access denied: admin role is required.",
    });
  } catch (err) {
    next(err);
  }
}

export { isAdmin };
