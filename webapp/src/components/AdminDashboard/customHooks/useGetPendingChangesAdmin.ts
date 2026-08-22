import { SERVER_URL } from "../../../utils/envConfig";
import { use, useEffect, useRef, useState } from "react";
import { RootContext } from "../../../contextData/RootContext";
import { guardedFetch } from "../../../utils/guardedFetch";
import {
  SERVER_STATUS,
  isServerNotReadyError,
} from "../../../utils/serverStatus";
import { readErrorMessage } from "../../../schemas/api";
import {
  adminPendingChangesResponseSchema,
  type AdminPendingChange,
} from "../../../schemas/pendingChange";
import type { TFunction } from "../../../types/i18n";

function useGetPendingChangesAdmin(
  setLoading: (loading: boolean) => void,
  t: TFunction,
) {
  const { addNotification, serverStatus } = use(RootContext);
  const [pendingChanges, setPendingChanges] = useState<AdminPendingChange[]>(
    [],
  );

  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  });

  useEffect(() => {
    if (serverStatus !== SERVER_STATUS.LIVE) {
      setLoading(false);
      return;
    }
    const fetchPendingChanges = async () => {
      try {
        setLoading(true);

        const response = await guardedFetch(
          `${SERVER_URL}/users/admin/pending-changes`,
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
            message: tRef.current("messages.pendingChanges.loadSuccess"),
          });
          return;
        }
        const serverMessage = readErrorMessage(await response.json());
        if (serverMessage) {
          console.warn("Failed to fetch pending changes:", serverMessage);
        }
        addNotification({
          type: "error",
          message: tRef.current("messages.pendingChanges.fetchError"),
        });
      } catch (error) {
        if (isServerNotReadyError(error)) {
          return;
        }

        console.error("Error fetching pending changes:", error);
        addNotification({
          type: "error",
          message: tRef.current("messages.pendingChanges.fetchError"),
        });
      } finally {
        setLoading(false);
      }
    };
    void fetchPendingChanges();
  }, [addNotification, setLoading, serverStatus]);

  return { pendingChanges, setPendingChanges };
}

export { useGetPendingChangesAdmin };
