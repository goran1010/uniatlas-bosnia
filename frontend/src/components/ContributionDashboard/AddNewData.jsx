import { useState, useContext, useRef } from "react";
import { RootContext } from "../../contextData/RootContext";
import { handleSubmitAddData } from "./utils/handleSubmitAddData";
import { validateAddData } from "./utils/validateAddData";
import { Button } from "../sharedComponents/Button";
import { Input } from "../sharedComponents/Input";
import { Label } from "../sharedComponents/Label";

function AddNewData({
  setSearchResult,
  loading,
  setLoading,
  setPendingChanges,
}) {
  const { userData } = useContext(RootContext);
  const { t } = useContext(RootContext);
  const { serverStatus } = useContext(RootContext);
  const [input, setInput] = useState({ city: "", code: "", post: "" });
  const { addNotification } = useContext(RootContext);

  const cityInput = useRef();
  const codeInput = useRef();

  function handleInput(e) {
    const newInput = { ...input };
    newInput[e.target.name] = e.target.value;
    validateAddData(e, t);
    setInput(newInput);
  }

  const [isOpen, setIsOpen] = useState(false);

  return (
    <form className="relative flex flex-col justify-center items-center gap-2 p-2">
      <Button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        variant="secondary"
      >
        {isOpen ? t("form.closeForm") : t("contribution.addNewData")}
      </Button>
      {isOpen && (
        <div className="flex flex-col gap-2 border border-gray-300 dark:border-gray-600 rounded-md p-3 w-full max-w-md mx-auto">
          <div>
            <Label htmlFor="city">{t("contribution.cityName")}</Label>
            <Input
              ref={cityInput}
              type="text"
              id="city"
              name="city"
              value={input.city}
              onChange={handleInput}
            />
          </div>
          <div>
            <Label htmlFor="code">{t("contribution.postalCode")}</Label>
            <Input
              ref={codeInput}
              type="text"
              id="code"
              name="code"
              value={input.code}
              onChange={handleInput}
            />
          </div>
          <div>
            <Label htmlFor="post">{t("contribution.postalCarrier")}</Label>
            <Input
              type="text"
              id="post"
              name="post"
              value={input.post}
              onChange={handleInput}
            />
          </div>
          <div className="flex justify-center items-center">
            <Button
              onClick={(e) =>
                handleSubmitAddData(
                  e,
                  input,
                  setSearchResult,
                  addNotification,
                  setLoading,
                  cityInput,
                  codeInput,
                  setPendingChanges,
                  userData,
                  t,
                  serverStatus,
                )
              }
              type="button"
              loading={loading}
              variant="success"
              className=""
            >
              {t("form.addData")}
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}

export { AddNewData };
