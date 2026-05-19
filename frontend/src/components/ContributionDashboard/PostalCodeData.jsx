import { useState } from "react";
import { ContributionPostalCodes } from "./ContributionPostalCodes";
import { AddNewData } from "./AddNewData";
import { PendingChanges } from "./PendingChanges";
import { useGetPendingChanges } from "./customHooks/useGetPendingChanges";
import { useContext } from "react";
import { LanguageContext } from "../../contextData/LanguageContext";

function PostalCodeData() {
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const { t } = useContext(LanguageContext);

  const { pendingChanges, setPendingChanges } = useGetPendingChanges(
    setLoading,
    t,
  );

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
