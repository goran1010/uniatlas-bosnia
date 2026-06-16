import { validationResult } from "express-validator";
import { sendError } from "../utils/response.js";

function validationError(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, {
      status: 400,
      message: `Validation failed: ${errors
        .array()
        .map((entry) => `${entry.path}: ${entry.msg}`)
        .join(", ")}.`,
    });
  }

  return next();
}

export { validationError };
