import { useEffect, useState } from "react";
import { guardedFetch } from "../utils/guardedFetch";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function useStatusCheck(addNotification, t, serverStatus) {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    let isCancelled = false;
    const abortController = new AbortController();
    let checkLoginTimeoutId;

    async function checkLogin() {
      let response;
      try {
        response = await guardedFetch(
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
            t,
          },
        );

        if (!response) {
          return;
        }

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
              "Failed to check login status.",
          });
          return;
        }

        addNotification({
          type: "success",
          message: result.message || "Login status verified.",
        });
        setUserData(result.data);
      } catch (err) {
        if (isCancelled || err?.name === "AbortError") {
          return;
        }
        addNotification({
          type: "error",
          message: "An error occurred while checking login status.",
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
  }, [addNotification, t, serverStatus]);

  return { userData, setUserData };
}

export { useStatusCheck };
