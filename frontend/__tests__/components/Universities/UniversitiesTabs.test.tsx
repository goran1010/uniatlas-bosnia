import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { Universities } from "../../../src/components/Universities/Universities";
import { RootContextProvider } from "../../rootContextProvider";

const user = userEvent.setup();

function Wrapper() {
  return (
    <RootContextProvider>
      <MemoryRouter>
        <Universities />
      </MemoryRouter>
    </RootContextProvider>
  );
}

beforeEach(() => {
  const mockResponse = new Response(JSON.stringify({ data: [] }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
  vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Universities page tabs", () => {
  test("renders all tab buttons", async () => {
    render(<Wrapper />);

    expect(
      await screen.findByRole("button", { name: /Browse All/i }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: /Search/i })[0],
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Find Study Programs/i }),
    ).toBeInTheDocument();
  });

  test("switches tabs and renders tab content", async () => {
    render(<Wrapper />);

    const searchInput = screen.getByRole("searchbox", { name: /Search/i });
    expect(searchInput).toBeInTheDocument();

    const findProgramsTab = screen.getByRole("button", {
      name: /Find Study Programs/i,
    });
    await user.click(findProgramsTab);

    const findProgramsInput = await screen.findByRole("searchbox", {
      name: /Find Study Programs/i,
    });
    expect(findProgramsInput).toBeInTheDocument();

    const browseAllTab = screen.getByRole("button", { name: /Browse All/i });
    await user.click(browseAllTab);

    const emptyMessage = await screen.findByText(/No universities found\./i);
    expect(emptyMessage).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
