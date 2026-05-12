import { useEffect, useState } from "react";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function useStatusCheck(setLoading, addNotification, longWait) {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    let isCancelled = false;
    const abortController = new AbortController();
    let checkLoginTimeoutId;

    async function checkLogin() {
      let response;
      try {
        response = await fetch(`${BACKEND_URL}/api/me`, {
          method: "GET",
          signal: abortController.signal,
        });

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
          setLoading(false);
          return;
        }

        addNotification({
          type: "success",
          message: result.message || "Login status verified.",
        });
        setLoading(false);
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
        setLoading(false);
      }
    }
    if (!longWait) {
      // Need to add a slight delay before checking the server status to avoid race conditions ?!
      // To-Do : Implement a more robust solution for this
      checkLoginTimeoutId = setTimeout(() => {
        if (!isCancelled) {
          checkLogin();
        }
      }, 100);
    }

    return () => {
      isCancelled = true;
      abortController.abort();
      clearTimeout(checkLoginTimeoutId);
    };
  }, [addNotification, setLoading, longWait]);

  return { userData, setUserData };
}

export { useStatusCheck };
