import { useContext } from "react";
import { NotificationContext } from "../../contextData/NotificationContext";
import { Spinner } from "../../utils/Spinner";
import { Button } from "../sharedComponents/Button";

const currentURL = import.meta.env.VITE_BACKEND_URL;

function GetAllPostalCodes({ setSearchResult, loading, setLoading }) {
  const { addNotification } = useContext(NotificationContext);

  async function handleGetAll(e) {
    try {
      setLoading(true);
      e.preventDefault();

      const response = await fetch(`${currentURL}/api/v1/postal-codes`, {
        mode: "cors",
      });
      const result = await response.json();

      if (!response.ok) {
        addNotification({
          type: "error",
          message:
            result?.error?.message ||
            result?.error ||
            "Failed to load postal codes.",
        });
        return;
      }
      addNotification({
        type: "success",
        message: result.message,
      });
      setSearchResult(result.data);
    } catch (err) {
      addNotification({
        type: "error",
        message:
          "An error occurred while fetching postal codes and municipalities.",
      });
      console.error("Error fetching postal codes and municipalities:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleGetAll} className="w-full">
      <Button type="submit" loading={loading} variant="warning">
        Get All
      </Button>
    </form>
  );
}

export { GetAllPostalCodes };
