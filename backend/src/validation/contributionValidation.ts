import { body } from "express-validator";
import { validationError } from "./validationError.js";
import {
  buildPendingChangeData,
  hasValidPendingChangeDataShape,
} from "../utils/pendingChangeData.js";

const ENTITY_TYPES = ["UNIVERSITY", "FACULTY", "STUDY_PROGRAM", "SUBJECT"];
const STUDY_CYCLES = ["FIRST", "SECOND", "THIRD"];
const SUBJECT_TYPES = ["MANDATORY", "ELECTIVE"];
const ENTITIES = ["FBIH", "RS", "BD"];
const OWNERSHIP = ["JAVNA", "PRIVATNA"];

function validateContributionDataShape(value: unknown, entityType: unknown) {
  if (typeof entityType !== "string") {
    return true;
  }

  if (
    entityType !== "UNIVERSITY" &&
    entityType !== "FACULTY" &&
    entityType !== "STUDY_PROGRAM" &&
    entityType !== "SUBJECT"
  ) {
    return true;
  }

  if (!hasValidPendingChangeDataShape(entityType, value)) {
    throw new Error("Data contains unsupported fields for this entity type");
  }

  return true;
}

function getEntityTypeFromRequestBody(req: {
  body?: { entityType?: unknown };
}) {
  return req.body?.entityType;
}

class ContributionValidation {
  createEntity = [
    body("entityType").customSanitizer((value) =>
      typeof value === "string" ? value.toUpperCase() : value,
    ),

    body("entityType")
      .trim()
      .notEmpty()
      .withMessage("Entity type is required")
      .bail()
      .isIn(ENTITY_TYPES)
      .withMessage("Invalid entity type"),

    body("parentId")
      .if((_, { req }) => getEntityTypeFromRequestBody(req) !== "UNIVERSITY")
      .notEmpty()
      .withMessage("Parent ID is required")
      .bail()
      .isInt({ min: 1 })
      .withMessage("Parent ID must be a positive integer")
      .toInt(),

    body("data")
      .custom((value, { req }) =>
        validateContributionDataShape(value, getEntityTypeFromRequestBody(req)),
      )
      .withMessage("Data contains unsupported fields for this entity type")
      .customSanitizer((value, { req }) => {
        if (
          getEntityTypeFromRequestBody(req) !== "UNIVERSITY" &&
          getEntityTypeFromRequestBody(req) !== "FACULTY" &&
          getEntityTypeFromRequestBody(req) !== "STUDY_PROGRAM" &&
          getEntityTypeFromRequestBody(req) !== "SUBJECT"
        ) {
          return value;
        }

        return (
          buildPendingChangeData(
            getEntityTypeFromRequestBody(req) as
              | "UNIVERSITY"
              | "FACULTY"
              | "STUDY_PROGRAM"
              | "SUBJECT",
            value,
          ) ?? value
        );
      }),

    body("data.name").trim().notEmpty().withMessage("Name is required"),

    body("data.city")
      .if((_, { req }) => getEntityTypeFromRequestBody(req) === "UNIVERSITY")
      .trim()
      .notEmpty()
      .withMessage("City is required"),

    body("data.entity")
      .if((_, { req }) => getEntityTypeFromRequestBody(req) === "UNIVERSITY")
      .notEmpty()
      .withMessage("Entity (FBIH/RS/BD) is required")
      .bail()
      .isIn(ENTITIES)
      .withMessage("Invalid entity — must be FBIH, RS, or BD"),

    body("data.ownership")
      .if((_, { req }) => getEntityTypeFromRequestBody(req) === "UNIVERSITY")
      .notEmpty()
      .withMessage("ownership is required")
      .bail()
      .isIn(OWNERSHIP)
      .withMessage("ownership must be JAVNA or PRIVATNA"),

    body("data.cycle")
      .if((_, { req }) => getEntityTypeFromRequestBody(req) === "STUDY_PROGRAM")
      .notEmpty()
      .withMessage("Study cycle is required")
      .bail()
      .isIn(STUDY_CYCLES)
      .withMessage("Invalid study cycle — must be FIRST, SECOND, or THIRD"),

    body("data.durationYears")
      .optional({ values: "null" })
      .isInt({ min: 1, max: 10 })
      .withMessage("Duration must be between 1 and 10 years"),

    body("data.ects")
      .optional({ values: "null" })
      .isInt({ min: 1 })
      .withMessage("ECTS must be a positive integer"),

    body("data.semester")
      .optional({ values: "null" })
      .isInt({ min: 1, max: 12 })
      .withMessage("Semester must be between 1 and 12"),

    body("data.type")
      .optional({ values: "null" })
      .isIn(SUBJECT_TYPES)
      .withMessage("Invalid subject type — must be MANDATORY or ELECTIVE"),

    validationError,
  ];

