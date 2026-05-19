import { Link } from "react-router-dom";
import { Status } from "./Status";
import { useContext } from "react";
import { LanguageContext } from "../../contextData/LanguageContext";

function StandardMenu({ setIsMenuOpen, userData }) {
  const { t } = useContext(LanguageContext);

  return (
    <div className="hidden lg:flex justify-between items-center">
      <ul className="flex items-center gap-1">
        <li>
          <Link className="menu-item block py-3 px-2" to="/">
            {t("nav.home")}
          </Link>
        </li>
        <li>
          <Link className="menu-item block py-3 px-2" to="/api-docs">
            {t("nav.apiDocs")}
          </Link>
        </li>
        <li>
          <Link
            className="menu-item block py-3 px-2 text-nowrap"
            to="/postal-codes"
          >
            {t("nav.postalCodes")}
          </Link>
        </li>

        <li>
          <Link className="menu-item block py-3 px-2" to="/universities">
            {t("nav.universities")}
          </Link>
        </li>

        {userData && (
          <li>
            <Link
              className="menu-item block py-3 px-2"
              to="/contribution-dashboard"
            >
              {t("nav.contribute")}
            </Link>
          </li>
        )}
        {userData?.role === "ADMIN" && (
          <li>
            <Link className="menu-item block py-3 px-2" to="/admin-dashboard">
              {t("nav.admin")}
            </Link>
          </li>
        )}
        <div className="flex justify-center items-center">
          <Status setIsMenuOpen={setIsMenuOpen} />
        </div>
      </ul>
    </div>
  );
}

export { StandardMenu };
