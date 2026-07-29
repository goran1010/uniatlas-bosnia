import { useState, use, useRef, type SubmitEvent } from "react";
import { RootContext } from "../../contextData/RootContext";
import { Input } from "../sharedComponents/Input";
import { Button } from "../sharedComponents/Button";
import { Spinner } from "../../utils/Spinner";
import { UniversityCard } from "./UniversityCard";
import { BACKEND_URL } from "../../utils/envConfig";
import { readErrorMessage } from "../../schemas/api";
import { universityListResponseSchema } from "../../schemas/university";
import { searchTermSchema } from "../../schemas/domain";

import type { UniversityListItem } from "../../schemas/university";

function SearchUniversities() {
  const { t, addNotification } = use(RootContext);
  const [results, setResults] = useState<UniversityListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSearch(e: SubmitEvent) {
    e.preventDefault();
    const searchTerm = searchTermSchema.safeParse(
      inputRef.current?.value ?? "",
    );
    if (!searchTerm.success) {
      addNotification({
        type: "error",
        message: t(
          searchTerm.error.issues[0]?.message ?? "validation.search.minLength",
        ),
      });
      return;
    }
    const term = searchTerm.data;
    try {
      setLoading(true);
      const res = await fetch(
        `${BACKEND_URL}/api/v1/universities/search?searchTerm=${encodeURIComponent(term)}`,
        { method: "GET", mode: "cors" },
      );

      if (res.ok) {
        const result = universityListResponseSchema.parse(await res.json());
        setResults(result.data);
      } else if (res.status === 404) {
        setResults([]);
      } else {
        const serverMessage = readErrorMessage(await res.json());
        if (serverMessage) {
          console.warn("University search failed:", serverMessage);
        }
        addNotification({
          type: "error",
          message: t("messages.universities.searchError"),
        });
      }
    } catch {
      addNotification({
        type: "error",
        message: t("messages.universities.searchError"),
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-4 w-full items-center justify-center">
      <form
        onSubmit={(e) => void handleSearch(e)}
        className="flex gap-2 w-full max-w-lg"
      >
        <Input
          ref={inputRef}
          type="search"
          placeholder={t("universitiesPage.searchPlaceholder")}
          minLength={2}
          maxLength={100}
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
