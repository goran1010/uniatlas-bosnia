function validateSubmitAddData(cityInput, codeInput, t) {
  cityInput.current.setCustomValidity("");
  codeInput.current.setCustomValidity("");

  if (!cityInput.current.value.trim()) {
    cityInput.current.setCustomValidity(t("validation.city.required"));
    cityInput.current.reportValidity();
    return false;
  }
  if (
    isNaN(Number(codeInput.current.value)) ||
    codeInput.current.value.length !== 5
  ) {
    codeInput.current.setCustomValidity(t("validation.postalCode.fiveDigits"));
    codeInput.current.reportValidity();
    return false;
  }
  cityInput.current.reportValidity();
  return true;
}
export { validateSubmitAddData };
