import { Link } from "react-router-dom";
import { Status } from "./Status";
import { useContext } from "react";
import { RootContext } from "../../contextData/RootContext";

const menuShellClass =
  "z-50 absolute top-full w-full left-0 bg-(--surface-2) text-(--text-primary) border border-(--border-color) shadow-(--card-shadow)";
const menuItemClass =
  "block p-2 w-full text-center text-nowrap rounded-lg transition-colors duration-150 hover:bg-(--hover-surface) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring) focus-visible:bg-(--hover-surface)";

function MobileMenu({ setIsMenuOpen, userData }) {
  const { t } = useContext(RootContext);

  return (
    <div id="mobile-menu" className={menuShellClass}>
      <ul className="flex flex-col items-center">
        <li className="w-full">
          <Link
            className={menuItemClass}
            to="/"
            onClick={() => setIsMenuOpen(false)}
          >
            {t("nav.home")}
          </Link>
        </li>
        <li className="w-full">
          <Link
            className={menuItemClass}
            to="/api-docs"
            onClick={() => setIsMenuOpen(false)}
          >
            {t("nav.apiDocs")}
          </Link>
        </li>
        <li className="w-full">
          <Link
            className={menuItemClass}
            to="/universities"
            onClick={() => setIsMenuOpen(false)}
          >
            {t("nav.universities")}
          </Link>
        </li>

        {userData && (
          <li className="w-full">
            <Link
              className={menuItemClass}
              to="/contribution-dashboard"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("nav.contribute")}
            </Link>
          </li>
        )}
        {userData?.role === "ADMIN" && (
          <li className="w-full">
            <Link
              className={menuItemClass}
              to="/admin-dashboard"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("nav.admin")}
            </Link>
          </li>
        )}
        <li className="flex justify-center items-center">
          <Status setIsMenuOpen={setIsMenuOpen} />
        </li>
      </ul>
    </div>
  );
}

export { MobileMenu };
