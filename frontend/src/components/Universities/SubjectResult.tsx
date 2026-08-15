import type { TFunction } from "../../types/i18n";
import type { SubjectSearchResult } from "../../schemas/university";

function SubjectResult({
  subject,
  t,
}: {
  subject: SubjectSearchResult;
  t: TFunction;
}) {
  return (
    <li className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-800">
      <p className="font-bold text-gray-900 dark:text-white">{subject.name}</p>
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-sm text-gray-600 dark:text-gray-300">
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
          <span>{t(`universitiesPage.subjectTypes.${subject.type}`)}</span>
        )}
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        {subject.studyProgram.name}
        <span className="text-gray-400 dark:text-gray-500">
          {" — "}
          {subject.studyProgram.faculty.name}
          {", "}
          {subject.studyProgram.faculty.university.name}
          {subject.studyProgram.faculty.university.acronym &&
            ` (${subject.studyProgram.faculty.university.acronym})`}
        </span>
      </p>
    </li>
  );
}

export { SubjectResult };
