import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "../../src/components/Footer";
import { RootContextProvider } from "../rootContextProvider";

function MockLanguageProvider({ children }) {
  return <RootContextProvider>{children}</RootContextProvider>;
}

describe("ErrorPage Component", () => {
  test("Footer component", () => {
    render(
      <MockLanguageProvider>
        <Footer />
      </MockLanguageProvider>,
    );

    const name = screen.getByText(/goran jovi/i);
    expect(name).toBeInTheDocument();
    const email = screen.getByText(/goran1010jovic@gmail.com/i);
    expect(email).toBeInTheDocument();
  });
});
