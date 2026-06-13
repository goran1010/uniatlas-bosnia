import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";

const getCsrfTokenMock = vi.fn<(args: unknown) => Promise<string | null>>();
const guardedFetchMock =
  vi.fn<
    (url: unknown, options: unknown, context: unknown) => Promise<Response>
  >();

vi.mock("../../../../src/components/utils/getCsrfToken", () => ({
  getCsrfToken: (args: unknown) => getCsrfTokenMock(args),
}));

vi.mock("../../../../src/utils/guardedFetch", () => ({
  guardedFetch: (url: unknown, options: unknown, context: unknown) =>
    guardedFetchMock(url, options, context),
}));

const t = (key: string) => key;

beforeEach(() => {
  getCsrfTokenMock.mockReset();
  guardedFetchMock.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("handleDiscardUniversityChange", () => {
  test("removes the discarded change and shows a success notification", async () => {
    getCsrfTokenMock.mockResolvedValue("csrf-token");
    guardedFetchMock.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({ message: "Pending change deleted successfully." }),
    } as Response);

    const { handleDiscardUniversityChange } =
      await import("../../../../src/components/ContributionDashboard/utils/handleDiscardUniversityChange");
    const setPendingChanges = vi.fn();
    const addNotification = vi.fn();
    const setLoading = vi.fn();

    await handleDiscardUniversityChange({
      changeId: "1",
      setPendingChanges,
      addNotification,
      setLoading,
      t,
      serverStatus: "live",
    });

    expect(guardedFetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/pending-changes/universities"),
      expect.objectContaining({
        method: "DELETE",
        body: JSON.stringify({ id: "1" }),
      }),
      expect.objectContaining({ serverStatus: "live" }),
    );
    expect(addNotification).toHaveBeenCalledWith({
      type: "success",
      message: "Pending change deleted successfully.",
    });

    const updatePendingChanges = setPendingChanges.mock.calls[0]?.[0] as (
      prev: { id: string }[],
    ) => { id: string }[];
    expect(updatePendingChanges([{ id: "1" }, { id: "2" }])).toEqual([
      { id: "2" },
    ]);
  });

  test("shows an error notification when the csrf token is missing", async () => {
    getCsrfTokenMock.mockResolvedValue(null);

    const { handleDiscardUniversityChange } =
      await import("../../../../src/components/ContributionDashboard/utils/handleDiscardUniversityChange");
    const addNotification = vi.fn();
    const setLoading = vi.fn();

    await handleDiscardUniversityChange({
      changeId: "1",
      setPendingChanges: vi.fn(),
      addNotification,
      setLoading,
      t,
      serverStatus: "live",
    });

    expect(guardedFetchMock).not.toHaveBeenCalled();
    expect(addNotification).toHaveBeenCalledWith({
      type: "error",
      message: "messages.csrfTokenFailed",
    });
    expect(setLoading).toHaveBeenLastCalledWith(false);
  });

  test("shows the backend error when discarding fails", async () => {
    getCsrfTokenMock.mockResolvedValue("csrf-token");
    guardedFetchMock.mockResolvedValue({
      ok: false,
      json: () =>
        Promise.resolve({
          error: { message: "Discard failed on the server." },
        }),
    } as Response);

    const { handleDiscardUniversityChange } =
      await import("../../../../src/components/ContributionDashboard/utils/handleDiscardUniversityChange");
    const setPendingChanges = vi.fn();
    const addNotification = vi.fn();

    await handleDiscardUniversityChange({
      changeId: "1",
      setPendingChanges,
      addNotification,
      setLoading: vi.fn(),
      t,
      serverStatus: "live",
    });

    expect(setPendingChanges).not.toHaveBeenCalled();
    expect(addNotification).toHaveBeenCalledWith({
      type: "error",
      message: "Discard failed on the server.",
    });
  });

  test("shows the fallback error when the request throws", async () => {
    const requestError = new Error("Network failure");
    getCsrfTokenMock.mockResolvedValue("csrf-token");
    guardedFetchMock.mockRejectedValue(requestError);
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const { handleDiscardUniversityChange } =
      await import("../../../../src/components/ContributionDashboard/utils/handleDiscardUniversityChange");
    const addNotification = vi.fn();

    await handleDiscardUniversityChange({
      changeId: "1",
      setPendingChanges: vi.fn(),
      addNotification,
      setLoading: vi.fn(),
      t,
      serverStatus: "live",
    });

    expect(addNotification).toHaveBeenCalledWith({
      type: "error",
      message: "messages.universities.deleteError",
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error discarding pending change:",
      requestError,
    );
  });
});
