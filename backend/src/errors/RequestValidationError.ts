import type { ZodError } from "zod";

export interface ApiValidationIssue {
  path: string;
  code: string;
  message: string;
}

export class RequestValidationError extends Error {
  readonly status = 400;
  readonly code = "VALIDATION_ERROR";
  readonly issues: ApiValidationIssue[];

  constructor(error: ZodError) {
    super("Request validation failed.");

    this.name = "RequestValidationError";

    this.issues = error.issues.map((issue) => ({
      path:
        issue.path.length > 0 ? issue.path.map(String).join(".") : "request",
      code: issue.code,
      message: issue.message,
    }));
  }
}
