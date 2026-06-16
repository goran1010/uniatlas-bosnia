import { body } from "express-validator";
import { validationError } from "./validationError.js";

class AdminValidation {
  declinePendingChange = [
    body("id")
      .trim()
      .notEmpty()
      .withMessage("Pending change ID is required")
      .bail()
      .isUUID()
      .withMessage("Pending change ID must be a valid UUID"),

    validationError,
  ];

  approvePendingChange = [
    body("id")
      .trim()
      .notEmpty()
      .withMessage("Pending change ID is required")
      .bail()
      .isUUID()
      .withMessage("Pending change ID must be a valid UUID"),

    body("entityType")
      .trim()
      .notEmpty()
      .withMessage("Entity type is required")
      .bail()
      .isIn(["UNIVERSITY", "FACULTY", "STUDY_PROGRAM", "SUBJECT"])
      .withMessage("Invalid entity type"),

    body("typeOfChange")
      .trim()
      .notEmpty()
      .withMessage("Type of change is required")
      .bail()
      .isIn(["CREATE", "UPDATE", "DELETE"])
      .withMessage("Invalid type of change"),

    validationError,
  ];
}

const adminValidation = new AdminValidation();
export { adminValidation };
