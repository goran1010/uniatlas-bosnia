import { Link } from "react-router-dom";
import { useContext } from "react";
import { LanguageContext } from "../contextData/LanguageContext";

function ErrorPage() {
  const { t } = useContext(LanguageContext);

  return (
    <main className="flex flex-col items-center gap-4 justify-center h-screen dark:text-gray-200">
      <p className="text-gray-700 text-2xl dark:text-gray-200">
        {t("error.notFound")}
      </p>
      <Link to="/" className="text-blue-500 underline text-2xl">
        {t("error.goHome")}
      </Link>
    </main>
  );
}
export { ErrorPage };
