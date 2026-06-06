type CheckFormValidity = (
  currentInput: string,
  emailInput: HTMLInputElement | null,
  passwordInput: HTMLInputElement | null,
  t: (key: string) => string,
) => void;

const checkLoginFormValidity: CheckFormValidity = function (
  currentInput,
  emailInput,
  passwordInput,
  t,
) {
  if (passwordInput === null || emailInput === null) return;
  if (currentInput === "email") {
    const emailValue = emailInput.value.trim();
    if (!emailValue.includes("@") || emailValue.length < 3) {
      emailInput.setCustomValidity(t("validation.email.invalid"));
      emailInput.reportValidity();
    } else emailInput.setCustomValidity("");
  }

  if (currentInput === "password") {
    if (passwordInput.value.trim().length < 6) {
      passwordInput.setCustomValidity(t("validation.password.minLength"));
      passwordInput.reportValidity();
    } else passwordInput.setCustomValidity("");
  }
};

export { checkLoginFormValidity };
