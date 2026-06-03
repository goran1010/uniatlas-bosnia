import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";

const getCsrfTokenMock = vi.fn();
const guardedFetchMock = vi.fn();

vi.mock("../../../../src/components/utils/getCsrfToken", () => ({
  getCsrfToken: (...args) => getCsrfTokenMock(...args),
}));

vi.mock("../../../../src/utils/guardedFetch", () => ({
  guardedFetch: (...args) => guardedFetchMock(...args),
}));

const change = {
  id: "8687b282-fcc6-4f69-8744-0f8e1585d991",
  entityType: "FACULTY",
  typeOfChange: "UPDATE",
  user: { email: "johndoe@examplemail.com" },
};

const t = (key) => key;

beforeEach(() => {
  getCsrfTokenMock.mockReset();
  guardedFetchMock.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("handleConfirm", () => {
  test("removes the approved change and shows a success notification", async () => {
    getCsrfTokenMock.mockResolvedValue("csrf-token");
    guardedFetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ message: "Pending change approved successfully." }),
    });

    const { handleConfirm } =
      await import("../../../../src/components/AdminDashboard/utils/handleConfirm");
    const setPendingChanges = vi.fn();
    const addNotification = vi.fn();
    const setLoading = vi.fn();

    await handleConfirm(
      change,
      setPendingChanges,
      addNotification,
      setLoading,
      t,
      "live",
    );

    expect(guardedFetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/approve-pending-change"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "x-csrf-token": "csrf-token" }),
        body: JSON.stringify({
          id: change.id,
          entityType: change.entityType,
          typeOfChange: change.typeOfChange,
        }),
      }),
      expect.objectContaining({ serverStatus: "live" }),
    );
    expect(setLoading).toHaveBeenNthCalledWith(1, true);
    expect(setLoading).toHaveBeenLastCalledWith(false);
    expect(addNotification).toHaveBeenCalledWith({
      type: "success",
      message: "Pending change approved successfully.",
    });

    const updatePendingChanges = setPendingChanges.mock.calls[0][0];

    expect(updatePendingChanges([change, { id: "2" }])).toEqual([{ id: "2" }]);
  });

  test("shows an error notification when the csrf token is missing", async () => {
    getCsrfTokenMock.mockResolvedValue(null);

    const { handleConfirm } =
      await import("../../../../src/components/AdminDashboard/utils/handleConfirm");
    const addNotification = vi.fn();
    const setLoading = vi.fn();

    await handleConfirm(
      change,
      vi.fn(),
      addNotification,
      setLoading,
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

  test("shows the backend error when approval fails", async () => {
    getCsrfTokenMock.mockResolvedValue("csrf-token");
    guardedFetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Approval failed on the server." }),
    });

    const { handleConfirm } =
      await import("../../../../src/components/AdminDashboard/utils/handleConfirm");
    const setPendingChanges = vi.fn();
    const addNotification = vi.fn();

    await handleConfirm(
      change,
      setPendingChanges,
      addNotification,
      vi.fn(),
      t,
      "live",
    );

    expect(setPendingChanges).not.toHaveBeenCalled();
    expect(addNotification).toHaveBeenCalledWith({
      type: "error",
      message: "Approval failed on the server.",
    });
  });

  test("shows the fallback approval error when the request throws", async () => {
    const requestError = new Error("Network failure");
    getCsrfTokenMock.mockResolvedValue("csrf-token");
    guardedFetchMock.mockRejectedValue(requestError);
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const { handleConfirm } =
      await import("../../../../src/components/AdminDashboard/utils/handleConfirm");
    const addNotification = vi.fn();

    await handleConfirm(change, vi.fn(), addNotification, vi.fn(), t, "live");

    expect(addNotification).toHaveBeenCalledWith({
      type: "error",
      message: "messages.admin.approveError",
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      `Error approving pending change for ${change.user.email}:`,
      requestError,
    );
  });
});
