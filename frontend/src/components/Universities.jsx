import { useContext } from "react";
import { LanguageContext } from "../contextData/LanguageContext";
import { Helmet } from "react-helmet-async";

function Universities() {
  const { t } = useContext(LanguageContext);

  return (
    <>
      <Helmet>
        <title>{`${t("title.universities")} | ${t("title.app")}`}</title>
        <meta name="description" content={t("meta.universities")} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://bosnia-lens.netlify.app/universities" />
        <meta property="og:url" content="https://bosnia-lens.netlify.app/universities" />
        <meta property="og:title" content={`${t("title.universities")} | ${t("title.app")}`} />
        <meta property="og:description" content={t("meta.universities")} />
        <meta name="twitter:title" content={`${t("title.universities")} | ${t("title.app")}`} />
        <meta name="twitter:description" content={t("meta.universities")} />
      </Helmet>
      <div className="flex flex-col justify-center items-center w-full">
        <h1>{t("contribution.dataset.universitiesPlaceholder")}</h1>
      </div>
    </>
  );
}

export { Universities };
