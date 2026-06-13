import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RootContextProvider } from "../../rootContextProvider";
import { PendingChangesAdminRow } from "../../../src/components/AdminDashboard/PendingChangesAdminRow";
import { SERVER_STATUS } from "../../../src/utils/serverStatus";
import type { ReactElement } from "react";
import type { PendingChange } from "../../../src/components/ContributionDashboard/customHooks/useGetPendingChanges";
import type { ServerStatus } from "../../../src/utils/serverStatus";

const handleConfirmMock = vi.fn<(...args: unknown[]) => undefined>();
const handleDeclineMock = vi.fn<(...args: unknown[]) => undefined>();

vi.mock("../../../src/components/AdminDashboard/utils/handleConfirm", () => ({
  handleConfirm: (...args: unknown[]) => {
    handleConfirmMock(...args);
  },
}));

vi.mock("../../../src/components/AdminDashboard/utils/handleDecline", () => ({
  handleDecline: (...args: unknown[]) => {
    handleDeclineMock(...args);
  },
}));

const change: PendingChange = {
  id: "8687b282-fcc6-4f69-8744-0f8e1585d991",
  entityType: "SUBJECT",
  typeOfChange: "DELETE",
  targetId: null,
  parentId: null,
  data: { email: "", role: "USER" },
  userId: "user-1",
  user: { email: "johndoe@examplemail.com", role: "USER" },
  createdAt: new Date(),
};

function Wrapper({ children }: { children: ReactElement }) {
  return (
    <RootContextProvider
      rootValue={{ serverStatus: SERVER_STATUS.LIVE as ServerStatus }}
    >
      {children}
    </RootContextProvider>
  );
}

beforeEach(() => {
  localStorage.setItem("language", "en");
  handleConfirmMock.mockReset();
  handleDeclineMock.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("PendingChangesAdminRow", () => {
  test("renders delete pending change details with delete styling", () => {
    render(
      <Wrapper>
        <PendingChangesAdminRow
          data={change}
          addNotification={vi.fn()}
          setPendingChanges={vi.fn()}
          index={0}
        />
      </Wrapper>,
    );

    const form = screen
      .getByRole("button", { name: /Approve/i })
      .closest("form");
    const badge = screen.getByText("DELETE");

    expect(screen.getByText("SUBJECT")).toBeInTheDocument();
    expect(screen.getByText("johndoe@examplemail.com")).toBeInTheDocument();
    expect(form).toHaveClass("border-l-4");
    expect(form).toHaveClass("border-l-red-500");
    expect(badge).toHaveClass("bg-red-100");
    expect(badge).toHaveClass("text-red-800");
  });

  test("calls the confirm and decline handlers when action buttons are clicked", async () => {
    const addNotification = vi.fn();
    const setPendingChanges = vi.fn();

    render(
      <Wrapper>
        <PendingChangesAdminRow
          data={change}
          addNotification={addNotification}
          setPendingChanges={setPendingChanges}
          index={1}
        />
      </Wrapper>,
    );

    const user = userEvent.setup();
    const approveButton = screen.getByRole("button", { name: /Approve/i });
    const rejectButton = screen.getByRole("button", { name: /Reject/i });

    await user.click(approveButton);
    await user.click(rejectButton);

    expect(handleConfirmMock).toHaveBeenCalledWith(
      change,
      setPendingChanges,
      addNotification,
      expect.any(Function),
      expect.any(Function),
      SERVER_STATUS.LIVE,
    );
    expect(handleDeclineMock).toHaveBeenCalledWith(
      change,
      setPendingChanges,
      addNotification,
      expect.any(Function),
      expect.any(Function),
      SERVER_STATUS.LIVE,
    );
    expect(approveButton.closest("form")).toHaveClass("bg-gray-100");
  });
});
