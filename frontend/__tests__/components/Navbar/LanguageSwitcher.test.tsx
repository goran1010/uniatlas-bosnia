import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageSwitcher } from "../../../src/components/Navbar/LanguageSwitcher";
import { RootContextProvider } from "../../rootContextProvider";

import type { AddNotification } from "../../../src/customHooks/useNotification";
import type { SetLanguage } from "../../../src/customHooks/useLanguage";

afterEach(() => {
  vi.restoreAllMocks();
});

beforeEach(() => {
  localStorage.setItem("language", "en");
});

interface WrapperProps {
  addNotification: AddNotification;
  setLanguage: SetLanguage;
}

function Wrapper({ addNotification, setLanguage }: WrapperProps) {
  return (
    <RootContextProvider
      rootValue={{
        addNotification,
        removeNotification: vi.fn(),
        setLanguage,
      }}
    >
      <LanguageSwitcher setLanguage={setLanguage} />
    </RootContextProvider>
  );
}

describe("LanguageSwitcher", () => {
  test("switches to browser language", async () => {
    const addNotification = vi.fn();
    const setLanguage = vi.fn();

    render(
      <Wrapper addNotification={addNotification} setLanguage={setLanguage} />,
    );

    const languageSelect = screen.getByRole("combobox", {
      name: /Toggle language/i,
    });

    expect(languageSelect).toBeInTheDocument();
    await userEvent.selectOptions(languageSelect, "system");

    expect(setLanguage).toHaveBeenCalledWith("system");
    expect(addNotification).toHaveBeenCalledWith({
      type: "info",
      message: "Switched to system language",
    });
  });

  test.each([
    {
      languageButton: /English/i,
      expectedLanguage: "en",
      expectedMessage: "Switched to English",
    },
    {
      languageButton: /Serbian/i,
      expectedLanguage: "sr",
      expectedMessage: "Switched to Serbian",
    },
  ])(
    "switches language using $languageButton",
    async ({ expectedLanguage, expectedMessage }) => {
      const addNotification = vi.fn();
      const setLanguage = vi.fn();

      render(
        <Wrapper addNotification={addNotification} setLanguage={setLanguage} />,
      );

      const languageSelect = screen.getByRole("combobox", {
        name: /Toggle language/i,
      });

      expect(languageSelect).toBeInTheDocument();
      await userEvent.selectOptions(languageSelect, expectedLanguage);

      expect(setLanguage).toHaveBeenCalledWith(expectedLanguage);
      expect(addNotification).toHaveBeenCalledWith({
        type: "info",
        message: expectedMessage,
      });
    },
  );
});
