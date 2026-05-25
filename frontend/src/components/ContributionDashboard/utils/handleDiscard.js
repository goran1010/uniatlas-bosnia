const currentUrl = import.meta.env.VITE_BACKEND_URL;
import { getCsrfToken } from "../../utils/getCsrfToken";
import { guardedFetch } from "../../../utils/guardedFetch";

async function handleDiscard(
  change,
  userData,
  addNotification,
  setPendingChanges,
  setLoading,
  t,
  serverStatus,
) {
  try {
    setLoading(true);
    const id = change.id;

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
      `${currentUrl}/users/contribution/pending-changes/postal-codes`,
      {
        mode: "cors",
        method: "DELETE",
        credentials: "include",
        headers: {
          "x-csrf-token": csrfToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      },
      { serverStatus, addNotification, t },
    );

    if (!response) {
      return;
    }
    const result = await response.json();

    if (response.ok) {
      setPendingChanges((prev) => prev.filter((change) => change.id !== id));
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

export { handleDiscard };
