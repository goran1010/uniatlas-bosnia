import { z } from "zod";
import { RequestValidationError } from "../errors/RequestValidationError.js";

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

function getUniversityById(input: unknown) {
  const result = getUniversityByIdParamsSchema.safeParse(input);

  if (!result.success) {
    throw new RequestValidationError(result.error);
  }

  return result.data;
}

const searchQuerySchema = z.strictObject({
  searchTerm: z
    .string()
    .trim()
    .min(2, {
      message: "Search term must be at least 2 characters.",
    })
    .max(100, {
      message: "Search term must not exceed 100 characters.",
    }),
});

function searchQuery(input: unknown) {
  const result = searchQuerySchema.safeParse(input);

  if (!result.success) {
    throw new RequestValidationError(result.error);
  }

  return result.data;
}

export { getUniversityById, searchQuery };
