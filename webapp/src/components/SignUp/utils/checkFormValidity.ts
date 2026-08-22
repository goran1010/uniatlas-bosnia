import {
  emailSchema,
  getSignupPasswordValidationKey,
} from "../../../schemas/auth";

type CheckFormValidity = (
  currentInput: string,
  passwordInput: HTMLInputElement | null,
  confirmPasswordInput: HTMLInputElement | null,
  emailInput: HTMLInputElement | null,
  t: (key: string) => string,
) => void;

const checkFormValidity: CheckFormValidity = function (
  currentInput,
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
  if (currentInput === "email") {
    if (!emailSchema.safeParse(emailInput.value).success) {
      emailInput.setCustomValidity(t("validation.email.invalid"));
      emailInput.reportValidity();
    } else {
      emailInput.setCustomValidity("");
    }
  }

  if (currentInput === "password") {
    const validationKey = getSignupPasswordValidationKey(passwordInput.value);
    if (validationKey) {
      passwordInput.setCustomValidity(t(validationKey));
      passwordInput.reportValidity();
    } else passwordInput.setCustomValidity("");
  }

  if (currentInput === "confirm-password") {
    if (passwordInput.value.trim() !== confirmPasswordInput.value.trim()) {
      confirmPasswordInput.setCustomValidity(
        t("validation.password.mustMatch"),
      );
      confirmPasswordInput.reportValidity();
    } else confirmPasswordInput.setCustomValidity("");
  }
};

export { checkFormValidity };
