import { useState, use } from "react";
import { RootContext } from "../../contextData/RootContext";
import { Button } from "../sharedComponents/Button";
import { Spinner } from "../../utils/Spinner";
import { BACKEND_URL } from "../../utils/envConfig";

import type { TFunction } from "../../customHooks/useLanguage";

import type {
  University,
  Faculty,
  StudyProgram,
  Subject,
} from "./GetAllUniversities";

function SubjectRow({ subject, t }: { subject: Subject; t: TFunction }) {
  return (
    <li className="flex flex-wrap gap-2 text-sm py-1 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <span className="font-medium flex-1">{subject.name}</span>
      <span className="flex gap-2 flex-wrap text-xs text-gray-500 dark:text-gray-400">
        {subject.semester != null && (
          <span>
            {t("universitiesPage.semester")} {subject.semester}
          </span>
        )}
        {subject.ects != null && (
          <span>
            {subject.ects} {t("universitiesPage.ects")}
          </span>
        )}
        {subject.type && (
          <span
            className={`px-1.5 py-0.5 rounded text-xs font-medium ${
              subject.type === "MANDATORY"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                : "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200"
            }`}
          >
            {t(`universitiesPage.subjectTypes.${subject.type}`)}
          </span>
        )}
      </span>
    </li>
  );
}

function StudyProgramRow({
  program,
  t,
}: {
  program: StudyProgram;
  t: TFunction;
}) {
  const [open, setOpen] = useState(false);
  return (
    <li className="text-sm">
      <button
        type="button"
        onClick={() => {
          setOpen((p) => !p);
        }}
        className="w-full text-left flex justify-between items-center gap-2 py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <span className="font-medium">{program.name}</span>
        <span className="flex gap-2 items-center text-xs text-gray-500 dark:text-gray-400 shrink-0">
          <span className="hidden sm:inline">
            {t(`universitiesPage.cycles.${program.cycle}`)}
          </span>
          {program.ects != null && (
            <span>
              {program.ects} {t("universitiesPage.ects")}
            </span>
          )}
          <span>{open ? "▲" : "▼"}</span>
        </span>
      </button>
      {open && program.subjects.length > 0 && (
        <ul className="ml-4 mt-1 mb-2 border-l-2 border-gray-200 dark:border-gray-600 pl-3">
          {program.subjects.map((s) => (
            <SubjectRow key={s.id} subject={s} t={t} />
          ))}
        </ul>
      )}
    </li>
  );
}

function FacultyRow({ faculty, t }: { faculty: Faculty; t: TFunction }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="text-sm">
      <button
        type="button"
        onClick={() => {
          setOpen((p) => !p);
        }}
        className="w-full text-left flex justify-between items-center gap-2 py-1.5 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-semibold"
      >
        <span>{faculty.name}</span>
        <span className="flex gap-2 items-center text-xs text-gray-500 dark:text-gray-400 shrink-0">
          {faculty.studyPrograms.length > 0 && (
            <span>
              {faculty.studyPrograms.length}{" "}
              {t("universitiesPage.studyPrograms")}
            </span>
          )}
          <span>{open ? "▲" : "▼"}</span>
        </span>
      </button>
      {open && faculty.studyPrograms.length > 0 && (
        <ul className="ml-4 mt-1 border-l-2 border-indigo-200 dark:border-indigo-700 pl-3 space-y-0.5">
          {faculty.studyPrograms.map((sp) => (
            <StudyProgramRow key={sp.id} program={sp} t={t} />
          ))}
        </ul>
      )}
    </li>
  );
}

function UniversityCard({ university }: { university: University }) {
  const { t, addNotification } = use(RootContext);
  const [expanded, setExpanded] = useState(false);
  const [detailData, setDetailData] = useState<University>();
  const [loadingDetail, setLoadingDetail] = useState(false);

  async function handleExpand() {
    if (expanded) {
      setExpanded(false);
      return;
    }
    if (detailData) {
      setExpanded(true);
      return;
    }
    try {
      setLoadingDetail(true);
      const res = await fetch(
        `${BACKEND_URL}/api/v1/universities/${university.id}`,
        {
          method: "GET",
          mode: "cors",
        },
      );
      const result = await res.json();
      if (res.ok) {
        setDetailData(result.data);
        setExpanded(true);
      } else {
        addNotification({
          type: "error",
          message: result?.error?.message || "Failed to load details.",
        });
      }
    } catch {
      addNotification({
        type: "error",
        message: "Failed to load university details.",
      });
    } finally {
      setLoadingDetail(false);
    }
  }

  const entityLabel = t(`universitiesPage.entities.${university.entity}`);

  return (
    <li className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
      <div className="p-3 sm:p-4">
        <div className="flex flex-wrap justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base text-gray-900 dark:text-white leading-snug">
              {university.name}
              {university.acronym && (
                <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                  ({university.acronym})
                </span>
              )}
            </h3>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-sm text-gray-600 dark:text-gray-300">
              <span>📍 {university.city}</span>
              <span>{entityLabel}</span>
              <span
                className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                  university.ownership === "JAVNA"
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                {university.ownership === "JAVNA"
                  ? t(`universitiesPage.ownership.JAVNA`)
                  : t(`universitiesPage.ownership.PRIVATNA`)}
              </span>
              {university.foundedYear && (
                <span>
                  {t("universitiesPage.foundedYear")}: {university.foundedYear}
                </span>
              )}
            </div>
            {university.website && (
              <a
                href={university.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1 inline-block truncate max-w-xs"
              >
                {university.website}
              </a>
            )}
          </div>
          <Button
            variant="secondary"
            className="px-3 py-1.5 text-xs shrink-0 max-w-36"
            onClick={handleExpand}
            loading={loadingDetail}
          >
            {expanded
              ? t("universitiesPage.hideDetails")
              : t("universitiesPage.viewDetails")}
          </Button>
        </div>

        {expanded && detailData && (
          <div className="mt-3 border-t border-gray-200 dark:border-gray-600 pt-3">
            {detailData.faculties.length > 0 ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                  {detailData.faculties.length}{" "}
                  {t("universitiesPage.faculties")}
                </p>
                <ul className="space-y-1">
                  {detailData.faculties.map((f) => (
                    <FacultyRow key={f.id} faculty={f} t={t} />
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                {t("universitiesPage.faculties")}: —
              </p>
            )}
          </div>
        )}
        {loadingDetail && <Spinner />}
      </div>
    </li>
  );
}

export { UniversityCard };
