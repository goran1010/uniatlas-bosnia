const currentUrl = import.meta.env.VITE_BACKEND_URL;
import { getCsrfToken } from "../../utils/getCsrfToken";

async function handleDiscard(
  change,
  userData,
  addNotification,
  setPendingChanges,
  setLoading,
) {
  try {
    setLoading(true);
    const id = change.id;

    const csrfToken = await getCsrfToken();

    if (!csrfToken) {
      addNotification({
        type: "error",
        message: "Failed to retrieve CSRF token.",
      });
      return;
    }

    const response = await fetch(
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
    );
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
        "Failed to delete postal code.",
    });
  } catch (err) {
    addNotification({
      type: "error",
      message: "An error occurred while deleting the postal code.",
    });
    console.error("Error deleting postal code:", err);
  } finally {
    setLoading(false);
  }
}

export { handleDiscard };
