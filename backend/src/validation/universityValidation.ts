import { query } from "express-validator";
import { z } from "zod";

import { RequestValidationError } from "../errors/RequestValidationError.js";
import { validationError } from "./validationError.js";

import type { NextFunction, Request, RequestHandler, Response } from "express";

const getUniversityByIdRequestSchema = z.object({
  params: z.strictObject({
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
  }),
});

type GetUniversityByIdController = (
  req: Request,
  res: Response,
  next: NextFunction,
  validated: z.output<typeof getUniversityByIdRequestSchema>,
) => void | Promise<void>;

class UniversityValidation {
  getUniversityById(controller: GetUniversityByIdController): RequestHandler {
    return async (req, res, next) => {
      const result = await getUniversityByIdRequestSchema.safeParseAsync({
        params: req.params,
      });

      if (!result.success) {
        next(new RequestValidationError(result.error));
        return;
      }

      try {
        await controller(req, res, next, result.data);
      } catch (error) {
        next(error);
      }
    };
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
