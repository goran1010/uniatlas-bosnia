import { useContext } from "react";
import { NotificationContext } from "../../contextData/NotificationContext";
import { setInitialLanguage } from "../../utils/setInitialLanguage";
import { LanguageContext } from "../../contextData/LanguageContext";

function LanguageSwitcher({ setLanguageMenuOpen, setLanguage }) {
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
              setLanguage(setInitialLanguage());
              addNotification({
                type: "info",
                message: t("language.switched.browser"),
              });
              setLanguageMenuOpen(false);
            }}
          >
            {t("language.browser")}
          </button>
        </li>

        <li>
          <button
            type="button"
            className="block w-full py-1 px-1 wrap-break-word text-sm rounded-[0.6rem] transition-[background-color,color] duration-150 hover:bg-(--hover-surface) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring) focus-visible:bg-(--hover-surface)"
            onClick={() => {
              setLanguage("en");
              addNotification({
                type: "info",
                message: t("language.switched.english"),
              });
              setLanguageMenuOpen(false);
            }}
          >
            {t("language.english")}
          </button>
        </li>

        <li>
          <button
            type="button"
            className="block w-full py-1 px-1 wrap-break-word text-sm rounded-[0.6rem] transition-[background-color,color] duration-150 hover:bg-(--hover-surface) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring) focus-visible:bg-(--hover-surface)"
            onClick={() => {
              setLanguage("sr");
              addNotification({
                type: "info",
                message: t("language.switched.serbian"),
              });
              setLanguageMenuOpen(false);
            }}
          >
            {t("language.serbian")}
          </button>
        </li>
      </ul>
    </div>
  );
}

export { LanguageSwitcher };
