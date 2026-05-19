const currentUrl = import.meta.env.VITE_BACKEND_URL;
import { getCsrfToken } from "../../utils/getCsrfToken";

async function handleEdit(
  e,
  addNotification,
  setLoading,
  setPendingChanges,
  userData,
  t,
) {
  try {
    e.preventDefault();
    setLoading(true);
    const code = e.target.children[0].children[1].textContent;
    const city = e.target[0].value;
    const post = e.target[1].value;

    const csrfToken = await getCsrfToken();

    if (!csrfToken) {
      addNotification({
        type: "error",
        message: t("messages.csrfTokenFailed"),
      });
      return;
    }

    const response = await fetch(
      `${currentUrl}/users/contribution/postal-codes`,
      {
        mode: "cors",
        method: "put",
        credentials: "include",
        headers: {
          "x-csrf-token": csrfToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ city, code, post }),
      },
    );
    const result = await response.json();
    const { data } = result;

    if (response.ok) {
      setPendingChanges((prev) => [
        ...prev,
        {
          id: data.id,
          typeOfChange: data.typeOfChange,
          code: data.code,
          city: data.city,
          post: data.post,
          user: { email: userData.email },
        },
      ]);
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
        t("messages.postal.updateFailed"),
    });
  } catch (err) {
    addNotification({
      type: "error",
      message: t("messages.postal.updateError"),
    });
    console.error("Error updating postal code:", err);
  } finally {
    setLoading(false);
  }
}

export { handleEdit };
