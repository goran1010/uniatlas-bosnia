import { SearchPostalCode } from "../PostalCodes/SearchPostalCode";
import { GetAllPostalCodes } from "../PostalCodes/GetAllPostalCodes";
import { PostalCodesResultContribution } from "./PostalCodesResultContribution";
import { useContext } from "react";
import { LanguageContext } from "../../contextData/LanguageContext";

function ContributionPostalCodes({
  searchResult,
  setSearchResult,
  loading,
  setLoading,
  setPendingChanges,
}) {
  const { t } = useContext(LanguageContext);

  return (
    <div className="flex flex-col w-full items-center gap-2">
      <h2>{t("contribution.viewEditAllData")}</h2>
      <section className="relative flex flex-col justify-center gap-2 p-2">
        <SearchPostalCode
          setSearchResult={setSearchResult}
          loading={loading}
          setLoading={setLoading}
        />
        <GetAllPostalCodes
          setSearchResult={setSearchResult}
          loading={loading}
          setLoading={setLoading}
        />
      </section>
      <PostalCodesResultContribution
        searchResult={searchResult}
        setPendingChanges={setPendingChanges}
        loading={loading}
      />

      <div className="relative"></div>
    </div>
  );
}

export { ContributionPostalCodes };
