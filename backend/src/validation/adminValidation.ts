import { z } from "zod";
import { RequestValidationError } from "../errors/RequestValidationError.js";

const pendingChangeSchema = z.strictObject({
  id: z.uuid({ message: "Pending change ID must be a valid UUID" }),
});

function declinePendingChange(input: unknown) {
  const result = pendingChangeSchema.safeParse(input);

  if (!result.success) {
    throw new RequestValidationError(result.error);
  }

  return result.data;
}

function approvePendingChange(input: unknown) {
  const result = pendingChangeSchema.safeParse(input);

  if (!result.success) {
    throw new RequestValidationError(result.error);
  }

  return result.data;
}

export { declinePendingChange, approvePendingChange };
