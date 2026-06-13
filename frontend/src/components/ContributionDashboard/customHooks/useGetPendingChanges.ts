import { BACKEND_URL } from "../../../utils/envConfig";
import { use, useEffect, useState } from "react";
import { RootContext } from "../../../contextData/RootContext";
import { guardedFetch } from "../../../utils/guardedFetch";

import type { TFunction } from "../../../customHooks/useLanguage";
import type { UserData } from "../../../customHooks/useStatusCheck";

export interface PendingChange {
  id: string;
  entityType: "UNIVERSITY" | "FACULTY" | "STUDY_PROGRAM" | "SUBJECT";
  typeOfChange: "CREATE" | "UPDATE" | "DELETE";
  targetId: number | null;
  parentId: number | null;
  data: UserData;
  userId: string;
  user: UserData;
  createdAt: Date;
}

interface StatusSuccessResponse {
  message: string;
  data: PendingChange[];
}

interface StatusErrorResponse {
  error: {
    message: string;
  };
}

async function parseJson<T>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
}

function useGetPendingChanges(
  setLoading: (loading: boolean) => void,
  t: TFunction,
  enabled = true,
) {
  const { addNotification, serverStatus } = use(RootContext);
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);

  useEffect(() => {
    if (!enabled) return;
    const fetchPendingChanges = async () => {
      try {
        setLoading(true);

        const response = await guardedFetch(
          `${BACKEND_URL}/users/contribution/pending-changes/universities`,
          {
            method: "GET",
            mode: "cors",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          },
          {
            serverStatus,
            addNotification,
            t,
          },
        );

        if (response.ok) {
          const result = await parseJson<StatusSuccessResponse>(response);
          setPendingChanges(result.data);
          addNotification({
            type: "success",
            message: result.message,
          });
          return;
        }
        const result = await parseJson<StatusErrorResponse>(response);
        addNotification({
          type: "error",
          message: result.error.message,
        });
      } catch (error) {
        console.error("Error fetching pending changes:", error);
        addNotification({
          type: "error",
          message: t("messages.pendingChanges.fetchError"),
        });
      } finally {
        setLoading(false);
      }
    };
    void fetchPendingChanges();
  }, [addNotification, enabled, setLoading, serverStatus, t]);

  return { pendingChanges, setPendingChanges };
}

export { useGetPendingChanges };
