import { useContext } from "react";
import { LanguageContext } from "../../contextData/LanguageContext";

function DividerOr() {
  const { t } = useContext(LanguageContext);

  return (
    <div className="relative flex items-center my-4">
      <div className="grow border-t border-[color-mix(in_oklab,var(--border-color),transparent_35%)]"></div>
      <span className="mx-4 text-sm text-(--text-secondary)">
        {t("auth.or")}
      </span>
      <div className="grow border-t border-[color-mix(in_oklab,var(--border-color),transparent_35%)]"></div>
    </div>
  );
}

export { DividerOr };
