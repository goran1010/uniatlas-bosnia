beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("envConfig", () => {
  test("should have the correct environment variables", async () => {
    vi.stubEnv("VITE_SERVER_URL", "https://example.com");

    const { SERVER_URL } = await import("../../../src/utils/envConfig");

    expect(SERVER_URL).toBe("https://example.com");
  });

  test("should throw an error if VITE_SERVER_URL is not defined", async () => {
    vi.stubEnv("VITE_SERVER_URL", undefined);

    await expect(async () => {
      await import("../../../src/utils/envConfig");
    }).rejects.toThrow(
      "VITE_SERVER_URL is not defined in environment variables",
    );
  });

  test("should use VITE_PUBLIC_API_URL when set", async () => {
    vi.stubEnv("VITE_SERVER_URL", "/server");
    vi.stubEnv("VITE_PUBLIC_API_URL", "https://api.example.com");

    const { PUBLIC_API_URL } = await import("../../../src/utils/envConfig");

    expect(PUBLIC_API_URL).toBe("https://api.example.com");
  });

  test("should fall back to VITE_SERVER_URL when VITE_PUBLIC_API_URL is not set", async () => {
    vi.stubEnv("VITE_SERVER_URL", "https://example.com");
    vi.stubEnv("VITE_PUBLIC_API_URL", undefined);

    const { PUBLIC_API_URL } = await import("../../../src/utils/envConfig");

    expect(PUBLIC_API_URL).toBe("https://example.com");
  });
});
