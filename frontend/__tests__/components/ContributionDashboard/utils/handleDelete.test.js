import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";

const getCsrfTokenMock = vi.fn();
const guardedFetchMock = vi.fn();

vi.mock("../../../../src/components/utils/getCsrfToken", () => ({
  getCsrfToken: (...args) => getCsrfTokenMock(...args),
}));

vi.mock("../../../../src/utils/guardedFetch", () => ({
  guardedFetch: (...args) => guardedFetchMock(...args),
}));

const t = (key) => key;

function createDeleteEvent({
  code = "71000",
  city = "Sarajevo",
  post = "BH Post",
} = {}) {
  return {
    preventDefault: vi.fn(),
    currentTarget: {
      dataset: {
        postalcode: code,
        city,
        post,
      },
    },
  };
}

beforeEach(() => {
  getCsrfTokenMock.mockReset();
  guardedFetchMock.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("handleDelete", () => {
  test("creates a pending delete change and shows success notification", async () => {
    getCsrfTokenMock.mockResolvedValue("csrf-token");
    guardedFetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          id: "pending-1",
          typeOfChange: "DELETE",
          code: "71000",
          city: "Sarajevo",
          post: "BH Post",
        },
        message: "Delete request queued.",
      }),
    });

    const { handleDelete } =
      await import("../../../../src/components/ContributionDashboard/utils/handleDelete");
    const addNotification = vi.fn();
    const setLoading = vi.fn();
    const setPendingChanges = vi.fn();

    await handleDelete(
      createDeleteEvent(),
      addNotification,
      setLoading,
      setPendingChanges,
      { email: "user@email.com" },
      t,
      "live",
    );

    expect(guardedFetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/users/contribution/universities"),
      expect.objectContaining({
        method: "DELETE",
        headers: expect.objectContaining({ "x-csrf-token": "csrf-token" }),
        body: JSON.stringify({
          code: "71000",
          city: "Sarajevo",
          post: "BH Post",
        }),
      }),
      expect.objectContaining({ serverStatus: "live" }),
    );
    expect(setLoading).toHaveBeenNthCalledWith(1, true);
    expect(setLoading).toHaveBeenLastCalledWith(false);
    expect(addNotification).toHaveBeenCalledWith({
      type: "success",
      message: "Delete request queued.",
    });

    const updatePendingChanges = setPendingChanges.mock.calls[0][0];

    expect(updatePendingChanges([{ id: "existing" }])).toEqual([
      { id: "existing" },
      {
        id: "pending-1",
        typeOfChange: "DELETE",
        code: "71000",
        city: "Sarajevo",
        post: "BH Post",
        user: { email: "user@email.com" },
      },
    ]);
  });

  test("shows error when csrf token is missing", async () => {
    getCsrfTokenMock.mockResolvedValue(null);

    const { handleDelete } =
      await import("../../../../src/components/ContributionDashboard/utils/handleDelete");
    const addNotification = vi.fn();
    const setLoading = vi.fn();

    await handleDelete(
      createDeleteEvent(),
      addNotification,
      setLoading,
      vi.fn(),
      { email: "user@email.com" },
      t,
      "live",
    );

    expect(guardedFetchMock).not.toHaveBeenCalled();
    expect(addNotification).toHaveBeenCalledWith({
      type: "error",
      message: "messages.csrfTokenFailed",
    });
    expect(setLoading).toHaveBeenLastCalledWith(false);
  });

  test("shows backend error when delete request fails", async () => {
    getCsrfTokenMock.mockResolvedValue("csrf-token");
    guardedFetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Delete failed on backend." }),
    });

    const { handleDelete } =
      await import("../../../../src/components/ContributionDashboard/utils/handleDelete");
    const addNotification = vi.fn();
    const setPendingChanges = vi.fn();

    await handleDelete(
      createDeleteEvent(),
      addNotification,
      vi.fn(),
      setPendingChanges,
      { email: "user@email.com" },
      t,
      "live",
    );

    expect(setPendingChanges).not.toHaveBeenCalled();
    expect(addNotification).toHaveBeenCalledWith({
      type: "error",
      message: "Delete failed on backend.",
    });
  });

  test("shows fallback error when request throws", async () => {
    const requestError = new Error("Network failure");
    getCsrfTokenMock.mockResolvedValue("csrf-token");
    guardedFetchMock.mockRejectedValue(requestError);
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const { handleDelete } =
      await import("../../../../src/components/ContributionDashboard/utils/handleDelete");
    const addNotification = vi.fn();

    await handleDelete(
      createDeleteEvent(),
      addNotification,
      vi.fn(),
      vi.fn(),
      { email: "user@email.com" },
      t,
      "live",
    );

    expect(addNotification).toHaveBeenCalledWith({
      type: "error",
      message: "messages.postal.deleteError",
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error deleting postal code:",
      requestError,
    );
  });
});
