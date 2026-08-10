import { guardedFetch } from "../../../src/utils/guardedFetch";
import {
  SERVER_STATUS,
  ServerNotReadyError,
} from "../../../src/utils/serverStatus";

import type { Guard } from "../../../src/utils/guardedFetch";

function createGuard(serverStatus: Guard["serverStatus"]): Guard {
  return {
    serverStatus,
  };
}

const blockedServerStatuses: readonly (readonly [Guard["serverStatus"]])[] = [
  [SERVER_STATUS.WAKING],
  [SERVER_STATUS.DOWN],
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
  });

  test.each(blockedServerStatuses)(
    "blocks requests with a ServerNotReadyError when the server is %s",
    (serverStatus) => {
      const fetchMock = vi.spyOn(globalThis, "fetch");
      const guard = createGuard(serverStatus);

      let thrown: unknown;
      try {
        void guardedFetch("/api/universities", {}, guard);
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeInstanceOf(ServerNotReadyError);
      expect((thrown as ServerNotReadyError).serverStatus).toBe(serverStatus);
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );
});
