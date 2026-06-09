import { checkLoginFormClickValidity } from "./utils/checkLoginFormClickValidity";
import { checkLoginFormValidity } from "./utils/checkLoginFormValidity";
import { useRef, useState, use } from "react";
import { RootContext } from "../../contextData/RootContext";
import { useNavigate } from "react-router-dom";
import { handleSubmitLogIn } from "./utils/handleSubmitLogIn";
import { Button } from "../sharedComponents/Button";
import { Input } from "../sharedComponents/Input";
import { Label } from "../sharedComponents/Label";

import type { ChangeEvent } from "react";
interface LogInFormProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

function LogInForm({ loading, setLoading }: LogInFormProps) {
  const navigate = useNavigate();
  const { setUserData, addNotification, t, serverStatus } = use(RootContext);

  const [inputFields, setInputFields] = useState({
    email: "",
    password: "",
  });

  const emailInput = useRef<HTMLInputElement>(null);
  const passwordInput = useRef<HTMLInputElement>(null);

  function handleInputFields(e: ChangeEvent<HTMLInputElement>) {
    checkLoginFormValidity(
      e.target.name,
      emailInput.current,
      passwordInput.current,
      t,
    );
    setInputFields({ ...inputFields, [e.target.name]: e.target.value });
  }

  return (
    <form
      onSubmit={(e) =>
        handleSubmitLogIn(
          e,
          inputFields,
          setUserData,
          addNotification,
          setLoading,
          navigate,
          t,
          serverStatus,
        )
      }
      className="flex flex-col gap-3"
    >
      <div>
        <Label htmlFor="email">{t("form.email")}</Label>
        <Input
          value={inputFields.email}
          ref={emailInput}
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
          autoComplete="current-password"
        />
      </div>
      <div>
        <Button
          onClick={() => {
            checkLoginFormClickValidity(
              emailInput.current,
              passwordInput.current,
              t,
            );
          }}
          type="submit"
          loading={loading}
          className="text-white"
        >
          {t("auth.login.heading")}
        </Button>
      </div>
    </form>
  );
}

export { LogInForm };
