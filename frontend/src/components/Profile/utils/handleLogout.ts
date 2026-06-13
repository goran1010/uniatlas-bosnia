import { BACKEND_URL } from "../../../utils/envConfig";
import { getCsrfToken, clearCsrfToken } from "../../utils/getCsrfToken";
import { guardedFetch } from "../../../utils/guardedFetch";

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

interface StatusSuccessResponse {
  message: string;
}

interface StatusErrorResponse {
  error: {
    message: string;
  };
}

async function parseJson<T>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
}

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
      { serverStatus, addNotification, t },
    );

    if (response.ok) {
      const result = await parseJson<StatusSuccessResponse>(response);
      addNotification({
        type: "success",
        message: result.message,
      });
      setUserData(null);
      clearCsrfToken();
      void navigate("/");
      return;
    }
    const result = await parseJson<StatusErrorResponse>(response);
    addNotification({
      type: "error",
      message: result.error.message,
    });
  } catch (err) {
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
