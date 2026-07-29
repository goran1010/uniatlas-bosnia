import { useState, use, useRef, type SubmitEvent } from "react";
import { RootContext } from "../../contextData/RootContext";
import { Input } from "../sharedComponents/Input";
import { Button } from "../sharedComponents/Button";
import { Spinner } from "../../utils/Spinner";
import { BACKEND_URL } from "../../utils/envConfig";
import { readErrorMessage } from "../../schemas/api";
import { studyProgramSearchResponseSchema } from "../../schemas/university";
import { searchTermSchema } from "../../schemas/domain";

import type { TFunction } from "../../types/i18n";
import type { StudyProgramSearchResult } from "../../schemas/university";

function StudyProgramResult({
  program,
  t,
}: {
  program: StudyProgramSearchResult;
  t: TFunction;
}) {
  return (
    <li className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-800">
      <p className="font-bold text-gray-900 dark:text-white">{program.name}</p>
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-sm text-gray-600 dark:text-gray-300">
        <span>{t(`universitiesPage.cycles.${program.cycle}`)}</span>
        {program.ects != null && (
          <span>
            {program.ects} {t("universitiesPage.ects")}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        {program.faculty.name}

        <span className="text-gray-400 dark:text-gray-500">
          {" — "}
          {program.faculty.university.name}
          {program.faculty.university.acronym &&
            ` (${program.faculty.university.acronym})`}
        </span>
      </p>
    </li>
  );
}

function SearchStudyPrograms() {
  const { t, addNotification } = use(RootContext);
  const [results, setResults] = useState<StudyProgramSearchResult[]>([]);
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
        `${BACKEND_URL}/api/v1/study-programs/search?searchTerm=${encodeURIComponent(term)}`,
        { method: "GET", mode: "cors" },
      );

      if (res.ok) {
        const result = studyProgramSearchResponseSchema.parse(await res.json());
        setResults(result.data);
      } else if (res.status === 404) {
        setResults([]);
      } else {
        const serverMessage = readErrorMessage(await res.json());
        if (serverMessage) {
          console.warn("Study program search failed:", serverMessage);
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
          placeholder={t("universitiesPage.studyProgramsPlaceholder")}
          minLength={2}
          maxLength={100}
          className="flex-1"
          aria-label={t("universitiesPage.findPrograms")}
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
              {t("universitiesPage.noStudyProgramResults")}
            </p>
          ) : (
            <ul className="flex flex-col gap-2 w-full">
              {results.map((p) => (
                <StudyProgramResult key={p.id} program={p} t={t} />
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

export { SearchStudyPrograms };
