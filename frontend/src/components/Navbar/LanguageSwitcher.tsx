import { use, type ChangeEvent } from "react";
import { RootContext } from "../../contextData/RootContext";
import { Select } from "../sharedComponents/Select";

import type { SetLanguage } from "../../types/i18n";

function LanguageSwitcher({ setLanguage }: { setLanguage: SetLanguage }) {
  const { addNotification, t } = use(RootContext);

  function handleLanguageChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextLanguage = event.target.value;
    if (
      nextLanguage !== "sr" &&
      nextLanguage !== "en" &&
      nextLanguage !== "system"
    )
      return;
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
      value={""}
      onChange={handleLanguageChange}
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
