import { test, describe, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { App } from "../../../src/App";
import { Notifications } from "../../../src/components/Notifications";
import { Navbar } from "../../../src/components/Navbar/Navbar";
import userEvent from "@testing-library/user-event";
import { useCloseMenu } from "../../../src/customHooks/useCloseMenu";
import { RootContextProvider } from "../../rootContextProvider";

import type { UserData } from "../../../src/customHooks/useStatusCheck";

function createUser(role: Role = "ADMIN"): UserData {
  return {
    email: "test@example.com",
    role,
  };
}

beforeEach(() => {
  localStorage.setItem("language", "en");
  const mockResponse = new Response(
    JSON.stringify({
      data: [{ id: 1, code: "mocked code" }],
      message: "mocked message",
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );

  vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse);
});

afterEach(() => {
  vi.restoreAllMocks();
});

async function openMobileMenu() {
  const menuButton = await screen.findByRole("button", {
    name: /Toggle navigation menu/i,
  });

  await userEvent.click(menuButton);

  await waitFor(() => {
    expect(menuButton).toHaveAttribute("aria-expanded", "true");
  });

  const controlsId = menuButton.getAttribute("aria-controls");
  if (!controlsId) {
    throw new Error("Menu button does not have aria-controls attribute");
  }
  const mobileMenu = screen
    .getAllByRole("link")
    .find((link) => link.closest(`#${controlsId}`))
    ?.closest("div");

  if (!mobileMenu) {
    throw new Error("Mobile menu not found");
  }

  return {
    menuButton,
    mobileMenu,
  };
}

function expectSharedNavbarLinks() {
  expect(screen.getByText(/Home/i)).toBeInTheDocument();
  expect(screen.getByText(/Universities/i)).toBeInTheDocument();
}

describe("Render Navbar on root route", () => {
  function Wrapper({ initialUser }: { initialUser: UserData }) {
    return (
      <RootContextProvider initialUserData={initialUser}>
        <MemoryRouter initialEntries={["/"]}>
          <Notifications />
          <Routes>
            <Route path="/" element={<App />} />
          </Routes>
        </MemoryRouter>
      </RootContextProvider>
    );
  }
  test("user not logged in", async () => {
    render(<Wrapper initialUser={null} />);
    await screen.findByText(/Home/i);

    const profile = screen.queryByRole("link", { name: /profile/i });

    expect(profile).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /^Log In$/i }),
    ).toBeInTheDocument();
    expectSharedNavbarLinks();
  });

  test("user logged in", async () => {
    render(
      <Wrapper initialUser={{ email: "test@example.com", role: "USER" }} />,
    );
    await screen.findByText(/Home/i);

    const profile = await screen.findByRole("link", { name: /profile/i });

    expect(profile).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /^Log In$/i }),
    ).not.toBeInTheDocument();
    expectSharedNavbarLinks();
  });
});

function NavbarWrapper({
  role = "ADMIN",
  withUser = true,
}: {
  role?: "ADMIN" | "USER";
  withUser?: boolean;
}) {
  const userData = withUser ? createUser(role) : null;

  const closeMenu = useCloseMenu();
  return (
    <RootContextProvider rootValue={{ userData, setUserData: vi.fn() }}>
      <MemoryRouter>
        <Navbar closeMenu={closeMenu} />
      </MemoryRouter>
    </RootContextProvider>
  );
}

type Role = "ADMIN" | "USER";
const roles: Role[] = ["ADMIN", "USER"];

describe("render Navbar mobile menu", () => {
  test.each(roles)("opens mobile menu for %s role", async (role) => {
    render(<NavbarWrapper role={role} />);

    const { menuButton, mobileMenu } = await openMobileMenu();

    expect(menuButton).toBeInTheDocument();
    expect(mobileMenu).toBeInTheDocument();
    expect(menuButton).toHaveAttribute("aria-expanded", "true");
  });

  test("shows user-only links for user in mobile menu", async () => {
    render(<NavbarWrapper role="USER" />);

    const { mobileMenu } = await openMobileMenu();

    expect(
      within(mobileMenu).getByRole("link", { name: /Improve Data/i }),
    ).toBeInTheDocument();
    expect(
      within(mobileMenu).queryByRole("link", { name: /^Admin$/i }),
    ).not.toBeInTheDocument();
  });

  test("shows admin link for admin in mobile menu", async () => {
    render(<NavbarWrapper role="ADMIN" />);

    const { mobileMenu } = await openMobileMenu();

    expect(
      within(mobileMenu).getByRole("link", { name: /Improve Data/i }),
    ).toBeInTheDocument();
    expect(
      within(mobileMenu).getByRole("link", { name: /^Admin$/i }),
    ).toBeInTheDocument();
  });

  test("hides user-only links when user is not logged in", async () => {
    render(<NavbarWrapper withUser={false} />);

    const { mobileMenu } = await openMobileMenu();

    expect(
      within(mobileMenu).queryByRole("link", { name: /Improve Data/i }),
    ).not.toBeInTheDocument();
    expect(
      within(mobileMenu).queryByRole("link", { name: /^Admin$/i }),
    ).not.toBeInTheDocument();
    expect(
      within(mobileMenu).getByRole("link", { name: /^Log In$/i }),
    ).toBeInTheDocument();
  });
});

describe("Navbar switchers", () => {
  test("opens language menu and closes theme menu", async () => {
    render(<NavbarWrapper />);

    const themeSelect: HTMLSelectElement = screen.getByRole("combobox", {
      name: /Toggle theme/i,
    });
    const languageSelect: HTMLSelectElement = screen.getByRole("combobox", {
      name: /Toggle language/i,
    });

    expect(themeSelect).toBeInTheDocument();
    expect(languageSelect).toBeInTheDocument();

    await userEvent.selectOptions(themeSelect, "light");
    expect(localStorage.getItem("theme")).toBe("light");
    expect(themeSelect.value).toBe("");

    await userEvent.selectOptions(languageSelect, "sr");
    expect(localStorage.getItem("language")).toBe("sr");
    expect(languageSelect.value).toBe("");
  });

  test("closes open menus when navbar is clicked", async () => {
    render(<NavbarWrapper />);

    const languageSelect: HTMLSelectElement = screen.getByRole("combobox", {
      name: /Toggle language/i,
    });
    expect(languageSelect).toBeInTheDocument();

    await userEvent.selectOptions(languageSelect, "sr");
    expect(localStorage.getItem("language")).toBe("sr");
    expect(languageSelect.value).toBe("");

    const navigation = screen.getByRole("navigation");
    expect(navigation).toBeInTheDocument();

    await userEvent.click(navigation);
    expect(localStorage.getItem("language")).toBe("sr");
    expect(languageSelect.value).toBe("");
  });
});

describe("render Menu based on viewport size", () => {
  test("Menu has the appropriate css", async () => {
    render(<NavbarWrapper />);

    const homeLink = await screen.findByRole("link", { name: /Home/i });
    const universitiesLink = screen.getByRole("link", {
      name: /Universities/i,
    });

    expect(homeLink).toBeInTheDocument();
    expect(universitiesLink).toBeInTheDocument();

    const menuButton = screen.getByRole("button", {
      name: /Toggle navigation menu/i,
    });

    expect(menuButton.parentElement).toHaveClass("flex");
    expect(menuButton.parentElement).toHaveClass("md:hidden");
  });
});
