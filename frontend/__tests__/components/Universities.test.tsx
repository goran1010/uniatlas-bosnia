import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Universities } from "../../src/components/Universities/Universities";
import { RootContextProvider } from "../rootContextProvider";

beforeEach(() => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: true,
    json: async () => ({ data: [], message: "ok" }),
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

function Wrapper() {
  return (
    <RootContextProvider>
      <MemoryRouter>
        <Universities />
      </MemoryRouter>
    </RootContextProvider>
  );
}

describe("Universities page", async () => {
  test("renders tab buttons: Browse All, Search, Find Study Programs", async () => {
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
});
