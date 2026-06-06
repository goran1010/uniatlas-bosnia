import { useEffect } from "react";
import { useRef, useState } from "react";

export interface UseCloseMenu {
  navRef: React.RefObject<HTMLElement | null>;
  isMenuOpen: boolean;
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isThemeMenuOpen: boolean;
  setThemeMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isLanguageMenuOpen: boolean;
  setLanguageMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function useCloseMenu(): UseCloseMenu {
  const navRef = useRef<HTMLElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isThemeMenuOpen, setThemeMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setLanguageMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMenuOpen && !isThemeMenuOpen && !isLanguageMenuOpen) return;

    const handleClickAway = () => {
      setIsMenuOpen(false);
      setThemeMenuOpen(false);
      setLanguageMenuOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
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
