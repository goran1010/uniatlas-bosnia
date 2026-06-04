import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter } from "react-router-dom";
import { routes } from "../../../src/routes";
import { RouterProvider } from "react-router-dom";
import userEvent from "@testing-library/user-event";
let fetchSpy;

beforeEach(() => {
  fetchSpy = vi.spyOn(globalThis, "fetch");
  vi.spyOn(console, "error").mockImplementation(() => {});
  fetchSpy.mockImplementation((url) => {
    if (String(url).endsWith("/api")) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          message: "Server is LIVE",
          data: null,
        }),
      });
    }

    return Promise.resolve({
      ok: false,
      json: async () => ({
        error: "User not authenticated.",
      }),
    });
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

const user = userEvent.setup();

function renderRoot() {
  const router = createMemoryRouter(routes, {
    initialEntries: ["/"],
  });

  render(<RouterProvider router={router} />);
}

async function expectNotificationAndLink({ notificationText, linkName }) {
  const notification = await screen.findByText(notificationText);
  const link = await screen.findByRole("link", { name: linkName });

  expect(notification).toBeInTheDocument();
  expect(link).toBeInTheDocument();
}

describe("Root component", () => {
  test("renders Home heading if server is live", async () => {
    renderRoot();
    const homeHeading = await screen.findByRole("heading", {
      name: /UniAtlas Bosnia/i,
    });
    expect(homeHeading).toBeInTheDocument();
  });

  test("renders Profile link when user is logged in", async () => {
    fetchSpy.mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          message: "User retrieved successfully.",
          data: {
            id: 1,
            username: "testuser",
            email: "testuser@example.com",
          },
        }),
      });
    });

    renderRoot();

    await expectNotificationAndLink({
      notificationText: /User retrieved successfully./i,
      linkName: /Profile/i,
    });
  });

  test("renders Log In link when user is not logged in", async () => {
    renderRoot();

    const screenLink = await screen.findAllByRole("link", { name: /Log In/i });
    expect(screenLink.length).toBe(2);
  });
});

describe("Root component - Menu interaction", () => {
  test("closes menu when main content is clicked", async () => {
    renderRoot();

    const menuButton = await screen.findByRole("button", {
      name: /Toggle navigation menu/i,
    });
    await user.click(menuButton);
    expect(menuButton).toHaveAttribute("aria-expanded", "true");

    const mainContent = await screen.findByRole("main");
    await user.click(mainContent);

    expect(menuButton).toHaveAttribute("aria-expanded", "false");
  });
});
