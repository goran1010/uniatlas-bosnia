import { vi, describe, test, expect } from "vitest";

vi.mock("pino", () => {
  return {
    default: vi
      .fn()
      .mockImplementation((options: { timestamp?: () => void }) => {
        if (options.timestamp) {
          options.timestamp();
        }
        return {
          info: vi.fn(),
          error: vi.fn(),
          warn: vi.fn(),
          debug: vi.fn(),
        };
      }),
  };
});

describe("logger", () => {
  test("should create a logger instance with timestamp", async () => {
    const { logger } = await import("../../../src/utils/logger.js");
    expect(logger).toBeDefined();
    expect(logger.info).toBeDefined();
  });
});
