import { useEffect, useState, useRef } from "react";
import { guardedFetch } from "../utils/guardedFetch";
import { BACKEND_URL } from "../utils/envConfig";

import type { Notification } from "../types/notification";
import type { ServerStatus } from "../utils/serverStatus";
import type { UserData } from "../types/auth";

type AddNotificationFunction = (notification: Notification) => string;

export type { UserData } from "../types/auth";
export type Message = string | null;

interface StatusSuccessResponse {
  message: Message;
  data: UserData;
}

interface StatusErrorResponse {
  error: {
    message: string;
  };
}

async function parseJson<T>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
}

function useStatusCheck(
  addNotification: AddNotificationFunction,
  t: (key: string) => string,
  serverStatus: ServerStatus,
) {
  const [userData, setUserData] = useState<UserData>(null);
  const tRef = useRef(t);
  const checkLoginTimeoutId = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

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
          const result = await parseJson<StatusErrorResponse>(response);

          if (isCancelled) {
            return;
          }

          addNotification({
            type: "error",
            message: result.error.message,
          });

          return;
        }

        const result = await parseJson<StatusSuccessResponse>(response);

        if (isCancelled) {
          return;
        }

        addNotification({
          type: "success",
          message: result.message ?? tRef.current("loginStatus.success"),
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

    checkLoginTimeoutId.current = setTimeout(() => {
      if (!isCancelled) {
        void checkLogin();
      }
    }, 100);

    return () => {
      isCancelled = true;
      abortController.abort();

      if (checkLoginTimeoutId.current !== null) {
        clearTimeout(checkLoginTimeoutId.current);
      }
    };
  }, [addNotification, serverStatus]);

  return { userData, setUserData };
}

export { useStatusCheck };
