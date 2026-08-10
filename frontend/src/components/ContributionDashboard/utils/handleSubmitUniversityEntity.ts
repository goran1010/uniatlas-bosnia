import { BACKEND_URL } from "../../../utils/envConfig";
import { readErrorMessage } from "../../../schemas/api";
import { contributionSubmissionSchema } from "../../../schemas/contribution";
import { pendingChangeResponseSchema } from "../../../schemas/pendingChange";
import { getCsrfToken } from "../../utils/getCsrfToken";
import { guardedFetch } from "../../../utils/guardedFetch";
import { isServerNotReadyError } from "../../../utils/serverStatus";

import type { ServerStatus } from "../../../utils/serverStatus";
import type { TFunction } from "../../../types/i18n";
import type { AddNotification } from "../../../types/notification";
import type { ContributionFormDraft, PendingChange } from "../types";
import type { Dispatch, SetStateAction } from "react";

export interface HandleSubmitUniversityEntityParams {
  entityType: string;
  parentId?: string;
  targetId?: string;
  typeOfChange: "CREATE" | "UPDATE" | "DELETE";
  data: ContributionFormDraft;
  setPendingChanges: Dispatch<SetStateAction<PendingChange[]>>;
  addNotification: AddNotification;
  setLoading: (loading: boolean) => void;
  setFormState: (formState: {
    entityType: string;
    parentId?: string;
    targetId?: string;
    data: ContributionFormDraft;
  }) => void;
  t: TFunction;
  serverStatus: ServerStatus;
}

async function getErrorMessage(response: Response) {
  try {
    return readErrorMessage(await response.json());
  } catch {
    return null;
  }
}

async function handleSubmitUniversityEntity({
  entityType,
  parentId,
  targetId,
  typeOfChange,
  data,
  setPendingChanges,
  addNotification,
  setLoading,
  setFormState,
  t,
  serverStatus,
}: HandleSubmitUniversityEntityParams) {
  try {
    setLoading(true);

    const submissionInput =
      typeOfChange === "CREATE" && entityType === "UNIVERSITY"
        ? { entityType, typeOfChange, data }
        : typeOfChange === "CREATE"
          ? { entityType, typeOfChange, parentId, data }
          : typeOfChange === "UPDATE"
            ? { entityType, typeOfChange, targetId, data }
            : { entityType, typeOfChange, targetId };
    const submission = contributionSubmissionSchema.parse(submissionInput);

    const csrfToken = await getCsrfToken({ serverStatus, addNotification, t });

    if (!csrfToken) {
      addNotification({
        type: "error",
        message: t("messages.csrfTokenFailed"),
      });
      return;
    }

    const method =
      submission.typeOfChange === "CREATE"
        ? "POST"
        : submission.typeOfChange === "UPDATE"
          ? "PUT"
          : "DELETE";
    const body =
      submission.typeOfChange === "CREATE"
        ? "parentId" in submission
          ? {
              entityType: submission.entityType,
              parentId: submission.parentId,
              data: submission.data,
            }
          : { entityType: submission.entityType, data: submission.data }
        : submission.typeOfChange === "UPDATE"
          ? {
              entityType: submission.entityType,
              targetId: submission.targetId,
              data: submission.data,
            }
          : {
              entityType: submission.entityType,
              targetId: submission.targetId,
            };

    const response = await guardedFetch(
      `${BACKEND_URL}/users/contribution/universities`,
      {
        method,
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        body: JSON.stringify(body),
        credentials: "include",
      },
      { serverStatus },
    );

    if (response.ok) {
      const result = pendingChangeResponseSchema.parse(await response.json());
      setPendingChanges((prev) => [result.data, ...prev]);
      addNotification({
        type: "success",
        message: t("messages.universities.addSuccess"),
      });
      setFormState({ entityType: "", parentId: "", targetId: "", data: {} });
      return;
    }
    const serverMessage = await getErrorMessage(response);
    if (serverMessage) {
      console.warn("Failed to submit university change:", serverMessage);
    }
    addNotification({
      type: "error",
      message: t("messages.universities.addError"),
    });
  } catch (err) {
    if (isServerNotReadyError(err)) {
      return;
    }
    addNotification({
      type: "error",
      message: t("messages.universities.addError"),
    });
    console.error("Error submitting university entity:", err);
  } finally {
    setLoading(false);
  }
}

export { handleSubmitUniversityEntity };
