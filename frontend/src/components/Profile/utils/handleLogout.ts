import { BACKEND_URL } from "../../../utils/envConfig";
import {
  actionSuccessResponseSchema,
  readErrorMessage,
} from "../../../schemas/api";
import { getCsrfToken, clearCsrfToken } from "../../utils/getCsrfToken";
import { guardedFetch } from "../../../utils/guardedFetch";
import { isServerNotReadyError } from "../../../utils/serverStatus";

import type { AddNotification } from "../../../types/notification";
import type { UserData } from "../../../types/auth";
import type { TFunction } from "../../../types/i18n";
import type { ServerStatus } from "../../../utils/serverStatus";
import type { NavigateFunction } from "react-router-dom";

type HandleLogout = (
  addNotification: AddNotification,
  navigate: NavigateFunction,
  setUserData: (data: UserData) => void,
  setLoading: (loading: boolean) => void,
  t: TFunction,
  serverStatus: ServerStatus,
) => Promise<void>;

const handleLogout: HandleLogout = async function (
  addNotification,
  navigate,
  setUserData,
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
      `${BACKEND_URL}/users/logout`,
      {
        mode: "cors",
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
      },
      { serverStatus },
    );

    if (response.ok) {
      actionSuccessResponseSchema.parse(await response.json());
      addNotification({
        type: "success",
        message: t("messages.auth.logoutSuccess"),
      });
      setUserData(null);
      clearCsrfToken();
      void navigate("/");
      return;
    }
    const serverMessage = readErrorMessage(await response.json());
    if (serverMessage) {
      console.warn("Logout request failed:", serverMessage);
    }
    addNotification({
      type: "error",
      message: t("messages.auth.logoutFailed"),
    });
  } catch (err) {
    if (isServerNotReadyError(err)) {
      return;
    }
    addNotification({
      type: "error",
      message: t("messages.auth.logoutError"),
    });
    console.error("Error logging out:", err);
  } finally {
    setLoading(false);
  }
};

export { handleLogout };
