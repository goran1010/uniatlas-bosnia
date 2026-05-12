import { body } from "express-validator";
import { postalCodesModel } from "../models/postalCodesModel.js";
import { validationError } from "./validationError.js";

const validPosts = ["BH_POSTA", "POSTE_SRP", "HP_MOSTAR"];

class ContributionValidation {
  createPostalCode = [
    body("code")
      .trim()
      .notEmpty()
      .withMessage("Code is required")
      .custom((value) => {
        if (Number.isInteger(Number(value))) {
          if (value.length !== 5) {
            throw new Error("Postal codes must have 5 numbers");
          }
        } else {
          throw new Error("Must be a number");
        }
        return true;
      }),

    body("city").trim().notEmpty().withMessage("City is required"),

    body("post").custom((value) => {
      if (!validPosts.includes(value) && value !== "") {
        throw new Error("Invalid post");
      }
      return true;
    }),
    validationError,
  ];

  editPostalCode = [
    body("code")
      .trim()
      .notEmpty()
      .withMessage("Code is required")
      .custom(async (value) => {
        const codeExists = await postalCodesModel.getPostalCodeByCode(
          Number(value),
        );
        if (!codeExists) {
          throw new Error("Code doesn't exist");
        }
        return true;
      }),

    body("city").trim().notEmpty().withMessage("City is required"),

    body("post").custom((value) => {
      if (!validPosts.includes(value) && value !== "") {
        throw new Error("Invalid post");
      }
      return true;
    }),
    validationError,
  ];

  deletePostalCode = [
    body("code")
      .trim()
      .notEmpty()
      .withMessage("Can't delete data. Code is required")
      .custom(async (value) => {
        const codeExists = await postalCodesModel.getPostalCodeByCode(
          Number(value),
        );
        if (!codeExists) {
          throw new Error("Code doesn't exist");
        }
        return true;
      }),

    validationError,
  ];

  deletePendingChange = [
    body("id")
      .trim()
      .notEmpty()
      .withMessage("Pending change ID is required")
      .bail()
      .isUUID()
      .withMessage("Pending change ID must be a valid UUID"),

    validationError,
  ];
}

const contributionValidation = new ContributionValidation();
export { contributionValidation };
