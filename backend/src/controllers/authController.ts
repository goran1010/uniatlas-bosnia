import { usersModel } from "../models/usersModel.js";
import crypto from "crypto";
import { emailConfirmHTML } from "../utils/emailConfirmHTML.js";
import { passport } from "../config/passport.js";
import { sendConfirmationEmail } from "../email/confirmationEmail.js";
import bcrypt from "bcryptjs";
import { matchedData } from "express-validator";
import { sendError, sendSuccess } from "../utils/response.js";
import { pendingUserModel } from "../models/pendingUsersModel.js";
import { env } from "../config/env.js";

import type { Request, Response, NextFunction } from "express";

class AuthController {
  async signup(req: Request, res: Response) {
    try {
      const { email, password } = matchedData(req);

      const existingUser = await usersModel.findOne({ email });
      if (existingUser) {
        return sendError(res, {
          status: 400,
          message: "Signup failed: check your input and try again.",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const confirmationToken = crypto.randomBytes(32).toString("hex");
      const confirmationLink = `${env.BACKEND_URL}/auth/confirm/${confirmationToken}`;

      const existingPending = await pendingUserModel.findMany({ email });

      if (existingPending.length > 0) {
        await pendingUserModel.update(
          { email },
          {
            password: hashedPassword,
            token: confirmationToken,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        );
      } else {
        await pendingUserModel.create({
          email,
          password: hashedPassword,
          token: confirmationToken,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
      }

      const result = await sendConfirmationEmail(email, confirmationLink);

      if (result.success) {
        return sendSuccess(res, {
          status: 201,
          data: { email },
          message: "Registration successful! Check your email.",
        });
      }
      await pendingUserModel.delete({ email });
      return sendError(res, {
        status: 500,
        message:
          "Signup failed: confirmation email was not sent. Check your email address and try again.",
      });
    } catch (err) {
      console.error(err);

      return sendError(res, {
        status: 400,
        message: "Signup failed: check your input and try again.",
      });
    }
  }

  async confirmEmail(req: Request, res: Response) {
    try {
      const { token } = matchedData(req);
      if (!token || typeof token !== "string") {
        sendError(res, {
          status: 400,
          message:
            "Email confirmation failed: token is invalid or expired. Request a new confirmation email.",
        });
        return;
      }

      const pendingUsers = await pendingUserModel.findMany({ token });
      const pendingUser = pendingUsers[0];

      if (!pendingUser) {
        sendError(res, {
          status: 400,
          message:
            "Email confirmation failed: token is invalid or expired. Request a new confirmation email.",
        });
        return;
      }

      if (pendingUser.expiresAt < new Date()) {
        await pendingUserModel.delete({ id: pendingUser.id });

        sendError(res, {
          status: 400,
          message: "Token expired. Please sign up again.",
        });
        return;
      }

      const user = await usersModel.create({
        email: pendingUser.email,
        password: pendingUser.password,
      });

      await pendingUserModel.delete({ id: pendingUser.id });

      if (!user) {
        sendError(res, {
          status: 500,
          message: "Email confirmation failed: account couldn't be created.",
        });
        return;
      }

      res.send(emailConfirmHTML());
    } catch (err) {
      console.error(err);

      sendError(res, {
        status: 500,
        message:
          "Email confirmation failed: token is invalid or expired. Request a new confirmation email.",
      });
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    passport.authenticate(
      "local",
      (
        err: unknown,
        user: Express.User | false | null,
        info: { message?: string } | undefined,
      ) => {
        if (err) return next(err);
        if (!user) {
          const loginReason = info?.message || "Invalid email or password";
          return sendError(res, {
            status: 401,
            message: `Login failed: ${loginReason}. Check your credentials and try again.`,
          });
        }

        const continueWithLogin = () => {
          req.logIn(user, (loginError) => {
            if (loginError) {
              return next(loginError);
            }

            return sendSuccess(res, {
              message: "Logged in successfully",
              data: user,
            });
          });
        };

        if (!req.session?.regenerate) {
          return continueWithLogin();
        }

        req.session.regenerate((regenerateError) => {
          if (regenerateError) {
            return next(regenerateError);
          }

          return continueWithLogin();
        });
      },
    )(req, res, next);
  }

  githubLogin(req: Request, res: Response, next: NextFunction) {
    passport.authenticate("github", { scope: ["user:email"] })(req, res, next);
  }

  githubCallback(req: Request, res: Response, next: NextFunction) {
    passport.authenticate(
      "github",
      (err: unknown, user: Express.User | false | null) => {
        if (err) return next(err);
        if (!user) {
          return res.redirect(`${env.FRONTEND_URL}/login?error=github`);
        }

        const continueWithLogin = () => {
          req.logIn(user, (loginError) => {
            if (loginError) return next(loginError);
            req.session.save((saveError) => {
              if (saveError) return next(saveError);
              return res.redirect(env.FRONTEND_URL);
            });
          });
        };

        if (!req.session?.regenerate) {
          return continueWithLogin();
        }

        req.session.regenerate((regenerateError) => {
          if (regenerateError) return next(regenerateError);
          return continueWithLogin();
        });
      },
    )(req, res, next);
  }
}

const authController = new AuthController();

export { authController };
