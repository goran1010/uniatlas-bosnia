import { useContext } from "react";
import { UserDataContext } from "../../contextData/UserDataContext";
import { useTheme } from "../../customHooks/useTheme";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { MobileMenu } from "./MobileMenu";
import { StandardMenu } from "./StandardMenu";
import { ButtonNavbar } from "./ButtonNavbar";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { LanguageContext } from "../../contextData/LanguageContext";

function Navbar({ closeMenu }) {
  const {
    navRef,
    isMenuOpen,
    setIsMenuOpen,
    isThemeMenuOpen,
    setThemeMenuOpen,
    isLanguageMenuOpen,
    setLanguageMenuOpen,
  } = closeMenu;
  const { setMode } = useTheme();
  const { userData } = useContext(UserDataContext);
  const { setLanguage, t } = useContext(LanguageContext);

  return (
    <nav
      ref={navRef}
      onClick={() => {
        setThemeMenuOpen(false);
        setLanguageMenuOpen(false);
        setIsMenuOpen(false);
      }}
      className="z-40 px-3 py-1 w-full font-bold grid grid-cols-3 lg:flex lg:justify-between items-center gap-2 lg:gap-3 transition transform text-(--text-primary) border-b border-(--border-color) backdrop-blur-[9px]
     sticky top-0 left-0 shadow-md"
    >
      <div className="relative">
        <ButtonNavbar
          id="theme-switcher"
          aria-label={t("nav.toggleThemeAria")}
          aria-controls="theme-menu"
          aria-expanded={isThemeMenuOpen}
          onClick={(e) => {
            e.stopPropagation();
            setThemeMenuOpen((prev) => !prev);
            setLanguageMenuOpen(false);
            setIsMenuOpen(false);
          }}
        >
          {isThemeMenuOpen ? t("nav.choose") : t("nav.theme")}
        </ButtonNavbar>
        {isThemeMenuOpen && (
          <ThemeSwitcher
            setMode={setMode}
            setThemeMenuOpen={setThemeMenuOpen}
          />
        )}
      </div>
      <div className="flex lg:hidden justify-center items-center py-2">
        <ButtonNavbar
          id="mobile-menu-toggle"
          type="button"
          aria-label={t("nav.toggleMenuAria")}
          aria-controls="mobile-menu"
          aria-expanded={isMenuOpen}
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen((prev) => !prev);
            setLanguageMenuOpen(false);
            setThemeMenuOpen(false);
          }}
        >
          {isMenuOpen ? t("nav.close") : t("nav.menu")}
        </ButtonNavbar>
      </div>

      {isMenuOpen && (
        <MobileMenu setIsMenuOpen={setIsMenuOpen} userData={userData} />
      )}

      <StandardMenu setIsMenuOpen={setIsMenuOpen} userData={userData} />

      <div className="relative">
        <ButtonNavbar
          id="language-switcher"
          aria-label={t("language.switchAria")}
          aria-controls="language-menu"
          aria-expanded={isLanguageMenuOpen}
          onClick={(e) => {
            e.stopPropagation();
            setLanguageMenuOpen((prev) => !prev);
            setIsMenuOpen(false);
            setThemeMenuOpen(false);
          }}
        >
          {isLanguageMenuOpen ? t("nav.choose") : t("nav.language")}
        </ButtonNavbar>
        {isLanguageMenuOpen && (
          <LanguageSwitcher
            setLanguageMenuOpen={setLanguageMenuOpen}
            setLanguage={setLanguage}
          />
        )}
      </div>
    </nav>
  );
}

export { Navbar };
