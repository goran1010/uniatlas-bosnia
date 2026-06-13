import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { routes } from "../../src/routes";

describe("ErrorPage Component", () => {
  test("Footer component", () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ["/"],
    });
    render(<RouterProvider router={router} />);

    const name = screen.getByText(/goran jovi/i);
    expect(name).toBeInTheDocument();
    const email = screen.getByText(/goran1010jovic@gmail.com/i);
    expect(email).toBeInTheDocument();
  });
});