  editEntity = [
    body("entityType").customSanitizer((value) =>
      typeof value === "string" ? value.toUpperCase() : value,
    ),

    body("entityType")
      .trim()
      .notEmpty()
      .withMessage("Entity type is required")
      .bail()
      .isIn(ENTITY_TYPES)
      .withMessage("Invalid entity type"),

    body("targetId")
      .notEmpty()
      .withMessage("Target ID is required")
      .bail()
      .isInt({ min: 1 })
      .withMessage("Target ID must be a positive integer")
      .toInt(),

    body("data")
      .custom((value, { req }) =>
        validateContributionDataShape(value, getEntityTypeFromRequestBody(req)),
      )
      .withMessage("Data contains unsupported fields for this entity type")
      .customSanitizer((value, { req }) => {
        if (
          getEntityTypeFromRequestBody(req) !== "UNIVERSITY" &&
          getEntityTypeFromRequestBody(req) !== "FACULTY" &&
          getEntityTypeFromRequestBody(req) !== "STUDY_PROGRAM" &&
          getEntityTypeFromRequestBody(req) !== "SUBJECT"
        ) {
          return value;
        }

        return (
          buildPendingChangeData(
            getEntityTypeFromRequestBody(req) as
              | "UNIVERSITY"
              | "FACULTY"
              | "STUDY_PROGRAM"
              | "SUBJECT",
            value,
          ) ?? value
        );
      }),

    body("data.name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Name cannot be empty if provided"),

    body("data.cycle")
      .optional()
      .isIn(STUDY_CYCLES)
      .withMessage("Invalid study cycle"),

    body("data.entity")
      .optional()
      .isIn(ENTITIES)
      .withMessage("Invalid entity — must be FBIH, RS, or BD"),

    body("data.ownership")
      .optional()
      .isIn(OWNERSHIP)
      .withMessage("ownership must be JAVNA or PRIVATNA"),

    body("data.durationYears")
      .optional({ values: "null" })
      .isInt({ min: 1, max: 10 })
      .withMessage("Duration must be between 1 and 10 years"),

    body("data.ects")
      .optional({ values: "null" })
      .isInt({ min: 1 })
      .withMessage("ECTS must be a positive integer"),

    body("data.semester")
      .optional({ values: "null" })
      .isInt({ min: 1, max: 12 })
      .withMessage("Semester must be between 1 and 12"),

    body("data.type")
      .optional({ values: "null" })
      .isIn(SUBJECT_TYPES)
      .withMessage("Invalid subject type — must be MANDATORY or ELECTIVE"),

    validationError,
  ];

  deleteEntity = [
    body("entityType").customSanitizer((value) =>
      typeof value === "string" ? value.toUpperCase() : value,
    ),

    body("entityType")
      .trim()
      .notEmpty()
      .withMessage("Entity type is required")
      .bail()
      .isIn(ENTITY_TYPES)
      .withMessage("Invalid entity type"),

    body("targetId")
      .notEmpty()
      .withMessage("Target ID is required")
      .bail()
      .isInt({ min: 1 })
      .withMessage("Target ID must be a positive integer")
      .toInt(),

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
