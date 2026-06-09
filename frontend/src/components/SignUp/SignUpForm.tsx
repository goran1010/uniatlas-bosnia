import { checkFormValidity } from "./utils/checkFormValidity";
import { checkFormValidityClick } from "./utils/checkFormValidityClick";
import { handleSignUpSubmit } from "./utils/handleSignUpSubmit";
import { useState, useRef, use } from "react";
import { useNavigate } from "react-router-dom";
import { RootContext } from "../../contextData/RootContext";
import { Button } from "../sharedComponents/Button";
import { Input } from "../sharedComponents/Input";
import { Label } from "../sharedComponents/Label";
import type { ChangeEvent } from "react";

interface SignUpFormProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

function SignUpForm({ loading, setLoading }: SignUpFormProps) {
  const navigate = useNavigate();
  const { addNotification, t, serverStatus } = use(RootContext);

  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const [inputFields, setInputFields] = useState({
    email: "",
    password: "",
    ["confirm-password"]: "",
  });

  function handleInputFields(e: ChangeEvent<HTMLInputElement>) {
    checkFormValidity(
      e.target.name,
      passwordRef.current,
      confirmPasswordRef.current,
      emailRef.current,
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
          serverStatus,
        )
      }
    >
      <div>
        <Label htmlFor="email">{t("form.email")}</Label>
        <Input
          ref={emailRef}
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
          ref={passwordRef}
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
          ref={confirmPasswordRef}
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
          onClick={() => {
            checkFormValidityClick(
              passwordRef.current,
              confirmPasswordRef.current,
              emailRef.current,
              t,
            );
          }}
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
