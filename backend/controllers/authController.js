import { usersModel } from "../models/usersModel.js";
import crypto from "crypto";
import { emailConfirmHTML } from "../utils/emailConfirmHTML.js";
import { passport } from "../config/passport.js";
import { sendConfirmationEmail } from "../email/confirmationEmail.js";
import bcrypt from "bcryptjs";
import { matchedData } from "express-validator";
import { sendError, sendSuccess } from "../utils/response.js";
import { sanitizeUser } from "../utils/sanitizeUser.js";
import { pendingUserModel } from "../models/pendingUsersModel.js";

const BACKEND_URL = process.env.BACKEND_URL;
const FRONTEND_URL = process.env.FRONTEND_URL;

class AuthController {
  async signup(req, res) {
    try {
      const { email, password } = matchedData(req);
      const hashedPassword = await bcrypt.hash(password, 10);

      const confirmationToken = crypto.randomBytes(32).toString("hex");
      const confirmationLink = `${BACKEND_URL}/auth/confirm/${confirmationToken}`;

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

  async confirmEmail(req, res) {
    try {
      const { token } = matchedData(req);

      const pendingUsers = await pendingUserModel.findMany({ token });
      const pendingUser = pendingUsers?.[0];

      if (!pendingUser)
        return sendError(res, {
          status: 400,
          message:
            "Email confirmation failed: token is invalid or expired. Request a new confirmation email.",
        });

      if (pendingUser.expiresAt < new Date()) {
        await pendingUserModel.delete({ id: pendingUser.id });

        return sendError(res, {
          status: 400,
          message: "Token expired. Please sign up again.",
        });
      }

      const user = await usersModel.create({
        email: pendingUser.email,
        password: pendingUser.password,
      });

      await pendingUserModel.delete({ id: pendingUser.id });

      if (!user) {
        return sendError(res, {
          status: 500,
          message: "Email confirmation failed: account couldn't be created.",
        });
      }

      res.send(emailConfirmHTML());
    } catch (err) {
      console.error(err);

      return sendError(res, {
        status: 500,
        message:
          "Email confirmation failed: token is invalid or expired. Request a new confirmation email.",
      });
    }
  }

  async login(req, res, next) {
    passport.authenticate("local", (err, user, info) => {
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
            data: sanitizeUser(user),
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
    })(req, res, next);
  }

  githubLogin(req, res, next) {
    passport.authenticate("github", { scope: ["user:email"] })(req, res, next);
  }

  githubCallback(req, res, next) {
    passport.authenticate("github", (err, user) => {
      if (err) return next(err);
      if (!user) {
        return res.redirect(`${FRONTEND_URL}/login?error=github`);
      }

      const continueWithLogin = () => {
        req.logIn(user, (loginError) => {
          if (loginError) return next(loginError);
          req.session.save((saveError) => {
            if (saveError) return next(saveError);
            return res.redirect(FRONTEND_URL);
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
    })(req, res, next);
  }
}

const authController = new AuthController();

export { authController };
