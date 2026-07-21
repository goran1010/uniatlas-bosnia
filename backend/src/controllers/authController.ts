import crypto from "crypto";
import { emailConfirmHTML } from "../utils/emailConfirmHTML.js";
import { passport } from "../config/passport.js";
import { sendConfirmationEmail } from "../email/confirmationEmail.js";
import bcrypt from "bcryptjs";
import { sendError, sendSuccess } from "../utils/response.js";
import { env } from "../config/env.js";
import { prisma } from "../db/prisma.js";
import * as authValidation from "../validation/authValidation.js";

import type { Request, Response, NextFunction } from "express";

type AuthenticateCallback = (
  err: unknown,
  user: Express.User | false | null,
  info?: { message?: string },
) => void;

interface AuthenticateOptions {
  scope?: string[];
}

type AuthenticateHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => void;

type Authenticate = (
  strategy: string,
  callbackOrOptions?: AuthenticateCallback | AuthenticateOptions,
) => AuthenticateHandler;

interface PassportAuthenticator {
  authenticate: Authenticate;
}

const typedPassport = passport as unknown as PassportAuthenticator;

async function signup(req: Request, res: Response) {
  const { email, password } = authValidation.signup(req.body);

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      sendError(res, {
        status: 400,
        message: "Signup failed: check your input and try again.",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const confirmationToken = crypto.randomBytes(32).toString("hex");
    const confirmationLink = `${env.BACKEND_URL}/auth/confirm/${confirmationToken}`;

    const existingPending = await prisma.pendingUser.findMany({
      where: { email },
    });

    if (existingPending.length > 0) {
      await prisma.pendingUser.updateMany({
        where: { email },
        data: {
          password: hashedPassword,
          token: confirmationToken,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });
    } else {
      await prisma.pendingUser.create({
        data: {
          email,
          password: hashedPassword,
          token: confirmationToken,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });
    }

    const result = await sendConfirmationEmail(email, confirmationLink);

    if (result.success) {
      sendSuccess(res, {
        status: 201,
        data: { email },
        message: "Registration successful! Check your email.",
      });
      return;
    }
    await prisma.pendingUser.deleteMany({ where: { email } });
    sendError(res, {
      status: 500,
      message:
        "Signup failed: confirmation email was not sent. Check your email address and try again.",
    });
  } catch (err) {
    console.error(err);

    sendError(res, {
      status: 400,
      message: "Signup failed: check your input and try again.",
    });
  }
}

async function confirmEmail(req: Request, res: Response) {
  const { token } = authValidation.confirmToken(req.params);

  try {
    const pendingUsers = await prisma.pendingUser.findMany({
      where: { token },
    });
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
      await prisma.pendingUser.delete({ where: { id: pendingUser.id } });

      sendError(res, {
        status: 400,
        message: "Token expired. Please sign up again.",
      });
      return;
    }

    await prisma.user.create({
      data: {
        email: pendingUser.email,
        password: pendingUser.password,
      },
    });

    await prisma.pendingUser.delete({ where: { id: pendingUser.id } });

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

function login(req: Request, res: Response, next: NextFunction) {
  authValidation.login(req.body);

  typedPassport.authenticate(
    "local",
    (
      err: unknown,
      user: Express.User | false | null,
      info: { message?: string } | undefined,
    ) => {
      if (err) {
        next(err);
        return;
      }
      if (!user) {
        const loginReason = info?.message ?? "Invalid email or password";
        sendError(res, {
          status: 401,
          message: `Login failed: ${loginReason}. Check your credentials and try again.`,
        });
        return;
      }

      const continueWithLogin = () => {
        req.logIn(user, (loginError) => {
          if (loginError) {
            next(loginError);
            return;
          }

          sendSuccess(res, {
            message: "Logged in successfully",
            data: user,
          });
          return;
        });
      };

      req.session.regenerate((regenerateError) => {
        if (regenerateError) {
          next(regenerateError);
          return;
        }

        continueWithLogin();
      });
    },
  )(req, res, next);
}

function githubLogin(req: Request, res: Response, next: NextFunction) {
  typedPassport.authenticate("github", { scope: ["user:email"] })(
    req,
    res,
    next,
  );
}

function githubCallback(req: Request, res: Response, next: NextFunction) {
  typedPassport.authenticate(
    "github",
    (err: unknown, user: Express.User | false | null) => {
      if (err) {
        next(err);
        return;
      }
      if (!user) {
        res.redirect(`${env.FRONTEND_URL}/login?error=github`);
        return;
      }

      const continueWithLogin = () => {
        req.logIn(user, (loginError) => {
          if (loginError) {
            next(loginError);
            return;
          }
          req.session.save((saveError) => {
            if (saveError) {
              next(saveError);
              return;
            }
            res.redirect(env.FRONTEND_URL);
          });
        });
      };

      req.session.regenerate((regenerateError) => {
        if (regenerateError) {
          next(regenerateError);
          return;
        }
        continueWithLogin();
      });
    },
  )(req, res, next);
}

export { signup, confirmEmail, login, githubLogin, githubCallback };
