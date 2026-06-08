import { useState, useContext } from "react";
import { RootContext } from "../../contextData/RootContext";
import { Input } from "../sharedComponents/Input";
import { Select } from "../sharedComponents/Select";
import { Label } from "../sharedComponents/Label";
import { Button } from "../sharedComponents/Button";
import { handleSubmitUniversityEntity } from "./utils/handleSubmitUniversityEntity";

import type { PendingChange } from "./customHooks/useGetPendingChanges";
import type { Dispatch, SetStateAction, SubmitEvent } from "react";

type EntityType = "UNIVERSITY" | "FACULTY" | "STUDY_PROGRAM" | "SUBJECT";
export type TypeOfChange = "CREATE" | "UPDATE" | "DELETE";
type Cycle = "FIRST" | "SECOND" | "THIRD";
type SubjectType = "MANDATORY" | "ELECTIVE";
type Entity = "FBIH" | "RS" | "BD";

interface DataFieldProps {
  label: string;
  id: string;
  type: string;
  min?: number;
  max?: number;
  required?: boolean;
  value: string | number;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
}

interface FormState {
  entityType: EntityType;
  typeOfChange: TypeOfChange;
  parentId: string;
  targetId: string;
  data: {
    name?: string;
    city?: string;
    entity?: Entity;
    ownership?: "JAVNA" | "PRIVATNA";
    website?: string;
    cycle?: Cycle;
    durationYears?: number;
    ects?: number;
    language?: string;
    semester?: number;
    type?: SubjectType;
  };
}

const INIT_FORM: FormState = {
  entityType: "UNIVERSITY",
  typeOfChange: "CREATE",
  parentId: "",
  targetId: "",
  data: {},
};

const ENTITY_TYPES: EntityType[] = [
  "UNIVERSITY",
  "FACULTY",
  "STUDY_PROGRAM",
  "SUBJECT",
];

const TYPE_OF_CHANGES: TypeOfChange[] = ["CREATE", "UPDATE", "DELETE"];

const CYCLES: Cycle[] = ["FIRST", "SECOND", "THIRD"];

const SUBJECT_TYPES: SubjectType[] = ["MANDATORY", "ELECTIVE"];

const ENTITIES: Entity[] = ["FBIH", "RS", "BD"];

function DataField(props: DataFieldProps) {
  const { label, id } = props;
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={id}>{label}</Label>
      <Input {...props} />
    </div>
  );
}

