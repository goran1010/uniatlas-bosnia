import { body, param } from "express-validator";
import { validationError } from "./validationError.js";

class AuthValidation {
  signupValidationRules = [
    body("email")
      .normalizeEmail()
      .isEmail()
      .withMessage("Invalid email address"),

    body("password")
      .trim()
      .custom((value: string) => {
        if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
          throw new Error(
            "Password can only contain letters, numbers, dashes or underscores",
          );
        }
        return true;
      })
      .isStrongPassword({
        minLength: 6,
        minLowercase: 0,
        minUppercase: 0,
        minNumbers: 1,
        minSymbols: 0,
      })
      .withMessage(
        "Password must be at least 6 characters long and contain at least one number",
      ),

    body("confirm-password")
      .trim()
      .custom((value: string, { req }) => {
        const body: unknown = req.body;

        if (
          typeof body !== "object" ||
          body === null ||
          !("password" in body) ||
          typeof body.password !== "string"
        ) {
          throw new Error("Password must be a string");
        }

        if (value !== body.password) {
          throw new Error("Passwords do not match");
        }

        return true;
      }),

    validationError,
  ];

  confirmTokenValidationRules = [
    param("token").trim().notEmpty().withMessage("Token is required"),
    validationError,
  ];

  loginValidationRules = [
    body("email")
      .normalizeEmail()
      .isEmail()
      .withMessage("Invalid email address"),
    body("password").trim().notEmpty().withMessage("Password is required"),
    validationError,
  ];
}

const authValidation = new AuthValidation();

export { authValidation };
