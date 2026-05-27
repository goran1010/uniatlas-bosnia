import { Link } from "react-router-dom";
import { useContext } from "react";
import { RootContext } from "../../contextData/RootContext";
import { Helmet } from "react-helmet-async";

function Home() {
  const { t } = useContext(RootContext);
  return (
    <>
      <Helmet>
        <title>{`${t("title.home")} | ${t("title.app")}`}</title>
        <meta name="description" content={t("meta.home")} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://bosnia-lens.netlify.app/" />
        <meta property="og:url" content="https://bosnia-lens.netlify.app/" />
        <meta
          property="og:title"
          content={`${t("title.home")} | ${t("title.app")}`}
        />
        <meta property="og:description" content={t("meta.home")} />
        <meta
          name="twitter:title"
          content={`${t("title.home")} | ${t("title.app")}`}
        />
        <meta name="twitter:description" content={t("meta.home")} />
      </Helmet>

      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl flex flex-col items-center gap-10 py-8 dark:text-gray-100">
        <header className="flex flex-col items-center gap-6 w-full">
          <h1 className="text-3xl font-bold">{t("home.heading")}</h1>
          <section className="w-full text-left">
            <p>{t("home.description1")}</p>
            <p className="mt-2">{t("home.description2")}</p>
          </section>

          <div className="grid gap-6 md:grid-cols-2 w-full">
            <section className="text-left">
              <h2 className="text-xl font-bold text-center mb-2">
                {t("home.availableData")}
              </h2>
              <ul>
                <li>{t("home.availableDataUniversities")}</li>
              </ul>
            </section>

            <section className="text-left">
              <h2 className="text-xl font-bold mb-2">
                {t("home.contributing")}
              </h2>
              <p>
                {t("home.contributingReadmePrefix")}{" "}
                <a href="https://github.com/goran1010/bosnia-lens/blob/main/CONTRIBUTING.md">
                  CONTRIBUTING.md
                </a>{" "}
                {t("home.contributingReadmeSuffix")}
              </p>
              <p className="mt-2">{t("home.contributingWelcome")}</p>
            </section>
          </div>
        </header>

        <section className="flex flex-col items-center gap-4 w-full">
          <h2 className="text-xl font-bold">{t("home.getStarted")}</h2>
          <div className="grid gap-4 md:grid-cols-2 w-full">
            <Link
              to="/universities"
              className="border rounded-lg p-5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
            >
              <h3 className="text-lg font-bold mb-1">
                {t("home.card.universities.title")}
              </h3>
              <p>{t("home.card.universities.description")}</p>
            </Link>
            <Link
              to="/api-docs"
              className="border rounded-lg p-5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
            >
              <h3 className="text-lg font-bold mb-1">
                {t("home.card.restApi.title")}
              </h3>
              <p>{t("home.card.restApi.description")}</p>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}

export { Home };
