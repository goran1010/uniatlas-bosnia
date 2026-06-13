import { BACKEND_URL } from "../../../utils/envConfig";
import { getCsrfToken } from "../../utils/getCsrfToken";
import { guardedFetch } from "../../../utils/guardedFetch";

import type { ServerStatus } from "../../../utils/serverStatus";
import type { TFunction } from "../../../customHooks/useLanguage";
import type { AddNotification } from "../../../customHooks/useNotification";
import type { PendingChange } from "../customHooks/useGetPendingChanges";
import type { Dispatch, SetStateAction } from "react";

export interface HandleSubmitUniversityEntityParams {
  entityType: string;
  parentId?: string;
  targetId?: string;
  typeOfChange: "CREATE" | "UPDATE" | "DELETE";
  data: Record<string, unknown>;
  setPendingChanges: Dispatch<SetStateAction<PendingChange[]>>;
  addNotification: AddNotification;
  setLoading: (loading: boolean) => void;
  setFormState: (formState: {
    entityType: string;
    parentId?: string;
    targetId?: string;
    data: Record<string, unknown>;
  }) => void;
  t: TFunction;
  serverStatus: ServerStatus;
}

interface StatusSuccessResponse {
  message: string;
  data: PendingChange;
}

interface StatusErrorResponse {
  error: {
    message: string;
  };
}

async function parseJson<T>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
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
      const result = await parseJson<StatusSuccessResponse>(response);
      setPendingChanges((prev) => [result.data, ...prev]);
      addNotification({ type: "success", message: result.message });
      setFormState({ entityType: "", parentId: "", targetId: "", data: {} });
      return;
    }
    const result = await parseJson<StatusErrorResponse>(response);
    addNotification({
      type: "error",
      message: result.error.message,
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
