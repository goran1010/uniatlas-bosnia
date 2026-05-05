import { useState } from "react";
import { ContributionPostalCodes } from "./ContributionPostalCodes";
import { AddNewData } from "./AddNewData";
import { PendingChanges } from "./PendingChanges";
import { useGetPendingChanges } from "./customHooks/useGetPendingChanges";

function PostalCodeData() {
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);

  const { pendingChanges, setPendingChanges } =
    useGetPendingChanges(setLoading);

  return (
    <>
      <AddNewData
        setSearchResult={setSearchResult}
        loading={loading}
        setLoading={setLoading}
        setPendingChanges={setPendingChanges}
      />

      <ContributionPostalCodes
        searchResult={searchResult}
        setSearchResult={setSearchResult}
        loading={loading}
        setLoading={setLoading}
        setPendingChanges={setPendingChanges}
      />
      <PendingChanges
        pendingChanges={pendingChanges}
        loading={loading}
        setPendingChanges={setPendingChanges}
      />
    </>
  );
}

export { PostalCodeData };
