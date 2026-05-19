import { useContext } from "react";
import { Link } from "react-router-dom";
import { UserDataContext } from "../../contextData/UserDataContext";
import { LanguageContext } from "../../contextData/LanguageContext";

function Status({ setIsMenuOpen }) {
  const { userData } = useContext(UserDataContext);
  const { t } = useContext(LanguageContext);

  if (userData) {
    return (
      <div className="flex items-center justify-center">
        <Link
          className="menu-item block py-3 px-4 cursor-pointer rounded-lg lg:px-2"
          to="/profile"
          onClick={() => setIsMenuOpen(false)}
        >
          {t("nav.profile")}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <Link
        className="menu-item block py-3 px-2 cursor-pointer rounded-lg lg:px-2"
        to="/login"
        onClick={() => setIsMenuOpen(false)}
      >
        {t("nav.login")}
      </Link>
    </div>
  );
}

export { Status };
