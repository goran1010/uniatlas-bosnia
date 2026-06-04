const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
import { getCsrfToken } from "../../utils/getCsrfToken";
import { guardedFetch } from "../../utils/guardedFetch";

async function handleDiscardUniversityChange({
  changeId,
  setPendingChanges,
  addNotification,
  setLoading,
  t,
  serverStatus,
}) {
  try {
    setLoading(true);
    const csrfToken = await getCsrfToken({ serverStatus, addNotification, t });

    if (!csrfToken) {
      addNotification({
        type: "error",
        message: t("messages.csrfTokenFailed"),
      });
      return;
    }

    const response = await guardedFetch(
      `${BACKEND_URL}/users/contribution/pending-changes/universities`,
      {
        method: "DELETE",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        body: JSON.stringify({ id: changeId }),
        credentials: "include",
      },
      { serverStatus, addNotification, t },
    );

    if (!response) return;

    const result = await response.json();

    if (response.ok) {
      setPendingChanges((prev) => prev.filter((c) => c.id !== changeId));
      addNotification({ type: "success", message: result.message });
      return;
    }
    addNotification({
      type: "error",
      message:
        result?.error?.message ||
        result?.error ||
        t("messages.universities.deleteFailed"),
    });
  } catch (err) {
    addNotification({
      type: "error",
      message: t("messages.universities.deleteError"),
    });
    console.error("Error discarding pending change:", err);
  } finally {
    setLoading(false);
  }
}

export { handleDiscardUniversityChange };
