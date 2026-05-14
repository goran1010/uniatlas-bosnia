import { describe, test, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { Api } from "../../../src/components/Api/Api";
import {
  endpoints,
  authenticatedGroups,
} from "../../../src/components/Api/utils/endpoints";

describe("Api component", () => {
  test("renders the main REST API heading", async () => {
    render(<Api />);
    const heading = await screen.findByRole("heading", {
      name: /REST API/i,
      level: 1,
    });
    expect(heading).toBeInTheDocument();
  });

  test("renders the postal code object section heading", () => {
    render(<Api />);
    expect(
      screen.getByRole("heading", { name: /Postal code object/i, level: 2 }),
    ).toBeInTheDocument();
  });

  test("renders postal code schema snippet", () => {
    render(<Api />);
    expect(screen.getByText(/POSTE_SRP/)).toBeInTheDocument();
  });

  test("renders the Endpoints section heading", () => {
    render(<Api />);
    expect(
      screen.getByRole("heading", { name: /^Endpoints$/i, level: 2 }),
    ).toBeInTheDocument();
  });

  test("renders all public endpoint paths", () => {
    render(<Api />);
    for (const ep of endpoints) {
      expect(screen.getAllByText(ep.path).length).toBeGreaterThan(0);
    }
  });

  test("renders the authenticated data contribution flow section heading", () => {
    render(<Api />);
    expect(
      screen.getByRole("heading", {
        name: /Authenticated Data Contribution Flow/i,
        level: 2,
      }),
    ).toBeInTheDocument();
  });

  test("renders all authenticated group titles", () => {
    render(<Api />);
    for (const group of authenticatedGroups) {
      expect(
        screen.getByRole("heading", { name: group.title, level: 3 }),
      ).toBeInTheDocument();
    }
  });

  test("renders all authenticated endpoint paths", () => {
    render(<Api />);
    for (const group of authenticatedGroups) {
      for (const ep of group.endpoints) {
        expect(screen.getAllByText(ep.path).length).toBeGreaterThan(0);
      }
    }
  });

  test("renders method tags for authenticated endpoints", () => {
    render(<Api />);
    const authSection = screen
      .getByRole("heading", { name: /Authenticated Data Contribution Flow/i })
      .closest("section");
    expect(within(authSection).getAllByText("GET").length).toBeGreaterThan(0);
    expect(within(authSection).getAllByText("POST").length).toBeGreaterThan(0);
  });

  test("renders session credentials note", () => {
    render(<Api />);
    expect(screen.getByText(/credentials: include/i)).toBeInTheDocument();
  });

  test("renders CSRF protection note", () => {
    render(<Api />);
    expect(screen.getByText(/CSRF protection/i)).toBeInTheDocument();
  });
});
