import { emailSchema, loginPasswordSchema } from "../../../schemas/auth";

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

  if (!emailSchema.safeParse(emailInput.value).success) {
    emailInput.setCustomValidity(t("validation.email.invalid"));
    emailInput.reportValidity();
  } else emailInput.setCustomValidity("");

  if (!loginPasswordSchema.safeParse(passwordInput.value).success) {
    passwordInput.setCustomValidity(t("validation.password.required"));
    passwordInput.reportValidity();
  } else passwordInput.setCustomValidity("");
};

export { checkLoginFormClickValidity };
