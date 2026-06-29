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

describe("handleConfirm", () => {
  test("removes the approved change and shows a success notification", async () => {
    getCsrfTokenMock.mockResolvedValue("csrf-token");
    guardedFetchMock.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({ message: "Pending change approved successfully." }),
    } as Response);

    const { handleConfirm } =
      await import("../../../../src/components/AdminDashboard/utils/handleConfirm");
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
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": "csrf-token",
        },
        body: JSON.stringify({
          id: change.id,
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

    expect(updatePendingChanges?.([change, { ...change, id: "2" }])).toEqual([
      { ...change, id: "2" },
    ]);
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
      json: () =>
        Promise.resolve({
          error: { message: "Approval failed on the server." },
        }),
    } as Response);

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
      .mockImplementation(() => undefined);

    const { handleConfirm } =
      await import("../../../../src/components/AdminDashboard/utils/handleConfirm");
    const addNotification = vi.fn();

    await handleConfirm(change, vi.fn(), addNotification, vi.fn(), t, "live");

    expect(addNotification).toHaveBeenCalledWith({
      type: "error",
      message: "messages.admin.approveError johndoe@examplemail.com",
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      `Error approving pending change for ${change.user?.email ?? ""}:`,
      requestError,
    );
  });
});
