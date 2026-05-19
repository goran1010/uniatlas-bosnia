function validateAddData(e, t) {
  if (e.target.name === "code") {
    const value = e.target.value;

    if (isNaN(Number(value)) || value.length !== 5) {
      e.target.setCustomValidity(t("validation.postalCode.fiveDigits"));
    } else {
      e.target.setCustomValidity("");
    }
  }
  if (e.target.name === "city" && !e.target.value.trim()) {
    e.target.setCustomValidity(t("validation.city.required"));
  } else if (e.target.name === "city") {
    e.target.setCustomValidity("");
  }
  e.target.reportValidity();
}

export { validateAddData };
