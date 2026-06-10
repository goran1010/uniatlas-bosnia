import { test, describe, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { routes } from "../src/routes";

const mockedResponse = new Response(
  JSON.stringify({
    data: [{ id: 1, code: "mocked code" }],
    message: "mocked message",
  }),
  {
    status: 200,
    headers: { "Content-Type": "application/json" },
  },
);

beforeEach(() => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(mockedResponse);
});

afterEach(() => {
  vi.restoreAllMocks();
});

function renderRoute(route: string) {
  const router = createMemoryRouter(routes, {
    initialEntries: [route],
  });

  render(<RouterProvider router={router} />);
}

describe("Loading components when visiting an address", () => {
  test("render Error Page when visiting non-existent address", async () => {
    const consoleSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);

    renderRoute("/non-existent-address");

    const linkElement = await screen.findByText(/Go to Home Page/i);
    expect(linkElement).not.toBeNull();
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  test("visit universities page", async () => {
    renderRoute("/universities");

    const linkElements = await screen.findAllByText(/Universities/i);
    expect(linkElements[0]).not.toBeNull();
  });

  test("visit home page", async () => {
    renderRoute("/");

    const linkElement = await screen.findByRole("heading", {
      name: /Bosnia and Herzegovina/i,
      level: 1,
    });
    expect(linkElement).not.toBeNull();
  });

  test.each(["/", "/universities"])(
    "render Footer on every page",
    async (route) => {
      renderRoute(route);

      const footerEmail = await screen.findByText(/goran1010jovic@gmail.com/i);
      const footerAuthor = await screen.findByText(/Goran Jović/i);
      expect(footerEmail).not.toBeNull();
      expect(footerAuthor).not.toBeNull();
    },
  );

  test.each(["/", "/universities"])(
    "render Navbar on every page",
    async (route) => {
      renderRoute(route);

      const nav = await screen.findByRole("navigation");
      const homeLink = within(nav).getByRole("link", { name: /Home/i });
      const universitiesLink = within(nav).getByRole("link", {
        name: /Universities/i,
      });

      expect(homeLink).not.toBeNull();
      expect(universitiesLink).not.toBeNull();
    },
  );
});
