import { useEffect, useRef, useState } from "react";
import { SERVER_STATUS_NOTIFICATION_ID } from "../utils/serverStatus";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const ALLOWED_ATTEMPTS = 30;
const DELAY_BETWEEN_ATTEMPTS = 2000;

import { type ServerStatus } from "../utils/serverStatus";
import type { AddNotification, RemoveNotification } from "./useNotification";
import type { TFunction } from "./useLanguage";

interface UseServerWakeUp {
  addNotification: AddNotification;
  removeNotification: RemoveNotification;
  t: TFunction;
}

function useServerWakeUp({
  addNotification,
  removeNotification,
  t,
}: UseServerWakeUp) {
  const [serverStatus, setServerStatus] = useState<ServerStatus>("live");
  const tRef = useRef(t);

  useEffect(() => {
    // Limit the number of wake-up attempts to prevent infinite loops
    let isCancelled = false;
    let currentNumberOfAttempts = 0;
    let retryTimeoutId: number;

    setServerStatus("waking");

    async function checkServer() {
      if (isCancelled) {
        return;
      }

      if (currentNumberOfAttempts >= ALLOWED_ATTEMPTS) {
        setServerStatus("down");
        addNotification({
          id: SERVER_STATUS_NOTIFICATION_ID,
          type: "error",
          message: tRef.current("longWait.unreachable"),
          duration: null,
          persistent: true,
        });
        console.error(
          "Server can't be reached after multiple attempts. Please try again later.",
        );
        return;
      }

      try {
        const response = await fetch(`${BACKEND_URL}/api`, {
          method: "GET",
          mode: "cors",
          signal: AbortSignal.timeout(5000),
        });

        if (!response.ok) {
          addNotification({
            id: SERVER_STATUS_NOTIFICATION_ID,
            type: "warning",
            message: tRef.current("longWait.wakingUp"),
            duration: null,
            persistent: true,
          });
          retryTimeoutId = setTimeout(() => {
            currentNumberOfAttempts++;
            checkServer();
          }, DELAY_BETWEEN_ATTEMPTS);
          return;
        }

        setServerStatus("live");
        removeNotification(SERVER_STATUS_NOTIFICATION_ID);
      } catch (err) {
        if (isCancelled) {
          return;
        }

        console.error(err);
        retryTimeoutId = setTimeout(() => {
          currentNumberOfAttempts++;
          checkServer();
        }, DELAY_BETWEEN_ATTEMPTS);
      }
    }

    checkServer();

    return () => {
      isCancelled = true;
      clearTimeout(retryTimeoutId);
      removeNotification(SERVER_STATUS_NOTIFICATION_ID);
    };
  }, [addNotification, removeNotification]);

  return serverStatus;
}

export { useServerWakeUp };
