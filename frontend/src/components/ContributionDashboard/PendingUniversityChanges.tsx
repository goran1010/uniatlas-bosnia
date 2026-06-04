import { useContext } from "react";
import { RootContext } from "../../contextData/RootContext";
import { PendingUniversityChangesRow } from "./PendingUniversityChangesRow";
import { Spinner } from "../utils/Spinner";

function PendingUniversityChanges({
  pendingChanges,
  setPendingChanges,
  loading,
}) {
  const { t } = useContext(RootContext);

  if (loading) return <Spinner />;

  if (!pendingChanges?.length) {
    return (
      <p className="text-center text-gray-500 dark:text-gray-400 py-4">
        {t("contribution.noPendingChanges")}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="hidden sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,2fr)_auto] gap-1 px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-200 dark:border-gray-600">
        <span>{t("contribution.change")}</span>
        <span>{t("contribution.entityType")}</span>
        <span>{t("endpoint.name")}</span>
        <span></span>
      </div>

      <ul className="flex flex-col gap-1">
        {pendingChanges.map((change, i) => (
          <PendingUniversityChangesRow
            key={change.id}
            change={change}
            index={i}
            setPendingChanges={setPendingChanges}
          />
        ))}
      </ul>

      <p className="text-xs text-gray-500 dark:text-gray-400 pt-2">
        <span
          className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 font-semibold mr-1"
          aria-label={t("contribution.pendingChangesCountAria")}
        >
          {pendingChanges.length}
        </span>
        {t("contribution.pendingChanges")}
      </p>
    </div>
  );
}

export { PendingUniversityChanges };
