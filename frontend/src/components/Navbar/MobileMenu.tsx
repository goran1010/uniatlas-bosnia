import { Link } from "react-router-dom";
import { Status } from "./Status";
import { useContext } from "react";
import { RootContext } from "../../contextData/RootContext";

import type { UserData } from "../../customHooks/useStatusCheck";
import type { SetIsMenuOpen } from "../../customHooks/useCloseMenu";

const menuItemClass = `block p-2 w-full text-center text-nowrap rounded-lg hover:bg-(--hover-surface) focus-visible:outline-none focus-visible:ring-2 
  focus-visible:ring-(--focus-ring) focus-visible:bg-(--hover-surface)`;

interface MobileMenuProps {
  setIsMenuOpen: SetIsMenuOpen;
  userData: UserData | null;
}

function MobileMenu({ setIsMenuOpen, userData }: MobileMenuProps) {
  const { t } = useContext(RootContext);

  return (
    <div
      id="mobile-menu"
      className={`z-50 absolute top-full w-full left-0 text-(--text-primary) border border-(--border-color) shadow-(--card-shadow) bg-(--surface-2) backdrop-blur-sm`}
    >
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
              to="/improve-data"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("nav.improveData")}
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
        <li className={`flex justify-center items-center`}>
          <Status setIsMenuOpen={setIsMenuOpen} />
        </li>
      </ul>
    </div>
  );
}

export { MobileMenu };
