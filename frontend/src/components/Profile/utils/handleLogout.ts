import { BACKEND_URL } from "../../../utils/envConfig";
import { getCsrfToken, clearCsrfToken } from "../../utils/getCsrfToken";
import { guardedFetch } from "../../../utils/guardedFetch";

import type { AddNotification } from "../../../customHooks/useNotification";
import type { UserData } from "../../../customHooks/useStatusCheck";
import type { TFunction } from "../../../customHooks/useLanguage";
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
      { serverStatus, addNotification, t },
    );

    const result = await response.json();
    if (response.ok) {
      addNotification({
        type: "success",
        message: result.message,
      });
      setUserData(null);
      clearCsrfToken();
      void navigate("/");
      return;
    }

    addNotification({
      type: "error",
      message:
        result?.error?.message ??
        result?.error ??
        t("messages.auth.logoutFailed"),
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
