import { useContext } from "react";
import { LanguageContext } from "../../contextData/LanguageContext";

function PostalCodesResult({ searchResult }) {
  const { t } = useContext(LanguageContext);

  if (!searchResult || searchResult.length === 0) {
    return (
      <section className="flex justify-center items-center p-4">
        <p className="text-gray-500 dark:text-gray-300">
          {t("postal.results.none")}
        </p>
      </section>
    );
  }
  return (
    <section className="flex flex-col items-center px-2 w-full">
      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400 self-start md:self-center">
        {searchResult.length}{" "}
        {searchResult.length === 1
          ? t("postal.results.resultOne")
          : t("postal.results.resultOther")}
      </p>
      <ul className="w-full max-w-3xl max-h-128 overflow-y-auto rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm divide-y divide-gray-200 dark:divide-gray-600">
        <li className="hidden md:grid grid-cols-3 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 sticky top-0">
          <span>{t("postal.results.code")}</span>
          <span>{t("postal.results.city")}</span>
          <span>{t("postal.results.post")}</span>
        </li>
        {searchResult.map((result, index) => {
          const rowBgEveryOther =
            index % 2 === 0
              ? "bg-white-100 dark:bg-gray-800"
              : "bg-gray-100 dark:bg-gray-600";
          return (
            <li
              key={result.code}
              className={`${rowBgEveryOther} flex flex-col gap-1 px-4 py-3 md:grid md:grid-cols-3 md:items-center md:gap-0 md:py-2.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/60`}
            >
              <div className="flex justify-between md:block">
                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase md:hidden">
                  {t("postal.results.code")}
                </span>
                <span className="font-mono font-medium text-gray-800 dark:text-gray-100">
                  {result.code}
                </span>
              </div>
              <div className="flex justify-between md:block">
                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase md:hidden">
                  {t("postal.results.city")}
                </span>
                <span className="text-gray-700 dark:text-gray-200">
                  {result.city}
                </span>
              </div>
              <div className="flex justify-between md:block">
                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase md:hidden">
                  {t("postal.results.post")}
                </span>
                <span className="text-gray-600 dark:text-gray-300">
                  {result.post}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export { PostalCodesResult };
