import { NotificationContext } from "../../contextData/NotificationContext";
import { Button } from "../sharedComponents/Button";
import { Spinner } from "../../utils/Spinner";
import { PendingChangesRow } from "./PendingChangesRow";
import { useContext } from "react";
import { LanguageContext } from "../../contextData/LanguageContext";

function PendingChanges({ pendingChanges, loading, setPendingChanges }) {
  const { addNotification } = useContext(NotificationContext);
  const { t } = useContext(LanguageContext);

  if (loading) {
    return <Spinner />;
  }

  if (!pendingChanges || pendingChanges.length === 0) {
    return (
      <section className="w-full max-w-4xl p-3 flex justify-center items-center bg-(--surface-2) text-(--text-primary) border border-(--border-color) rounded-[0.9rem] shadow-(--card-shadow) backdrop-blur-[7px]">
        <p className="text-center text-(--text-secondary)">
          {t("contribution.noPendingChanges")}
        </p>
      </section>
    );
  }

  return (
    <section className="w-full max-w-4xl p-3 flex flex-col gap-3 bg-(--surface-2) text-(--text-primary) border border-(--border-color) rounded-[0.9rem] shadow-(--card-shadow) backdrop-blur-[7px]">
      <h2 className="text-md text-center font-semibold flex items-center gap-1 p-1 flex-1">
        <span
          aria-label={t("contribution.pendingChangesCountAria")}
          className="px-2 py-1 rounded-full text-sm font-bold bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
        >
          {pendingChanges.length}
        </span>
        <span className="flex-1">{t("contribution.pendingChanges")}</span>
      </h2>

      <section className="flex flex-col justify-center items-center w-full">
        <ul className="w-full max-h-128 flex flex-col overflow-auto border border-gray-400 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 gap-1">
          <li className="hidden sm:grid sm:gap-1 text-center w-full p-2 border border-gray-400 dark:border-gray-600 rounded-md font-bold text-gray-800 dark:text-white bg-gray-50 dark:bg-gray-600 sm:grid-cols-5">
            <div>{t("contribution.change")}</div>
            <div>{t("postal.results.code")}</div>
            <div>{t("postal.results.city")}</div>
            <div>{t("postal.results.post")}</div>
            <div>{t("form.discard")}</div>
          </li>
          {pendingChanges.map((result, index) => {
            return (
              <PendingChangesRow
                key={result.id}
                change={result}
                addNotification={addNotification}
                setPendingChanges={setPendingChanges}
                index={index}
              />
            );
          })}
        </ul>
      </section>
    </section>
  );
}

export { PendingChanges };
