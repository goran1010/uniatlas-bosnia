import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { routes } from "../../src/routes";

vi.spyOn(globalThis, "fetch").mockResolvedValue(
  new Response(
    JSON.stringify({
      message: "Server is live.",
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  ),
);

describe("ErrorPage Component", () => {
  test("Footer component", async () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ["/"],
    });
    render(<RouterProvider router={router} />);

    const name = await screen.findByText(/goran jovi/i);
    expect(name).toBeInTheDocument();
    const email = screen.getByText(/goran1010jovic@gmail.com/i);
    expect(email).toBeInTheDocument();
  });
});
