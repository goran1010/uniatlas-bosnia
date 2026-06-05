import { useCallback, useEffect, useState } from "react";
import en from "../locales/en.json";
import sr from "../locales/sr.json";
import { setSystemLanguage } from "../utils/setInitialLanguage";
import type { SystemLanguage } from "../utils/setInitialLanguage";

export type Language = SystemLanguage | "system";

type TranslationValue = string | TranslationMap;

type TranslationMap = {
  [key: string]: TranslationValue;
};

const translations: Record<SystemLanguage, TranslationMap> = { en, sr };

function getSavedLanguage(): Language {
  const savedLanguage = localStorage.getItem("language");

  if (
    savedLanguage === "en" ||
    savedLanguage === "sr" ||
    savedLanguage === "system"
  ) {
    return savedLanguage;
  }

  return "system";
}

function useLanguage() {
  const [language, setLanguageState] = useState<Language>(getSavedLanguage);

  const resolvedLanguage =
    language === "system" ? setSystemLanguage() : language;

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const t = useCallback(
    (key: string): string => {
      const keys = key.split(".");
      let value: TranslationValue = translations[resolvedLanguage];

      for (const k of keys) {
        if (typeof value !== "object" || value === null) return key;
        value = value[k];
      }

      if (typeof value !== "string") return key;

      return value;
    },
    [resolvedLanguage],
  );

  return { language, setLanguage, t };
}

export { useLanguage };
