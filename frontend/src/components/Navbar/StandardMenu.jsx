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
          <Link
            className="block py-3 px-2 rounded-[0.6rem] transition-[background-color,color] duration-150 hover:bg-(--hover-surface) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring) focus-visible:bg-(--hover-surface)"
            to="/"
          >
            {t("nav.home")}
          </Link>
        </li>
        <li>
          <Link
            className="block py-3 px-2 rounded-[0.6rem] transition-[background-color,color] duration-150 hover:bg-(--hover-surface) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring) focus-visible:bg-(--hover-surface)"
            to="/api-docs"
          >
            {t("nav.apiDocs")}
          </Link>
        </li>
        <li>
          <Link
            className="block py-3 px-2 text-nowrap rounded-[0.6rem] transition-[background-color,color] duration-150 hover:bg-(--hover-surface) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring) focus-visible:bg-(--hover-surface)"
            to="/postal-codes"
          >
            {t("nav.postalCodes")}
          </Link>
        </li>

        <li>
          <Link
            className="block py-3 px-2 rounded-[0.6rem] transition-[background-color,color] duration-150 hover:bg-(--hover-surface) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring) focus-visible:bg-(--hover-surface)"
            to="/universities"
          >
            {t("nav.universities")}
          </Link>
        </li>

        {userData && (
          <li>
            <Link
              className="block py-3 px-2 rounded-[0.6rem] transition-[background-color,color] duration-150 hover:bg-(--hover-surface) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring) focus-visible:bg-(--hover-surface)"
              to="/contribution-dashboard"
            >
              {t("nav.contribute")}
            </Link>
          </li>
        )}
        {userData?.role === "ADMIN" && (
          <li>
            <Link
              className="block py-3 px-2 rounded-[0.6rem] transition-[background-color,color] duration-150 hover:bg-(--hover-surface) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring) focus-visible:bg-(--hover-surface)"
              to="/admin-dashboard"
            >
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
