import { BACKEND_URL } from "../../../utils/envConfig";
import { readErrorMessage } from "../../../schemas/api";
import { pendingChangeResponseSchema } from "../../../schemas/pendingChange";
import { getCsrfToken } from "../../utils/getCsrfToken";
import { guardedFetch } from "../../../utils/guardedFetch";

import type { ServerStatus } from "../../../utils/serverStatus";
import type { TFunction } from "../../../types/i18n";
import type { AddNotification } from "../../../types/notification";
import type { ContributionFormData, PendingChange } from "../types";
import type { Dispatch, SetStateAction } from "react";

export interface HandleSubmitUniversityEntityParams {
  entityType: string;
  parentId?: string;
  targetId?: string;
  typeOfChange: "CREATE" | "UPDATE" | "DELETE";
  data: ContributionFormData;
  setPendingChanges: Dispatch<SetStateAction<PendingChange[]>>;
  addNotification: AddNotification;
  setLoading: (loading: boolean) => void;
  setFormState: (formState: {
    entityType: string;
    parentId?: string;
    targetId?: string;
    data: ContributionFormData;
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
    const csrfToken = await getCsrfToken({ serverStatus, addNotification, t });

    if (!csrfToken) {
      addNotification({
        type: "error",
        message: t("messages.csrfTokenFailed"),
      });
      return;
    }

    const method =
      typeOfChange === "CREATE"
        ? "POST"
        : typeOfChange === "UPDATE"
          ? "PUT"
          : "DELETE";
    const body =
      typeOfChange === "CREATE"
        ? {
            entityType,
            parentId: parentId ? Number(parentId) : undefined,
            data,
          }
        : typeOfChange === "UPDATE"
          ? { entityType, targetId: Number(targetId), data }
          : { entityType, targetId: Number(targetId) };

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
      { serverStatus, addNotification, t },
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
