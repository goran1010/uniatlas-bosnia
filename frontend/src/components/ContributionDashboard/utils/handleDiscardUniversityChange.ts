import { BACKEND_URL } from "../../../utils/envConfig";
import { getCsrfToken } from "../../utils/getCsrfToken";
import { guardedFetch } from "../../../utils/guardedFetch";

import type { ServerStatus } from "../../../utils/serverStatus";
import type { TFunction } from "../../../customHooks/useLanguage";
import type { AddNotification } from "../../../customHooks/useNotification";
import type { PendingChange } from "../customHooks/useGetPendingChanges";
import type { Dispatch, SetStateAction } from "react";

interface HandleDiscardUniversityChangeParams {
  changeId: string;
  setPendingChanges: Dispatch<SetStateAction<PendingChange[]>>;
  addNotification: AddNotification;
  setLoading: (loading: boolean) => void;
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

async function handleDiscardUniversityChange({
  changeId,
  setPendingChanges,
  addNotification,
  setLoading,
  t,
  serverStatus,
}: HandleDiscardUniversityChangeParams) {
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

    const response = await guardedFetch(
      `${BACKEND_URL}/users/contribution/pending-changes/universities`,
      {
        method: "DELETE",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        body: JSON.stringify({ id: changeId }),
        credentials: "include",
      },
      { serverStatus, addNotification, t },
    );

    if (response.ok) {
      const result = await parseJson<StatusSuccessResponse>(response);
      setPendingChanges((prev) => prev.filter((c) => c.id !== changeId));
      addNotification({ type: "success", message: result.message });
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
      message: t("messages.universities.deleteError"),
    });
    console.error("Error discarding pending change:", err);
  } finally {
    setLoading(false);
  }
}

export { handleDiscardUniversityChange };
