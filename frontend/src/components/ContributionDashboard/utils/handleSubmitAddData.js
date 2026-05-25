const currentUrl = import.meta.env.VITE_BACKEND_URL;
import { getCsrfToken } from "../../utils/getCsrfToken";
import { validateSubmitAddData } from "./validateSubmitAddData";
import { guardedFetch } from "../../../utils/guardedFetch";

async function handleSubmitAddData(
  e,
  input,
  setSearchResult,
  addNotification,
  setLoading,
  cityInput,
  codeInput,
  setPendingChanges,
  userData,
  t,
  serverStatus,
) {
  try {
    e.preventDefault();
    setLoading(true);
    const { city, code, post } = input;

    if (!validateSubmitAddData(cityInput, codeInput, t)) {
      return;
    }

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
      `${currentUrl}/users/contribution/postal-codes`,
      {
        mode: "cors",
        method: "post",
        credentials: "include",
        headers: {
          "x-csrf-token": csrfToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ city, code, post }),
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

      const newItem = result.data;

      setPendingChanges((prev) => [
        ...prev,
        {
          id: newItem.id,
          typeOfChange: newItem.typeOfChange,
          code: newItem.code,
          city: newItem.city,
          post: newItem.post,
          user: { email: userData.email },
        },
      ]);
      return;
    }

    addNotification({
      type: "error",
      message:
        result?.error?.message ||
        result?.error ||
        t("messages.postal.addFailed"),
    });
  } catch (err) {
    console.error("Error adding postal code:", err);
    addNotification({
      type: "error",
      message: t("messages.postal.addError"),
    });
  } finally {
    setLoading(false);
  }
}

export { handleSubmitAddData };
