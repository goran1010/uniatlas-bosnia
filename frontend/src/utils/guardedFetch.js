import { SERVER_STATUS, SERVER_STATUS_NOTIFICATION_ID } from "./serverStatus";

function notifyServerNotReady({ serverStatus, addNotification, t }) {
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

async function guardedFetch(url, options, guard) {
  const { serverStatus } = guard || {};
  const shouldBlock =
    serverStatus === SERVER_STATUS.WAKING ||
    serverStatus === SERVER_STATUS.DOWN;

  if (shouldBlock) {
    notifyServerNotReady(guard || {});
    return null;
  }

  return fetch(url, options);
}

export { guardedFetch, notifyServerNotReady };
