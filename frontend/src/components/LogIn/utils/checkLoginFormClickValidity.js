function checkLoginFormClickValidity(emailInput, passwordInput, t) {
  const emailValue = emailInput.current.value.trim();
  if (!emailValue.includes("@") || emailValue.length < 3) {
    emailInput.current.setCustomValidity(t("validation.email.invalid"));
    emailInput.current.reportValidity();
  } else emailInput.current.setCustomValidity("");

  if (passwordInput.current.value.trim().length < 6) {
    passwordInput.current.setCustomValidity(t("validation.password.minLength"));
    passwordInput.current.reportValidity();
  } else passwordInput.current.setCustomValidity("");
}

export { checkLoginFormClickValidity };
