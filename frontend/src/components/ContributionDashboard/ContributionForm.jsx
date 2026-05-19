import { useState } from "react";
import { PostalCodeData } from "./PostalCodeData";
import { Select } from "../sharedComponents/Select";
import { useContext } from "react";
import { LanguageContext } from "../../contextData/LanguageContext";

function ContributionForm() {
  const [datasetSelect, setDatasetSelect] = useState("");
  const { t } = useContext(LanguageContext);

  function handleDataset(e) {
    setDatasetSelect(e.target.value);
  }

  return (
    <div className="flex flex-col items-center flex-1 w-full">
      <form className="p-2 flex items-center gap-2 flex-wrap justify-center">
        <label htmlFor="dataset" className="text-nowrap">
          {t("contribution.chooseDataset")}{" "}
        </label>
        <Select
          name="dataset"
          id="dataset"
          onChange={handleDataset}
          className="min-w-44"
        >
          <option default value="">
            {t("contribution.noDataset")}
          </option>
          <option value="postal-codes">
            {t("contribution.dataset.postalCodes")}
          </option>
          <option value="universities">
            {t("contribution.dataset.universities")}
          </option>
        </Select>
      </form>
      {datasetSelect === "postal-codes" && <PostalCodeData />}
      {datasetSelect === "universities" &&
        t("contribution.dataset.universitiesPlaceholder")}
      {datasetSelect === "" && (
        <div>{t("contribution.selectDatasetError")}</div>
      )}
    </div>
  );
}

export { ContributionForm };
