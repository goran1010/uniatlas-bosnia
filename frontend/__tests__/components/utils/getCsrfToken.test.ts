import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import type { ServerStatus } from "../../../src/utils/serverStatus";

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.restoreAllMocks();
});

const serverStatus: ServerStatus = "live";

describe("getCsrfToken", () => {
  test("returns the CSRF token when response is ok", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const mockResponse = new Response(
      JSON.stringify({ data: "test-csrf-token" }),
      { status: 200 },
    );
    fetchSpy.mockResolvedValue(mockResponse);
    const { getCsrfToken } =
      await import("../../../src/components/utils/getCsrfToken");
    const result = await getCsrfToken({
      serverStatus,
      addNotification: () => vi.fn(),
      t: (key) => key,
    });

    expect(result).toBe("test-csrf-token");
  });

  test("calls fetch with cors mode and credentials included", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const mockResponse = new Response(
      JSON.stringify({ data: "test-csrf-token" }),
      { status: 200 },
    );
    fetchSpy.mockResolvedValue(mockResponse);

    const { getCsrfToken } =
      await import("../../../src/components/utils/getCsrfToken");

    await getCsrfToken({
      serverStatus,
      addNotification: () => vi.fn(),
      t: (key) => key,
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ mode: "cors", credentials: "include" }),
    );
  });

  test("throws an Error when fetch throws", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockRejectedValue(new Error("Network failure"));
    vi.spyOn(console, "error").mockImplementation(() => vi.fn());
    const { getCsrfToken } =
      await import("../../../src/components/utils/getCsrfToken");

    await expect(
      getCsrfToken({
        serverStatus,
        addNotification: () => vi.fn(),
        t: (key) => key,
      }),
    ).rejects.toThrow("Failed to fetch CSRF token");
  });

  test("logs the error to console when fetch throws", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const networkError = new Error("Network failure");
    fetchSpy.mockRejectedValue(networkError);
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => vi.fn());
    const { getCsrfToken } =
      await import("../../../src/components/utils/getCsrfToken");

    await expect(
      getCsrfToken({
        serverStatus,
        addNotification: () => vi.fn(),
        t: (key) => key,
      }),
    ).rejects.toThrow("Failed to fetch CSRF token");
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error fetching CSRF token:",
      networkError,
    );
  });
});
