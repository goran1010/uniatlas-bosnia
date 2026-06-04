import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ContributionDashboard } from "../../../src/components/ContributionDashboard/ContributionDashboard";
import { Notifications } from "../../../src/components/Notifications";
import { RootContextProvider } from "../../rootContextProvider";

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

describe("render ContributionDashboard component", () => {
  test("render message if user doesn't exist", async () => {
    render(<Wrapper />);

    const paragraphElement = await screen.findByText(
      /You need to be a registered user to propose changes to the content./i,
    );
    expect(paragraphElement).toBeInTheDocument();
  });

  test("renders contribution form when user exists", async () => {
    render(<Wrapper initialUser={{ email: "some@email.com" }} />);

    const headingElement = await screen.findByRole("heading", {
      name: /Improve the Data/i,
    });

    expect(headingElement).toBeInTheDocument();
  });
});
