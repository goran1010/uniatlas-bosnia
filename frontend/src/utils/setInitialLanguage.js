function setInitialLanguage() {
  const browserLanguage = navigator.language.slice(0, 2);

  if (browserLanguage === "en" || browserLanguage === "sr") {
    return browserLanguage;
  }
  return "en";
}

export { setInitialLanguage };
