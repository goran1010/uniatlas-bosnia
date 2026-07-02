import { BACKEND_URL } from "../../../utils/envConfig";
import { use, useEffect, useState } from "react";
import { RootContext } from "../../../contextData/RootContext";
import { guardedFetch } from "../../../utils/guardedFetch";

import type { PendingChange } from "../../ContributionDashboard/customHooks/useGetPendingChanges";
import type { TFunction } from "../../../types/i18n";

interface StatusSuccessResponse {
  message: string;
  data: PendingChange[];
}

async function parseJson<T>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
}

async function readErrorMessage(response: Response) {
  try {
    const result = (await response.json()) as {
      error?: { message?: string };
      message?: string;
    };

    return result.error?.message ?? result.message ?? null;
  } catch {
    return null;
  }
}

function useGetPendingChangesAdmin(
  setLoading: (loading: boolean) => void,
  t: TFunction,
) {
  const { addNotification, serverStatus } = use(RootContext);
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);

  useEffect(() => {
    const fetchPendingChanges = async () => {
      try {
        setLoading(true);

        const response = await guardedFetch(
          `${BACKEND_URL}/users/admin/pending-changes`,
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
        const message =
          (await readErrorMessage(response)) ??
          t("messages.pendingChanges.fetchError");
        addNotification({
          type: "error",
          message,
        });
      } catch (error) {
        if (error instanceof Error && error.message === "Server is not ready") {
          return;
        }

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
  }, [addNotification, setLoading, serverStatus, t]);

  return { pendingChanges, setPendingChanges };
}

export { useGetPendingChangesAdmin };
