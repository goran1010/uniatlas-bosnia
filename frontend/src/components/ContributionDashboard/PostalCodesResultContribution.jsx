import { useContext, useEffect, useState } from "react";
import { NotificationContext } from "../../contextData/NotificationContext";
import { PostalCodeRow } from "./PostalCodeRow";
import { Spinner } from "../../utils/Spinner";
import { LanguageContext } from "../../contextData/LanguageContext";

function PostalCodesResultContribution({
  searchResult,
  setPendingChanges,
  loading,
}) {
  const [inputValuesByCode, setInputValuesByCode] = useState(new Map());
  const { addNotification } = useContext(NotificationContext);
  const { t } = useContext(LanguageContext);

  useEffect(() => {
    const nextValuesByCode = new Map();
    searchResult.forEach((result) => {
      nextValuesByCode.set(result.code, result);
    });
    setInputValuesByCode(nextValuesByCode);
  }, [searchResult]);

  const handleInputChange = (code, name, value) => {
    setInputValuesByCode((prev) => {
      const newMap = new Map(prev);
      const current = newMap.get(code) || { code };
      newMap.set(code, { ...current, [name]: value });
      return newMap;
    });
  };

  if (loading) {
    return <Spinner />;
  }

  if (searchResult.length === 0) {
    return (
      <section className="panel-card w-full max-w-4xl p-3 flex justify-center items-center">
        <p className="label-muted text-center">{t("postal.results.none")}</p>
      </section>
    );
  }
  return (
    <section className="panel-card w-full max-w-4xl p-3 flex flex-col gap-3">
      <h2 className="text-md text-center font-semibold flex items-center justify-center gap-2 p-1">
        <span
          aria-label={t("contribution.searchResultsCountAria")}
          className="badge-warning px-2 py-1 rounded-full text-sm font-bold"
        >
          {searchResult.length}
        </span>
        <span className="flex-1">{t("contribution.searchResults")}</span>
      </h2>
      <ul className="w-full max-h-128 flex flex-col overflow-auto border border-gray-400 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 gap-1">
        <li className="hidden sm:grid sm:gap-1 text-center w-full p-2 border border-gray-400 dark:border-gray-600 rounded-md font-bold text-gray-800 dark:text-white bg-gray-50 dark:bg-gray-600 sm:grid-cols-5">
          <div>{t("postal.results.code")}</div>
          <div>{t("postal.results.city")}</div>
          <div>{t("postal.results.post")}</div>
          <div>{t("form.update")}</div>
          <div>{t("form.delete")}</div>
        </li>
        {searchResult.map((result, index) => {
          const rowValue = inputValuesByCode.get(result.code) || result;
          return (
            <PostalCodeRow
              key={result.code}
              result={rowValue}
              handleInputChange={handleInputChange}
              setPendingChanges={setPendingChanges}
              addNotification={addNotification}
              index={index}
            />
          );
        })}
      </ul>
    </section>
  );
}

export { PostalCodesResultContribution };
