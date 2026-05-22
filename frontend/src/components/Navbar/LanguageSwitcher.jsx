import { useContext } from "react";
import { NotificationContext } from "../../contextData/NotificationContext";
import { LanguageContext } from "../../contextData/LanguageContext";
import { Select } from "../sharedComponents/Select";

function LanguageSwitcher({ language, setLanguage }) {
  const { addNotification } = useContext(NotificationContext);
  const { t } = useContext(LanguageContext);

  function handleLanguageChange(e) {
    const nextLanguage = e.target.value;
    if (!nextLanguage) return;
    setLanguage(nextLanguage);

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
      value={language}
      onChange={handleLanguageChange}
      className="whitespace-normal text-center break-all sm:min-w-38 w-full rounded-md p-1 text-sm font-semibold bg-(--surface-1) text-(--text-primary) border border-(--border-color) shadow-(--card-shadow-soft) hover:shadow-(--card-shadow)"
    >
      <option value="system">{t("language.system")}</option>
      <option value="en">{t("language.english")}</option>
      <option value="sr">{t("language.serbian")}</option>
    </Select>
  );
}

export { LanguageSwitcher };
