import { use } from "react";
import { RootContext } from "../contextData/RootContext";

function Footer() {
  const { t } = use(RootContext);

  return (
    <footer className="w-full flex justify-between items-center font-bold px-3 py-2 text-(--text-primary) border-b border-(--border-color) backdrop-blur">
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
