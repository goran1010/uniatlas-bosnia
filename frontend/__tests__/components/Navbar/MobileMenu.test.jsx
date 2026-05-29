import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { MobileMenu } from "../../../src/components/Navbar/MobileMenu";
import { RootContextProvider } from "../../rootContextProvider";

beforeEach(() => {
  localStorage.setItem("language", "en");
});

function Wrapper({ userData, setIsMenuOpen }) {
  return (
    <RootContextProvider rootValue={{ userData, setUserData: vi.fn() }}>
      <MemoryRouter>
        <MobileMenu setIsMenuOpen={setIsMenuOpen} userData={userData} />
      </MemoryRouter>
    </RootContextProvider>
  );
}

describe("MobileMenu", () => {
  test("renders guest links without contributor and admin links", () => {
    render(<Wrapper userData={null} setIsMenuOpen={vi.fn()} />);

    expect(screen.getByRole("link", { name: /Home/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /API Docs/i })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Universities/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^Log In$/i })).toBeInTheDocument();

    expect(
      screen.queryByRole("link", { name: /Improve Data/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /^Admin$/i }),
    ).not.toBeInTheDocument();
  });

  test("renders contributor link for authenticated contributor", () => {
    render(
      <Wrapper
        userData={{ id: "1", username: "User", role: "CONTRIBUTOR" }}
        setIsMenuOpen={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("link", { name: /Improve Data/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /^Admin$/i }),
    ).not.toBeInTheDocument();
  });

  test("renders admin link for authenticated admin", () => {
    render(
      <Wrapper
        userData={{ id: "1", username: "Admin", role: "ADMIN" }}
        setIsMenuOpen={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("link", { name: /Improve Data/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^Admin$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Profile/i })).toBeInTheDocument();
  });

  test("closes mobile menu when navigation links are clicked", async () => {
    const setIsMenuOpen = vi.fn();

    render(
      <Wrapper
        userData={{ id: "1", username: "Admin", role: "ADMIN" }}
        setIsMenuOpen={setIsMenuOpen}
      />,
    );

    const links = screen.getAllByRole("link");
    for (const link of links) {
      await userEvent.click(link);
    }

    expect(setIsMenuOpen).toHaveBeenCalled();
    expect(setIsMenuOpen).toHaveBeenCalledWith(false);
  });
});
