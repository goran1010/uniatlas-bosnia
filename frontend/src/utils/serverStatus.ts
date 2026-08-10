const SERVER_STATUS = {
  WAKING: "waking",
  LIVE: "live",
  DOWN: "down",
} as const;

export type ServerStatus = "waking" | "live" | "down";

const SERVER_STATUS_NOTIFICATION_ID = "server-status" as const;

class ServerNotReadyError extends Error {
  readonly serverStatus: ServerStatus;

  constructor(serverStatus: ServerStatus) {
    super("Server is not ready");
    this.name = "ServerNotReadyError";
    this.serverStatus = serverStatus;
  }
}

function isServerNotReadyError(error: unknown): error is ServerNotReadyError {
  return error instanceof ServerNotReadyError;
}

export {
  SERVER_STATUS,
  SERVER_STATUS_NOTIFICATION_ID,
  ServerNotReadyError,
  isServerNotReadyError,
};
