function validateSubmitAddData(cityInput, codeInput) {
  cityInput.current.setCustomValidity("");
  codeInput.current.setCustomValidity("");

  if (!cityInput.current.value.trim()) {
    cityInput.current.setCustomValidity("City name cannot be empty");
    cityInput.current.reportValidity();
    return false;
  }
  if (
    isNaN(Number(codeInput.current.value)) ||
    codeInput.current.value.length !== 5
  ) {
    codeInput.current.setCustomValidity("Postal code must be a 5-digit number");
    codeInput.current.reportValidity();
    return false;
  }
  cityInput.current.reportValidity();
  return true;
}
export { validateSubmitAddData };
