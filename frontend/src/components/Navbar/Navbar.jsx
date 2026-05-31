import { useContext } from "react";
import { RootContext } from "../../contextData/RootContext";
import { useTheme } from "../../customHooks/useTheme";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { MobileMenu } from "./MobileMenu";
import { StandardMenu } from "./StandardMenu";
import { ButtonNavbar } from "./ButtonNavbar";
import { LanguageSwitcher } from "./LanguageSwitcher";

function Navbar({ closeMenu }) {
  const { navRef, isMenuOpen, setIsMenuOpen } = closeMenu;
  const { theme, setMode } = useTheme();
  const { userData, language, setLanguage, t } = useContext(RootContext);

  return (
    <nav
      ref={navRef}
      onClick={() => {
        setIsMenuOpen(false);
      }}
      className="z-40 w-full px-1 py-2 font-bold grid grid-cols-3 lg:flex lg:justify-between items-center gap-2 lg:gap-3 transition transform text-(--text-primary) border-b border-(--border-color) backdrop-blur
     sticky top-0 left-0 shadow-md"
    >
      <div className="flex lg:hidden justify-center items-center">
        <ButtonNavbar
          id="mobile-menu-toggle"
          type="button"
          aria-label={t("nav.toggleMenuAria")}
          aria-controls="mobile-menu"
          aria-expanded={isMenuOpen}
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen((prev) => !prev);
          }}
        >
          {isMenuOpen ? t("nav.close") : t("nav.menu")}
        </ButtonNavbar>
      </div>
      {isMenuOpen && (
        <MobileMenu setIsMenuOpen={setIsMenuOpen} userData={userData} />
      )}

      <ThemeSwitcher theme={theme} setMode={setMode} />

      <StandardMenu setIsMenuOpen={setIsMenuOpen} userData={userData} />

      <LanguageSwitcher language={language} setLanguage={setLanguage} />
    </nav>
  );
}

export { Navbar };
