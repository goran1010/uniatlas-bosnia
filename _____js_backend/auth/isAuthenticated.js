import { sendError } from "../utils/response.js";

function isAuthenticated(req, res, next) {
  try {
    if (req.user) return next();

    return sendError(res, {
      status: 401,
      message: "Authentication required: log in and try again.",
    });
  } catch (err) {
    next(err);
  }
}

export { isAuthenticated };
