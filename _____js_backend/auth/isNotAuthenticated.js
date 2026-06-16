import { sendError } from "../utils/response.js";

function isNotAuthenticated(req, res, next) {
  if (!req.user) return next();

  return sendError(res, {
    status: 403,
    message: "Already logged in: log out first.",
  });
}

export { isNotAuthenticated };
