import { useContext } from "react";
import { Link } from "react-router-dom";
import { RootContext } from "../../contextData/RootContext";

const statusLinkClass =
  "block h-full flex px-1 py-2 items-center justify-center cursor-pointer rounded-lg transition-colors duration-150 hover:bg-(--hover-surface) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring) focus-visible:bg-(--hover-surface)";

function Status({
  setIsMenuOpen,
}: {
  setIsMenuOpen: (value: boolean) => void;
}) {
  const { userData } = useContext(RootContext);
  const { t } = useContext(RootContext);

  if (userData) {
    return (
      <Link
        className={statusLinkClass}
        to="/profile"
        onClick={() => { setIsMenuOpen(false); }}
      >
        {t("nav.profile")}
      </Link>
    );
  }

  return (
    <Link
      className={statusLinkClass}
      to="/login"
      onClick={() => { setIsMenuOpen(false); }}
    >
      {t("nav.login")}
    </Link>
  );
}

export { Status };
