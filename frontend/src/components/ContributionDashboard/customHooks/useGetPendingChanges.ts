import { BACKEND_URL } from "../../../utils/envConfig";
import { use, useEffect, useState } from "react";
import { RootContext } from "../../../contextData/RootContext";
import { guardedFetch } from "../../../utils/guardedFetch";
import { pendingChangesResponseSchema } from "../../../schemas/pendingChange";

import type { TFunction } from "../../../types/i18n";
import type { PendingChange } from "../types";

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
          const result = pendingChangesResponseSchema.parse(
            await response.json(),
          );
          setPendingChanges(result.data);
          addNotification({
            type: "success",
            message: t("messages.pendingChanges.loadSuccess"),
          });
          return;
        }
        const message = t("messages.pendingChanges.fetchError");
        addNotification({
          type: "error",
          message,
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
export type { PendingChange } from "../types";
