import type { TFunction } from "../../types/i18n";
import type { FacultySearchResult } from "../../schemas/university";

function FacultyResult({
  faculty,
  t,
}: {
  faculty: FacultySearchResult;
  t: TFunction;
}) {
  return (
    <li className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-800">
      <p className="font-bold text-gray-900 dark:text-white">{faculty.name}</p>
      {faculty.city && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          {t("universitiesPage.city")}: {faculty.city}
        </p>
      )}
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        {faculty.university.name}
        {faculty.university.acronym && ` (${faculty.university.acronym})`}
      </p>
    </li>
  );
}

export { FacultyResult };
