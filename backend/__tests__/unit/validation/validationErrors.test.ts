import { vi, test, describe, expect } from "vitest";
import { validationError } from "../../../src/validation/validationError.js";
import type { Request, Response, NextFunction } from "express";

vi.mock("express-validator", () => ({
  validationResult: () => ({
    isEmpty: () => false,
    array: () => [
      { msg: "Invalid input", type: "unexpected", path: "unknown" },
    ],
  }),
}));

describe("validationError", () => {
  test("should show an error for unexpected validation error type", () => {
    const req = {} as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    const next = vi.fn() as NextFunction;

    validationError(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        message: "Validation failed: Invalid input.",
      },
    });
    expect(next).not.toHaveBeenCalled();
  });
});
