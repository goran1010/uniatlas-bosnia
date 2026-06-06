type CheckLoginFormClickValidity = (
  passwordInput: HTMLInputElement | null,
  emailInput: HTMLInputElement | null,
  t: (key: string) => string,
) => void;

const checkLoginFormClickValidity: CheckLoginFormClickValidity = function (
  emailInput,
  passwordInput,
  t,
) {
  if (passwordInput === null || emailInput === null) return;

  const emailValue = emailInput.value.trim();
  if (!emailValue.includes("@") || emailValue.length < 3) {
    emailInput.setCustomValidity(t("validation.email.invalid"));
    emailInput.reportValidity();
  } else emailInput.setCustomValidity("");

  if (passwordInput.value.trim().length < 6) {
    passwordInput.setCustomValidity(t("validation.password.minLength"));
    passwordInput.reportValidity();
  } else passwordInput.setCustomValidity("");
};

export { checkLoginFormClickValidity };
