import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { GetAllUniversities } from "../../../src/components/Universities/GetAllUniversities";
import { Notifications } from "../../../src/components/Notifications";
import { RootContextProvider } from "../../rootContextProvider";

function Wrapper() {
  return (
    <RootContextProvider>
      <MemoryRouter>
        <Notifications />
        <GetAllUniversities />
      </MemoryRouter>
    </RootContextProvider>
  );
}

describe("GetAllUniversities", () => {
  beforeEach(() => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: [] }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("renders empty state when API returns no universities", async () => {
    render(<Wrapper />);

    const emptyMessage = await screen.findByText(/No universities found\./i);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(emptyMessage).toBeInTheDocument();
  });

  test("renders universities list when API call succeeds", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        data: [
          {
            id: 1,
            name: "University of Sarajevo",
            acronym: "UNSA",
            city: "Sarajevo",
            entity: "FBIH",
            ownership: "JAVNA",
            foundedYear: 1949,
            website: "https://unsa.ba",
          },
        ],
      }),
    });

    render(<Wrapper />);

    const universityName = await screen.findByText(/University of Sarajevo/i);
    const detailsButton = screen.getByRole("button", { name: /View details/i });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(universityName).toBeInTheDocument();
    expect(detailsButton).toBeInTheDocument();
  });

  test("shows API error notification for non-ok response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({
        error: { message: "Backend failed to load data." },
      }),
    });

    render(<Wrapper />);

    const errorMessage = await screen.findByText(
      /Backend failed to load data\./i,
    );

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(errorMessage).toBeInTheDocument();
  });

  test("shows fallback notification when request throws", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("network"));

    render(<Wrapper />);

    const fallbackMessage = await screen.findByText(
      /Failed to load universities\./i,
    );

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fallbackMessage).toBeInTheDocument();
  });
});
