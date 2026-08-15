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

export { StudyProgramResult };
