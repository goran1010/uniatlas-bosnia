import { BACKEND_URL } from "../../utils/envConfig";
import { csrfTokenResponseSchema } from "../../schemas/auth";
import { guardedFetch } from "../../utils/guardedFetch";
import { isServerNotReadyError } from "../../utils/serverStatus";

import type { ServerStatus } from "../../utils/serverStatus";
import type { AddNotification } from "../../types/notification";
import type { TFunction } from "../../types/i18n";

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
      { serverStatus },
    );
    const { data: csrfToken } = csrfTokenResponseSchema.parse(
      await csrfResponse.json(),
    );
    cachedToken = csrfToken;

    return csrfToken;
  } catch (error) {
    if (isServerNotReadyError(error)) {
      throw error;
    }
    addNotification({
      type: "error",
      message: t("messages.csrfTokenFailed"),
    });
    console.error("Error fetching CSRF token:", error);
    throw new Error("Failed to fetch CSRF token", { cause: error });
  }
}

function clearCsrfToken() {
  cachedToken = null;
}

export { getCsrfToken, clearCsrfToken };
