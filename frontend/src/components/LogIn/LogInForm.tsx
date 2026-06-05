import { checkLoginFormClickValidity } from "./utils/checkLoginFormClickValidity";
import { checkLoginFormValidity } from "./utils/checkLoginFormValidity";
import { useRef, useState, useContext } from "react";
import { RootContext } from "../../contextData/RootContext";
import { useNavigate } from "react-router-dom";
import { handleSubmitLogIn } from "./utils/handleSubmitLogIn";
import { Button } from "../sharedComponents/Button";
import { Input } from "../sharedComponents/Input";
import { Label } from "../sharedComponents/Label";

function LogInForm({ loading, setLoading }) {
  const navigate = useNavigate();
  const { setUserData } = useContext(RootContext);
  const { addNotification } = useContext(RootContext);
  const { t } = useContext(RootContext);
  const { serverStatus } = useContext(RootContext);

  const [inputFields, setInputFields] = useState({
    email: "",
    password: "",
  });

  const emailInput = useRef(null);
  const passwordInput = useRef(null);

  function handleInputFields(e) {
    checkLoginFormValidity(e.target.name, emailInput, passwordInput, t);
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
          onClick={() =>
            checkLoginFormClickValidity(emailInput, passwordInput, t)
          }
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
