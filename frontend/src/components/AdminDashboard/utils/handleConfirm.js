const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
import { getCsrfToken } from "../../utils/getCsrfToken";

async function handleConfirm(
  change,
  setPendingChanges,
  addNotification,
  setLoading,
  t,
) {
  try {
    setLoading(true);
    const csrfToken = await getCsrfToken();

    if (!csrfToken) {
      addNotification({
        type: "error",
        message: t("messages.csrfTokenFailed"),
      });
      return;
    }

    const response = await fetch(
      `${BACKEND_URL}/users/admin/approve-pending-change`,
      {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        body: JSON.stringify({
          id: change.id,
          typeOfChange: change.typeOfChange,
        }),
        credentials: "include",
      },
    );
    const result = await response.json();

    if (response.ok) {
      setPendingChanges((prev) =>
        prev.filter((request) => request.id !== change.id),
      );
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
        t("messages.admin.approveFailed"),
    });
  } catch (error) {
    addNotification({
      type: "error",
      message: t("messages.admin.approveError", { email: change.user.email }),
    });
    console.error(
      `Error approving pending change for ${change.user.email}:`,
      error,
    );
  } finally {
    setLoading(false);
  }
}

export { handleConfirm };
