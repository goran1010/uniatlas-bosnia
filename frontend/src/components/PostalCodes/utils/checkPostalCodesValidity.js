function checkPostalCodesValidity(searchInput, t) {
  const searchInputValue = searchInput.current.value.trim();

  if (Number.isInteger(Number(searchInputValue))) {
    if (searchInputValue.length !== 5) {
      searchInput.current.setCustomValidity(
        t("validation.postalCode.fiveDigits"),
      );
      searchInput.current.reportValidity();
    } else searchInput.current.setCustomValidity("");
  } else if (searchInputValue.length < 2) {
    searchInput.current.setCustomValidity(t("validation.search.minLength"));
    searchInput.current.reportValidity();
  } else searchInput.current.setCustomValidity("");
}

export { checkPostalCodesValidity };
