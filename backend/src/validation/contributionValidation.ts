import { body } from "express-validator";
import { validationError } from "./validationError.js";

const ENTITY_TYPES = ["UNIVERSITY", "FACULTY", "STUDY_PROGRAM", "SUBJECT"];
const STUDY_CYCLES = ["FIRST", "SECOND", "THIRD"];
const SUBJECT_TYPES = ["MANDATORY", "ELECTIVE"];
const ENTITIES = ["FBIH", "RS", "BD"];
const OWNERSHIP = ["JAVNA", "PRIVATNA"];

class ContributionValidation {
  createEntity = [
    body("entityType")
      .trim()
      .notEmpty()
      .withMessage("Entity type is required")
      .bail()
      .isIn(ENTITY_TYPES)
      .withMessage("Invalid entity type"),

    body("parentId")
      .if((_, { req }) => req.body.entityType !== "UNIVERSITY")
      .notEmpty()
      .withMessage("Parent ID is required")
      .bail()
      .isInt({ min: 1 })
      .withMessage("Parent ID must be a positive integer"),

    body("data.name").trim().notEmpty().withMessage("Name is required"),

    body("data.city")
      .if((_, { req }) => req.body.entityType === "UNIVERSITY")
      .trim()
      .notEmpty()
      .withMessage("City is required"),

    body("data.entity")
      .if((_, { req }) => req.body.entityType === "UNIVERSITY")
      .notEmpty()
      .withMessage("Entity (FBIH/RS/BD) is required")
      .bail()
      .isIn(ENTITIES)
      .withMessage("Invalid entity — must be FBIH, RS, or BD"),

    body("data.ownership")
      .if((_, { req }) => req.body.entityType === "UNIVERSITY")
      .notEmpty()
      .withMessage("ownership is required")
      .bail()
      .isIn(OWNERSHIP)
      .withMessage("ownership must be JAVNA or PRIVATNA"),

    body("data.cycle")
      .if((_, { req }) => req.body.entityType === "STUDY_PROGRAM")
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
      .withMessage("Target ID must be a positive integer"),

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
      .withMessage("Target ID must be a positive integer"),

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
