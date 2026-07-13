import { beforeEach, describe, expect, test, vi } from "vitest";
import { guardedFetch } from "../../../src/utils/guardedFetch";
import {
  SERVER_STATUS,
  SERVER_STATUS_NOTIFICATION_ID,
} from "../../../src/utils/serverStatus";

import type { Guard } from "../../../src/utils/guardedFetch";

function createGuard(serverStatus: Guard["serverStatus"]): Guard {
  return {
    serverStatus,
    addNotification: vi.fn(),
    t: vi.fn((key: string) => key),
  };
}

const blockedServerStatuses: readonly (readonly [
  Guard["serverStatus"],
  "warning" | "error",
  string,
])[] = [
  [SERVER_STATUS.WAKING, "warning", "longWait.wakingUp"],
  [SERVER_STATUS.DOWN, "error", "longWait.unreachable"],
];

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("guardedFetch", () => {
  test("delegates to fetch when the server is live", async () => {
    const response = new Response(null, { status: 204 });
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(response);
    const guard = createGuard(SERVER_STATUS.LIVE);
    const options = { method: "GET" };

    await expect(
      guardedFetch("/api/universities", options, guard),
    ).resolves.toBe(response);

    expect(fetchMock).toHaveBeenCalledWith("/api/universities", options);
    expect(guard.addNotification).not.toHaveBeenCalled();
  });

  test.each(blockedServerStatuses)(
    "blocks requests and notifies when the server is WAKING or DOWN",
    (serverStatus, type, message) => {
      const fetchMock = vi.spyOn(globalThis, "fetch");
      const guard = createGuard(serverStatus);

      expect(() => guardedFetch("/api/universities", {}, guard)).toThrow(
        "Server is not ready",
      );

      expect(fetchMock).not.toHaveBeenCalled();
      expect(guard.t).toHaveBeenCalledWith(message);
      expect(guard.addNotification).toHaveBeenCalledWith({
        id: SERVER_STATUS_NOTIFICATION_ID,
        type,
        message,
        duration: null,
        persistent: true,
      });
    },
  );
});
