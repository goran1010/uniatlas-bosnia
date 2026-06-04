import { test, describe, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { routes } from "../js_files/src/routes";
import { RootContextProvider } from "./rootContextProvider";

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

function renderRoute(route, { withUserDataContext = false } = {}) {
  const router = createMemoryRouter(routes, {
    initialEntries: [route],
  });

  if (withUserDataContext) {
    render(
      <RootContextProvider
        rootValue={{
          userData: { message: [], setMessage: () => {} },
          setUserData: () => {},
        }}
      >
        <RouterProvider router={router} />
      </RootContextProvider>,
    );
    return;
  }

  render(
    <RootContextProvider>
      <RouterProvider router={router} />
    </RootContextProvider>,
  );
}

describe("Loading components when visiting an address", () => {
  test("render Error Page when visiting non-existent address", async () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    renderRoute("/non-existent-address");

    const linkElement = await screen.findByText(/Go to Home Page/i);
    expect(linkElement).toBeInTheDocument();
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  test("visit universities page", async () => {
    renderRoute("/universities");

    const linkElements = await screen.findAllByText(/Universities/i);
    expect(linkElements[0]).toBeInTheDocument();
  });

  test("visit home page", async () => {
    renderRoute("/");

    const linkElement = await screen.findByRole("heading", {
      name: /Bosnia and Herzegovina/i,
      level: 1,
    });
    expect(linkElement).toBeInTheDocument();
  });

  test.each(["/", "/universities"])(
    "render Footer on every page",
    async (route) => {
      renderRoute(route);

      const footerEmail = await screen.findByText(/goran1010jovic@gmail.com/i);
      const footerAuthor = await screen.findByText(/Goran Jović/i);
      expect(footerEmail).toBeInTheDocument();
      expect(footerAuthor).toBeInTheDocument();
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

      expect(homeLink).toBeInTheDocument();
      expect(universitiesLink).toBeInTheDocument();
    },
  );
});
