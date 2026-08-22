import { render, screen } from "@testing-library/react";
import { About } from "../../../../src/components/About/About";
import { MemoryRouter } from "react-router";
import { RootContextProvider } from "../../../utils/rootContextProvider";
import type { ReactElement } from "react";

function Wrapper({ children }: { children: ReactElement }) {
  return <RootContextProvider>{children}</RootContextProvider>;
}

describe("About component", () => {
  test("render component", async () => {
    render(
      <MemoryRouter>
        <Wrapper>
          <About />
        </Wrapper>
      </MemoryRouter>,
    );
    const linkElement = await screen.findByRole("heading", {
      name: /Universities and Academic Programs in Bosnia and Herzegovina/i,
      level: 1,
    });
    expect(linkElement).toBeInTheDocument();
  });

  test("render available data section", async () => {
    render(
      <MemoryRouter>
        <Wrapper>
          <About />
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
          <About />
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
          <About />
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
          <About />
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
