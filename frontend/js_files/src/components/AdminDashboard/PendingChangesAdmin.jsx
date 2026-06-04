import { useGetPendingChangesAdmin } from "./customHooks/useGetPendingChangesAdmin";
import { useContext, useState } from "react";
import { RootContext } from "../../contextData/RootContext";
import { Button } from "../sharedComponents/Button";
import { Spinner } from "../../utils/Spinner";
import { PendingChangesAdminRow } from "./PendingChangesAdminRow";

const panelClass =
  "py-3 px-1 sm:px-4 w-full bg-(--surface-2) text-(--text-primary) border border-(--border-color) rounded-2xl shadow-(--card-shadow) backdrop-blur-sm";

function PendingChangesAdmin() {
  const [loading, setLoading] = useState(true);

  const { addNotification } = useContext(RootContext);
  const { t } = useContext(RootContext);
  const { pendingChanges, setPendingChanges } = useGetPendingChangesAdmin(
    setLoading,
    t,
  );

  if (loading) {
    return <Spinner />;
  }

  if (!pendingChanges?.length) {
    return (
      <section className="flex flex-col justify-center items-center p-1 w-full">
        <p className="text-gray-600 dark:text-gray-300">
          {t("admin.noPendingChanges")}
        </p>
      </section>
    );
  }

  return (
    <section className={panelClass}>
      <h2 className="text-md text-center font-semibold flex items-center gap-1 p-1 flex-1">
        <span
          aria-label={t("admin.pendingChangesCountAria")}
          className="px-2 py-1 rounded-full text-sm font-bold bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
        >
          {pendingChanges.length}
        </span>
        <span className="flex-1">{t("admin.pendingChanges")}</span>
      </h2>

      <section className="flex flex-col justify-center items-center p-1 w-full">
        <ul className="w-full max-w-4xl flex flex-col border border-gray-400 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 gap-1">
          <li className="hidden sm:grid sm:gap-1 text-center w-full p-2 border border-gray-400 dark:border-gray-600 rounded-md font-bold text-gray-800 dark:text-white bg-gray-50 dark:bg-gray-600 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,2fr)_minmax(0,2fr)]">
            <div>{t("contribution.change")}</div>
            <div>{t("contribution.entityType")}</div>
            <div>{t("endpoint.name")}</div>
            <div>{t("contribution.user")}</div>
          </li>
          {pendingChanges.map((result, index) => {
            return (
              <PendingChangesAdminRow
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

export { PendingChangesAdmin };
