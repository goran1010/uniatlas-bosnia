import { useState, useRef, useContext } from "react";
import { checkPostalCodesValidity } from "./utils/checkPostalCodesValidity";
import { RootContext } from "../../contextData/RootContext";
import { Button } from "../sharedComponents/Button";
import { Input } from "../sharedComponents/Input";
import { Label } from "../sharedComponents/Label";
import { guardedFetch } from "../../utils/guardedFetch";

const currentURL = import.meta.env.VITE_BACKEND_URL;

function SearchPostalCode({ setSearchResult, loading, setLoading }) {
  const [searchTerm, setSearchTerm] = useState("");
  const searchInput = useRef();
  const { addNotification } = useContext(RootContext);
  const { t } = useContext(RootContext);
  const { serverStatus } = useContext(RootContext);

  function handleSearch(e) {
    checkPostalCodesValidity(searchInput, t);
    setSearchTerm(e.target.value);
  }

  async function handleSubmit(e) {
    try {
      setLoading(true);
      e.preventDefault();

      const response = await guardedFetch(
        `${currentURL}/api/v1/postal-codes/search?searchTerm=${searchTerm}`,
        undefined,
        {
          serverStatus,
          addNotification,
          t,
        },
      );

      if (!response) {
        return;
      }

      const result = await response.json();

      if (!response.ok) {
        addNotification({
          type: "error",
          message:
            result?.error?.message ||
            result?.error ||
            t("postal.search.failed"),
        });
        return;
      }
      addNotification({
        type: "success",
        message: t("postal.search.success"),
      });
      setSearchResult(result.data);
    } catch (err) {
      addNotification({
        type: "error",
        message: t("postal.search.error"),
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col justify-center items-center gap-2 w-full"
    >
      <Label htmlFor="search-term">{t("postal.search.label")}</Label>

      <div className="flex gap-2 w-full max-w-xl flex-wrap sm:flex-nowrap">
        <Input
          ref={searchInput}
          value={searchTerm}
          onChange={handleSearch}
          type="text"
          name="search-term"
          id="search-term"
          className="flex-1"
        />
        <Button
          type="submit"
          onClick={() => {
            checkPostalCodesValidity(searchInput, t);
          }}
          loading={loading}
          className="sm:w-auto text-white"
        >
          {t("form.search")}
        </Button>
      </div>
    </form>
  );
}

export { SearchPostalCode };
