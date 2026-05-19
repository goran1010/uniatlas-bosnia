import { useContext } from "react";
import { LanguageContext } from "../contextData/LanguageContext";
import { Helmet } from "react-helmet-async";

function Universities() {
  const { t } = useContext(LanguageContext);

  return (
    <>
      <Helmet>
        <title>{`${t("title.universities")} | ${t("title.app")}`}</title>
      </Helmet>
      <div className="flex flex-col justify-center items-center w-full">
        <h1>{t("contribution.dataset.universitiesPlaceholder")}</h1>
      </div>
    </>
  );
}

export { Universities };
