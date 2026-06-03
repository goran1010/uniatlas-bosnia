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

describe("handleDecline", () => {
  test("removes the declined change and shows a success notification", async () => {
    getCsrfTokenMock.mockResolvedValue("csrf-token");
    guardedFetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ message: "Pending change declined successfully." }),
    });

    const { handleDecline } =
      await import("../../../../src/components/AdminDashboard/utils/handleDecline");
    const setPendingChanges = vi.fn();
    const addNotification = vi.fn();
    const setLoading = vi.fn();

    await handleDecline(
      change,
      setPendingChanges,
      addNotification,
      setLoading,
      t,
      "live",
    );

    expect(guardedFetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/decline-pending-change"),
      expect.objectContaining({
        method: "DELETE",
        headers: expect.objectContaining({ "x-csrf-token": "csrf-token" }),
        body: JSON.stringify({ id: change.id }),
      }),
      expect.objectContaining({ serverStatus: "live" }),
    );
    expect(setLoading).toHaveBeenNthCalledWith(1, true);
    expect(setLoading).toHaveBeenLastCalledWith(false);
    expect(addNotification).toHaveBeenCalledWith({
      type: "success",
      message: "Pending change declined successfully.",
    });

    const updatePendingChanges = setPendingChanges.mock.calls[0][0];

    expect(updatePendingChanges([change, { id: "2" }])).toEqual([{ id: "2" }]);
  });

  test("shows an error notification when the csrf token is missing", async () => {
    getCsrfTokenMock.mockResolvedValue(null);

    const { handleDecline } =
      await import("../../../../src/components/AdminDashboard/utils/handleDecline");
    const addNotification = vi.fn();
    const setLoading = vi.fn();

    await handleDecline(
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

  test("shows the fallback decline error when the backend response is not ok", async () => {
    getCsrfTokenMock.mockResolvedValue("csrf-token");
    guardedFetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({}),
    });

    const { handleDecline } =
      await import("../../../../src/components/AdminDashboard/utils/handleDecline");
    const setPendingChanges = vi.fn();
    const addNotification = vi.fn();

    await handleDecline(
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
      message: "messages.admin.declineFailed",
    });
  });

  test("shows the fallback decline error when the request throws", async () => {
    const requestError = new Error("Network failure");
    getCsrfTokenMock.mockResolvedValue("csrf-token");
    guardedFetchMock.mockRejectedValue(requestError);
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const { handleDecline } =
      await import("../../../../src/components/AdminDashboard/utils/handleDecline");
    const addNotification = vi.fn();

    await handleDecline(change, vi.fn(), addNotification, vi.fn(), t, "live");

    expect(addNotification).toHaveBeenCalledWith({
      type: "error",
      message: "messages.admin.declineError",
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      `Error declining ${change.user.email}'s request:`,
      requestError,
    );
  });
});
