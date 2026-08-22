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

const adminRequestSchema = z.strictObject({
  id: z.uuid({ message: "User ID must be a valid UUID" }),
});

function approveAdminRequest(input: unknown) {
  const result = adminRequestSchema.safeParse(input);

  if (!result.success) {
    throw new RequestValidationError(result.error);
  }

  return result.data;
}

function declineAdminRequest(input: unknown) {
  const result = adminRequestSchema.safeParse(input);

  if (!result.success) {
    throw new RequestValidationError(result.error);
  }

  return result.data;
}

export {
  declinePendingChange,
  approvePendingChange,
  approveAdminRequest,
  declineAdminRequest,
};
