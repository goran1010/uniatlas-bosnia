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
        <main className="fixed w-full h-full flex items-center justify-center p-2 md:p-4 lg:p-6 xl:p-8 2xl:p-10 bg-[color-mix(in_oklab,var(--app-bg),black_5%)]">
          <div className="p-2 rounded border border-red-500 bg-red-700 text-red-50 shadow-(--card-shadow-strong)">
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
      <main className="fixed w-full h-full flex items-center justify-center p-2 md:p-4 lg:p-6 xl:p-8 2xl:p-10 bg-[color-mix(in_oklab,var(--app-bg),black_5%)]">
        <div className="p-2 rounded border border-slate-500 bg-slate-700 text-slate-50 shadow-(--card-shadow-strong)">
          <p className="font-bold text-center">{t("longWait.wakingUp")}</p>
        </div>
      </main>
    </>
  );
}

export { LongWaitInfo };
