import { useContext, useEffect, useState } from "react";
import { NotificationContext } from "../../contextData/NotificationContext";
import { PostalCodeRow } from "./PostalCodeRow";

function PostalCodesResultContribution({ searchResult, setSearchResult }) {
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
    <section className="flex flex-col justify-center items-center p-1 w-full">
      <ul className="w-full max-w-4xl max-h-128 flex flex-col overflow-auto border border-gray-400 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 gap-1">
        <li className="hidden sm:grid sm:gap-1 text-center w-full p-2 border border-gray-400 dark:border-gray-600 rounded-md font-bold text-gray-800 dark:text-white bg-gray-50 dark:bg-gray-600 sm:grid-cols-5">
          <div>Code</div>
          <div>City</div>
          <div>Post</div>
          <div>Save</div>
          <div>Delete</div>
        </li>
        {searchResult.map((result) => {
          const rowValue = inputValuesByCode.get(result.code) || result;
          return (
            <PostalCodeRow
              key={result.code}
              result={rowValue}
              handleInputChange={handleInputChange}
              setSearchResult={setSearchResult}
              addNotification={addNotification}
            />
          );
        })}
      </ul>
    </section>
  );
}

export { PostalCodesResultContribution };
