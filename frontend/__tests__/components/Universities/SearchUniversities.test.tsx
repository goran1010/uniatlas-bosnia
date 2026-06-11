import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { SearchUniversities } from "../../../src/components/Universities/SearchUniversities";
import { Notifications } from "../../../src/components/Notifications";
import { RootContextProvider } from "../../rootContextProvider";

function Wrapper() {
  return (
    <RootContextProvider>
      <MemoryRouter>
        <Notifications />
        <SearchUniversities />
      </MemoryRouter>
    </RootContextProvider>
  );
}

describe("SearchUniversities", () => {
  const mockResponse = new Response(
    JSON.stringify({
      data: [
        {
          id: 5,
          name: "University of Mostar",
          acronym: "SUM",
          city: "Mostar",
          entity: "FBIH",
          ownership: "PRIVATNA",
          foundedYear: 1977,
          website: "https://sum.ba",
        },
      ],
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
  beforeEach(() => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("shows validation message and skips fetch for short search term", async () => {
    render(<Wrapper />);
    const user = userEvent.setup();

    const searchInput = screen.getByRole("searchbox", { name: /Search/i });
    const searchButton = screen.getByRole("button", { name: /^Search$/i });

    await user.type(searchInput, "a");
    await user.click(searchButton);

    const validationMessage = await screen.findByText(
      /Search must have at least 2 characters/i,
    );

    expect(fetch).toHaveBeenCalledTimes(0);
    expect(validationMessage).toBeInTheDocument();
  });

  test("renders search results when API returns matches", async () => {
    render(<Wrapper />);
    const user = userEvent.setup();

    const searchInput = screen.getByRole("searchbox", { name: /Search/i });
    const searchButton = screen.getByRole("button", { name: /^Search$/i });

    await user.type(searchInput, "mostar");
    await user.click(searchButton);

    const universityName = await screen.findByText(/University of Mostar/i);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(universityName).toBeInTheDocument();
  });

  test("renders no results message for 404", async () => {
    const mockNotFoundResponse = new Response(
      JSON.stringify({ error: { message: "Not found" } }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      },
    );
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(mockNotFoundResponse);

    render(<Wrapper />);
    const user = userEvent.setup();

    const searchInput = screen.getByRole("searchbox", { name: /Search/i });
    const searchButton = screen.getByRole("button", { name: /^Search$/i });

    await user.type(searchInput, "xy");
    await user.click(searchButton);

    const noResultsMessage = await screen.findByText(
      /No universities found\./i,
    );

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(noResultsMessage).toBeInTheDocument();
  });

  test("shows API error message on non-404 non-ok response", async () => {
    const mockErrorResponse = new Response(
      JSON.stringify({ error: { message: "Search exploded." } }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(mockErrorResponse);

    render(<Wrapper />);
    const user = userEvent.setup();

    const searchInput = screen.getByRole("searchbox", { name: /Search/i });
    const searchButton = screen.getByRole("button", { name: /^Search$/i });

    await user.type(searchInput, "sarajevo");
    await user.click(searchButton);

    const apiErrorMessage = await screen.findByText(/Search exploded\./i);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(apiErrorMessage).toBeInTheDocument();
  });

  test("shows fallback message on thrown request", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("network"));

    render(<Wrapper />);
    const user = userEvent.setup();

    const searchInput = screen.getByRole("searchbox", { name: /Search/i });
    const searchButton = screen.getByRole("button", { name: /^Search$/i });

    await user.type(searchInput, "sarajevo");
    await user.click(searchButton);

    const fallbackMessage = await screen.findByText(/^Search failed\.$/i);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fallbackMessage).toBeInTheDocument();
  });
});
