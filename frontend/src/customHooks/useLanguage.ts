import { useCallback, useEffect, useState } from "react";
import en from "../locales/en.json";
import sr from "../locales/sr.json";
import { setInitialLanguage } from "../components/utils/setInitialLanguage";

const translations = { en, sr };

function useLanguage() {
  const [language, setLanguageState] = useState(
    () => localStorage.getItem("language") ?? "system",
  );

  const resolvedLanguage =
    language === "system" ? setInitialLanguage() : language;

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const setLanguage = useCallback((lang) => {
    setLanguageState(lang);
  }, []);

  const t = useCallback(
    (key, params = {}) => {
      const keys = key.split(".");
      let value = translations[resolvedLanguage];

      for (const k of keys) {
        if (value == null) return key;
        value = value[k];
      }

      if (typeof value !== "string") return value ?? key;

      return value.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, token) => {
        const replacement = params[token];
        return replacement == null ? "" : String(replacement);
      });
    },
    [resolvedLanguage],
  );

  return { language, setLanguage, t };
}

export { useLanguage };
