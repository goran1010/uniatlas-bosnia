import { sendSuccess } from "../utils/response.js";
import { sanitizeUser } from "../utils/sanitizeUser.js";

class APIController {
  status(req, res) {
    return sendSuccess(res, {
      data: {
        status: "ok",
      },
      message: "API server is running",
    });
  }
  async me(req, res) {
    if (!req.user) {
      return sendSuccess(res, {
        data: null,
        message: "No user is currently logged in",
      });
    }

    const loggedInUser = sanitizeUser(req.user);

    return sendSuccess(res, {
      message: "User info retrieved",
      data: loggedInUser,
    });
  }
}

const apiController = new APIController();

export { apiController };
