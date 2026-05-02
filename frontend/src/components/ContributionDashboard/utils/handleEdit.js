const currentUrl = import.meta.env.VITE_BACKEND_URL;
import { getCsrfToken } from "../../utils/getCsrfToken";

async function handleEdit(e, setSearchResult, addNotification, setLoading) {
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
        message: "Failed to retrieve CSRF token.",
      });
      return;
    }

    const response = await fetch(
      `${currentUrl}/users/contributor/postal-codes`,
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

    if (response.ok) {
      setSearchResult((prevState) => {
        return prevState.map((item) =>
          item.code === result.data.code ? result.data : item,
        );
      });
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
        "Failed to update postal code.",
    });
  } catch (err) {
    addNotification({
      type: "error",
      message: "An error occurred while updating the postal code.",
    });
    console.error("Error updating postal code:", err);
  } finally {
    setLoading(false);
  }
}

export { handleEdit };
