import { render, screen, waitFor } from "@testing-library/react";
import { useGetPendingChangesAdmin } from "../../../../../src/components/AdminDashboard/customHooks/useGetPendingChangesAdmin";
import { RootContextProvider } from "../../../../utils/rootContextProvider";
import { guardedFetch } from "../../../../../src/utils/guardedFetch";

import type { RootContextType } from "../../../../../src/contextData/RootContext";

vi.mock("../../../../../src/utils/guardedFetch", () => ({
  guardedFetch: vi.fn(),
}));

const mockedGuardedFetch = vi.mocked(guardedFetch);
const identityTranslate = (key: string) => key;

interface HookProbeProps {
  setLoading: (loading: boolean) => void;
}

function HookProbe({ setLoading }: HookProbeProps) {
  const { pendingChanges } = useGetPendingChangesAdmin(
    setLoading,
    identityTranslate,
  );

  return <output data-testid="pending-count">{pendingChanges.length}</output>;
}

function Wrapper({
  addNotification,
  setLoading,
}: {
  addNotification: RootContextType["addNotification"];
  setLoading: (loading: boolean) => void;
}) {
  return (
    <RootContextProvider rootValue={{ addNotification }}>
      <HookProbe setLoading={setLoading} />
    </RootContextProvider>
  );
}

beforeEach(() => {
  mockedGuardedFetch.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useGetPendingChangesAdmin", () => {
  test("uses the API error message when pending changes cannot be fetched", async () => {
    const addNotification = vi.fn();
    const setLoading = vi.fn();
    mockedGuardedFetch.mockResolvedValue(
      new Response(JSON.stringify({ error: { message: "Access denied" } }), {
        status: 403,
      }),
    );

    render(
      <Wrapper addNotification={addNotification} setLoading={setLoading} />,
    );

    await waitFor(() => {
      expect(addNotification).toHaveBeenCalledWith({
        type: "error",
        message: "Access denied",
      });
    });

    expect(setLoading).toHaveBeenLastCalledWith(false);
  });

  test("uses the fallback error message when the API error body is invalid", async () => {
    const addNotification = vi.fn();
    mockedGuardedFetch.mockResolvedValue(
      new Response("not valid JSON", { status: 500 }),
    );

    render(<Wrapper addNotification={addNotification} setLoading={vi.fn()} />);

    await waitFor(() => {
      expect(addNotification).toHaveBeenCalledWith({
        type: "error",
        message: "messages.pendingChanges.fetchError",
      });
    });
    expect(screen.getByTestId("pending-count")).toHaveTextContent("0");
  });

  test("does not notify when the server is not ready", async () => {
    const addNotification = vi.fn();
    const setLoading = vi.fn();
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    mockedGuardedFetch.mockRejectedValue(new Error("Server is not ready"));

    render(
      <Wrapper addNotification={addNotification} setLoading={setLoading} />,
    );

    await waitFor(() => {
      expect(setLoading).toHaveBeenLastCalledWith(false);
    });

    expect(addNotification).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
});