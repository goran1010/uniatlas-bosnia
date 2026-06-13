import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PendingUniversityChangesRow } from "../../../src/components/ContributionDashboard/PendingUniversityChangesRow";
import { RootContextProvider } from "../../rootContextProvider";

import type { ReactElement } from "react";
import type { PendingChange } from "../../../src/components/ContributionDashboard/customHooks/useGetPendingChanges";

const change: PendingChange = {
  id: "8687b282-fcc6-4f69-8744-0f8e1585d991",
  entityType: "UNIVERSITY",
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

    expect(screen.getByText(/University/i)).toBeInTheDocument();
    expect(badge).toHaveClass("bg-red-100");
    expect(screen.getByRole("button", { name: /Delete/i })).toBeInTheDocument();
  });
});
