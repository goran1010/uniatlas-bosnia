import { SERVER_STATUS, SERVER_STATUS_NOTIFICATION_ID } from "./serverStatus";

import type { AddNotification } from "../customHooks/useNotification";
import type { TFunction } from "../customHooks/useLanguage";
import type { ServerStatus } from "./serverStatus";

export type Url = string;
export type FetchOptions = Parameters<typeof fetch>[1];
export type Guard = {
  serverStatus: ServerStatus;
  addNotification: AddNotification;
  t: TFunction;
};

type GuardedFetch = (
  url: Url,
  options: FetchOptions,
  guard: Guard,
) => Promise<Response> | null;

interface NotifyServerNotReadyParams {
  serverStatus?: ServerStatus;
  addNotification?: AddNotification;
  t: TFunction;
}

function notifyServerNotReady({
  serverStatus,
  addNotification,
  t,
}: NotifyServerNotReadyParams) {
  if (typeof addNotification !== "function") {
    return;
  }

  const isDown = serverStatus === SERVER_STATUS.DOWN;

  addNotification({
    id: SERVER_STATUS_NOTIFICATION_ID,
    type: isDown ? "error" : "warning",
    message: t(isDown ? "longWait.unreachable" : "longWait.wakingUp"),
    duration: null,
    persistent: true,
  });
}

const guardedFetch: GuardedFetch = (url, options, guard) => {
  const { serverStatus } = guard;
  const shouldBlock =
    serverStatus === SERVER_STATUS.WAKING ||
    serverStatus === SERVER_STATUS.DOWN;

  if (shouldBlock) {
    notifyServerNotReady(guard);
    return null;
  }

  return fetch(url, options);
};

export { guardedFetch, notifyServerNotReady };
