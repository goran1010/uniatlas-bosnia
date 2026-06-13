import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useTheme } from "../../src/customHooks/useTheme";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove("dark");
});

afterEach(() => {
  vi.restoreAllMocks();
});

function ThemeProbe() {
  const { theme, setMode } = useTheme();

  return (
    <div>
      <span data-testid="theme-value">{theme}</span>
      <button
        type="button"
        onClick={() => {
          setMode("dark");
        }}
      >
        Set Dark
      </button>
      <button
        type="button"
        onClick={() => {
          setMode("light");
        }}
      >
        Set Light
      </button>
      <button
        type="button"
        onClick={() => {
          setMode("system");
        }}
      >
        Set System
      </button>
    </div>
  );
}

describe("useTheme", () => {
  test("loads dark theme from localStorage and applies dark class", () => {
    localStorage.setItem("theme", "dark");

    render(<ThemeProbe />);

    expect(screen.getByTestId("theme-value")).toHaveTextContent("dark");
    expect(document.documentElement).toHaveClass("dark");
  });

  test("sets light mode and writes to localStorage", async () => {
    render(<ThemeProbe />);

    const lightButton = screen.getByRole("button", { name: /Set Light/i });

    expect(lightButton).toBeInTheDocument();
    await userEvent.click(lightButton);

    expect(screen.getByTestId("theme-value")).toHaveTextContent("light");
    expect(localStorage.getItem("theme")).toBe("light");
    expect(document.documentElement).not.toHaveClass("dark");
  });

  test("sets system mode and clears localStorage", async () => {
    render(<ThemeProbe />);

    const systemButton = screen.getByRole("button", { name: /Set System/i });

    expect(systemButton).toBeInTheDocument();
    await userEvent.click(systemButton);

    expect(localStorage.getItem("theme")).toBeNull();
    expect(screen.getByTestId("theme-value")).toHaveTextContent("system");
  });
});
