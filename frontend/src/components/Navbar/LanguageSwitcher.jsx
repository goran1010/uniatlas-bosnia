import { useContext, useState } from "react";
import { RootContext } from "../../contextData/RootContext";
import { Select } from "../sharedComponents/Select";

function LanguageSwitcher({ setLanguage }) {
  const [languageLabel, setLanguageLabel] = useState("");
  const { addNotification } = useContext(RootContext);
  const { t } = useContext(RootContext);

  function handleLanguageChange(e) {
    const nextLanguage = e.target.value;
    if (!nextLanguage) return;
    setLanguage(nextLanguage);
    setLanguageLabel(nextLanguage);

    addNotification({
      type: "info",
      message: t(
        nextLanguage === "system"
          ? "language.switched.system"
          : nextLanguage === "en"
            ? "language.switched.english"
            : "language.switched.serbian",
      ),
    });
  }

  return (
    <Select
      id="language-switcher"
      aria-label={t("language.switchAria")}
      value={languageLabel}
      onChange={handleLanguageChange}
      className="whitespace-normal text-center break-all h-full py-2 sm:min-w-38 w-full sm:w-auto relative inline-flex items-center justify-center rounded-md p-1 text-sm font-semibold bg-(--surface-1) text-(--text-primary) border border-(--border-color) shadow-(--card-shadow-soft) hover:shadow-(--card-shadow)"
    >
      <option className="font-bold" value="">
        {t("language.select")}
      </option>
      <option value="system">{t("language.system")}</option>
      <option value="en">{t("language.english")}</option>
      <option value="sr">{t("language.serbian")}</option>
    </Select>
  );
}

export { LanguageSwitcher };
