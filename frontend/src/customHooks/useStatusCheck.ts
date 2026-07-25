import { useEffect, useState, useRef } from "react";
import { guardedFetch } from "../utils/guardedFetch";
import { BACKEND_URL } from "../utils/envConfig";
import { currentUserResponseSchema } from "../schemas/auth";

import type { Notification } from "../types/notification";
import type { ServerStatus } from "../utils/serverStatus";
import type { UserData } from "../types/auth";

type AddNotificationFunction = (notification: Notification) => string;

export type { UserData } from "../types/auth";
export type Message = string | null;

function useStatusCheck(
  addNotification: AddNotificationFunction,
  t: (key: string) => string,
  serverStatus: ServerStatus,
) {
  const [userData, setUserData] = useState<UserData>(null);
  const tRef = useRef(t);

  useEffect(() => {
    tRef.current = t;
  }, [t]);

  useEffect(() => {
    let isCancelled = false;
    const abortController = new AbortController();

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

        if (!response.ok) {
          const message = tRef.current("loginStatus.error");

          if (isCancelled) {
            return;
          }

          addNotification({
            type: "error",
            message,
          });

          return;
        }

        const result = currentUserResponseSchema.parse(await response.json());

        if (isCancelled) {
          return;
        }

        addNotification({
          type: "success",
          message: tRef.current("messages.loginStatus.success"),
        });

        setUserData(result.data);
      } catch (err) {
        if (isCancelled) {
          return;
        }

        addNotification({
          type: "error",
          message: tRef.current("messages.loginStatus.error"),
        });

        console.error("Error checking login status:", err);
      }
    }

    const loginTimeoutId = setTimeout(() => {
      if (!isCancelled) {
        void checkLogin();
      }
    }, 100);

    return () => {
      isCancelled = true;
      abortController.abort();

      if (loginTimeoutId) {
        clearTimeout(loginTimeoutId);
      }
    };
  }, [addNotification, serverStatus]);

  return { userData, setUserData };
}

export { useStatusCheck };
