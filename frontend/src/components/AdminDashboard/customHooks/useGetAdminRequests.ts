import { BACKEND_URL } from "../../../utils/envConfig";
import { use, useEffect, useRef, useState } from "react";
import { RootContext } from "../../../contextData/RootContext";
import { guardedFetch } from "../../../utils/guardedFetch";
import {
  SERVER_STATUS,
  isServerNotReadyError,
} from "../../../utils/serverStatus";
import { readErrorMessage } from "../../../schemas/api";
import { adminRequestsResponseSchema } from "../../../schemas/adminRequest";

import type { AdminRequest } from "../../../schemas/adminRequest";
import type { TFunction } from "../../../types/i18n";

function useGetAdminRequests(
  setLoading: (loading: boolean) => void,
  t: TFunction,
) {
  const { addNotification, serverStatus } = use(RootContext);
  const [adminRequests, setAdminRequests] = useState<AdminRequest[]>([]);

  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  });

  useEffect(() => {
    if (serverStatus !== SERVER_STATUS.LIVE) {
      setLoading(false);
      return;
    }
    const fetchAdminRequests = async () => {
      try {
        setLoading(true);

        const response = await guardedFetch(
          `${BACKEND_URL}/users/admin/admin-requests`,
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
          const result = adminRequestsResponseSchema.parse(
            await response.json(),
          );
          setAdminRequests(result.data);
          return;
        }
        const serverMessage = readErrorMessage(await response.json());
        if (serverMessage) {
          console.warn("Failed to fetch admin requests:", serverMessage);
        }
        addNotification({
          type: "error",
          message: tRef.current("messages.adminRequest.fetchError"),
        });
      } catch (error) {
        if (isServerNotReadyError(error)) {
          return;
        }

        console.error("Error fetching admin requests:", error);
        addNotification({
          type: "error",
          message: tRef.current("messages.adminRequest.fetchError"),
        });
      } finally {
        setLoading(false);
      }
    };
    void fetchAdminRequests();
  }, [addNotification, setLoading, serverStatus]);

  return { adminRequests, setAdminRequests };
}

export { useGetAdminRequests };
