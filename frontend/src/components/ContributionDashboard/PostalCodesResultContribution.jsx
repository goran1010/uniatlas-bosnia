import { useContext, useEffect, useState } from "react";
import { NotificationContext } from "../../contextData/NotificationContext";
import { PostalCodeRow } from "./PostalCodeRow";

function PostalCodesResultContribution({ searchResult, setPendingChanges }) {
  const [inputValuesByCode, setInputValuesByCode] = useState(new Map());
  const { addNotification } = useContext(NotificationContext);

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

  if (searchResult.length === 0) {
    return (
      <section className="flex justify-center items-center p-4">
        <p className="text-gray-500 dark:text-gray-300">
          No results to display.
        </p>
      </section>
    );
  }
  return (
    <section className="flex flex-col justify-center items-center w-full">
      <h2 className="text-md text-center font-semibold flex items-center gap-1 p-1 flex-1">
        <span
          aria-label="pending changes count"
          className="badge-warning px-2 py-1 rounded-full text-sm font-bold"
        >
          {searchResult.length}
        </span>
        <span className="flex-1">Pending Changes</span>
      </h2>

      <ul className="w-full max-w-4xl max-h-128 flex flex-col overflow-auto border border-gray-400 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700">
        <li className="hidden sm:grid sm:gap-1 text-center w-full p-2 border border-gray-400 dark:border-gray-600 rounded-md font-bold text-gray-800 dark:text-white bg-gray-50 dark:bg-gray-600 sm:grid-cols-5">
          <div>Code</div>
          <div>City</div>
          <div>Post</div>
          <div>Update</div>
          <div>Delete</div>
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
