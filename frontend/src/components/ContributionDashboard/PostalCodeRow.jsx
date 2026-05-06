import { memo, useContext } from "react";
import { Button } from "../sharedComponents/Button";
import { Input } from "../sharedComponents/Input";
import { useState } from "react";
import { handleEdit } from "./utils/handleEdit";
import { handleDelete } from "./utils/handleDelete";
import { UserDataContext } from "../../contextData/UserDataContext";

const PostalCodeRow = memo(
  ({
    result,
    handleInputChange,
    addNotification,
    setPendingChanges,
    index = 0,
  }) => {
    const [loading, setLoading] = useState(false);
    const { userData } = useContext(UserDataContext);

    const handleEditForm = (e) => {
      handleEdit(e, addNotification, setLoading, setPendingChanges, userData);
    };

    const handleDeleteForm = (e) => {
      handleDelete(e, addNotification, setLoading, setPendingChanges, userData);
    };
    return (
      <form
        onSubmit={handleEditForm}
        className={`grid gap-2 w-full p-2 border border-gray-200 dark:border-gray-500 rounded-md sm:border-0 sm:rounded-none sm:p-1 sm:gap-1 sm:grid-cols-5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/60 ${
          index % 2 === 0
            ? "bg-white dark:bg-gray-800"
            : "bg-gray-100 dark:bg-gray-800/60"
        }`}
      >
        <div className="flex justify-between sm:justify-center items-center">
          <span className="sm:hidden font-semibold">Code</span>
          <span className="font-mono font-medium text-gray-800 dark:text-gray-100">
            {result.code}
          </span>
        </div>
        <Input
          name="city"
          type="text"
          value={result.city || ""}
          onChange={(e) =>
            handleInputChange(result.code, e.target.name, e.target.value)
          }
          data-code={result.code}
          aria-label={`City for postal code ${result.code}`}
        />
        <Input
          data-code={result.code}
          name="post"
          type="text"
          value={result.post || ""}
          onChange={(e) =>
            handleInputChange(result.code, e.target.name, e.target.value)
          }
          aria-label={`Post office for postal code ${result.code}`}
        />
        <div>
          <Button
            type="submit"
            className="btn-update w-full py-2"
            loading={loading}
          >
            Update
          </Button>
        </div>
        <div>
          <Button
            type="button"
            data-postalcode={result.code}
            data-city={result.city}
            data-post={result.post}
            onClick={handleDeleteForm}
            className="btn-danger w-full py-2"
            loading={loading}
          >
            Delete
          </Button>
        </div>
      </form>
    );
  },
);

export { PostalCodeRow };
