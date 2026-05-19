import { useContext } from "react";
import { NotificationContext } from "../../contextData/NotificationContext";
import { setInitialLanguage } from "../../utils/setInitialLanguage";
import { LanguageContext } from "../../contextData/LanguageContext";

function LanguageSwitcher({ setLanguageMenuOpen, setLanguage }) {
  const { addNotification } = useContext(NotificationContext);
  const { t } = useContext(LanguageContext);

  return (
    <div className="menu-shell z-50 absolute top-full left-0 w-full text-center rounded-b user-select-none cursor-pointer backdrop-blur-sm">
      <ul className="flex flex-col">
        <li>
          <button
            type="button"
            className="menu-item block w-full py-1 px-1 wrap-break-word text-sm"
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
            className="menu-item block w-full py-1 px-1 wrap-break-word text-sm"
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
            className="menu-item block w-full py-1 px-1 wrap-break-word text-sm"
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
