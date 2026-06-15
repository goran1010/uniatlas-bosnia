import { sendSuccess } from "../utils/response.js";

class APIController {
  status(req, res) {
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
