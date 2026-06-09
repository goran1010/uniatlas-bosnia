const BACKEND_URL: string | undefined = import.meta.env.VITE_BACKEND_URL;

import { guardedFetch } from "../../utils/guardedFetch";

import type { ServerStatus } from "../../utils/serverStatus";
import type { AddNotification } from "../../customHooks/useNotification";
import type { TFunction } from "../../customHooks/useLanguage";

let cachedToken: string | null = null;

async function getCsrfToken({
  serverStatus,
  addNotification,
  t,
}: {
  serverStatus: ServerStatus;
  addNotification: AddNotification;
  t: TFunction;
}): Promise<string> {
  if (!BACKEND_URL) {
    throw new Error("VITE_BACKEND_URL is not defined");
  }
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
