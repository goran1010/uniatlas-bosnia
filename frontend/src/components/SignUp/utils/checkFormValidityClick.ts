import {
  emailSchema,
  getSignupPasswordValidationKey,
} from "../../../schemas/auth";

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

  if (!emailSchema.safeParse(emailInput.value).success) {
    emailInput.setCustomValidity(t("validation.email.invalid"));
    emailInput.reportValidity();
  } else {
    emailInput.setCustomValidity("");
  }

  const validationKey = getSignupPasswordValidationKey(passwordInput.value);
  if (validationKey) {
    passwordInput.setCustomValidity(t(validationKey));
    passwordInput.reportValidity();
  } else passwordInput.setCustomValidity("");

  if (passwordInput.value.trim() !== confirmPasswordInput.value.trim()) {
    confirmPasswordInput.setCustomValidity(t("validation.password.mustMatch"));
    confirmPasswordInput.reportValidity();
  } else confirmPasswordInput.setCustomValidity("");
};

export { checkFormValidityClick };
