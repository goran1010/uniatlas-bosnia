import { param, query } from "express-validator";
import { validationError } from "./validationError.js";

class UniversityValidation {
  searchUniversities = [
    query("searchTerm")
      .trim()
      .notEmpty()
      .withMessage("Search term is required")
      .isLength({ min: 2 })
      .withMessage("Search term must be at least 2 characters"),

    validationError,
  ];

  searchStudyPrograms = [
    query("searchTerm")
      .trim()
      .notEmpty()
      .withMessage("Search term is required")
      .isLength({ min: 2 })
      .withMessage("Search term must be at least 2 characters"),

    validationError,
  ];

  getUniversityById = [
    param("id")
      .trim()
      .notEmpty()
      .withMessage("University ID is required")
      .bail()
      .isInt({ min: 1 })
      .withMessage("Invalid university ID.")
      .toInt(),

    validationError,
  ];
}

const universityValidation = new UniversityValidation();

export { universityValidation };
