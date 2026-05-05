import { memo, useContext } from "react";
import { Button } from "../sharedComponents/Button";
import { Input } from "../sharedComponents/Input";
import { useState } from "react";
import { UserDataContext } from "../../contextData/UserDataContext";
import { handleRemove } from "./utils/handleRemove";

const PendingChangesRow = memo(
  ({ change, addNotification, setPendingChanges }) => {
    const [loading, setLoading] = useState(false);
    const { userData } = useContext(UserDataContext);

    return (
      <form className="grid gap-2 w-full p-2 border border-gray-200 dark:border-gray-500 rounded-md sm:border-0 sm:rounded-none sm:p-1 sm:gap-1 sm:grid-cols-5">
        <div className="flex justify-between sm:justify-center items-center">
          <span className="sm:hidden font-semibold">Change</span>
          <span>{change.typeOfChange}</span>
        </div>
        <div className="flex justify-between sm:justify-center items-center">
          <span className="sm:hidden font-semibold">Code</span>
          <span>{change.code}</span>
        </div>

        <div className="flex justify-between sm:justify-center items-center">
          <span className="sm:hidden font-semibold">City</span>
          <span>{change.city}</span>
        </div>
        <div className="flex justify-between sm:justify-center items-center">
          <span className="sm:hidden font-semibold">Post</span>
          <span>{change.post}</span>
        </div>

        <div>
          <Button
            type="button"
            data-postalcode={change.code}
            data-city={change.city}
            data-post={change.post}
            className="w-full bg-red-600 py-2 text-white hover:bg-red-700"
            loading={loading}
            onClick={() =>
              handleRemove(
                change,
                userData,
                addNotification,
                setPendingChanges,
                setLoading,
              )
            }
          >
            Delete
          </Button>
        </div>
      </form>
    );
  },
);

export { PendingChangesRow };
