import { Router } from "express";
const authRouter = Router();
import { authValidation } from "../validation/authValidation.js";
import { authController } from "../controllers/authController.js";
import { isNotAuthenticated } from "../auth/isNotAuthenticated.js";

import { csrfSync } from "csrf-sync";
const { csrfSynchronisedProtection } = csrfSync();

authRouter.post(
  "/signup",
  csrfSynchronisedProtection,
  authValidation.signupValidationRules,
  isNotAuthenticated,
  authController.signup,
);

authRouter.get(
  "/confirm/:token",
  csrfSynchronisedProtection,
  authValidation.confirmTokenValidationRules,
  isNotAuthenticated,
  authController.confirmEmail,
);

authRouter.post(
  "/login",
  csrfSynchronisedProtection,
  authValidation.loginValidationRules,
  isNotAuthenticated,
  authController.login,
);

authRouter.get("/github", authController.githubLogin);
authRouter.get("/github/callback", authController.githubCallback);

export { authRouter };
