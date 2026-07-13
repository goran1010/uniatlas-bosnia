beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("envConfig", () => {
  test("should have the correct environment variables", async () => {
    vi.stubEnv("VITE_BACKEND_URL", "https://example.com");

    const { BACKEND_URL } = await import("../../../src/utils/envConfig");

    expect(BACKEND_URL).toBe("https://example.com");
  });

  test("should throw an error if VITE_BACKEND_URL is not defined", async () => {
    vi.stubEnv("VITE_BACKEND_URL", undefined);

    await expect(async () => {
      await import("../../../src/utils/envConfig");
    }).rejects.toThrow(
      "VITE_BACKEND_URL is not defined in environment variables",
    );
  });
});
