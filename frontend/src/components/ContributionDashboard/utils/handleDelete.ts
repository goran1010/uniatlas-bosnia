const currentUrl = import.meta.env.VITE_BACKEND_URL;
import { getCsrfToken } from "../../utils/getCsrfToken";
import { guardedFetch } from "../../utils/guardedFetch";

async function handleDelete(
  e,
  addNotification,
  setLoading,
  setPendingChanges,
  userData,
  t,
  serverStatus,
) {
  try {
    e.preventDefault();
    setLoading(true);
    const code = e.currentTarget.dataset.postalcode;
    const city = e.currentTarget.dataset.city;
    const post = e.currentTarget.dataset.post;

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
      `${currentUrl}/users/contribution/universities`,
      {
        mode: "cors",
        method: "DELETE",
        credentials: "include",
        headers: {
          "x-csrf-token": csrfToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, city, post }),
      },
      { serverStatus, addNotification, t },
    );

    if (!response) {
      return;
    }
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
        t("messages.postal.deleteFailed"),
    });
  } catch (err) {
    addNotification({
      type: "error",
      message: t("messages.postal.deleteError"),
    });
    console.error("Error deleting postal code:", err);
  } finally {
    setLoading(false);
  }
}

export { handleDelete };
