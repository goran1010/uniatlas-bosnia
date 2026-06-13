import { useState, use } from "react";
import { RootContext } from "../../contextData/RootContext";
import { AddUniversityEntity } from "./AddUniversityEntity";
import { PendingUniversityChanges } from "./PendingUniversityChanges";
import { useGetPendingChanges } from "./customHooks/useGetPendingChanges";
import { Spinner } from "../../utils/Spinner";

const TABS = ["addNewData", "pendingChanges"];

function ContributionForm() {
  const { t } = use(RootContext);
  const [activeTab, setActiveTab] = useState("addNewData");
  const [loading, setLoading] = useState(false);
  const { pendingChanges, setPendingChanges } = useGetPendingChanges(
    setLoading,
    t,
    activeTab === "pendingChanges",
  );

  return (
    <div className="flex flex-col gap-2 items-center w-full">
      <h1 className="text-center text-(--text-secondary)">
        {t("contribution.title")}
      </h1>
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 items-center justify-center">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setActiveTab(tab);
            }}
            className={`relative px-3 py-2 text-sm font-medium rounded-t-md transition-colors ${
              activeTab === tab
                ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            {t(`contribution.${tab}`)}
            {tab === "pendingChanges" &&
              !loading &&
              pendingChanges.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 font-bold">
                  {pendingChanges.length}
                </span>
              )}
          </button>
        ))}
      </div>

      {activeTab === "addNewData" && (
        <AddUniversityEntity setPendingChanges={setPendingChanges} />
      )}

      {activeTab === "pendingChanges" &&
        (loading ? (
          <Spinner />
        ) : (
          <PendingUniversityChanges
            loading={loading}
            pendingChanges={pendingChanges}
            setPendingChanges={setPendingChanges}
          />
        ))}
    </div>
  );
}

export { ContributionForm };
