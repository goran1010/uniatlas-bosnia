import {
  useState,
  use,
  useEffect,
  useRef,
  type ReactNode,
  type SubmitEvent,
} from "react";
import { RootContext } from "../../contextData/RootContext";
import { Input } from "../sharedComponents/Input";
import { Button } from "../sharedComponents/Button";
import { Spinner } from "../../utils/Spinner";
import { UniversityCard } from "./UniversityCard";
import { FacultyResult } from "./FacultyResult";
import { StudyProgramResult } from "./StudyProgramResult";
import { SubjectResult } from "./SubjectResult";
import { searchAll } from "./utils/search";
import { searchTermSchema } from "../../schemas/domain";

import type { UnifiedSearchResults } from "../../schemas/university";

function ResultSection({
  heading,
  emptyMessage,
  isEmpty,
  children,
}: {
  heading: string;
  emptyMessage: string;
  isEmpty: boolean;
  children: ReactNode;
}) {
  return (
    <section className="w-full flex flex-col gap-2">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        {heading}
      </h2>
      {isEmpty ? (
        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      ) : (
        children
      )}
    </section>
  );
}

function UnifiedSearch() {
  const { t, addNotification } = use(RootContext);
  const [results, setResults] = useState<UnifiedSearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the search input only on devices with a precise pointer
  // (mouse/trackpad) so mobile users don't get the keyboard popping up.
  useEffect(() => {
    if (window.matchMedia("(pointer: fine)").matches) {
      inputRef.current?.focus();
    }
  }, []);

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
      setResults(await searchAll(term));
    } catch {
      addNotification({
        type: "error",
        message: t("messages.universities.searchError"),
      });
    } finally {
      setLoading(false);
    }
  }

  const noResultsAtAll =
    results !== null &&
    results.universities.length === 0 &&
    results.faculties.length === 0 &&
    results.studyPrograms.length === 0 &&
    results.subjects.length === 0;

  return (
    <div className="flex flex-col gap-4 w-full items-center justify-center">
      <p className="text-sm text-center text-gray-600 dark:text-gray-300 max-w-lg">
        {t("universitiesPage.searchHint")}
      </p>
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
            <ResultSection
              heading={t("universitiesPage.universitiesSection")}
              emptyMessage={t("universitiesPage.noResults")}
              isEmpty={results.universities.length === 0}
            >
              <ul className="flex flex-col gap-3 w-full">
                {results.universities.map((u) => (
                  <UniversityCard key={u.id} university={u} />
                ))}
              </ul>
            </ResultSection>
            <ResultSection
              heading={t("universitiesPage.facultiesSection")}
              emptyMessage={t("universitiesPage.noFacultyResults")}
              isEmpty={results.faculties.length === 0}
            >
              <ul className="flex flex-col gap-2 w-full">
                {results.faculties.map((f) => (
                  <FacultyResult key={f.id} faculty={f} t={t} />
                ))}
              </ul>
            </ResultSection>
            <ResultSection
              heading={t("universitiesPage.studyProgramsSection")}
              emptyMessage={t("universitiesPage.noStudyProgramResults")}
              isEmpty={results.studyPrograms.length === 0}
            >
              <ul className="flex flex-col gap-2 w-full">
                {results.studyPrograms.map((p) => (
                  <StudyProgramResult key={p.id} program={p} t={t} />
                ))}
              </ul>
            </ResultSection>
            <ResultSection
              heading={t("universitiesPage.subjectsSection")}
              emptyMessage={t("universitiesPage.noSubjectResults")}
              isEmpty={results.subjects.length === 0}
            >
              <ul className="flex flex-col gap-2 w-full">
                {results.subjects.map((s) => (
                  <SubjectResult key={s.id} subject={s} t={t} />
                ))}
              </ul>
            </ResultSection>
          </>
        ))
      )}
    </div>
  );
}

export { UnifiedSearch };
