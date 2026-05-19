const currentUrl = import.meta.env.VITE_BACKEND_URL;
import { getCsrfToken } from "../../utils/getCsrfToken";

async function handleSignUpSubmit(
  event,
  setLoading,
  inputFields,
  addNotification,
  navigate,
  t,
) {
  try {
    setLoading(true);
    event.preventDefault();

    const csrfToken = await getCsrfToken();

    if (!csrfToken) {
      addNotification({
        type: "error",
        message: t("messages.csrfTokenFailed"),
      });
      return;
    }

    const response = await fetch(`${currentUrl}/auth/signup`, {
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
        "confirm-password": inputFields["confirm-password"],
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      addNotification({
        type: "error",
        message:
          result?.error?.message ||
          result?.error ||
          t("messages.auth.registrationFailed"),
      });
      return;
    }
    addNotification({
      type: "success",
      message: result.message,
    });
    navigate("/login");
  } catch (err) {
    addNotification({
      type: "error",
      message: t("messages.auth.registrationError"),
    });
    console.error("Error during registration:", err);
  } finally {
    setLoading(false);
  }
}

export { handleSignUpSubmit };
