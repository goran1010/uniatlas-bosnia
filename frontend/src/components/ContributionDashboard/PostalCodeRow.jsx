import { memo } from "react";
import { Button } from "../sharedComponents/Button";
import { Input } from "../sharedComponents/Input";
import { useState } from "react";
import { handleEdit } from "./utils/handleEdit";
import { handleDelete } from "./utils/handleDelete";

const PostalCodeRow = memo(
  ({ result, handleInputChange, setSearchResult, addNotification }) => {
    const [loading, setLoading] = useState(false);

    const handleEditForm = (e) => {
      handleEdit(e, setSearchResult, addNotification, setLoading);
    };

    const handleDeleteForm = (e) => {
      handleDelete(e, setSearchResult, addNotification, setLoading);
    };
    return (
      <form
        onSubmit={handleEditForm}
        className="grid gap-2 w-full p-2 border border-gray-200 dark:border-gray-500 rounded-md sm:border-0 sm:rounded-none sm:p-1 sm:gap-1 sm:grid-cols-5"
      >
        <div className="flex justify-between sm:justify-center items-center">
          <span className="sm:hidden font-semibold">Code</span>
          <span>{result.code}</span>
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
            className="w-full py-2 text-white"
            loading={loading}
          >
            Save
          </Button>
        </div>
        <div>
          <Button
            type="button"
            data-postalcode={result.code}
            onClick={handleDeleteForm}
            className="w-full bg-red-600 py-2 text-white hover:bg-red-700"
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
