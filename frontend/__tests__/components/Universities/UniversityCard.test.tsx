import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { UniversityCard } from "../../../src/components/Universities/UniversityCard";
import { Notifications } from "../../../src/components/Notifications";
import { RootContextProvider } from "../../rootContextProvider";

import type { University } from "../../../src/components/Universities/GetAllUniversities";

const baseUniversity: University = {
  id: 1,
  name: "University of Sarajevo",
  acronym: "UNSA",
  city: "Sarajevo",
  entity: "FBiH",
  ownership: "JAVNA",
  foundedYear: "1949",
  website: "https://unsa.ba",
  faculties: [],
};

function Wrapper({ university = baseUniversity }) {
  return (
    <RootContextProvider>
      <MemoryRouter>
        <Notifications />
        <ul>
          <UniversityCard university={university} />
        </ul>
      </MemoryRouter>
    </RootContextProvider>
  );
}

describe("UniversityCard", () => {
  beforeEach(() => {
    const mockResponse = new Response(
      JSON.stringify({ data: { faculties: [] } }),
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

  test("renders basic university metadata", () => {
    render(<Wrapper />);

    const universityName = screen.getByText(/University of Sarajevo/i);
    const cityText = screen.getByText(/^📍\s*Sarajevo$/i);
    const entityText = screen.getByText(/FBiH/i);
    const foundedText = screen.getByText(/Founded: 1949/i);
    const websiteLink = screen.getByRole("link", {
      name: /https:\/\/unsa\.ba/i,
    });

    expect(universityName).toBeInTheDocument();
    expect(cityText).toBeInTheDocument();
    expect(entityText).toBeInTheDocument();
    expect(foundedText).toBeInTheDocument();
    expect(websiteLink).toHaveAttribute("href", "https://unsa.ba");
  });

  test("loads details, can hide details, and reopens cached details without refetch", async () => {
    const mockResponse = new Response(
      JSON.stringify({ data: { faculties: [] } }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse);

    render(<Wrapper />);
    const user = userEvent.setup();

    const viewDetailsButton = screen.getByRole("button", {
      name: /View details/i,
    });

    await user.click(viewDetailsButton);

    const noFacultiesText = await screen.findByText(/Faculties: —/i);
    expect(noFacultiesText).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(1);

    const hideDetailsButton = screen.getByRole("button", {
      name: /Hide details/i,
    });
    await user.click(hideDetailsButton);

    expect(screen.queryByText(/Faculties: —/i)).not.toBeInTheDocument();

    const showCachedDetailsButton = screen.getByRole("button", {
      name: /View details/i,
    });
    await user.click(showCachedDetailsButton);

    const cachedDetails = await screen.findByText(/Faculties: —/i);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(cachedDetails).toBeInTheDocument();
  });

  test("expands nested faculty, study program and subject rows", async () => {
    const mockResponse = new Response(
      JSON.stringify({
        data: {
          faculties: [
            {
              id: 11,
              name: "Faculty of Electrical Engineering",
              studyPrograms: [
                {
                  id: 21,
                  name: "Computer Science",
                  cycle: "FIRST",
                  ects: 180,
                  subjects: [
                    {
                      id: 31,
                      name: "Algorithms",
                      semester: 3,
                      ects: 6,
                      type: "OBAVEZNI",
                    },
                  ],
                },
              ],
            },
          ],
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse);

    render(<Wrapper />);
    const user = userEvent.setup();

    const viewDetailsButton = screen.getByRole("button", {
      name: /View details/i,
    });
    await user.click(viewDetailsButton);

    const facultiesTitle = await screen.findByText(/1 Faculties/i);
    expect(facultiesTitle).toBeInTheDocument();

    const facultyButton = screen.getByRole("button", {
      name: /Faculty of Electrical Engineering/i,
    });
    await user.click(facultyButton);

    const studyProgramButton = await screen.findByRole("button", {
      name: /Computer Science/i,
    });
    await user.click(studyProgramButton);

    const subjectName = await screen.findByText(/Algorithms/i);
    const semesterText = screen.getByText(/Semester 3/i);
    const ectsText = screen.getByText(/6 ECTS/i);
    const subjectType = screen.getByText(/OBAVEZNI/i);

    expect(subjectName).toBeInTheDocument();
    expect(semesterText).toBeInTheDocument();
    expect(ectsText).toBeInTheDocument();
    expect(subjectType).toBeInTheDocument();
  });

  test("shows API error notification when details response is non-ok", async () => {
    const mockErrorResponse = new Response(
      JSON.stringify({ error: { message: "Failed from API." } }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockErrorResponse);

    render(<Wrapper />);
    const user = userEvent.setup();

    const viewDetailsButton = screen.getByRole("button", {
      name: /View details/i,
    });
    await user.click(viewDetailsButton);

    const apiErrorMessage = await screen.findByText(/Failed from API\./i);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(apiErrorMessage).toBeInTheDocument();
  });

  test("shows fallback notification when details request throws", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("network"));

    render(<Wrapper />);
    const user = userEvent.setup();

    const viewDetailsButton = screen.getByRole("button", {
      name: /View details/i,
    });
    await user.click(viewDetailsButton);

    const fallbackError = await screen.findByText(
      /Failed to load university details\./i,
    );

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fallbackError).toBeInTheDocument();
  });

  test("renders private ownership label", () => {
    render(
      <Wrapper
        university={{
          ...baseUniversity,
          id: 2,
          ownership: "PRIVATNA",
        }}
      />,
    );

    const privateOwnership = screen.getByText(/Private/i);

    expect(privateOwnership).toBeInTheDocument();
  });
});
