import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { routes } from "../../src/routes";

const mockValue = new Response(JSON.stringify({ universities: [] }), {
  status: 200,
  headers: { "Content-type": "application/json" },
});

beforeEach(() => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(mockValue);
});
afterEach(() => {
  vi.restoreAllMocks();
});

function Wrapper() {
  const router = createMemoryRouter(routes, {
    initialEntries: ["/universities"],
  });
  render(<RouterProvider router={router} />);
}

describe("Universities page", () => {
  test("renders tab buttons: Browse All, Search, Find Study Programs", async () => {
    Wrapper();

    const BrowseAllButton = await screen.findByRole("button", {
      name: /Browse All/i,
    });
    const SearchButton = screen.getAllByRole("button", { name: /Search/i })[0];
    const FindStudyProgramsButton = screen.getByRole("button", {
      name: /Find Study Programs/i,
    });

    expect(BrowseAllButton).toBeInTheDocument();
    expect(SearchButton).toBeInTheDocument();
    expect(FindStudyProgramsButton).toBeInTheDocument();
  });
});
