import { Link } from "react-router-dom";
import { Status } from "./Status";
import { useContext } from "react";
import { LanguageContext } from "../../contextData/LanguageContext";

function MobileMenu({ setIsMenuOpen, userData }) {
  const { t } = useContext(LanguageContext);

  return (
    <div
      id="mobile-menu"
      className="menu-shell z-50 pb-2 absolute top-full w-full left-0"
    >
      <ul className="flex flex-col items-center">
        <Link
          className="menu-item block p-2 w-full text-center text-nowrap"
          to="/"
          onClick={() => setIsMenuOpen(false)}
        >
          {t("nav.home")}
        </Link>
        <Link
          className="menu-item block p-2 w-full text-center text-nowrap"
          to="/api-docs"
          onClick={() => setIsMenuOpen(false)}
        >
          {t("nav.apiDocs")}
        </Link>
        <Link
          className="menu-item block p-2 w-full text-center text-nowrap"
          to="/postal-codes"
          onClick={() => setIsMenuOpen(false)}
        >
          {t("nav.postalCodes")}
        </Link>

        <Link
          className="menu-item block p-2 w-full text-center text-nowrap"
          to="/universities"
          onClick={() => setIsMenuOpen(false)}
        >
          {t("nav.universities")}
        </Link>

        {userData && (
          <Link
            className="menu-item block p-2 w-full text-center text-nowrap"
            to="/contribution-dashboard"
            onClick={() => setIsMenuOpen(false)}
          >
            {t("nav.contribute")}
          </Link>
        )}
        {userData?.role === "ADMIN" && (
          <Link
            className="menu-item block p-2 w-full text-center text-nowrap"
            to="/admin-dashboard"
            onClick={() => setIsMenuOpen(false)}
          >
            {t("nav.admin")}
          </Link>
        )}
        <div className="flex justify-center items-center">
          <Status setIsMenuOpen={setIsMenuOpen} />
        </div>
      </ul>
    </div>
  );
}

export { MobileMenu };
