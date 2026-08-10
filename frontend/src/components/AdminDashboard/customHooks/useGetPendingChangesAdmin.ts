import { BACKEND_URL } from "../../../utils/envConfig";
import { use, useEffect, useState } from "react";
import { RootContext } from "../../../contextData/RootContext";
import { guardedFetch } from "../../../utils/guardedFetch";
import {
  SERVER_STATUS,
  isServerNotReadyError,
} from "../../../utils/serverStatus";
import { readErrorMessage } from "../../../schemas/api";
import { adminPendingChangesResponseSchema } from "../../../schemas/pendingChange";

import type { PendingChange } from "../../ContributionDashboard/customHooks/useGetPendingChanges";
import type { TFunction } from "../../../types/i18n";

function useGetPendingChangesAdmin(
  setLoading: (loading: boolean) => void,
  t: TFunction,
) {
  const { addNotification, serverStatus } = use(RootContext);
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);

  useEffect(() => {
    if (serverStatus !== SERVER_STATUS.LIVE) {
      setLoading(false);
      return;
    }
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
          { serverStatus },
        );

        if (response.ok) {
          const result = adminPendingChangesResponseSchema.parse(
            await response.json(),
          );
          setPendingChanges(result.data);
          addNotification({
            type: "success",
            message: t("messages.pendingChanges.loadSuccess"),
          });
          return;
        }
        const serverMessage = readErrorMessage(await response.json());
        if (serverMessage) {
          console.warn("Failed to fetch pending changes:", serverMessage);
        }
        addNotification({
          type: "error",
          message: t("messages.pendingChanges.fetchError"),
        });
      } catch (error) {
        if (isServerNotReadyError(error)) {
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
