import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useCloseMenu } from "../../../src/customHooks/useCloseMenu";

function CloseMenuProbe() {
  const {
    isMenuOpen,
    setIsMenuOpen,
    isThemeMenuOpen,
    setIsThemeMenuOpen,
    isLanguageMenuOpen,
    setIsLanguageMenuOpen,
  } = useCloseMenu();

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          setIsMenuOpen(true);
          setIsThemeMenuOpen(true);
          setIsLanguageMenuOpen(true);
        }}
      >
        Open All Menus
      </button>
      <output data-testid="menu-open">{String(isMenuOpen)}</output>
      <output data-testid="theme-menu-open">{String(isThemeMenuOpen)}</output>
      <output data-testid="language-menu-open">
        {String(isLanguageMenuOpen)}
      </output>
    </div>
  );
}

describe("useCloseMenu", () => {
  test("closes every menu when Escape is pressed", async () => {
    const user = userEvent.setup();
    render(<CloseMenuProbe />);

    await user.click(screen.getByRole("button", { name: "Open All Menus" }));

    expect(screen.getByTestId("menu-open")).toHaveTextContent("true");
    expect(screen.getByTestId("theme-menu-open")).toHaveTextContent("true");
    expect(screen.getByTestId("language-menu-open")).toHaveTextContent("true");

    await user.keyboard("{Escape}");

    expect(screen.getByTestId("menu-open")).toHaveTextContent("false");
    expect(screen.getByTestId("theme-menu-open")).toHaveTextContent("false");
    expect(screen.getByTestId("language-menu-open")).toHaveTextContent("false");
  });
});
