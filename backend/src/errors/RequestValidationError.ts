import type { ZodError } from "zod";

type ZodIssueCode = ZodError["issues"][number]["code"];

export interface ApiValidationIssue {
  path: string;
  code: ZodIssueCode;
  message: string;
}

export class RequestValidationError extends Error {
  readonly status = 400;
  readonly code = "VALIDATION_ERROR";
  readonly issues: ApiValidationIssue[];

  constructor(error: ZodError) {
    super("Request validation failed.", {
      cause: error,
    });

    this.name = "RequestValidationError";

    this.issues = error.issues.map((issue) => ({
      path:
        issue.path.length > 0 ? issue.path.map(String).join(".") : "request",
      code: issue.code,
      message: issue.message,
    }));
  }
}
