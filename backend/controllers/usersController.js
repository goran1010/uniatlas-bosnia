import { sendError, sendSuccess } from "../utils/response.js";

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const NUMBER_OF_DAYS = 30;

class UsersController {
  logout(req, res) {
    req.logout((err) => {
      if (err) {
        console.error(err);
        return sendError(res, {
          status: 500,
          message: "Logout failed: try again.",
        });
      }

      req.session.destroy(() => {
        res.clearCookie("sessionId", {
          // Must set clearCookie options to match cookie set options, otherwise client will not clear cookie
          maxAge: NUMBER_OF_DAYS * 24 * 60 * 60 * 1000,
          sameSite: IS_PRODUCTION ? "none" : "lax",
          secure: IS_PRODUCTION,
          httpOnly: true,
          path: "/",
        });
        return sendSuccess(res, {
          message: "User logged out successfully",
          data: { success: true },
        });
      });
    });
  }
}

const usersController = new UsersController();

export { usersController };