function AddUniversityEntity({
  setPendingChanges,
}: {
  setPendingChanges: Dispatch<SetStateAction<PendingChange[]>>;
}) {
  const { t, addNotification, serverStatus } = useContext(RootContext);
  const [formState, setFormState] = useState(INIT_FORM);
  const [loading, setLoading] = useState(false);

  const { entityType, typeOfChange, parentId, targetId, data } = formState;

  function setField(field: keyof FormState, value: string) {
    setFormState((prev) => ({ ...prev, [field]: value }));
  }

  function setDataField(
    field: keyof FormState["data"],
    value: string | number,
  ) {
    setFormState((prev) => ({
      ...prev,
      data: { ...prev.data, [field]: value },
    }));
  }

  const needsParent =
    typeOfChange === "CREATE" && entityType && entityType !== "UNIVERSITY";
  const needsTarget = typeOfChange !== "CREATE" && entityType;
  const needsDataFields = typeOfChange !== "DELETE";

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!entityType || !typeOfChange) {
      addNotification({
        type: "error",
        message: "Entity type and change type are required.",
      });
      return;
    }
    await handleSubmitUniversityEntity({
      entityType,
      parentId,
      targetId,
      typeOfChange,
      data,
      setPendingChanges,
      addNotification,
      setLoading,
      setFormState: () => setFormState(INIT_FORM),
      t,
      serverStatus,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 w-full max-w-lg"
    >
      <div className="flex flex-col gap-1 items-center">
        <Label htmlFor="entityType">{t("contribution.entityType")}</Label>
        <Select
          id="entityType"
          name="entityType"
          value={entityType}
          onChange={(e) => setField("entityType", e.target.value)}
          required
        >
          <option value="">{t("contribution.noDataset")}</option>
          {ENTITY_TYPES.map((et) => (
            <option key={et} value={et}>
              {t(`contribution.entityTypes.${et}`)}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-1 items-center">
        <Label htmlFor="typeOfChange">{t("contribution.change")}</Label>
        <Select
          id="typeOfChange"
          name="typeOfChange"
          value={typeOfChange}
          onChange={(e) => setField("typeOfChange", e.target.value)}
          required
        >
          {TYPE_OF_CHANGES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>

      {needsParent && (
        <DataField
          label={`${t("contribution.parentId")} — ${t(`contribution.parentIdHelp.${entityType}`)}`}
          id="parentId"
          type="number"
          min={1}
          required
          value={parentId}
          onChange={(e) => setField("parentId", e.target.value)}
        />
      )}

      {needsTarget && (
        <DataField
          label={`ID`}
          id="targetId"
          type="number"
          min={1}
          required
          value={targetId}
          onChange={(e) => setField("targetId", e.target.value)}
        />
      )}

      {needsDataFields && entityType && (
        <fieldset className="flex flex-col gap-3 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
          <legend className="text-xs font-semibold px-1 text-gray-600 dark:text-gray-300">
            Data
          </legend>

          <DataField
            label={t("contribution.dataFields.name")}
            id="dataName"
            type="text"
            required={typeOfChange === "CREATE"}
            value={data.name ?? ""}
            onChange={(e) => setDataField("name", e.target.value)}
          />

          {entityType === "UNIVERSITY" && (
            <>
              <DataField
                label={t("contribution.dataFields.city")}
                id="dataCity"
                type="text"
                required={typeOfChange === "CREATE"}
                value={data.city ?? ""}
                onChange={(e) => setDataField("city", e.target.value)}
              />
              <div className="flex flex-col gap-1 self-center">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="dataEntity" className="text-center">
                    {t("contribution.dataFields.entity")}
                  </Label>
                  <Select
                    id="dataEntity"
                    value={data.entity ?? ""}
                    onChange={(e) => setDataField("entity", e.target.value)}
                    required={typeOfChange === "CREATE"}
                  >
                    <option value="">—</option>
                    {ENTITIES.map((en) => (
                      <option key={en} value={en}>
                        {t(`contribution.entities.${en}`)}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="dataOwnership" className="text-center">
                    {t("contribution.dataFields.ownership")}
                  </Label>
                  <Select
                    id="dataOwnership"
                    value={data.ownership ?? ""}
                    onChange={(e) => setDataField("ownership", e.target.value)}
                    required={typeOfChange === "CREATE"}
                  >
                    <option value="">—</option>
                    <option value="JAVNA">
                      {t("universitiesPage.ownership.JAVNA")}
                    </option>
                    <option value="PRIVATNA">
                      {t("universitiesPage.ownership.PRIVATNA")}
                    </option>
                  </Select>
                </div>
              </div>
              <DataField
                label={t("contribution.dataFields.website")}
                id="dataWebsite"
                type="url"
                value={data.website ?? ""}
                onChange={(e) => setDataField("website", e.target.value)}
              />
            </>
          )}

          {entityType === "STUDY_PROGRAM" && (
            <>
              <div className="flex flex-col gap-1">
                <Label htmlFor="dataCycle">
                  {t("contribution.dataFields.cycle")}
                </Label>
                <Select
                  id="dataCycle"
                  value={data.cycle ?? ""}
                  onChange={(e) => setDataField("cycle", e.target.value)}
                  required={typeOfChange === "CREATE"}
                >
                  <option value="">—</option>
                  {CYCLES.map((c) => (
                    <option key={c} value={c}>
                      {t(`contribution.cycles.${c}`)}
                    </option>
                  ))}
                </Select>
              </div>
              <DataField
                label={t("contribution.dataFields.durationYears")}
                id="dataDuration"
                type="number"
                min={1}
                max={10}
                value={data.durationYears ?? ""}
                onChange={(e) =>
                  setDataField("durationYears", Number(e.target.value))
                }
              />
              <DataField
                label={t("contribution.dataFields.ects")}
                id="dataEcts"
                type="number"
                min={1}
                value={data.ects ?? ""}
                onChange={(e) => setDataField("ects", Number(e.target.value))}
              />
              <DataField
                label={t("contribution.dataFields.language")}
                id="dataLanguage"
                type="text"
                value={data.language ?? ""}
                onChange={(e) => setDataField("language", e.target.value)}
              />
            </>
          )}

          {entityType === "SUBJECT" && (
            <>
              <DataField
                label={t("contribution.dataFields.semester")}
                id="dataSemester"
                type="number"
                min={1}
                max={12}
                value={data.semester ?? ""}
                onChange={(e) =>
                  setDataField("semester", Number(e.target.value))
                }
              />
              <DataField
                label={t("contribution.dataFields.ects")}
                id="dataSubjectEcts"
                type="number"
                min={1}
                value={data.ects ?? ""}
                onChange={(e) => setDataField("ects", Number(e.target.value))}
              />
              <div className="flex flex-col gap-1">
                <Label htmlFor="dataSubjectType">
                  {t("contribution.dataFields.subjectType")}
                </Label>
                <Select
                  id="dataSubjectType"
                  value={data.type ?? ""}
                  onChange={(e) => setDataField("type", e.target.value)}
                >
                  <option value="">—</option>
                  {SUBJECT_TYPES.map((st) => (
                    <option key={st} value={st}>
                      {t(`contribution.subjectTypes.${st}`)}
                    </option>
                  ))}
                </Select>
              </div>
            </>
          )}
        </fieldset>
      )}

      {entityType && (
        <Button type="submit" loading={loading} className="max-w-xs">
          {t("contribution.submitSuggestion")}
        </Button>
      )}
    </form>
  );
}

export { AddUniversityEntity };
