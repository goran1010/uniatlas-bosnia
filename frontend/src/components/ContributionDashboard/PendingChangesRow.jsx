import { memo, useContext } from "react";
import { Button } from "../sharedComponents/Button";
import { Input } from "../sharedComponents/Input";
import { useState } from "react";
import { UserDataContext } from "../../contextData/UserDataContext";
import { handleDiscard } from "./utils/handleDiscard";
import { LanguageContext } from "../../contextData/LanguageContext";

const PendingChangesRow = memo(
  ({ change, addNotification, setPendingChanges, index = 0 }) => {
    const [loading, setLoading] = useState(false);
    const { userData } = useContext(UserDataContext);
    const { t } = useContext(LanguageContext);

    const getChangeTypeStyles = (type) => {
      switch (type?.toLowerCase()) {
        case "create":
          return "sm:border-l-4 sm:border-l-green-500 dark:sm:border-l-green-400";
        case "update":
          return "sm:border-l-4 sm:border-l-blue-500 dark:sm:border-l-blue-400";
        case "delete":
          return "sm:border-l-4 sm:border-l-red-500 dark:sm:border-l-red-400";
        default:
          return "";
      }
    };

    const getChangeTypeBadgeStyles = (type) => {
      switch (type?.toLowerCase()) {
        case "create":
          return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
        case "update":
          return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300";
        case "delete":
          return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
        default:
          return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
      }
    };

    return (
      <form
        className={`grid gap-2 w-full p-2 border border-gray-200 dark:border-gray-500 rounded-md sm:border-0 sm:rounded-none sm:p-1 sm:gap-1 sm:grid-cols-5 transition-colors hover:sm:bg-gray-50 dark:hover:sm:bg-gray-700/60 ${getChangeTypeStyles(
          change.typeOfChange,
        )} ${
          index % 2 === 0
            ? "bg-white dark:bg-gray-800"
            : "bg-gray-100 dark:bg-gray-800/60"
        }`}
      >
        <div className="flex justify-between sm:justify-center items-center">
          <span className="sm:hidden font-semibold">
            {t("contribution.change")}
          </span>
          <span
            className={`px-2 py-1 rounded-md text-xs font-semibold capitalize ${getChangeTypeBadgeStyles(
              change.typeOfChange,
            )}`}
          >
            {change.typeOfChange}
          </span>
        </div>
        <div className="flex justify-between sm:justify-center items-center">
          <span className="sm:hidden font-semibold">
            {t("postal.results.code")}
          </span>
          <span className="font-mono font-medium text-gray-800 dark:text-gray-100">
            {change.code}
          </span>
        </div>

        <div className="flex justify-between sm:justify-center items-center">
          <span className="sm:hidden font-semibold">
            {t("postal.results.city")}
          </span>
          <span>{change.city}</span>
        </div>
        <div className="flex justify-between sm:justify-center items-center">
          <span className="sm:hidden font-semibold">
            {t("postal.results.post")}
          </span>
          <span>{change.post}</span>
        </div>

        <div className="flex items-center">
          <Button
            type="button"
            data-postalcode={change.code}
            data-city={change.city}
            data-post={change.post}
            variant="danger"
            className="w-full py-2"
            loading={loading}
            onClick={() =>
              handleDiscard(
                change,
                userData,
                addNotification,
                setPendingChanges,
                setLoading,
                t,
              )
            }
          >
            {t("form.discard")}
          </Button>
        </div>
      </form>
    );
  },
);

export { PendingChangesRow };
