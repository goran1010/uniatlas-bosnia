import { sendError, sendSuccess } from "../utils/response.js";
import { env } from "../config/env.js";

import type { Request, Response } from "express";

const IS_PRODUCTION = env.NODE_ENV === "production";
const NUMBER_OF_DAYS = 30;

class UsersController {
  async me(req: Request, res: Response) {
    if (!req.user) {
      return sendSuccess(res, {
        message: "No user logged in",
        data: null,
      });
    }

    return sendSuccess(res, {
      message: "User info retrieved",
      data: req.user,
    });
  }

  logout(req: Request, res: Response) {
    req.logout((err) => {
      if (err) {
        console.error(err);
        sendError(res, {
          status: 500,
          message: "Logout failed: try again.",
        });
        return;
      }

      req.session.destroy((err) => {
        if (err) {
          console.error(err);
          sendError(res, {
            status: 500,
            message: "Logout failed: try again.",
          });
          return;
        }

        res.clearCookie("sessionId", {
          // Must set clearCookie options to match cookie set options, otherwise browser will not clear cookies
          maxAge: NUMBER_OF_DAYS * 24 * 60 * 60 * 1000,
          sameSite: IS_PRODUCTION ? "none" : "lax",
          secure: IS_PRODUCTION,
          httpOnly: true,
          path: "/",
        });
        sendSuccess(res, {
          message: "User logged out successfully",
          data: { success: true },
        });
      });
    });
  }
}

const usersController = new UsersController();

export { usersController };
