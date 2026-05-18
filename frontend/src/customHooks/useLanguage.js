import { useEffect, useState } from "react";
import en from "../locales/en.json";
import sr from "../locales/sr.json";
import { LanguageContext } from "../contextData/LanguageContext";
import { setInitialLanguage } from "../utils/setInitialLanguage";

const translations = { en, sr };

function useLanguage() {
  const [language, setLanguageState] = useState(() => setInitialLanguage());

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  function setLanguage(lang) {
    setLanguageState(lang);
  }

  function t(key) {
    const keys = key.split(".");
    let value = translations[language];
    for (const k of keys) {
      if (value == null) return key;
      value = value[k];
    }
    return value ?? key;
  }

  return { language, setLanguage, t };
}

export { useLanguage };
