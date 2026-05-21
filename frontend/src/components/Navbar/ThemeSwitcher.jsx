import { useContext } from "react";
import { NotificationContext } from "../../contextData/NotificationContext";
import { LanguageContext } from "../../contextData/LanguageContext";

function ThemeSwitcher({ setMode, setThemeMenuOpen }) {
  const { addNotification } = useContext(NotificationContext);
  const { t } = useContext(LanguageContext);

  return (
    <div className="z-50 absolute top-full left-0 w-full text-center rounded-b user-select-none cursor-pointer backdrop-blur-sm bg-(--surface-2) text-(--text-primary) border border-(--border-color) shadow-(--card-shadow)">
      <ul className="flex flex-col">
        <li>
          <button
            type="button"
            className="block w-full py-1 px-1 wrap-break-word text-sm rounded-[0.6rem] transition-[background-color,color] duration-150 hover:bg-(--hover-surface) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring) focus-visible:bg-(--hover-surface)"
            onClick={() => {
              setMode("system");
              addNotification({
                type: "info",
                message: t("theme.switched.system"),
              });
              setThemeMenuOpen(false);
            }}
          >
            {t("theme.system")}
          </button>
        </li>
        <li>
          <button
            type="button"
            className="block w-full py-1 px-1 wrap-break-word text-sm rounded-[0.6rem] transition-[background-color,color] duration-150 hover:bg-(--hover-surface) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring) focus-visible:bg-(--hover-surface)"
            onClick={() => {
              setMode("light");
              addNotification({
                type: "info",
                message: t("theme.switched.light"),
              });
              setThemeMenuOpen(false);
            }}
          >
            {t("theme.light")}
          </button>
        </li>
        <li>
          <button
            type="button"
            className="block w-full py-1 px-1 wrap-break-word text-sm rounded-[0.6rem] transition-[background-color,color] duration-150 hover:bg-(--hover-surface) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring) focus-visible:bg-(--hover-surface)"
            onClick={() => {
              setMode("dark");
              addNotification({
                type: "info",
                message: t("theme.switched.dark"),
              });
              setThemeMenuOpen(false);
            }}
          >
            {t("theme.dark")}
          </button>
        </li>
      </ul>
    </div>
  );
}

export { ThemeSwitcher };
