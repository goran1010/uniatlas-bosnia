import { useState, useContext } from "react";
import { RootContext } from "../../contextData/RootContext";
import { Helmet } from "react-helmet-async";
import { GetAllUniversities } from "./GetAllUniversities";
import { SearchUniversities } from "./SearchUniversities";
import { SearchStudyPrograms } from "./SearchStudyPrograms";

const TABS = ["search", "findPrograms", "browseAll"];

function Universities() {
  const { t } = useContext(RootContext);
  const [activeTab, setActiveTab] = useState("search");

  return (
    <>
      <Helmet>
        <title>{`${t("title.universities")} | ${t("title.app")}`}</title>
        <meta name="description" content={t("meta.universities")} />
        <meta name="robots" content="index, follow" />
        <link
          rel="canonical"
          href="https://uniatlas-bosnia.netlify.app/universities"
        />
        <meta
          property="og:url"
          content="https://uniatlas-bosnia.netlify.app/universities"
        />
        <meta
          property="og:title"
          content={`${t("title.universities")} | ${t("title.app")}`}
        />
        <meta property="og:description" content={t("meta.universities")} />
        <meta
          name="twitter:title"
          content={`${t("title.universities")} | ${t("title.app")}`}
        />
        <meta name="twitter:description" content={t("meta.universities")} />
      </Helmet>

      <div className="w-full mx-auto px-2 sm:px-4 max-w-5xl flex flex-col gap-2">
        <h1 className="text-center text-(--text-secondary)">
          {t("universitiesPage.title")}
        </h1>
        <div className="flex gap-1 justify-center border-b border-gray-200 dark:border-gray-700">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => { setActiveTab(tab); }}
              className={`px-3 py-2 text-sm font-medium rounded-t-md transition-colors ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              {t(`universitiesPage.${tab}`)}
            </button>
          ))}
        </div>

        <div className="w-full">
          {activeTab === "browseAll" && <GetAllUniversities />}
          {activeTab === "search" && <SearchUniversities />}
          {activeTab === "findPrograms" && <SearchStudyPrograms />}
        </div>
      </div>
    </>
  );
}

export { Universities };
