import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AdminDashboard } from "../../../src/components/AdminDashboard/AdminDashboard";
import { NotificationContext } from "../../../src/contextData/NotificationContext";
import { UserDataContext } from "../../../src/contextData/UserDataContext";
import { useNotification } from "../../../src/customHooks/useNotification";
import { Notifications } from "../../../src/components/Notifications";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";

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

function Wrapper({ initialUser = null }) {
  const [userData, setUserData] = useState(initialUser);
  const { notifications, addNotification, removeNotification } =
    useNotification();

  return (
    <NotificationContext
      value={{ notifications, addNotification, removeNotification }}
    >
      <UserDataContext value={{ userData, setUserData }}>
        <MemoryRouter initialEntries={["/admin-dashboard"]}>
          <Notifications />
          <Routes>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
          </Routes>
        </MemoryRouter>
      </UserDataContext>
    </NotificationContext>
  );
}

describe("AdminDashboard component", () => {
  test("render component if user doesn't exist", async () => {
    render(<Wrapper initialUser={null} />);
    const paragraphElement = await screen.findByText(
      /You need to be logged in and an admin to see the admin dashboard./i,
    );
    expect(paragraphElement).toBeInTheDocument();
  });

  test("render component if user is not admin", async () => {
    render(<Wrapper initialUser={{ role: "USER" }} />);

    const paragraphElement = await screen.findByText(
      /You need to be an admin to see the admin dashboard./i,
    );
    expect(paragraphElement).toBeInTheDocument();
  });

  test("render component if user is admin", async () => {
    render(<Wrapper initialUser={{ role: "ADMIN" }} />);

    const headingElement = await screen.findByRole("heading", {
      name: /Admin Dashboard/i,
    });

    expect(headingElement).toBeInTheDocument();
  });
});
