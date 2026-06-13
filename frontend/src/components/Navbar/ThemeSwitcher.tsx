import { use, type ChangeEvent } from "react";
import { RootContext } from "../../contextData/RootContext";
import { Select } from "../sharedComponents/Select";

import type { SetMode } from "../../customHooks/useTheme";

function ThemeSwitcher({ setMode }: { setMode: SetMode }) {
  const { addNotification, t } = use(RootContext);

  function handleThemeChange(e: ChangeEvent<HTMLSelectElement>) {
    if (!e.target.value) return;
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
      value={""}
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
