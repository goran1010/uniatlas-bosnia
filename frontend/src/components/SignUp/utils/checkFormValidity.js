function checkFormValidity(
  currentInput,
  passwordInput,
  confirmPasswordInput,
  emailInput,
  t,
) {
  if (currentInput === "email") {
    const emailValue = emailInput.current.value.trim();
    if (emailValue.length < 3) {
      emailInput.current.setCustomValidity(t("validation.email.minLength"));
      emailInput.current.reportValidity();
    } else if (!emailValue.includes("@")) {
      emailInput.current.setCustomValidity(
        t("validation.email.missingAt", { email: emailValue }),
      );
      emailInput.current.reportValidity();
    } else if (emailValue.split("@")[1]?.length === 0) {
      emailInput.current.setCustomValidity(
        t("validation.email.missingDomain", { email: emailValue }),
      );
      emailInput.current.reportValidity();
    } else {
      emailInput.current.setCustomValidity("");
    }
  }

  if (currentInput === "password") {
    if (passwordInput.current.value.trim().length < 6) {
      passwordInput.current.setCustomValidity(
        t("validation.password.minLength"),
      );
      passwordInput.current.reportValidity();
    } else passwordInput.current.setCustomValidity("");
  }

  if (currentInput === "confirm-password") {
    if (
      passwordInput.current.value.trim() !==
      confirmPasswordInput.current.value.trim()
    ) {
      confirmPasswordInput.current.setCustomValidity(
        t("validation.password.mustMatch"),
      );
      confirmPasswordInput.current.reportValidity();
    } else confirmPasswordInput.current.setCustomValidity("");
  }
}

export { checkFormValidity };
