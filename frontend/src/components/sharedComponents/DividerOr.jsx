import { useContext } from "react";
import { LanguageContext } from "../../contextData/LanguageContext";

function DividerOr() {
  const { t } = useContext(LanguageContext);

  return (
    <div className="relative flex items-center my-4">
      <div className="grow border-t divider-muted"></div>
      <span className="label-muted mx-4 text-sm">{t("auth.or")}</span>
      <div className="grow border-t divider-muted"></div>
    </div>
  );
}

export { DividerOr };
