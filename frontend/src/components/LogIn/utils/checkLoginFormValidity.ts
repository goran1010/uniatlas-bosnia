import { emailSchema, loginPasswordSchema } from "../../../schemas/auth";

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
    if (!emailSchema.safeParse(emailInput.value).success) {
      emailInput.setCustomValidity(t("validation.email.invalid"));
      emailInput.reportValidity();
    } else emailInput.setCustomValidity("");
  }

  if (currentInput === "password") {
    if (!loginPasswordSchema.safeParse(passwordInput.value).success) {
      passwordInput.setCustomValidity(t("validation.password.required"));
      passwordInput.reportValidity();
    } else passwordInput.setCustomValidity("");
  }
};

export { checkLoginFormValidity };
