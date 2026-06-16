import { validationResult } from "express-validator";
import { sendError } from "../utils/response.js";

import type { Request, Response, NextFunction } from "express";

function validationError(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, {
      status: 400,
      message: `Validation failed: ${errors
        .array()
        .map((entry) => {
          if (entry.type === "field") {
            return `${entry.path}: ${entry.msg}`;
          }
          return entry.msg;
        })
        .join(", ")}.`,
    });
  }

  return next();
}

export { validationError };
