import { SearchPostalCode } from "../PostalCodes/SearchPostalCode";
import { GetAllPostalCodes } from "../PostalCodes/GetAllPostalCodes";
import { PostalCodesResultContribution } from "./PostalCodesResultContribution";

function ContributionPostalCodes({
  searchResult,
  setSearchResult,
  loading,
  setLoading,
}) {
  return (
    <div className="flex flex-col w-full items-center">
      <h2>View and edit all data:</h2>
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
        setSearchResult={setSearchResult}
      />

      <div className="relative"></div>
    </div>
  );
}

export { ContributionPostalCodes };
