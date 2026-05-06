import { memo } from "react";
import { Button } from "../sharedComponents/Button";
import { Input } from "../sharedComponents/Input";
import { useState } from "react";
import { UserDataContext } from "../../contextData/UserDataContext";
import { handleConfirm } from "./utils/handleConfirm";
import { handleDecline } from "./utils/handleDecline";

const PendingChangesAdminRow = memo(
  ({ change, addNotification, setPendingChanges, index = 0 }) => {
    const [loading, setLoading] = useState(false);

    const getChangeTypeStyles = (type) => {
      switch (type?.toLowerCase()) {
        case "create":
          return "border-l-4 border-l-green-500 dark:border-l-green-400";
        case "update":
          return "border-l-4 border-l-blue-500 dark:border-l-blue-400";
        case "delete":
          return "border-l-4 border-l-red-500 dark:border-l-red-400";
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
        className={`rounded-md transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/60 ${getChangeTypeStyles(
          change.typeOfChange,
        )} ${
          index % 2 === 0
            ? "bg-white dark:bg-gray-800"
            : "bg-gray-100 dark:bg-gray-800/60"
        }`}
      >
        <div className="grid gap-2 w-full p-1 sm:p-1 sm:gap-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,2fr)]">
          <div className="flex justify-between sm:justify-center items-center ">
            <span className="sm:hidden font-semibold">Change</span>
            <span
              className={`px-2 py-1 rounded-md text-xs font-semibold capitalize ${getChangeTypeBadgeStyles(
                change.typeOfChange,
              )}`}
            >
              {change.typeOfChange}
            </span>
          </div>
          <div className="flex justify-between sm:justify-center items-center flex-wrap gap-1">
            <span className="sm:hidden font-semibold">Code</span>
            <span className="font-mono font-medium text-gray-800 dark:text-gray-100">
              {change.code}
            </span>
          </div>
          <div className="flex justify-between sm:justify-center items-center flex-wrap gap-1">
            <span className="sm:hidden font-semibold">City</span>
            <span>{change.city}</span>
          </div>
          <div className="flex justify-between sm:justify-center items-center flex-wrap gap-1">
            <span className="sm:hidden font-semibold">Post</span>
            <span>{change.post}</span>
          </div>
          <div className="flex justify-between sm:justify-center items-center flex-wrap gap-1 min-w-0">
            <span className="sm:hidden font-semibold">User</span>
            <span className="break-all">{change.user.email}</span>
          </div>
        </div>

        <div className="flex justify-center sm:flex-row gap-2 p-1">
          <Button
            variant="success"
            className="px-3 py-2 text-sm sm:max-w-25"
            onClick={() => {
              handleConfirm(
                change,
                setPendingChanges,
                addNotification,
                setLoading,
              );
            }}
            type="submit"
            loading={loading}
          >
            Approve
          </Button>
          <Button
            variant="danger"
            className="px-3 py-2 text-sm sm:max-w-25"
            onClick={() => {
              handleDecline(
                change,
                setPendingChanges,
                addNotification,
                setLoading,
              );
            }}
            type="submit"
            loading={loading}
          >
            Reject
          </Button>
        </div>
      </form>
    );
  },
);

export { PendingChangesAdminRow };
