import { SERVER_URL } from "../../../utils/envConfig";
import {
  actionSuccessResponseSchema,
  readErrorMessage,
} from "../../../schemas/api";
import { getCsrfToken } from "../../utils/getCsrfToken";
import { guardedFetch } from "../../../utils/guardedFetch";
import { isServerNotReadyError } from "../../../utils/serverStatus";

import type { AdminRequest } from "../../../schemas/adminRequest";
import type { TFunction } from "../../../types/i18n";
import type { Notification } from "../../../types/notification";
import type { ServerStatus } from "../../../utils/serverStatus";
import type { Dispatch, SetStateAction } from "react";

type HandleDeclineAdminRequest = (
  adminRequest: AdminRequest,
  setAdminRequests: Dispatch<SetStateAction<AdminRequest[]>>,
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

const handleDeclineAdminRequest: HandleDeclineAdminRequest = async function (
  adminRequest,
  setAdminRequests,
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
      `${SERVER_URL}/users/admin/decline-admin-request`,
      {
        method: "DELETE",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        body: JSON.stringify({
          id: adminRequest.id,
        }),
        credentials: "include",
      },
      { serverStatus },
    );

    if (response.ok) {
      actionSuccessResponseSchema.parse(await response.json());
      setAdminRequests((prev) =>
        prev.filter((request) => request.id !== adminRequest.id),
      );
      addNotification({
        type: "success",
        message: t("messages.adminRequest.declineSuccess"),
      });
      return;
    }
    const serverMessage = await getErrorMessage(response);
    if (serverMessage) {
      console.warn("Failed to decline admin request:", serverMessage);
    }
    addNotification({
      type: "error",
      message: t("messages.adminRequest.declineError"),
    });
  } catch (error) {
    if (isServerNotReadyError(error)) {
      return;
    }
    addNotification({
      type: "error",
      message: t("messages.adminRequest.declineError"),
    });
    console.error(
      `Error declining admin request for ${adminRequest.email}:`,
      error,
    );
  } finally {
    setLoading(false);
  }
};

export { handleDeclineAdminRequest };
