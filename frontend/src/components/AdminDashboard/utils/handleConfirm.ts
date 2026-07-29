import { BACKEND_URL } from "../../../utils/envConfig";
import {
  actionSuccessResponseSchema,
  readErrorMessage,
} from "../../../schemas/api";
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

async function getErrorMessage(response: Response) {
  try {
    return readErrorMessage(await response.json());
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
      actionSuccessResponseSchema.parse(await response.json());
      setPendingChanges((prev) =>
        prev.filter((request) => request.id !== change.id),
      );
      addNotification({
        type: "success",
        message: t("messages.admin.approveSuccess"),
      });
      return;
    }
    const serverMessage = await getErrorMessage(response);
    if (serverMessage) {
      console.warn("Failed to approve pending change:", serverMessage);
    }
    addNotification({
      type: "error",
      message: t("messages.admin.approveError"),
    });
  } catch (error) {
    addNotification({
      type: "error",
      message: t("messages.admin.approveError"),
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
