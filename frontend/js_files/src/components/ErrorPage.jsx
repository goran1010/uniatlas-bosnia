import { Link } from "react-router-dom";
import { useLanguage } from "../customHooks/useLanguage";
import { RootContext } from "../contextData/RootContext";
import { Helmet } from "react-helmet-async";

function ErrorPage() {
  const { t } = useLanguage();

  return (
    <>
      <Helmet>
        <title>{`${t("title.notFound")} | ${t("title.app")}`}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <main className="flex flex-col items-center gap-4 justify-center h-screen dark:text-gray-200">
        <p className="text-gray-700 text-2xl dark:text-gray-200">
          {t("error.notFound")}
        </p>
        <Link to="/" className="text-blue-500 underline text-2xl">
          {t("error.goHome")}
        </Link>
      </main>
    </>
  );
}
export { ErrorPage };
