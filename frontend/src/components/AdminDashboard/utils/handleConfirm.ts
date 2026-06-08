const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
import { getCsrfToken } from "../../utils/getCsrfToken";
import { guardedFetch } from "../../../utils/guardedFetch";

import type { PendingChange } from "../../ContributionDashboard/customHooks/useGetPendingChanges";
import type { TFunction } from "../../../customHooks/useLanguage";
import type { Notification } from "../../../customHooks/useNotification";
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
          entityType: change.entityType,
          typeOfChange: change.typeOfChange,
        }),
        credentials: "include",
      },
      { serverStatus, addNotification, t },
    );

    if (!response) {
      return;
    }
    const result = await response.json();

    if (response.ok) {
      setPendingChanges((prev) =>
        prev.filter((request) => request.id !== change.id),
      );
      addNotification({
        type: "success",
        message: result.message,
      });
      return;
    }
    addNotification({
      type: "error",
      message:
        result?.error?.message ||
        result?.error ||
        t("messages.admin.approveFailed"),
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
