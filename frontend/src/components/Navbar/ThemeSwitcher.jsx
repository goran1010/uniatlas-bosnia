import { useContext } from "react";
import { NotificationContext } from "../../contextData/NotificationContext";
import { LanguageContext } from "../../contextData/LanguageContext";
import { Select } from "../sharedComponents/Select";

function ThemeSwitcher({ theme, setMode }) {
  const { addNotification } = useContext(NotificationContext);
  const { t } = useContext(LanguageContext);

  function handleThemeChange(e) {
    const nextTheme = e.target.value;

    setMode(nextTheme);
    addNotification({
      type: "info",
      message: t(`theme.switched.${nextTheme}`),
    });
  }

  return (
    <Select
      id="theme-switcher"
      aria-label={t("nav.toggleThemeAria")}
      value={theme}
      onChange={handleThemeChange}
      className="whitespace-normal text-center break-all sm:min-w-38 w-full relative inline-flex items-center justify-center rounded-md p-1 text-sm font-semibold bg-(--surface-1) text-(--text-primary) border border-(--border-color) shadow-(--card-shadow-soft) hover:shadow-(--card-shadow)"
    >
      <option value="system">{t("theme.system")}</option>
      <option value="light">{t("theme.light")}</option>
      <option value="dark">{t("theme.dark")}</option>
    </Select>
  );
}

export { ThemeSwitcher };
