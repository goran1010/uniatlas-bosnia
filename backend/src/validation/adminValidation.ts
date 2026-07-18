import { z } from "zod";
import { RequestValidationError } from "../errors/RequestValidationError.js";

const pendingChangeSchema = z.strictObject({
  id: z.uuid({ message: "Pending change ID must be a valid UUID" }),
});

function parsePendingChange(input: unknown) {
  const result = pendingChangeSchema.safeParse(input);

  if (!result.success) {
    throw new RequestValidationError(result.error);
  }

  return result.data;
}

function declinePendingChange(input: unknown) {
  return parsePendingChange(input);
}

function approvePendingChange(input: unknown) {
  return parsePendingChange(input);
}

export { declinePendingChange, approvePendingChange };
