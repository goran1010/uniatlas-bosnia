import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeSwitcher } from "../../../src/components/Navbar/ThemeSwitcher";
import { RootContextProvider } from "../../rootContextProvider";

function Wrapper({ addNotification, setThemeMenuOpen, setMode }) {
  return (
    <RootContextProvider
      rootValue={{
        addNotification,
        removeNotification: vi.fn(),
      }}
    >
      <ThemeSwitcher setMode={setMode} setThemeMenuOpen={setThemeMenuOpen} />
    </RootContextProvider>
  );
}

describe("ThemeSwitcher", () => {
  test.each([
    {
      optionValue: "system",
      expectedMode: "system",
      expectedMessage: "Switched to system theme",
    },
    {
      optionValue: "light",
      expectedMode: "light",
      expectedMessage: "Switched to light theme",
    },
    {
      optionValue: "dark",
      expectedMode: "dark",
      expectedMessage: "Switched to dark theme",
    },
  ])(
    "changes mode using $optionValue",
    async ({ optionValue, expectedMode, expectedMessage }) => {
      const addNotification = vi.fn();
      const setMode = vi.fn();

      render(
        <Wrapper
          addNotification={addNotification}
          setThemeMenuOpen={vi.fn()}
          setMode={setMode}
        />,
      );

      const themeSelect = screen.getByRole("combobox", {
        name: /Toggle theme menu/i,
      });

      expect(themeSelect).toBeInTheDocument();
      await userEvent.selectOptions(themeSelect, optionValue);

      expect(setMode).toHaveBeenCalledWith(expectedMode);
      expect(addNotification).toHaveBeenCalledWith({
        type: "info",
        message: expectedMessage,
      });
    },
  );
});
