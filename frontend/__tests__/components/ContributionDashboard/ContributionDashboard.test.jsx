import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ContributionDashboard } from "../../../src/components/ContributionDashboard/ContributionDashboard";
import { NotificationContext } from "../../../src/contextData/NotificationContext";
import { UserDataContext } from "../../../src/contextData/UserDataContext";
import { useNotification } from "../../../src/customHooks/useNotification";
import { Notifications } from "../../../src/components/Notifications";
import { useState } from "react";

function Wrapper({ initialUser = null }) {
  const [userData, setUserData] = useState(initialUser);
  const { notifications, addNotification, removeNotification } =
    useNotification();

  return (
    <NotificationContext
      value={{ notifications, addNotification, removeNotification }}
    >
      <UserDataContext value={{ userData, setUserData }}>
        <MemoryRouter initialEntries={["/contribution-dashboard"]}>
          <Notifications />
          <Routes>
            <Route
              path="/contribution-dashboard"
              element={<ContributionDashboard />}
            />
          </Routes>
        </MemoryRouter>
      </UserDataContext>
    </NotificationContext>
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
});
