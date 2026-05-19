import { useContext } from "react";
import { UserDataContext } from "../../contextData/UserDataContext";
import { ContributionForm } from "./ContributionForm";
import { LanguageContext } from "../../contextData/LanguageContext";
import { Helmet } from "react-helmet-async";

function ContributionDashboard() {
  const { userData } = useContext(UserDataContext);
  const { t } = useContext(LanguageContext);

  if (userData) {
    return (
      <>
        <Helmet>
          <title>{`${t("title.contribute")} | ${t("title.app")}`}</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <ContributionForm />
      </>
    );
  }
  return (
    <>
      <Helmet>
        <title>{`${t("title.contribute")} | ${t("title.app")}`}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <section className="panel-card relative min-h-full w-full flex items-center justify-center p-3">
        <p className="label-muted text-center">{t("contribution.needUser")}</p>
      </section>
    </>
  );
}

export { ContributionDashboard };
