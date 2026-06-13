import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";

import type { PendingChange } from "../../../../src/components/ContributionDashboard/customHooks/useGetPendingChanges";
import type { Dispatch, SetStateAction } from "react";

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

const change: PendingChange = {
  id: "8687b282-fcc6-4f69-8744-0f8e1585d991",
  entityType: "FACULTY",
  typeOfChange: "UPDATE",
  targetId: 1,
  parentId: 1,
  data: { email: "", role: "USER" },
  userId: "user-1",
  user: { email: "johndoe@examplemail.com", role: "USER" },
  createdAt: new Date(),
};

const t = (key: string) => key;

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
      json: () =>
        Promise.resolve({ message: "Pending change declined successfully." }),
    } as Response);

    const { handleDecline } =
      await import("../../../../src/components/AdminDashboard/utils/handleDecline");
    let updatePendingChanges:
      | ((prev: PendingChange[]) => PendingChange[])
      | undefined;
    const setPendingChanges: Dispatch<SetStateAction<PendingChange[]>> = (
      value,
    ) => {
      if (typeof value === "function") {
        updatePendingChanges = value;
      }
    };
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
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": "csrf-token",
        },
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

    expect(updatePendingChanges?.([change, { ...change, id: "2" }])).toEqual([
      { ...change, id: "2" },
    ]);
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
      json: () => Promise.resolve({}),
    } as Response);

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
      message: "messages.admin.declineError johndoe@examplemail.com",
    });
  });

  test("shows the fallback decline error when the request throws", async () => {
    const requestError = new Error("Network failure");
    getCsrfTokenMock.mockResolvedValue("csrf-token");
    guardedFetchMock.mockRejectedValue(requestError);
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const { handleDecline } =
      await import("../../../../src/components/AdminDashboard/utils/handleDecline");
    const addNotification = vi.fn();

    await handleDecline(change, vi.fn(), addNotification, vi.fn(), t, "live");

    expect(addNotification).toHaveBeenCalledWith({
      type: "error",
      message: "messages.admin.declineError johndoe@examplemail.com",
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      `Error declining ${change.user?.email ?? ""}'s request:`,
      requestError,
    );
  });
});
