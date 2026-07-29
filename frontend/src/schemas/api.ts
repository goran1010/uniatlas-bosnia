import { z } from "zod";

const apiErrorResponseSchema = z.object({
  error: z.object({
    message: z.string(),
  }),
});

const actionSuccessResponseSchema = z.object({
  message: z.string(),
  data: z.unknown().optional(),
});

function readErrorMessage(payload: unknown): string | null {
  const result = apiErrorResponseSchema.safeParse(payload);
  return result.success ? result.data.error.message : null;
}

export {
  actionSuccessResponseSchema,
  apiErrorResponseSchema,
  readErrorMessage,
};
