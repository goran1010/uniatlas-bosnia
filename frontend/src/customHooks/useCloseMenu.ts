import { useEffect } from "react";
import { useRef, useState } from "react";

function useCloseMenu() {
  const navRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isThemeMenuOpen, setThemeMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setLanguageMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMenuOpen && !isThemeMenuOpen && !isLanguageMenuOpen) return;

    const handleClickAway = (event) => {
      if (navRef.current?.contains(event.target)) return;

      setIsMenuOpen(false);
      setThemeMenuOpen(false);
      setLanguageMenuOpen(false);
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
        setThemeMenuOpen(false);
        setLanguageMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickAway);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("click", handleClickAway);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen, isThemeMenuOpen, isLanguageMenuOpen]);

  return {
    navRef,
    isMenuOpen,
    setIsMenuOpen,
    isThemeMenuOpen,
    setThemeMenuOpen,
    isLanguageMenuOpen,
    setLanguageMenuOpen,
  };
}

export { useCloseMenu };
