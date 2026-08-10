import { act, render, screen } from "@testing-library/react";
import { useStatusCheck } from "../../../src/customHooks/useStatusCheck";
import { guardedFetch } from "../../../src/utils/guardedFetch";
import {
  SERVER_STATUS,
  ServerNotReadyError,
} from "../../../src/utils/serverStatus";

import type { Notification } from "../../../src/types/notification";
import type { ServerStatus } from "../../../src/utils/serverStatus";

vi.mock("../../../src/utils/guardedFetch", () => ({
  guardedFetch: vi.fn(),
}));

const mockedGuardedFetch = vi.mocked(guardedFetch);
const identityTranslate = (key: string) => key;

interface StatusCheckProbeProps {
  addNotification: (notification: Notification) => string;
  serverStatus: ServerStatus;
}

function StatusCheckProbe({
  addNotification,
  serverStatus,
}: StatusCheckProbeProps) {
  const { userData } = useStatusCheck(
    addNotification,
    identityTranslate,
    serverStatus,
  );

  return <div data-testid="user-email">{userData?.email ?? "none"}</div>;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("useStatusCheck", () => {
  test("uses the default success message when the response message is null", async () => {
    const addNotification = vi.fn(() => "notification-id");
    const response = new Response(
      JSON.stringify({
        message: null,
        data: { email: "user@example.com", role: "USER" },
      }),
      { headers: { "Content-Type": "application/json" } },
    );
    mockedGuardedFetch.mockResolvedValue(response);

    render(
      <StatusCheckProbe
        addNotification={addNotification}
        serverStatus={SERVER_STATUS.LIVE}
      />,
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    expect(addNotification).toHaveBeenCalledWith({
      type: "success",
      message: "messages.loginStatus.success",
    });
    expect(screen.getByTestId("user-email")).toHaveTextContent(
      "user@example.com",
    );
  });

  test("does not notify after unmounting while an OK response is pending", async () => {
    const addNotification = vi.fn(() => "notification-id");
    let resolveFetch!: (response: Response) => void;
    mockedGuardedFetch.mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          resolveFetch = resolve;
        }),
    );

    const { unmount } = render(
      <StatusCheckProbe
        addNotification={addNotification}
        serverStatus={SERVER_STATUS.LIVE}
      />,
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    unmount();

    resolveFetch(
      new Response(
        JSON.stringify({
          message: "Welcome back",
          data: { email: "user@example.com", role: "USER" },
        }),
        { headers: { "Content-Type": "application/json" } },
      ),
    );

    expect(addNotification).not.toHaveBeenCalled();
  });

  test("does not notify after unmounting while a request rejection is pending", async () => {
    const addNotification = vi.fn(() => "notification-id");
    const error = new Error("Network error");
    let rejectFetch!: (reason?: unknown) => void;
    mockedGuardedFetch.mockImplementation(
      () =>
        new Promise<Response>((_, reject) => {
          rejectFetch = reject;
        }),
    );

    const { unmount } = render(
      <StatusCheckProbe
        addNotification={addNotification}
        serverStatus={SERVER_STATUS.LIVE}
      />,
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    unmount();

    act(() => {
      rejectFetch(error);
    });

    expect(addNotification).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  });

  test("reports an error when a successful response contains invalid user data", async () => {
    const addNotification = vi.fn(() => "notification-id");
    mockedGuardedFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          message: "User info retrieved",
          data: { email: "user@example.com", role: "CONTRIBUTOR" },
        }),
        { headers: { "Content-Type": "application/json" } },
      ),
    );

    render(
      <StatusCheckProbe
        addNotification={addNotification}
        serverStatus={SERVER_STATUS.LIVE}
      />,
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    expect(addNotification).toHaveBeenCalledWith({
      type: "error",
      message: "messages.loginStatus.error",
    });
    expect(screen.getByTestId("user-email")).toHaveTextContent("none");
  });

  test.each([[SERVER_STATUS.WAKING], [SERVER_STATUS.DOWN]])(
    "does not check login status while the server is %s",
    async (serverStatus) => {
      const addNotification = vi.fn(() => "notification-id");

      render(
        <StatusCheckProbe
          addNotification={addNotification}
          serverStatus={serverStatus}
        />,
      );

      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });

      expect(mockedGuardedFetch).not.toHaveBeenCalled();
      expect(addNotification).not.toHaveBeenCalled();
    },
  );

  test("checks login status once the server becomes live", async () => {
    const addNotification = vi.fn(() => "notification-id");
    mockedGuardedFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          message: null,
          data: { email: "user@example.com", role: "USER" },
        }),
        { headers: { "Content-Type": "application/json" } },
      ),
    );

    const { rerender } = render(
      <StatusCheckProbe
        addNotification={addNotification}
        serverStatus={SERVER_STATUS.WAKING}
      />,
    );

    expect(mockedGuardedFetch).not.toHaveBeenCalled();

    rerender(
      <StatusCheckProbe
        addNotification={addNotification}
        serverStatus={SERVER_STATUS.LIVE}
      />,
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    expect(mockedGuardedFetch).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("user-email")).toHaveTextContent(
      "user@example.com",
    );
  });

  test("does not notify when the request is blocked by the server guard", async () => {
    const addNotification = vi.fn(() => "notification-id");
    mockedGuardedFetch.mockRejectedValue(
      new ServerNotReadyError(SERVER_STATUS.WAKING),
    );

    render(
      <StatusCheckProbe
        addNotification={addNotification}
        serverStatus={SERVER_STATUS.LIVE}
      />,
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    expect(addNotification).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  });
});
