import { useState, useContext, useRef, type SubmitEvent } from "react";
import { RootContext } from "../../contextData/RootContext";
import { Input } from "../sharedComponents/Input";
import { Button } from "../sharedComponents/Button";
import { Spinner } from "../../utils/Spinner";
import { UniversityCard } from "./UniversityCard";

import type { University } from "./GetAllUniversities";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function SearchUniversities() {
  const { t, addNotification } = useContext(RootContext);
  const [results, setResults] = useState<University[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSearch(e: SubmitEvent) {
    e.preventDefault();
    const term = inputRef.current?.value?.trim();
    if (!term || term.length < 2) {
      addNotification({
        type: "error",
        message: t("validation.search.minLength"),
      });
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(
        `${BACKEND_URL}/api/v1/universities/search?searchTerm=${encodeURIComponent(term)}`,
        { method: "GET", mode: "cors" },
      );
      const result = await res.json();
      if (res.ok) {
        setResults(result.data);
      } else if (res.status === 404) {
        setResults([]);
      } else {
        addNotification({
          type: "error",
          message: result?.error?.message || "Search failed.",
        });
      }
    } catch {
      addNotification({ type: "error", message: "Search failed." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-4 w-full items-center justify-center">
      <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-lg">
        <Input
          ref={inputRef}
          type="search"
          placeholder={t("universitiesPage.searchPlaceholder")}
          minLength={2}
          className="flex-1"
          aria-label={t("universitiesPage.search")}
        />
        <Button type="submit" loading={loading} className="max-w-28">
          {t("universitiesPage.search")}
        </Button>
      </form>

      {loading ? (
        <Spinner />
      ) : (
        <>
          {results.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              {t("universitiesPage.noResults")}
            </p>
          ) : (
            <ul className="flex flex-col gap-3 w-full">
              {results.map((u) => (
                <UniversityCard key={u.id} university={u} />
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

export { SearchUniversities };
