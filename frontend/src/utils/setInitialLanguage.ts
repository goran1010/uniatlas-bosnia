export type SystemLanguage = "en" | "sr";

function setSystemLanguage(): SystemLanguage {
  const browserLanguage = navigator.language.slice(0, 2);

  if (browserLanguage === "en" || browserLanguage === "sr") {
    return browserLanguage;
  }
  return "en";
}

export { setSystemLanguage };
