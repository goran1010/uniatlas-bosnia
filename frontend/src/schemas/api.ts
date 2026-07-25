import { z } from "zod";

const apiErrorResponseSchema = z.object({
  error: z.object({
    message: z.string(),
  }),
});

function readErrorMessage(payload: unknown): string | null {
  const result = apiErrorResponseSchema.safeParse(payload);
  return result.success ? result.data.error.message : null;
}

export { apiErrorResponseSchema, readErrorMessage };
