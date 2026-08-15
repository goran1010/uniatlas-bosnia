import { useState, use, useRef, type SubmitEvent } from "react";
import { RootContext } from "../../contextData/RootContext";
import { Input } from "../sharedComponents/Input";
import { Button } from "../sharedComponents/Button";
import { Spinner } from "../../utils/Spinner";
import { UniversityCard } from "./UniversityCard";
import { StudyProgramResult } from "./StudyProgramResult";
import { searchStudyPrograms, searchUniversities } from "./utils/search";
import { searchTermSchema } from "../../schemas/domain";

import type {
  StudyProgramSearchResult,
  UniversityListItem,
} from "../../schemas/university";

interface SearchResults {
  universities: UniversityListItem[];
  studyPrograms: StudyProgramSearchResult[];
}

function UnifiedSearch() {
  const { t, addNotification } = use(RootContext);
  const [results, setResults] = useState<SearchResults | null>(null);
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
    setLoading(true);
    const [universities, studyPrograms] = await Promise.allSettled([
      searchUniversities(term),
      searchStudyPrograms(term),
    ]);
    if (
      universities.status === "rejected" ||
      studyPrograms.status === "rejected"
    ) {
      addNotification({
        type: "error",
        message: t("messages.universities.searchError"),
      });
    }
    setResults({
      universities:
        universities.status === "fulfilled" ? universities.value : [],
      studyPrograms:
        studyPrograms.status === "fulfilled" ? studyPrograms.value : [],
    });
    setLoading(false);
  }

  const noResultsAtAll =
    results !== null &&
    results.universities.length === 0 &&
    results.studyPrograms.length === 0;

  return (
    <div className="flex flex-col gap-4 w-full items-center justify-center">
      <form
        onSubmit={(e) => void handleSearch(e)}
        className="flex gap-2 w-full max-w-lg"
      >
        <Input
          ref={inputRef}
          type="search"
          placeholder={t("universitiesPage.searchAllPlaceholder")}
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
        results !== null &&
        (noResultsAtAll ? (
          <p className="text-gray-500 dark:text-gray-400">
            {t("universitiesPage.noResultsAtAll")}
          </p>
        ) : (
          <>
            <section className="w-full flex flex-col gap-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("universitiesPage.universitiesSection")}
              </h2>
              {results.universities.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">
                  {t("universitiesPage.noResults")}
                </p>
              ) : (
                <ul className="flex flex-col gap-3 w-full">
                  {results.universities.map((u) => (
                    <UniversityCard key={u.id} university={u} />
                  ))}
                </ul>
              )}
            </section>
            <section className="w-full flex flex-col gap-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("universitiesPage.studyProgramsSection")}
              </h2>
              {results.studyPrograms.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">
                  {t("universitiesPage.noStudyProgramResults")}
                </p>
              ) : (
                <ul className="flex flex-col gap-2 w-full">
                  {results.studyPrograms.map((p) => (
                    <StudyProgramResult key={p.id} program={p} t={t} />
                  ))}
                </ul>
              )}
            </section>
          </>
        ))
      )}
    </div>
  );
}

export { UnifiedSearch };
