import { query } from "express-validator";
import { z } from "zod";

import { RequestValidationError } from "../errors/RequestValidationError.js";
import { validationError } from "./validationError.js";

const getUniversityByIdParamsSchema = z.strictObject({
  id: z
    .string()
    .trim()
    .transform(Number)
    .pipe(
      z
        .number()
        .int({
          error: "University ID must be an integer.",
        })
        .positive({
          error: "University ID must be positive.",
        }),
    ),
});

type GetUniversityByIdParams = z.output<typeof getUniversityByIdParamsSchema>;

class UniversityValidation {
  getUniversityById(input: unknown): GetUniversityByIdParams {
    const result = getUniversityByIdParamsSchema.safeParse(input);

    if (!result.success) {
      throw new RequestValidationError(result.error);
    }

    return result.data;
  }

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
}

export const universityValidation = new UniversityValidation();
