import { useState, useContext } from "react";
import { SearchPostalCode } from "./SearchPostalCode";
import { GetAllPostalCodes } from "./GetAllPostalCodes";
import { PostalCodesResult } from "./PostalCodesResult";
import { Helmet } from "react-helmet-async";
import { LanguageContext } from "../../contextData/LanguageContext";

function PostalCodes() {
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState([]);
  const { t } = useContext(LanguageContext);

  return (
    <>
      <Helmet>
        <title>{`${t("title.postal")} | ${t("title.app")}`}</title>
      </Helmet>
      <div className="flex flex-col gap-8 flex-1 items-center w-full">
        <section className="relative flex flex-col justify-center items-center gap-4 py-4">
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
        <PostalCodesResult searchResult={searchResult} />

        <div className="relative"></div>
      </div>
    </>
  );
}

export { PostalCodes };
