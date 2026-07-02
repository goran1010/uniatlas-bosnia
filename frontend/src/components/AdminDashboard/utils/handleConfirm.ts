import { BACKEND_URL } from "../../../utils/envConfig";
import { getCsrfToken } from "../../utils/getCsrfToken";
import { guardedFetch } from "../../../utils/guardedFetch";

import type { PendingChange } from "../../ContributionDashboard/customHooks/useGetPendingChanges";
import type { TFunction } from "../../../types/i18n";
import type { Notification } from "../../../types/notification";
import type { ServerStatus } from "../../../utils/serverStatus";
import type { Dispatch, SetStateAction } from "react";

type HandleConfirm = (
  change: PendingChange,
  setPendingChanges: Dispatch<SetStateAction<PendingChange[]>>,
  addNotification: (notification: Notification) => void,
  setLoading: (loading: boolean) => void,
  t: TFunction,
  serverStatus: ServerStatus,
) => Promise<void>;

interface StatusSuccessResponse {
  message: string;
  data: {
    email: string;
  };
}

async function parseJson<T>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
}

async function readErrorMessage(response: Response) {
  try {
    const result = (await response.json()) as {
      error?: { message?: string };
      message?: string;
    };

    return result.error?.message ?? result.message ?? null;
  } catch {
    return null;
  }
}

const handleConfirm: HandleConfirm = async function (
  change,
  setPendingChanges,
  addNotification,
  setLoading,
  t,
  serverStatus,
) {
  try {
    setLoading(true);
    const csrfToken = await getCsrfToken({
      serverStatus,
      addNotification,
      t,
    });

    if (!csrfToken) {
      addNotification({
        type: "error",
        message: t("messages.csrfTokenFailed"),
      });
      return;
    }

    const response = await guardedFetch(
      `${BACKEND_URL}/users/admin/approve-pending-change`,
      {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        body: JSON.stringify({
          id: change.id,
        }),
        credentials: "include",
      },
      { serverStatus, addNotification, t },
    );

    if (response.ok) {
      const result = await parseJson<StatusSuccessResponse>(response);
      setPendingChanges((prev) =>
        prev.filter((request) => request.id !== change.id),
      );
      addNotification({
        type: "success",
        message: result.message,
      });
      return;
    }
    const message =
      (await readErrorMessage(response)) ??
      `${t("messages.admin.approveError")} ${change.user?.email ?? ""}`;
    addNotification({
      type: "error",
      message,
    });
  } catch (error) {
    addNotification({
      type: "error",
      message: `${t("messages.admin.approveError")} ${change.user?.email ?? ""}`,
    });
    console.error(
      `Error approving pending change for ${change.user?.email ?? ""}:`,
      error,
    );
  } finally {
    setLoading(false);
  }
};

export { handleConfirm };
