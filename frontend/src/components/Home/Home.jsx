import { Link } from "react-router-dom";
import { useContext } from "react";
import { RootContext } from "../../contextData/RootContext";
import { Helmet } from "react-helmet-async";

function Home() {
  const { t } = useContext(RootContext);
  const pageTitle = `${t("home.title")} | ${t("title.app")}`;

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={t("meta.home")} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://uniatlas-bosnia.netlify.app/" />
        <meta property="og:url" content="https://uniatlas-bosnia.netlify.app/" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={t("meta.home")} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={t("meta.home")} />
      </Helmet>

      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl flex flex-col gap-12 py-10 dark:text-gray-100">
        <header className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold text-center">
            {t("home.heading")}
          </h1>
          <p className="text-lg">{t("home.intro")}</p>
          <p>{t("home.summary")}</p>
        </header>

        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-center">
            {t("home.exploreHeading")}
          </h2>
          <p>{t("home.exploreDescription")}</p>
          <div className="flex flex-wrap gap-3 justify-center items-center">
            <Link
              to="/universities"
              className="border rounded-lg px-4 py-2 dark:hover:bg-gray-800 transition-colors font-medium w-full text-center text-(--text-primary) sm:w-auto hover:bg-(--hover-surface) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring) focus-visible:bg-(--hover-surface)"
            >
              {t("home.card.universities.title")}
            </Link>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-center">
            {t("home.improveHeading")}
          </h2>
          <p>{t("home.improveDescription")}</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>{t("home.improveStep1")}</li>
            <li>{t("home.improveStep2")}</li>
            <li>{t("home.improveStep3")}</li>
          </ol>
          <div className="flex flex-wrap gap-3 justify-center items-center">
            <Link
              to="/improve-data"
              className="border rounded-lg px-4 py-2 dark:hover:bg-gray-800 transition-colors font-medium w-full text-center text-(--text-primary) sm:w-auto hover:bg-(--hover-surface) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring) focus-visible:bg-(--hover-surface)"
            >
              {t("home.improveContribute")}
            </Link>
            <Link
              to="/signup"
              className="border rounded-lg px-4 py-2 dark:hover:bg-gray-800 transition-colors font-medium w-full text-center text-(--text-primary) sm:w-auto hover:bg-(--hover-surface) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring) focus-visible:bg-(--hover-surface)"
            >
              {t("home.improveSignUp")}
            </Link>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-center">
            {t("home.whyHeading")}
          </h2>
          <p>{t("home.whyDescription1")}</p>
          <p>{t("home.whyDescription2")}</p>
          <div className="flex flex-wrap gap-3 justify-center items-center">
            <Link
              to="/login"
              className="border rounded-lg px-4 py-2 dark:hover:bg-gray-800 transition-colors font-medium w-full text-center text-(--text-primary) sm:w-auto hover:bg-(--hover-surface) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring) focus-visible:bg-(--hover-surface)"
            >
              {t("home.whyLogin")}
            </Link>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold self-center">
            {t("home.forDevsHeading")}
          </h2>
          <p>{t("home.forDevsDescription")}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("home.forDevsNote")}
          </p>
          <Link
            to="/api-docs"
            className="border rounded-lg px-4 py-2 dark:hover:bg-gray-800 transition-colors font-medium w-full text-center text-(--text-primary) sm:w-auto hover:bg-(--hover-surface) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring) focus-visible:bg-(--hover-surface) self-center"
          >
            {t("home.forDevsCta")}
          </Link>
        </section>
      </div>
    </>
  );
}

export { Home };
