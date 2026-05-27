import { describe, test, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ContributionDashboard } from "../../../src/components/ContributionDashboard/ContributionDashboard";
import { Notifications } from "../../../src/components/Notifications";
import { useState } from "react";
import userEvent from "@testing-library/user-event";
import { RootContextProvider } from "../../rootContextProvider";

beforeEach(() => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: true,
    json: async () => ({
      data: [{ id: 1, code: "mocked code" }],
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
      <MemoryRouter initialEntries={["/contribution-dashboard"]}>
        <Notifications />
        <Routes>
          <Route
            path="/contribution-dashboard"
            element={<ContributionDashboard />}
          />
        </Routes>
      </MemoryRouter>
    </RootContextProvider>
  );
}

describe("ContributionForm component rendering", () => {
  beforeEach(() => {
    render(<Wrapper initialUser={{ email: "some@email.com" }} />);
  });

  test("renders ContributionForm component's select element if user is logged in", async () => {
    const selectElement = screen.getByLabelText(/Choose dataset/i);
    expect(selectElement).toBeInTheDocument();
  });

  test("renders You need to select a dataset message when no choice is made", async () => {
    const messageElement = screen.getByText(/You need to select a dataset/i);
    expect(messageElement).toBeInTheDocument();
  });

  test("renders You need to select a dataset message when No dataset is selected", async () => {
    const selectElement = screen.getByLabelText(/Choose dataset/i);
    await user.selectOptions(selectElement, "No dataset");

    const messageElement = screen.getByText(/You need to select a dataset/i);
    expect(messageElement).toBeInTheDocument();
  });

  test("renders Universities component when Universities is selected", async () => {
    const selectElement = screen.getByLabelText(/Choose dataset/i);
    await user.selectOptions(selectElement, "Universities");

    const universitiesElement = screen.getByText(/Universities placeholder/i);
    expect(universitiesElement).toBeInTheDocument();
  });
});
