import { sendError } from "../utils/response.js";

function isAdmin(req, res, next) {
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
