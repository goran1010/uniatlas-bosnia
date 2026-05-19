import { useContext } from "react";
import { LanguageContext } from "../contextData/LanguageContext";

function Footer() {
  const { t } = useContext(LanguageContext);

  return (
    <footer className="nav-shell w-full flex justify-between items-center font-bold px-3 py-2">
      <address className="not-italic w-full flex justify-between items-center">
        <span className="block text-sm font-medium">{t("footer.name")}</span>
        <a
          href={`mailto:${t("footer.email")}`}
          className="block text-sm font-medium"
        >
          {t("footer.email")}
        </a>
      </address>
    </footer>
  );
}

export { Footer };
