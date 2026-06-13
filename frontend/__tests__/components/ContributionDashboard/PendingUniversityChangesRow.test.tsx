import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PendingUniversityChangesRow } from "../../../src/components/ContributionDashboard/PendingUniversityChangesRow";
import { RootContextProvider } from "../../rootContextProvider";

import type { UserData } from "../../../src/customHooks/useStatusCheck";
import type { Entity } from "../../../src/components/Universities/GetAllUniversities";
import type { ReactElement } from "react";

import type { AddNotification } from "../../../src/customHooks/useNotification";

const handleDiscardUniversityChangeMock = vi.fn();

vi.mock(
  "../../../src/components/ContributionDashboard/utils/handleDiscardUniversityChange",
  () => ({
    handleDiscardUniversityChange: (...args) =>
      handleDiscardUniversityChangeMock(...args),
  }),
);

interface Change {
  id: string;
  entityType: Entity;
  typeOfChange: "CREATE" | "UPDATE" | "DELETE";
  targetId: number | null;
  parentId: number | null;
  data: UserData;
  userId: string;
  user: UserData;
  createdAt: Date;
}

const change: Change = {
  id: "8687b282-fcc6-4f69-8744-0f8e1585d991",
  entityType: "BD",
  typeOfChange: "DELETE",
  targetId: null,
  parentId: null,
  data: {
    email: "",
    role: "ADMIN",
  },
  userId: "",
  user: {
    email: "",
    role: "ADMIN",
  },
  createdAt: new Date(),
};

function Wrapper({ children }: { children: ReactElement }) {
  return <RootContextProvider>{children}</RootContextProvider>;
}

beforeEach(() => {
  localStorage.setItem("language", "en");
  handleDiscardUniversityChangeMock.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("PendingUniversityChangesRow", () => {
  test("renders the pending change and its delete badge", () => {
    render(
      <Wrapper>
        <PendingUniversityChangesRow
          change={change}
          index={0}
          setPendingChanges={vi.fn()}
        />
      </Wrapper>,
    );

    const badge = screen.getByText("DELETE");

    expect(screen.getByText(/Faculty/i)).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
    expect(badge).toHaveClass("bg-red-100");
    expect(screen.getByRole("button", { name: /Delete/i })).toBeInTheDocument();
  });

  test("calls the discard handler when delete is clicked", async () => {
    const setPendingChanges = vi.fn();

    render(
      <Wrapper>
        <PendingUniversityChangesRow
          change={change}
          index={1}
          setPendingChanges={setPendingChanges}
        />
      </Wrapper>,
    );

    const user = userEvent.setup();
    const deleteButton = screen.getByRole("button", { name: /Delete/i });

    await user.click(deleteButton);

    expect(handleDiscardUniversityChangeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        changeId: change.id,
        setPendingChanges,
        addNotification: expect.any(Function),
        setLoading: expect.any(Function),
        t: expect.any(Function),
        serverStatus: "live",
      }),
    );
    expect(deleteButton.closest("li")).toHaveClass("bg-gray-50");
  });
});
