import { useContext } from "react";
import { LanguageContext } from "../contextData/LanguageContext";
import { Helmet } from "react-helmet-async";

function LongWaitInfo({ serverIsDown }) {
  const { t } = useContext(LanguageContext);

  if (serverIsDown) {
    return (
      <>
        <Helmet>
          <title>{`${t("title.serverDown")} | ${t("title.app")}`}</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <main className="overlay-screen fixed w-full h-full flex items-center justify-center p-2 md:p-4 lg:p-6 xl:p-8 2xl:p-10">
          <div className="status-banner status-banner--error p-2 rounded">
            <p className="font-bold text-center">{t("longWait.unreachable")}</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${t("title.wakingUp")} | ${t("title.app")}`}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <main className="overlay-screen fixed w-full h-full flex items-center justify-center p-2 md:p-4 lg:p-6 xl:p-8 2xl:p-10">
        <div className="status-banner status-banner--info p-2 rounded">
          <p className="font-bold text-center">{t("longWait.wakingUp")}</p>
        </div>
      </main>
    </>
  );
}

export { LongWaitInfo };
