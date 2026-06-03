import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { LogIn } from "../../../src/components/LogIn/LogIn";
import { Home } from "../../../src/components/Home/Home";
import { Notifications } from "../../../src/components/Notifications";
import { RootContextProvider } from "../../rootContextProvider";

vi.mock("../../../src/components/utils/getCsrfToken", () => ({
  getCsrfToken: async () => "mocked-csrf-token",
  clearCsrfToken: () => {},
}));

const user = userEvent.setup();

function createFormElements() {
  return {
    emailField: screen.getByLabelText(/Email/i),
    passwordField: screen.getByLabelText("Password"),
    logInButton: screen.getByRole("button", { name: "Log in" }),
  };
}

async function submitLogInForm({ email, password }) {
  const { emailField, passwordField, logInButton } = createFormElements();

  await user.type(emailField, email);
  await user.type(passwordField, password);
  await user.click(logInButton);
}

beforeEach(async () => {
  function Wrapper() {
    return (
      <RootContextProvider>
        <MemoryRouter initialEntries={["/login"]}>
          <Notifications />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LogIn />} />
          </Routes>
        </MemoryRouter>
      </RootContextProvider>
    );
  }

  render(<Wrapper />);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Render LogIn Component", () => {
  test("LogIn component heading", () => {
    const linkElement = screen.getByRole("heading", {
      name: /Log in/i,
    });
    expect(linkElement).toBeInTheDocument();
  });

  test("LogIn form fields", () => {
    const formElements = createFormElements();

    for (let element in formElements) {
      expect(formElements[element]).toBeInTheDocument();
    }
  });

  test("shows github login error notification from query params", async () => {
    function WrapperWithGithubError() {
      return (
        <RootContextProvider>
          <MemoryRouter initialEntries={["/login?error=github"]}>
            <Notifications />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<LogIn />} />
            </Routes>
          </MemoryRouter>
        </RootContextProvider>
      );
    }

    render(<WrapperWithGithubError />);

    const githubFailed = await screen.findByText(/GitHub login failed/i);

    expect(githubFailed).toBeInTheDocument();
  });

  test("redirects to home and warns when user is already logged in", async () => {
    function WrapperWithUser() {
      return (
        <RootContextProvider
          initialUserData={{ id: "1", email: "user@mail.com" }}
        >
          <MemoryRouter initialEntries={["/login"]}>
            <Notifications />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
              <Route path="/login" element={<LogIn />} />
            </Routes>
          </MemoryRouter>
        </RootContextProvider>
      );
    }

    render(<WrapperWithUser />);

    const alreadyLoggedIn = await screen.findByText(/already logged in/i);
    const homePageText = await screen.findByText(
      /A free, open-source project/i,
    );

    expect(alreadyLoggedIn).toBeInTheDocument();
    expect(homePageText).toBeInTheDocument();
  });
});

describe("User typing in input fields in LogIn Component", () => {
  test("displays user input", async () => {
    const { passwordField, emailField } = createFormElements();

    await user.type(emailField, "testuser@example.com");
    await user.type(passwordField, "Password123!");

    expect(emailField).toHaveValue("testuser@example.com");
    expect(passwordField).toHaveValue("Password123!");
  });
});

describe("LogIn form validation on input", () => {
  test("shows validation messages for invalid email", async () => {
    const { emailField } = createFormElements();

    await user.type(emailField, "notanemail");
    expect(emailField).toHaveValue("notanemail");
    expect(emailField.validationMessage).toMatch(/valid email/i);
    await user.clear(emailField);
    await user.type(emailField, "test@mail.com");
    expect(emailField).toHaveValue("test@mail.com");
    expect(emailField.validationMessage).toBe("");
  });
  test("shows validation messages for invalid password", async () => {
    const { passwordField } = createFormElements();

    await user.type(passwordField, "pass");
    expect(passwordField).toHaveValue("pass");
    expect(passwordField.validationMessage).toMatch(/at least 6 characters/i);
    await user.type(passwordField, "word");
    expect(passwordField).toHaveValue("password");
    expect(passwordField.validationMessage).toBe("");
  });
});

describe("LogIn for validation on button click", () => {
  test("shows validation messages for invalid email input", async () => {
    const { logInButton, emailField } = createFormElements();

    await user.type(emailField, "notanemail");
    await user.click(logInButton);

    expect(emailField).toHaveValue("notanemail");
    expect(emailField.validationMessage).toMatch(/valid email/i);

    await user.clear(emailField);
    await user.type(emailField, "test@mail.com");
    await user.click(logInButton);

    expect(emailField).toHaveValue("test@mail.com");
    expect(emailField.validationMessage).toBe("");
  });

  test("shows validation messages for invalid password input", async () => {
    const { logInButton, passwordField } = createFormElements();

    await user.type(passwordField, "pass");
    await user.click(logInButton);

    expect(passwordField).toHaveValue("pass");
    expect(passwordField.validationMessage).toMatch(/at least 6 characters/i);

    await user.type(passwordField, "word");
    await user.click(logInButton);

    expect(passwordField).toHaveValue("password");
    expect(passwordField.validationMessage).toBe("");
  });
});

describe("LogIn Form Submit", () => {
  test("Shows error message after clicking Create when fetching with wrong email/password", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        error: {
          message:
            "Login failed: Invalid email or password. Check your credentials and try again.",
        },
      }),
    });

    await submitLogInForm({
      email: "existing@user.com",
      password: "Password123!",
    });

    const errorMessage = await screen.findByText(/Invalid email or password/i);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(errorMessage).toBeInTheDocument();
  });

  test("Redirects to Home on successful form submit", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        username: "new_user",
      }),
    });

    await submitLogInForm({ email: "new@user.com", password: "Password123!" });

    const homePageText = await screen.findByText(
      /A free, open-source project/i,
    );
    expect(homePageText).toBeInTheDocument();
  });

  test("shows error message when network request throws", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(
      new Error("Network error"),
    );

    await submitLogInForm({
      email: "existing@user.com",
      password: "Password123!",
    });

    const networkErrorMessage = await screen.findByText(
      /An error occurred while logging in/i,
    );
    expect(networkErrorMessage).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });

  test("shows fallback login failed message when backend error payload is missing", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({}),
    });

    await submitLogInForm({
      email: "existing@user.com",
      password: "Password123!",
    });

    const fallbackError = await screen.findByText(/^Login failed\.$/i);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fallbackError).toBeInTheDocument();
  });
});
