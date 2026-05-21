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
          className="block py-3 px-4 cursor-pointer rounded-lg lg:px-2 transition-[background-color,color] duration-150 hover:bg-(--hover-surface) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring) focus-visible:bg-(--hover-surface)"
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
        className="block py-3 px-2 cursor-pointer rounded-lg lg:px-2 transition-[background-color,color] duration-150 hover:bg-(--hover-surface) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring) focus-visible:bg-(--hover-surface)"
        to="/login"
        onClick={() => setIsMenuOpen(false)}
      >
        {t("nav.login")}
      </Link>
    </div>
  );
}

export { Status };
