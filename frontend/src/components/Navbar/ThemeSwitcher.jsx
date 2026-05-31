import { useContext, useState } from "react";
import { RootContext } from "../../contextData/RootContext";
import { Select } from "../sharedComponents/Select";

function ThemeSwitcher({ setMode }) {
  const [themeLabel, setThemeLabel] = useState("");
  const { addNotification } = useContext(RootContext);
  const { t } = useContext(RootContext);

  function handleThemeChange(e) {
    if (!e.target.value) return;
    const nextTheme = e.target.value;

    setThemeLabel(nextTheme);
    setMode(nextTheme);
    addNotification({
      type: "info",
      message: t(`theme.switched.${nextTheme}`),
    });
  }

  return (
    <Select
      id="theme-switcher"
      value={themeLabel}
      aria-label={t("nav.toggleThemeAria")}
      onChange={handleThemeChange}
    >
      <option className="font-bold" value="">
        {t("theme.select")}
      </option>
      <option value="system">{t("theme.system")}</option>
      <option value="light">{t("theme.light")}</option>
      <option value="dark">{t("theme.dark")}</option>
    </Select>
  );
}

export { ThemeSwitcher };
