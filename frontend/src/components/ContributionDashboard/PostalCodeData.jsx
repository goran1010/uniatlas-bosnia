import { useState } from "react";
import { ContributionPostalCodes } from "./ContributionPostalCodes";
import { AddNewData } from "./AddNewData";

function PostalCodeData() {
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <>
      <AddNewData
        setSearchResult={setSearchResult}
        loading={loading}
        setLoading={setLoading}
      />

      <ContributionPostalCodes
        searchResult={searchResult}
        setSearchResult={setSearchResult}
        loading={loading}
        setLoading={setLoading}
      />
    </>
  );
}

export { PostalCodeData };
