import { test, describe, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { Root } from "../../../src/Root";
import { Notifications } from "../../../src/components/Notifications";
import { Navbar } from "../../../src/components/Navbar/Navbar";
import userEvent from "@testing-library/user-event";
import { useCloseMenu } from "../../../src/customHooks/useCloseMenu";
import { RootContextProvider } from "../../rootContextProvider";

function createUser(role = "ADMIN") {
  return {
    id: "1",
    username: "Test User",
    email: "test@example.com",
    role,
  };
}

beforeEach(() => {
  localStorage.setItem("language", "en");

  vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: true,
    json: async () => ({
      data: [{ id: 1, code: "mocked code" }],
      message: "mocked message",
    }),
  });
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

  return {
    menuButton,
    mobileMenu: document.getElementById("mobile-menu"),
  };
}

function expectSharedNavbarLinks() {
  expect(screen.getByText(/Home/i)).toBeInTheDocument();
  expect(screen.getByText(/Universities/i)).toBeInTheDocument();
}

describe("Render Navbar on root route", () => {
  function Wrapper({ initialUser = null }) {
    return (
      <RootContextProvider initialUserData={initialUser}>
        <MemoryRouter initialEntries={["/"]}>
          <Notifications />
          <Routes>
            <Route path="/" element={<Root />} />
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
      <Wrapper
        initialUser={{ id: "1", username: "Test User", role: "USER" }}
      />,
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

function NavbarWrapper({ role = "ADMIN", withUser = true }) {
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

describe("render Navbar mobile menu", () => {
  test.each(["ADMIN", "CONTRIBUTOR"])(
    "opens mobile menu for %s role",
    async (role) => {
      render(<NavbarWrapper role={role} />);

      const { menuButton, mobileMenu } = await openMobileMenu();

      expect(menuButton).toBeInTheDocument();
      expect(mobileMenu).toBeInTheDocument();
      expect(menuButton).toHaveAttribute("aria-expanded", "true");
    },
  );

  test("shows user-only links for contributor in mobile menu", async () => {
    render(<NavbarWrapper role="CONTRIBUTOR" />);

    await openMobileMenu();

    const contributeLinks = document.querySelectorAll(
      "#mobile-menu a[href='/improve-data']",
    );
    const adminLinks = document.querySelectorAll(
      "#mobile-menu a[href='/admin-dashboard']",
    );

    expect(contributeLinks.length).toBe(1);
    expect(adminLinks.length).toBe(0);
  });

  test("shows admin link for admin in mobile menu", async () => {
    render(<NavbarWrapper role="ADMIN" />);

    await openMobileMenu();

    const contributeLinks = document.querySelectorAll(
      "#mobile-menu a[href='/improve-data']",
    );
    const adminLinks = document.querySelectorAll(
      "#mobile-menu a[href='/admin-dashboard']",
    );

    expect(contributeLinks.length).toBe(1);
    expect(adminLinks.length).toBe(1);
  });

  test("hides user-only links when user is not logged in", async () => {
    render(<NavbarWrapper withUser={false} />);

    await openMobileMenu();

    const contributeLinks = document.querySelectorAll(
      "#mobile-menu a[href='/improve-data']",
    );
    const adminLinks = document.querySelectorAll(
      "#mobile-menu a[href='/admin-dashboard']",
    );
    const loginLinks = document.querySelectorAll("a[href='/login']");

    expect(contributeLinks.length).toBe(0);
    expect(adminLinks.length).toBe(0);
    expect(loginLinks.length).toBeGreaterThan(0);
  });
});

describe("Navbar switchers", () => {
  test("opens language menu and closes theme menu", async () => {
    render(<NavbarWrapper />);

    const themeSelect = document.getElementById("theme-switcher");
    const languageSelect = document.getElementById("language-switcher");

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

    const languageSelect = document.getElementById("language-switcher");
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
