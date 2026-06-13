import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { act, render } from "@testing-library/react";
import { useServerWakeUp } from "../../src/customHooks/useServerWakeUp";

import type { Notification } from "../../src/customHooks/useNotification";

async function flushMicrotasks() {
  await Promise.resolve();
  await Promise.resolve();
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.restoreAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => vi.fn());
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const identityTranslate = (key: string) => key;

interface ServerWakeUpProbeProps {
  setLongWait: (notification: Notification) => void;
  setServerIsDown: (id: string) => void;
}

function ServerWakeUpProbe({
  setLongWait,
  setServerIsDown,
}: ServerWakeUpProbeProps) {
  useServerWakeUp({
    addNotification: setLongWait,
    removeNotification: setServerIsDown,
    t: identityTranslate,
  });

  return <div data-testid="server-wake-up-probe">Probe</div>;
}

const mockedResponse = new Response(
  JSON.stringify({
    message: "Server is live",
  }),
  {
    status: 200,
    headers: { "Content-Type": "application/json" },
  },
);

describe("useServerWakeUp", () => {
  test("clears long wait when server responds ok", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(mockedResponse);
    const setLongWait = vi.fn();
    const setServerIsDown = vi.fn();

    render(
      <ServerWakeUpProbe
        setLongWait={setLongWait}
        setServerIsDown={setServerIsDown}
      />,
    );

    await act(async () => {
      await flushMicrotasks();
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(setLongWait).not.toHaveBeenCalled();

    expect(setServerIsDown).toHaveBeenCalledWith("server-status");
  });

  test("retries when response is not ok and then succeeds", async () => {
    const mockedErrorResponse = new Response(
      JSON.stringify({
        message: "Wake up",
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      },
    );
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(mockedErrorResponse)
      .mockResolvedValueOnce(mockedResponse);
    const setLongWait = vi.fn();
    const setServerIsDown = vi.fn();

    render(
      <ServerWakeUpProbe
        setLongWait={setLongWait}
        setServerIsDown={setServerIsDown}
      />,
    );

    expect(fetchSpy).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
      await flushMicrotasks();
    });

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(setLongWait).toHaveBeenCalledWith({
      id: "server-status",
      type: "warning",
      message: "longWait.wakingUp",
      duration: null,
      persistent: true,
    });
    expect(setServerIsDown).toHaveBeenCalledWith("server-status");
  });

  test("sets server down after max attempts on repeated fetch errors", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network error"));
    const setLongWait = vi.fn();
    const setServerIsDown = vi.fn();

    render(
      <ServerWakeUpProbe
        setLongWait={setLongWait}
        setServerIsDown={setServerIsDown}
      />,
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
      await vi.advanceTimersByTimeAsync(2000 * 30);
      await flushMicrotasks();
    });

    expect(setLongWait).toHaveBeenLastCalledWith({
      id: "server-status",
      type: "error",
      message: "longWait.unreachable",
      duration: null,
      persistent: true,
    });
    expect(setServerIsDown).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });
});
