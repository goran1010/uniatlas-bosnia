import { Link } from "react-router-dom";
import { Status } from "./Status";
import { useContext } from "react";
import { RootContext } from "../../contextData/RootContext";

import type { SetIsMenuOpen } from "../../customHooks/useCloseMenu";
import type { UserData } from "../../customHooks/useStatusCheck";

interface StandardMenuProps {
  setIsMenuOpen: SetIsMenuOpen;
  userData: UserData;
}

const menuLinkClass =
  "block h-full px-1 py-2 flex items-center justify-center text-center rounded-lg transition-colors duration-150 hover:bg-(--hover-surface) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring) focus-visible:bg-(--hover-surface)";

function StandardMenu({ setIsMenuOpen, userData }: StandardMenuProps) {
  const { t } = useContext(RootContext);

  return (
    <div className="hidden md:flex justify-between">
      <ul className="flex h-full gap-1">
        <li>
          <Link className={menuLinkClass} to="/">
            {t("nav.home")}
          </Link>
        </li>
        <li>
          <Link className={menuLinkClass} to="/api-docs">
            {t("nav.apiDocs")}
          </Link>
        </li>
        <li>
          <Link className={menuLinkClass} to="/universities">
            {t("nav.universities")}
          </Link>
        </li>

        {userData && (
          <li>
            <Link className={menuLinkClass} to="/improve-data">
              {t("nav.improveData")}
            </Link>
          </li>
        )}
        {userData?.role === "ADMIN" && (
          <li>
            <Link className={menuLinkClass} to="/admin-dashboard">
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

export { StandardMenu };
