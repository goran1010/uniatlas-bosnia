import { SERVER_URL } from "../../../utils/envConfig";
import {
  actionSuccessResponseSchema,
  readErrorMessage,
} from "../../../schemas/api";
import { requestAdminResponseSchema } from "../../../schemas/adminRequest";
import { getCsrfToken } from "../../utils/getCsrfToken";
import { guardedFetch } from "../../../utils/guardedFetch";
import { isServerNotReadyError } from "../../../utils/serverStatus";

import type { UserData } from "../../../types/auth";
import type { TFunction } from "../../../types/i18n";
import type { Notification } from "../../../types/notification";
import type { ServerStatus } from "../../../utils/serverStatus";
import type { Dispatch, SetStateAction } from "react";

type HandleAdminRequest = (
  setUserData: Dispatch<SetStateAction<UserData>>,
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

const handleRequestAdmin: HandleAdminRequest = async function (
  setUserData,
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
      `${SERVER_URL}/users/request-admin`,
      {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        credentials: "include",
      },
      { serverStatus },
    );

    if (response.ok) {
      const result = requestAdminResponseSchema.parse(await response.json());
      setUserData(
        (prev) =>
          prev && { ...prev, adminRequestedAt: result.data.adminRequestedAt },
      );
      addNotification({
        type: "success",
        message: t("messages.adminRequest.requestSuccess"),
      });
      return;
    }
    const serverMessage = await getErrorMessage(response);
    if (serverMessage) {
      console.warn("Failed to request admin access:", serverMessage);
    }
    addNotification({
      type: "error",
      message: t("messages.adminRequest.requestError"),
    });
  } catch (error) {
    if (isServerNotReadyError(error)) {
      return;
    }
    addNotification({
      type: "error",
      message: t("messages.adminRequest.requestError"),
    });
    console.error("Error requesting admin access:", error);
  } finally {
    setLoading(false);
  }
};

const handleCancelAdminRequest: HandleAdminRequest = async function (
  setUserData,
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
      `${SERVER_URL}/users/request-admin`,
      {
        method: "DELETE",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        credentials: "include",
      },
      { serverStatus },
    );

    if (response.ok) {
      actionSuccessResponseSchema.parse(await response.json());
      setUserData((prev) => prev && { ...prev, adminRequestedAt: null });
      addNotification({
        type: "success",
        message: t("messages.adminRequest.cancelSuccess"),
      });
      return;
    }
    const serverMessage = await getErrorMessage(response);
    if (serverMessage) {
      console.warn("Failed to cancel admin request:", serverMessage);
    }
    addNotification({
      type: "error",
      message: t("messages.adminRequest.cancelError"),
    });
  } catch (error) {
    if (isServerNotReadyError(error)) {
      return;
    }
    addNotification({
      type: "error",
      message: t("messages.adminRequest.cancelError"),
    });
    console.error("Error cancelling admin request:", error);
  } finally {
    setLoading(false);
  }
};

export { handleRequestAdmin, handleCancelAdminRequest };
