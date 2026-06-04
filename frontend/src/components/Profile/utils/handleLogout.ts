const currentURL = import.meta.env.VITE_BACKEND_URL;
import { getCsrfToken, clearCsrfToken } from "../../utils/getCsrfToken";
import { guardedFetch } from "../../../utils/guardedFetch";

async function handleLogout(
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
      `${currentURL}/users/logout`,
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

    if (!response) {
      return;
    }
    const result = await response.json();
    if (response.ok) {
      addNotification({
        type: "success",
        message: result.message,
      });
      navigate("/");
      setUserData(null);

      clearCsrfToken();
      return;
    }

    addNotification({
      type: "error",
      message:
        result?.error?.message ||
        result?.error ||
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
}

export { handleLogout };
