import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { SearchStudyPrograms } from "../../../../src/components/Universities/SearchStudyPrograms";
import { Notifications } from "../../../../src/components/Notifications";
import { RootContextProvider } from "../../../utils/rootContextProvider";

function Wrapper() {
  return (
    <RootContextProvider>
      <MemoryRouter>
        <Notifications />
        <SearchStudyPrograms />
      </MemoryRouter>
    </RootContextProvider>
  );
}

describe("SearchStudyPrograms", () => {
  beforeEach(() => {
    const mockResponse = new Response(
      JSON.stringify({
        message: "Study programs retrieved successfully.",
        data: [],
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("shows validation message and skips fetch for short search term", async () => {
    render(<Wrapper />);
    const user = userEvent.setup();

    const searchInput = screen.getByRole("searchbox", {
      name: /Find Study Programs/i,
    });
    const searchButton = screen.getByRole("button", { name: /^Search$/i });

    await user.type(searchInput, "a");
    await user.click(searchButton);

    const validationMessage = await screen.findByText(
      /Search must have at least 2 characters/i,
    );

    expect(fetch).toHaveBeenCalledTimes(0);
    expect(validationMessage).toBeInTheDocument();
  });

  test("renders study program results when API returns matches", async () => {
    const mockResponse = new Response(
      JSON.stringify({
        message: "Study programs retrieved successfully.",
        data: [
          {
            id: 7,
            name: "Computer Science",
            facultyId: 3,
            cycle: "FIRST",
            ects: 180,
            faculty: {
              id: 3,
              name: "Faculty of Electrical Engineering",
              universityId: 1,
              university: {
                id: 1,
                name: "University of Sarajevo",
                acronym: "UNSA",
              },
            },
          },
        ],
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(mockResponse);

    render(<Wrapper />);
    const user = userEvent.setup();

    const searchInput = screen.getByRole("searchbox", {
      name: /Find Study Programs/i,
    });
    const searchButton = screen.getByRole("button", { name: /^Search$/i });

    await user.type(searchInput, "computer");
    await user.click(searchButton);

    const programName = await screen.findByText(/Computer Science/i);
    const facultyName = screen.getByText(/Faculty of Electrical Engineering/i);
    const universityName = screen.getByText(/University of Sarajevo \(UNSA\)/i);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(programName).toBeInTheDocument();
    expect(facultyName).toBeInTheDocument();
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

    const searchInput = screen.getByRole("searchbox", {
      name: /Find Study Programs/i,
    });
    const searchButton = screen.getByRole("button", { name: /^Search$/i });

    await user.type(searchInput, "xy");
    await user.click(searchButton);

    const noResultsMessage = await screen.findByText(
      /No study programs found\./i,
    );

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(noResultsMessage).toBeInTheDocument();
  });

  test("shows API error message on non-404 non-ok response", async () => {
    const mockErrorResponse = new Response(
      JSON.stringify({ error: { message: "Study search exploded." } }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(mockErrorResponse);

    render(<Wrapper />);
    const user = userEvent.setup();

    const searchInput = screen.getByRole("searchbox", {
      name: /Find Study Programs/i,
    });
    const searchButton = screen.getByRole("button", { name: /^Search$/i });

    await user.type(searchInput, "program");
    await user.click(searchButton);

    const apiErrorMessage = await screen.findByText(/^Search failed\.$/i);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(apiErrorMessage).toBeInTheDocument();
  });

  test("shows fallback message on thrown request", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("network"));

    render(<Wrapper />);
    const user = userEvent.setup();

    const searchInput = screen.getByRole("searchbox", {
      name: /Find Study Programs/i,
    });
    const searchButton = screen.getByRole("button", { name: /^Search$/i });

    await user.type(searchInput, "program");
    await user.click(searchButton);

    const fallbackMessage = await screen.findByText(/^Search failed\.$/i);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fallbackMessage).toBeInTheDocument();
  });

  test("shows an error when a successful response has an invalid result", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          message: "Study programs retrieved successfully.",
          data: [{ id: 7, name: "Computer Science" }],
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    render(<Wrapper />);
    const user = userEvent.setup();

    await user.type(
      screen.getByRole("searchbox", { name: /Find Study Programs/i }),
      "computer",
    );
    await user.click(screen.getByRole("button", { name: /^Search$/i }));

    expect(await screen.findByText(/^Search failed\.$/i)).toBeInTheDocument();
  });
});
