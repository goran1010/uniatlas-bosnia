import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Home } from "../../../src/components/Home/Home";
import { NotificationContext } from "../../../src/contextData/NotificationContext";
import { MemoryRouter } from "react-router-dom";

describe("Home component", () => {
  test("render component", async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );
    const linkElement = await screen.findByRole("heading", {
      name: /Bosnia Lens/i,
      level: 1,
    });
    expect(linkElement).toBeInTheDocument();
  });

  test("render available data section", async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );
    const linkElement = await screen.findByRole("heading", {
      name: /Available data/i,
      level: 2,
    });
    expect(linkElement).toBeInTheDocument();
  });

  test("render contributing section", async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );
    const linkElement = await screen.findByRole("heading", {
      name: /Contributing/i,
      level: 2,
    });
    expect(linkElement).toBeInTheDocument();
  });

  test("render get started section", async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );
    const linkElement = await screen.findByRole("heading", {
      name: /Get started/i,
      level: 2,
    });
    expect(linkElement).toBeInTheDocument();
  });

  test("render get started section with links", async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );
    const linkElement = await screen.findByRole("link", {
      name: /REST API/i,
    });
    expect(linkElement).toBeInTheDocument();
    const linkElement2 = await screen.findByRole("link", {
      name: /Postal Codes/i,
    });
    expect(linkElement2).toBeInTheDocument();
  });
});
