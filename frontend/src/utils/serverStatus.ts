const SERVER_STATUS = {
  WAKING: "waking",
  LIVE: "live",
  DOWN: "down",
};

export type ServerStatus = "waking" | "live" | "down";

const SERVER_STATUS_NOTIFICATION_ID = "server-status" as const;

export { SERVER_STATUS, SERVER_STATUS_NOTIFICATION_ID };
