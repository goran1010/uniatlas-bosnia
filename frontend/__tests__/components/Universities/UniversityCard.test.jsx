import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { UniversityCard } from "../../../src/components/Universities/UniversityCard";
import { Notifications } from "../../../src/components/Notifications";
import { RootContextProvider } from "../../rootContextProvider";

const baseUniversity = {
  id: 1,
  name: "University of Sarajevo",
  acronym: "UNSA",
  city: "Sarajevo",
  entity: "FBIH",
  ownership: "JAVNA",
  foundedYear: 1949,
  website: "https://unsa.ba",
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
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: { faculties: [] } }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("renders basic university metadata", () => {
    render(<Wrapper />);

    const universityName = screen.getByText(/University of Sarajevo/i);
    const cityText = screen.getByText(/^📍\s*Sarajevo$/i);
    const entityText = screen.getByText(/Federation of B&H/i);
    const ownershipText = screen.getByText(/Public/i);
    const foundedText = screen.getByText(/Founded: 1949/i);
    const websiteLink = screen.getByRole("link", {
      name: /https:\/\/unsa\.ba/i,
    });

    expect(universityName).toBeInTheDocument();
    expect(cityText).toBeInTheDocument();
    expect(entityText).toBeInTheDocument();
    expect(ownershipText).toBeInTheDocument();
    expect(foundedText).toBeInTheDocument();
    expect(websiteLink).toHaveAttribute("href", "https://unsa.ba");
  });

  test("loads details, can hide details, and reopens cached details without refetch", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: { faculties: [] } }),
    });

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
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
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
                      type: "MANDATORY",
                    },
                  ],
                },
              ],
            },
          ],
        },
      }),
    });

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
    const subjectType = screen.getByText(/Mandatory/i);

    expect(subjectName).toBeInTheDocument();
    expect(semesterText).toBeInTheDocument();
    expect(ectsText).toBeInTheDocument();
    expect(subjectType).toBeInTheDocument();
  });

  test("shows API error notification when details response is non-ok", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: { message: "Failed from API." } }),
    });

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
          acronym: null,
          website: null,
          foundedYear: null,
        }}
      />,
    );

    const privateOwnership = screen.getByText(/Private/i);

    expect(privateOwnership).toBeInTheDocument();
  });
});
