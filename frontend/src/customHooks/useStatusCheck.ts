import { useEffect, useState, useRef } from "react";
import { guardedFetch } from "../utils/guardedFetch";
import { BACKEND_URL } from "../utils/envConfig";

import type { Notification } from "./useNotification";
import type { ServerStatus } from "../utils/serverStatus";

type AddNotificationFunction = (notification: Notification) => string;

export type UserData = {
  email: string;
  role: string;
} | null;

function useStatusCheck(
  addNotification: AddNotificationFunction,
  t: (key: string) => string,
  serverStatus: ServerStatus,
) {
  const [userData, setUserData] = useState<UserData>(null);

  const tRef = useRef(t);

  useEffect(() => {
    let isCancelled = false;
    const abortController = new AbortController();
    let checkLoginTimeoutId;

    async function checkLogin() {
      try {
        const response = await guardedFetch(
          `${BACKEND_URL}/users/me`,
          {
            mode: "cors",
            method: "GET",
            credentials: "include",
            signal: abortController.signal,
          },
          {
            serverStatus,
            addNotification,
            t: tRef.current,
          },
        );

        const result = await response.json();

        if (isCancelled) {
          return;
        }

        if (!response.ok) {
          addNotification({
            type: "error",
            message:
              result?.error?.message ||
              result?.error ||
              tRef.current("loginStatus.failed"),
          });
          return;
        }

        addNotification({
          type: "success",
          message: result.message || tRef.current("loginStatus.success"),
        });
        setUserData(result.data);
      } catch (err) {
        if (isCancelled) {
          return;
        }
        addNotification({
          type: "error",
          message: tRef.current("loginStatus.error"),
        });
        console.error("Error checking login status:", err);
      }
    }

    // Need to add a slight delay before checking the server status to avoid race conditions ?!
    // To-Do : Implement a more robust solution for this
    checkLoginTimeoutId = setTimeout(() => {
      if (!isCancelled) {
        checkLogin();
      }
    }, 100);

    return () => {
      isCancelled = true;
      abortController.abort();
      clearTimeout(checkLoginTimeoutId);
    };
  }, [addNotification, serverStatus]);

  return { userData, setUserData };
}

export { useStatusCheck };
