type CheckFormValidityClick = (
  passwordInput: HTMLInputElement | null,
  confirmPasswordInput: HTMLInputElement | null,
  emailInput: HTMLInputElement | null,
  t: (key: string) => string,
) => void;

const checkFormValidityClick: CheckFormValidityClick = function (
  passwordInput,
  confirmPasswordInput,
  emailInput,
  t,
) {
  if (
    passwordInput === null ||
    confirmPasswordInput === null ||
    emailInput === null
  )
    return;

  const emailValue = emailInput.value.trim();

  if (emailValue.length < 3) {
    emailInput.setCustomValidity(t("validation.email.minLength"));
    emailInput.reportValidity();
  } else if (!emailValue.includes("@")) {
    emailInput.setCustomValidity(
      `${t("validation.email.missingAt")} ${emailValue}`,
    );
    emailInput.reportValidity();
  } else if (emailValue.split("@")[1]?.length === 0) {
    emailInput.setCustomValidity(
      `${t("validation.email.missingDomain")} ${emailValue}`,
    );
    emailInput.reportValidity();
  } else {
    emailInput.setCustomValidity("");
  }

  if (passwordInput.value.trim().length < 6) {
    passwordInput.setCustomValidity(t("validation.password.minLength"));
    passwordInput.reportValidity();
  } else passwordInput.setCustomValidity("");

  if (passwordInput.value.trim() !== confirmPasswordInput.value.trim()) {
    confirmPasswordInput.setCustomValidity(t("validation.password.mustMatch"));
    confirmPasswordInput.reportValidity();
  } else confirmPasswordInput.setCustomValidity("");
};

export { checkFormValidityClick };
