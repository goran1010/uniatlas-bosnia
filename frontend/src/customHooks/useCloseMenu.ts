import { useEffect } from "react";
import { useRef, useState } from "react";
import type { Dispatch, SetStateAction, RefObject } from "react";

export type SetIsMenuOpen = Dispatch<SetStateAction<boolean>>;
export type SetThemeMenuOpen = Dispatch<SetStateAction<boolean>>;
export type SetLanguageMenuOpen = Dispatch<SetStateAction<boolean>>;

export interface UseCloseMenu {
  navRef: RefObject<HTMLElement | null>;
  isMenuOpen: boolean;
  setIsMenuOpen: SetIsMenuOpen;
  isThemeMenuOpen: boolean;
  setThemeMenuOpen: SetThemeMenuOpen;
  isLanguageMenuOpen: boolean;
  setLanguageMenuOpen: SetLanguageMenuOpen;
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
