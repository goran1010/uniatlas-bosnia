import { useState, use, type Dispatch, type SetStateAction } from "react";
import { RootContext } from "../../contextData/RootContext";
import { Button } from "../sharedComponents/Button";
import { handleDiscardUniversityChange } from "./utils/handleDiscardUniversityChange";
import type { PendingChange } from "./customHooks/useGetPendingChanges";

interface BadgeStyles {
  CREATE: string;
  UPDATE: string;
  DELETE: string;
}

const BADGE: BadgeStyles = {
  CREATE: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
  UPDATE: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
  DELETE: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
};

interface PendingUniversityChangesRowProps {
  change: PendingChange;
  index: number;
  setPendingChanges: Dispatch<SetStateAction<PendingChange[]>>;
}

function PendingUniversityChangesRow({
  change,
  index,
  setPendingChanges,
}: PendingUniversityChangesRowProps) {
  const { t, addNotification, serverStatus } = use(RootContext);
  const [loading, setLoading] = useState(false);

  const isEven = index % 2 === 0;

  return (
    <li
      className={`rounded-md p-2 sm:p-3 ${isEven ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-800/60"}`}
    >
      <div className="grid gap-2 sm:gap-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,2fr)_auto]">
        <div className="flex justify-between sm:justify-start items-center gap-2">
          <span className="sm:hidden text-xs font-semibold text-gray-500 dark:text-gray-400">
            {t("contribution.change")}
          </span>
          <span
            className={`px-2 py-0.5 rounded text-xs font-semibold ${BADGE[change.typeOfChange]}`}
          >
            {change.typeOfChange}
          </span>
        </div>

        <div className="flex justify-between sm:justify-start items-center gap-2">
          <span className="sm:hidden text-xs font-semibold text-gray-500 dark:text-gray-400">
            {t("contribution.entityType")}
          </span>
          <span className="text-xs font-mono text-gray-700 dark:text-gray-200">
            {t(`contribution.entityTypes.${change.entityType}`)}
          </span>
        </div>

        <div className="flex justify-between sm:justify-start items-center gap-2 min-w-0">
          <span className="sm:hidden text-xs font-semibold text-gray-500 dark:text-gray-400">
            {t("endpoint.name")}
          </span>
          <span className="text-sm truncate">{change.data?.email ?? "—"}</span>
        </div>

        <div className="flex justify-end items-center">
          <Button
            variant="danger"
            className="px-2 py-1 text-xs max-w-24"
            loading={loading}
            onClick={() =>
              void handleDiscardUniversityChange({
                changeId: change.id,
                setPendingChanges,
                addNotification,
                setLoading,
                t,
                serverStatus,
              })
            }
          >
            {t("contribution.deleteChange")}
          </Button>
        </div>
      </div>
    </li>
  );
}

export { PendingUniversityChangesRow };
