import { use } from "react";
import { RootContext } from "../../contextData/RootContext";

import type { TFunction } from "../../types/i18n";

interface DetailRow {
  label: string;
  value: string | number;
}

function buildEntityRows(
  entityType: string,
  entity: Record<string, unknown>,
  t: TFunction,
): DetailRow[] {
  const rows: DetailRow[] = [];

  function push(label: string, raw: unknown) {
    if (typeof raw !== "string" && typeof raw !== "number") return;
    rows.push({ label, value: raw });
  }

  push(t("contribution.dataFields.name"), entity.name);

  switch (entityType) {
    case "UNIVERSITY":
      push(t("contribution.dataFields.city"), entity.city);
      if (typeof entity.entity === "string") {
        push(
          t("contribution.dataFields.entity"),
          t(`contribution.entities.${entity.entity}`),
        );
      }
      if (typeof entity.ownership === "string") {
        push(
          t("contribution.dataFields.ownership"),
          t(`universitiesPage.ownership.${entity.ownership}`),
        );
      }
      push(t("universitiesPage.foundedYear"), entity.foundedYear);
      push(t("contribution.dataFields.website"), entity.website);
      break;
    case "FACULTY":
      push(t("contribution.dataFields.city"), entity.city);
      push(t("contribution.dataFields.website"), entity.website);
      break;
    case "STUDY_PROGRAM":
      if (typeof entity.cycle === "string") {
        push(
          t("contribution.dataFields.cycle"),
          t(`contribution.cycles.${entity.cycle}`),
        );
      }
      push(t("contribution.dataFields.durationYears"), entity.durationYears);
      push(t("contribution.dataFields.ects"), entity.ects);
      push(t("contribution.dataFields.language"), entity.language);
      break;
    case "SUBJECT":
      push(t("contribution.dataFields.semester"), entity.semester);
      push(t("contribution.dataFields.ects"), entity.ects);
      if (typeof entity.type === "string") {
        push(
          t("contribution.dataFields.subjectType"),
          t(`contribution.subjectTypes.${entity.type}`),
        );
      }
      break;
  }

  return rows;
}

function DataCard({ heading, rows }: { heading: string; rows: DetailRow[] }) {
  if (rows.length === 0) return null;

  return (
    <div className="flex flex-col gap-1 rounded-lg border border-(--border-color) bg-(--surface-2) p-3">
      <p className="text-xs font-semibold text-(--text-secondary)">{heading}</p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="contents">
            <dt className="font-medium text-(--text-secondary)">{row.label}</dt>
            <dd className="text-(--text-primary) wrap-break-word">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

interface PendingChangeDetailProps {
  entityType: string;
  typeOfChange: string;
  data: Record<string, unknown>;
  currentEntity?: Record<string, unknown> | null;
}

function PendingChangeDetail({
  entityType,
  typeOfChange,
  data: proposedData,
  currentEntity,
}: PendingChangeDetailProps) {
  const { t } = use(RootContext);

  const hasProposedFields = Object.keys(proposedData).length > 0;

  return (
    <div className="flex flex-col gap-2 p-2 sm:p-3">
      {typeOfChange === "CREATE" && hasProposedFields && (
        <DataCard
          heading={t("admin.proposedData")}
          rows={buildEntityRows(entityType, proposedData, t)}
        />
      )}

      {typeOfChange === "UPDATE" && (
        <>
          {currentEntity ? (
            <DataCard
              heading={t("admin.currentData")}
              rows={buildEntityRows(entityType, currentEntity, t)}
            />
          ) : currentEntity === null ? (
            <p className="text-xs italic text-(--text-secondary)">
              {t("admin.entityDeleted")}
            </p>
          ) : null}
          {hasProposedFields && (
            <DataCard
              heading={t("admin.proposedChanges")}
              rows={buildEntityRows(entityType, proposedData, t)}
            />
          )}
        </>
      )}

      {typeOfChange === "DELETE" && (
        <>
          {currentEntity ? (
            <DataCard
              heading={t("admin.currentData")}
              rows={buildEntityRows(entityType, currentEntity, t)}
            />
          ) : (
            <p className="text-xs italic text-(--text-secondary)">
              {t("admin.entityDeleted")}
            </p>
          )}
        </>
      )}
    </div>
  );
}

export { PendingChangeDetail };
