import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";

let fetchSpy;

beforeEach(() => {
  fetchSpy = vi.spyOn(globalThis, "fetch");
  vi.resetModules();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getCsrfToken", () => {
  test("returns the CSRF token when response is ok", async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({ data: "test-csrf-token" }),
    });
    const { getCsrfToken } =
      await import("../../../src/components/utils/getCsrfToken");
    const result = await getCsrfToken();

    expect(result).toBe("test-csrf-token");
  });

  test("calls fetch with cors mode and credentials included", async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({ data: "token" }),
    });
    const { getCsrfToken } =
      await import("../../../src/components/utils/getCsrfToken");
    await getCsrfToken();

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ mode: "cors", credentials: "include" }),
    );
  });

  test("returns null when response is not ok", async () => {
    fetchSpy.mockResolvedValue({ ok: false });
    const { getCsrfToken } =
      await import("../../../src/components/utils/getCsrfToken");
    const result = await getCsrfToken();

    expect(result).toBeNull();
  });

  test("throws an Error when fetch throws", async () => {
    fetchSpy.mockRejectedValue(new Error("Network failure"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { getCsrfToken } =
      await import("../../../src/components/utils/getCsrfToken");
    await expect(getCsrfToken()).rejects.toThrow("Failed to fetch CSRF token");
  });

  test("logs the error to console when fetch throws", async () => {
    const networkError = new Error("Network failure");
    fetchSpy.mockRejectedValue(networkError);
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const { getCsrfToken } =
      await import("../../../src/components/utils/getCsrfToken");
    await expect(getCsrfToken()).rejects.toThrow("Failed to fetch CSRF token");
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error fetching CSRF token:",
      networkError,
    );
  });
});
