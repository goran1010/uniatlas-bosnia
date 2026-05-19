import { useContext } from "react";
import { LanguageContext } from "../contextData/LanguageContext";

function Universities() {
  const { t } = useContext(LanguageContext);

  return (
    <>
      <h1>{t("contribution.dataset.universitiesPlaceholder")}</h1>
    </>
  );
}

export { Universities };
