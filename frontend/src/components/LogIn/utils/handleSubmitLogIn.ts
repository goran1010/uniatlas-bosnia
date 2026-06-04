const currentUrl = import.meta.env.VITE_BACKEND_URL;
import { getCsrfToken, clearCsrfToken } from "../../utils/getCsrfToken";
import { guardedFetch } from "../../utils/guardedFetch";

async function handleSubmitLogIn(
  e,
  inputFields,
  setUserData,
  addNotification,
  setLoading,
  navigate,
  t,
  serverStatus,
) {
  try {
    setLoading(true);
    e.preventDefault();

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
      `${currentUrl}/auth/login`,
      {
        mode: "cors",
        method: "POST",
        credentials: "include",
        headers: {
          "x-csrf-token": csrfToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: inputFields.email,
          password: inputFields.password,
        }),
      },
      { serverStatus, addNotification, t },
    );

    if (!response) {
      return;
    }

    const result = await response.json();
    if (!response.ok) {
      addNotification({
        type: "error",
        message:
          result?.error?.message ||
          result?.error ||
          t("messages.auth.loginFailed"),
      });
      return;
    }
    addNotification({
      type: "success",
      message: result.message,
    });
    setUserData(result.data);

    clearCsrfToken();
    navigate("/");
  } catch (err) {
    addNotification({
      type: "error",
      message: t("messages.auth.loginError"),
    });
    console.error(err);
  } finally {
    setLoading(false);
  }
}

export { handleSubmitLogIn };
