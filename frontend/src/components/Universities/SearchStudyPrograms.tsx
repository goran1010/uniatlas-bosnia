import { useState, useContext, useRef, type SubmitEvent } from "react";
import { RootContext } from "../../contextData/RootContext";
import { Input } from "../sharedComponents/Input";
import { Button } from "../sharedComponents/Button";
import { Spinner } from "../../utils/Spinner";

import type { Faculty, StudyProgram } from "./GetAllUniversities";
import type { TFunction } from "../../customHooks/useLanguage";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function StudyProgramResult({
  program,
  t,
}: {
  program: StudyWithFacultyResult;
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
        {program.faculty?.name}
        {program.faculty?.university && (
          <span className="text-gray-400 dark:text-gray-500">
            {" — "}
            {program.faculty.university.name}
            {program.faculty.university.acronym &&
              ` (${program.faculty.university.acronym})`}
          </span>
        )}
      </p>
    </li>
  );
}

interface StudyWithFacultyResult extends StudyProgram {
  faculty: Faculty;
}

function SearchStudyPrograms() {
  const { t, addNotification } = useContext(RootContext);
  const [results, setResults] = useState<StudyWithFacultyResult[]>([]);
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
        `${BACKEND_URL}/api/v1/study-programs/search?searchTerm=${term}`,
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
          placeholder={t("universitiesPage.studyProgramsPlaceholder")}
          minLength={2}
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
