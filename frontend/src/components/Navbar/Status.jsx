import { useContext } from "react";
import { Link } from "react-router-dom";
import { UserDataContext } from "../../contextData/UserDataContext";
import { LanguageContext } from "../../contextData/LanguageContext";

const statusLinkClass =
  "py-3 px-2 block cursor-pointer rounded-lg lg:px-2 transition-colors duration-150 hover:bg-(--hover-surface) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring) focus-visible:bg-(--hover-surface)";

function Status({ setIsMenuOpen }) {
  const { userData } = useContext(UserDataContext);
  const { t } = useContext(LanguageContext);

  if (userData) {
    return (
      <Link
        className={statusLinkClass}
        to="/profile"
        onClick={() => setIsMenuOpen(false)}
      >
        {t("nav.profile")}
      </Link>
    );
  }

  return (
    <Link
      className={statusLinkClass}
      to="/login"
      onClick={() => setIsMenuOpen(false)}
    >
      {t("nav.login")}
    </Link>
  );
}

export { Status };
