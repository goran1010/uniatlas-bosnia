const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
import { guardedFetch } from "../../utils/guardedFetch";

let cachedToken = null;

async function getCsrfToken({ serverStatus, addNotification, t }) {
  try {
    if (cachedToken) {
      return cachedToken;
    }

    const csrfResponse = await guardedFetch(
      `${BACKEND_URL}/csrf-token`,
      {
        mode: "cors",
        credentials: "include",
      },
      {
        serverStatus,
        addNotification,
        t,
      },
    );

    if (!csrfResponse) {
      return null;
    }

    if (!csrfResponse.ok) {
      return null;
    }

    const { data: csrfToken } = await csrfResponse.json();
    cachedToken = csrfToken;
    return csrfToken;
  } catch (error) {
    console.error("Error fetching CSRF token:", error);
    throw new Error("Failed to fetch CSRF token");
  }
}

function clearCsrfToken() {
  cachedToken = null;
}

export { getCsrfToken, clearCsrfToken };
