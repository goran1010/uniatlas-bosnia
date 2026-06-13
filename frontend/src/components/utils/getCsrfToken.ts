import { BACKEND_URL } from "../../utils/envConfig";
import { guardedFetch } from "../../utils/guardedFetch";

import type { ServerStatus } from "../../utils/serverStatus";
import type { AddNotification } from "../../types/notification";
import type { TFunction } from "../../types/i18n";

let cachedToken: string | null = null;

interface StatusSuccessResponse {
  message: string;
  data: string;
}

async function parseJson<T>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
}

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
    const { data: csrfToken } =
      await parseJson<StatusSuccessResponse>(csrfResponse);
    cachedToken = csrfToken;

    return csrfToken;
  } catch (error) {
    addNotification({
      type: "error",
      message: "Error fetching CSRF token",
    });
    console.error("Error fetching CSRF token:", error);
    throw new Error("Failed to fetch CSRF token", { cause: error });
  }
}

function clearCsrfToken() {
  cachedToken = null;
}

export { getCsrfToken, clearCsrfToken };
