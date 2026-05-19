import { useEffect, useState } from "react";
import en from "../locales/en.json";
import sr from "../locales/sr.json";
import { setInitialLanguage } from "../utils/setInitialLanguage";

const translations = { en, sr };

function useLanguage() {
  const [language, setLanguageState] = useState(
    () => localStorage.getItem("language") ?? setInitialLanguage(),
  );

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  function setLanguage(lang) {
    setLanguageState(lang);
  }

  function t(key, params = {}) {
    const keys = key.split(".");
    let value = translations[language];
    for (const k of keys) {
      if (value == null) return key;
      value = value[k];
    }
    if (typeof value !== "string") return value ?? key;

    return value.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, token) => {
      const replacement = params[token];
      return replacement == null ? "" : String(replacement);
    });
  }

  return { language, setLanguage, t };
}

export { useLanguage };
