import { describe, test, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ContributionDashboard } from "../../../src/components/ContributionDashboard/ContributionDashboard";
import { Notifications } from "../../../src/components/Notifications";
import userEvent from "@testing-library/user-event";
import { RootContextProvider } from "../../rootContextProvider";

beforeEach(() => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: true,
    json: async () => ({
      data: [],
      message: "mocked message",
    }),
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

const user = userEvent.setup();

function Wrapper({ initialUser = null }) {
  return (
    <RootContextProvider initialUserData={initialUser}>
      <MemoryRouter initialEntries={["/improve-data"]}>
        <Notifications />
        <Routes>
          <Route path="/improve-data" element={<ContributionDashboard />} />
        </Routes>
      </MemoryRouter>
    </RootContextProvider>
  );
}

describe("ContributionForm component rendering", () => {
  beforeEach(() => {
    render(<Wrapper initialUser={{ email: "some@email.com" }} />);
  });

  test("renders Add new data tab button", async () => {
    const tab = await screen.findByRole("button", { name: /Add new data/i });
    expect(tab).toBeInTheDocument();
  });

  test("renders Pending changes tab button", async () => {
    const tab = await screen.findByRole("button", { name: /Pending changes/i });
    expect(tab).toBeInTheDocument();
  });

  test("shows entity type select when Add new data tab is active", async () => {
    const entityTypeLabel = await screen.findByText(/Entity Type/i);
    expect(entityTypeLabel).toBeInTheDocument();
  });

  test("switches to pending changes tab on click", async () => {
    const tab = await screen.findByRole("button", { name: /Pending changes/i });
    await user.click(tab);
    const noChanges = await screen.findByText(/no pending changes/i);
    expect(noChanges).toBeInTheDocument();
  });
});
