import { useEffect, useState, useContext } from "react";
import { RootContext } from "../../contextData/RootContext";
import { Spinner } from "../../utils/Spinner";
import { UniversityCard } from "./UniversityCard";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function GetAllUniversities() {
  const { t, addNotification } = useContext(RootContext);
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUniversities() {
      try {
        setLoading(true);
        const res = await fetch(`${BACKEND_URL}/api/v1/universities`, {
          method: "GET",
          mode: "cors",
        });
        const result = await res.json();
        if (res.ok) {
          setUniversities(result.data);
        } else {
          addNotification({
            type: "error",
            message: result?.error?.message || "Failed to load universities.",
          });
        }
      } catch {
        addNotification({
          type: "error",
          message: "Failed to load universities.",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchUniversities();
  }, [addNotification]);

  if (loading) return <Spinner />;

  if (!universities.length) {
    return (
      <p className="text-center text-gray-500 dark:text-gray-400 py-8">
        {t("universitiesPage.noResults")}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3 w-full">
      {universities.map((u) => (
        <UniversityCard key={u.id} university={u} />
      ))}
    </ul>
  );
}

export { GetAllUniversities };
