import { checkFormValidity } from "./utils/checkFormValidity";
import { checkFormValidityClick } from "./utils/checkFormValidityClick";
import { handleSignUpSubmit } from "./utils/handleSignUpSubmit";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { NotificationContext } from "../../contextData/NotificationContext";
import { Button } from "../sharedComponents/Button";
import { Input } from "../sharedComponents/Input";
import { Label } from "../sharedComponents/Label";
import { LanguageContext } from "../../contextData/LanguageContext";

function SignUpForm({ loading, setLoading }) {
  const navigate = useNavigate();
  const { addNotification } = useContext(NotificationContext);
  const { t } = useContext(LanguageContext);

  const passwordInput = useRef();
  const confirmPasswordInput = useRef();
  const emailInput = useRef();

  const [inputFields, setInputFields] = useState({
    email: "",
    password: "",
    ["confirm-password"]: "",
  });

  function handleInputFields(e) {
    checkFormValidity(
      e.target.name,
      passwordInput,
      confirmPasswordInput,
      emailInput,
      t,
    );

    setInputFields({ ...inputFields, [e.target.name]: e.target.value });
  }

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) =>
        handleSignUpSubmit(
          e,
          setLoading,
          inputFields,
          addNotification,
          navigate,
          t,
        )
      }
    >
      <div>
        <Label htmlFor="email">{t("form.email")}</Label>
        <Input
          ref={emailInput}
          value={inputFields.email}
          onChange={handleInputFields}
          type="email"
          name="email"
          id="email"
          autoComplete="email"
        />
      </div>
      <div>
        <Label htmlFor="password">{t("form.password")}</Label>
        <Input
          ref={passwordInput}
          value={inputFields.password}
          onChange={handleInputFields}
          type="password"
          name="password"
          id="password"
          autoComplete="new-password"
        />
      </div>
      <div>
        <Label htmlFor="confirm-password">{t("form.confirmPassword")}</Label>
        <Input
          ref={confirmPasswordInput}
          value={inputFields["confirm-password"]}
          onChange={handleInputFields}
          type="password"
          name="confirm-password"
          id="confirm-password"
          autoComplete="new-password"
        />
      </div>
      <div>
        <Button
          onClick={() =>
            checkFormValidityClick(
              passwordInput,
              confirmPasswordInput,
              emailInput,
              t,
            )
          }
          type="submit"
          loading={loading}
          className="text-white"
        >
          {t("form.create")}
        </Button>
      </div>
    </form>
  );
}

export { SignUpForm };
