import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Home } from "../../../src/components/Home/Home";
import { MemoryRouter } from "react-router-dom";
import { RootContextProvider } from "../../rootContextProvider";

function Wrapper({ children }) {
  return <RootContextProvider>{children}</RootContextProvider>;
}

describe("Home component", () => {
  test("render component", async () => {
    render(
      <MemoryRouter>
        <Wrapper>
          <Home />
        </Wrapper>
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
        <Wrapper>
          <Home />
        </Wrapper>
      </MemoryRouter>,
    );
    const linkElement = await screen.findByRole("heading", {
      name: /Explore the Data/i,
      level: 2,
    });
    expect(linkElement).toBeInTheDocument();
  });

  test("render contributing section", async () => {
    render(
      <MemoryRouter>
        <Wrapper>
          <Home />
        </Wrapper>
      </MemoryRouter>,
    );
    const linkElement = await screen.findByRole("heading", {
      name: /Improve the Data/i,
      level: 2,
    });
    expect(linkElement).toBeInTheDocument();
  });

  test("render get started section", async () => {
    render(
      <MemoryRouter>
        <Wrapper>
          <Home />
        </Wrapper>
      </MemoryRouter>,
    );
    const linkElement = await screen.findByRole("heading", {
      name: /For Developers/i,
      level: 2,
    });
    expect(linkElement).toBeInTheDocument();
  });

  test("render get started section with links", async () => {
    render(
      <MemoryRouter>
        <Wrapper>
          <Home />
        </Wrapper>
      </MemoryRouter>,
    );
    const linkElement = await screen.findByRole("link", {
      name: /View API Docs/i,
    });
    expect(linkElement).toBeInTheDocument();
    const linkElement2 = await screen.findByRole("link", {
      name: /Universities/i,
    });
    expect(linkElement2).toBeInTheDocument();
  });
});
