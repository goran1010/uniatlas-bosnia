import { useEffect, useState } from "react";

export type SetMode = (mode: string) => void;

function useTheme() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "system",
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const isDark = theme === "dark" || (theme === "system" && media.matches);

    document.documentElement.classList.toggle("dark", isDark);

    if (theme === "system") {
      const listener = () =>
        document.documentElement.classList.toggle("dark", media.matches);

      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }
  }, [theme]);

  const setMode: SetMode = (mode) => {
    if (mode === "system") localStorage.removeItem("theme");
    else localStorage.setItem("theme", mode);

    setTheme(mode);
  };

  return { theme, setMode };
}

export { useTheme };
