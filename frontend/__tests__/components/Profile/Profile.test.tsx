import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Notifications } from "../../../src/components/Notifications";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { Profile } from "../../../src/components/Profile/Profile";
import { LogIn } from "../../../src/components/LogIn/LogIn";
import userEvent from "@testing-library/user-event";
import { RootContextProvider } from "../../rootContextProvider";

import type { UserData } from "../../../src/customHooks/useStatusCheck";

let getCsrfTokenMock: string | null = "mocked-csrf-token";

vi.mock("../../../src/components/utils/getCsrfToken", () => ({
  getCsrfToken: () => getCsrfTokenMock,
  clearCsrfToken: () => vi.fn(),
}));

const user = userEvent.setup();

beforeEach(() => {
  getCsrfTokenMock = "mocked-csrf-token";
  const mockResponse = new Response(
    JSON.stringify({
      message: "User logged out successfully",
      data: null,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
  const mockConsoleError = vi.fn();

  vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse);
  vi.spyOn(console, "error").mockImplementation(mockConsoleError);
});

afterEach(() => {
  vi.restoreAllMocks();
});

function Wrapper({ initialUser = null }: { initialUser?: UserData }) {
  return (
    <RootContextProvider initialUserData={initialUser}>
      <MemoryRouter initialEntries={["/profile"]}>
        <Notifications />
        <Routes>
          <Route path="/" element={<div>Home Page</div>} />
          <Route path="/login" element={<LogIn />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </MemoryRouter>
    </RootContextProvider>
  );
}

async function clickLogout() {
  const logoutButton = await screen.findByRole("button", {
    name: /Log out/i,
  });

  expect(logoutButton).toBeInTheDocument();
  await user.click(logoutButton);

  return logoutButton;
}

describe("Profile Component", () => {
  test("renders profile component when user is not logged in", async () => {
    render(<Wrapper />);
    const paragraphElement = await screen.findByText(
      /You need to be logged in. Redirected to the login page./i,
    );
    expect(paragraphElement).toBeInTheDocument();
  });

  test("renders profile component when user is logged in", async () => {
    render(
      <Wrapper initialUser={{ email: "testuser@example.com", role: "USER" }} />,
    );
    const headingElement = await screen.findByRole("heading", {
      name: /My Profile/i,
    });
    expect(headingElement).toBeInTheDocument();
  });

  test("displays user information correctly", async () => {
    const user: UserData = {
      email: "testuser@example.com",
      role: "USER",
    };
    render(<Wrapper initialUser={user} />);
    const emailElement = await screen.findByText(/testuser@example.com/i);
    const roleElement = await screen.findByText("USER");
    expect(emailElement).toBeInTheDocument();
    expect(roleElement).toBeInTheDocument();
  });

  test("displays admin role when user role is ADMIN", async () => {
    const user: UserData = {
      email: "admin@example.com",
      role: "ADMIN",
    };
    render(<Wrapper initialUser={user} />);
    const emailElement = await screen.findByText(/admin@example.com/i);
    const roleElement = await screen.findByText("ADMIN");
    expect(emailElement).toBeInTheDocument();
    expect(roleElement).toBeInTheDocument();
  });
});

describe("Profile Component handle logout", () => {
  test("handles logout failure due to missing CSRF token", async () => {
    getCsrfTokenMock = null;
    render(
      <Wrapper initialUser={{ email: "testuser@example.com", role: "USER" }} />,
    );

    await clickLogout();

    const notificationElement = await screen.findByText(
      /Failed to retrieve CSRF token./i,
    );
    expect(notificationElement).toBeInTheDocument();
  });

  test("handles logout failure due to server error", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const mockErrorResponse = new Response(
      JSON.stringify({
        error: { message: "An error occurred while logging out." },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
    fetchSpy.mockResolvedValueOnce(mockErrorResponse);

    render(
      <Wrapper initialUser={{ email: "testuser@example.com", role: "USER" }} />,
    );

    await clickLogout();

    const notificationElement = await screen.findByText(
      "An error occurred while logging out.",
    );
    expect(notificationElement).toBeInTheDocument();
  });

  test("handles logout failure due to unexpected error", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => vi.fn());

    fetchSpy.mockRejectedValueOnce(new Error("Network error"));

    render(
      <Wrapper initialUser={{ email: "testuser@example.com", role: "USER" }} />,
    );

    await clickLogout();

    const notificationElement = await screen.findByText(
      /An error occurred while logging out./i,
    );
    expect(notificationElement).toBeInTheDocument();
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  test("handles logout correctly", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const mockSuccessResponse = new Response(
      JSON.stringify({
        message: "User logged out successfully",
        data: null,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
    fetchSpy.mockResolvedValueOnce(mockSuccessResponse);

    render(
      <Wrapper initialUser={{ email: "testuser@example.com", role: "USER" }} />,
    );
    const logoutButton = await clickLogout();

    const notificationElement = await screen.findByText(
      /User logged out successfully/i,
    );
    expect(notificationElement).toBeInTheDocument();

    const logIn = await screen.findByRole("heading", { name: /Log In/i });

    expect(logIn).toBeInTheDocument();
    expect(logoutButton).not.toBeInTheDocument();
  });
});
