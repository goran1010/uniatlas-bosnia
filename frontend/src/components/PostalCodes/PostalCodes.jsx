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
        <meta name="description" content={t("meta.postal")} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://bosnia-lens.netlify.app/postal-codes" />
        <meta property="og:url" content="https://bosnia-lens.netlify.app/postal-codes" />
        <meta property="og:title" content={`${t("title.postal")} | ${t("title.app")}`} />
        <meta property="og:description" content={t("meta.postal")} />
        <meta name="twitter:title" content={`${t("title.postal")} | ${t("title.app")}`} />
        <meta name="twitter:description" content={t("meta.postal")} />
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
