import { useState } from "react";
import { PostalCodeData } from "./PostalCodeData";
import { Select } from "../sharedComponents/Select";

function ContributionForm() {
  const [datasetSelect, setDatasetSelect] = useState("");

  function handleDataset(e) {
    setDatasetSelect(e.target.value);
  }

  return (
    <div className="flex flex-col items-center flex-1 w-full">
      <form className="p-2 flex items-center gap-2 flex-wrap justify-center">
        <label htmlFor="dataset" className="text-nowrap">
          Choose dataset:{" "}
        </label>
        <Select
          name="dataset"
          id="dataset"
          onChange={handleDataset}
          className="min-w-44"
        >
          <option default value="">
            No dataset
          </option>
          <option value="postal-codes">Postal Codes</option>
          <option value="universities">Universities</option>
        </Select>
      </form>
      {datasetSelect === "postal-codes" && <PostalCodeData />}
      {datasetSelect === "universities" && "Universities placeholder"}
      {datasetSelect === "" && <div>You need to select a dataset.</div>}
    </div>
  );
}

export { ContributionForm };
