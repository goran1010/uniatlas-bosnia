import { BACKEND_URL } from "../../../utils/envConfig";
import { use, useEffect, useState } from "react";
import { RootContext } from "../../../contextData/RootContext";
import { guardedFetch } from "../../../utils/guardedFetch";

import type { PendingChange } from "../../ContributionDashboard/customHooks/useGetPendingChanges";
import type { TFunction } from "../../../customHooks/useLanguage";

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

        const result = await response.json();

        if (response.ok) {
          setPendingChanges(result.data);
          addNotification({
            type: "success",
            message: result.message,
          });
          return;
        }
        addNotification({
          type: "error",
          message:
            result?.error?.message ??
            result?.error ??
            t("messages.pendingChanges.loadFailed"),
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
    fetchPendingChanges();
  }, [addNotification, setLoading, serverStatus, t]);

  return { pendingChanges, setPendingChanges };
}

export { useGetPendingChangesAdmin };
