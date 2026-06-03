import { test, describe, expect, beforeEach, afterEach, vi } from "vitest";
import { SignUp } from "../../src/components/SignUp/SignUp";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { LogIn } from "../../src/components/LogIn/LogIn";
import { Notifications } from "../../src/components/Notifications";
import { RootContextProvider } from "../rootContextProvider";

vi.mock("../../src/components/utils/getCsrfToken", () => ({
  getCsrfToken: async () => "mocked-csrf-token",
  clearCsrfToken: () => {},
}));

const user = userEvent.setup();

beforeEach(async () => {
  function Wrapper() {
    return (
      <RootContextProvider>
        <MemoryRouter initialEntries={["/signup"]}>
          <Notifications />
          <Routes>
            <Route path="/signup" element={<SignUp />} />
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

function createFormElements() {
  return {
    emailField: screen.getByLabelText(/Email/i),
    passwordField: screen.getByLabelText("Password"),
    confirmPasswordField: screen.getByLabelText(/Confirm Password/i),
    signUpButton: screen.getByRole("button", { name: /Create/i }),
  };
}

async function submitSignUpForm({ email, password, confirmPassword, button }) {
  const { emailField, passwordField, confirmPasswordField, signUpButton } =
    createFormElements();

  await user.type(emailField, email);
  await user.type(passwordField, password);
  await user.type(confirmPasswordField, confirmPassword);
  await user.click(button ?? signUpButton);
}

describe("Render SignUp Component", () => {
  test("SignUp component heading", () => {
    const linkElement = screen.getByRole("heading", {
      name: /Create your account/i,
    });
    expect(linkElement).toBeInTheDocument();
  });

  test("SignUp form fields", () => {
    const formElements = createFormElements();

    for (let element in formElements) {
      expect(formElements[element]).toBeInTheDocument();
    }
  });

  test("redirects to home and warns when user is already logged in", async () => {
    function WrapperWithUser() {
      return (
        <RootContextProvider
          initialUserData={{ id: "1", email: "user@mail.com" }}
        >
          <MemoryRouter initialEntries={["/signup"]}>
            <Notifications />
            <Routes>
              <Route path="/" element={<div>Home Page</div>} />
              <Route path="/home" element={<div>Home Page</div>} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/login" element={<LogIn />} />
            </Routes>
          </MemoryRouter>
        </RootContextProvider>
      );
    }

    render(<WrapperWithUser />);

    const warningMessage = await screen.findByText(
      /can't sign up while logged in/i,
    );
    const homePageText = await screen.findByText(/^Home Page$/i);

    expect(warningMessage).toBeInTheDocument();
    expect(homePageText).toBeInTheDocument();
  });
});

describe("User typing in input fields in SignUp Component", () => {
  test("displays user input", async () => {
    const { passwordField, confirmPasswordField, emailField } =
      createFormElements();

    await user.type(emailField, "testuser@example.com");
    await user.type(passwordField, "Password123!");
    await user.type(confirmPasswordField, "Password123!");

    expect(emailField).toHaveValue("testuser@example.com");
    expect(passwordField).toHaveValue("Password123!");
    expect(confirmPasswordField).toHaveValue("Password123!");
  });
});

describe("SignUp Form Validation on input", () => {
  test("shows validation messages for email input", async () => {
    const { emailField } = createFormElements();

    await user.type(emailField, "te");
    expect(emailField).toHaveValue("te");
    expect(emailField.validationMessage).toMatch(
      /Email must have at least 3 characters/i,
    );
    await user.type(emailField, "st");
    expect(emailField).toHaveValue("test");
    expect(emailField.validationMessage).toMatch(
      /Please include an '@' in the email address. 'test' is missing an '@'./i,
    );
    await user.type(emailField, "@");
    expect(emailField).toHaveValue("test@");
    expect(emailField.validationMessage).toMatch(
      /Please enter a part following '@'. test@ is incomplete./i,
    );
    await user.type(emailField, "mail");
    expect(emailField).toHaveValue("test@mail");
    expect(emailField.validationMessage).toBe("");
  });

  test("shows validation messages for password input", async () => {
    const { passwordField } = createFormElements();

    await user.type(passwordField, "pass");
    expect(passwordField).toHaveValue("pass");
    expect(passwordField.validationMessage).toMatch(/at least 6 characters/i);
    await user.type(passwordField, "word");
    expect(passwordField).toHaveValue("password");
    expect(passwordField.validationMessage).toBe("");
  });

  test("shows validation messages for confirm password input", async () => {
    const { passwordField, confirmPasswordField } = createFormElements();

    await user.type(passwordField, "password");
    expect(passwordField).toHaveValue("password");

    await user.type(confirmPasswordField, "different");
    expect(confirmPasswordField).toHaveValue("different");
    expect(confirmPasswordField.validationMessage).toMatch(/must match/i);
    await user.clear(confirmPasswordField);
    await user.type(confirmPasswordField, "password");
    expect(confirmPasswordField).toHaveValue("password");
    expect(confirmPasswordField.validationMessage).toBe("");
  });
});

describe("SignUp Form Validation on Create button click", () => {
  test("shows validation messages for invalid input on Create button click", async () => {
    const { signUpButton, emailField } = createFormElements();

    await user.type(emailField, "te");
    expect(emailField).toHaveValue("te");
    await user.click(signUpButton);
    expect(emailField.validationMessage).toMatch(
      /Email must have at least 3 characters/i,
    );
    await user.type(emailField, "st");
    expect(emailField).toHaveValue("test");
    await user.click(signUpButton);
    expect(emailField.validationMessage).toMatch(
      /Please include an '@' in the email address. 'test' is missing an '@'./i,
    );
    await user.type(emailField, "@");
    expect(emailField).toHaveValue("test@");
    await user.click(signUpButton);
    expect(emailField.validationMessage).toMatch(
      /Please enter a part following '@'. test@ is incomplete./i,
    );
    await user.type(emailField, "mail");
    expect(emailField).toHaveValue("test@mail");
    await user.click(signUpButton);
    expect(emailField.validationMessage).toBe("");
  });

  test("shows validation messages for password input", async () => {
    const { passwordField, signUpButton } = createFormElements();

    await user.type(passwordField, "pass");
    expect(passwordField).toHaveValue("pass");
    await user.click(signUpButton);
    expect(passwordField.validationMessage).toMatch(/at least 6 characters/i);
    await user.type(passwordField, "word");
    expect(passwordField).toHaveValue("password");
    await user.click(signUpButton);
    expect(passwordField.validationMessage).toBe("");
  });

  test("shows validation messages for confirm password input", async () => {
    const { passwordField, confirmPasswordField, signUpButton } =
      createFormElements();

    await user.type(passwordField, "password");
    expect(passwordField).toHaveValue("password");

    await user.type(confirmPasswordField, "different");
    expect(confirmPasswordField).toHaveValue("different");
    await user.click(signUpButton);
    expect(confirmPasswordField.validationMessage).toMatch(/must match/i);
    await user.clear(confirmPasswordField);
    await user.type(confirmPasswordField, "password");
    expect(confirmPasswordField).toHaveValue("password");
    await user.click(signUpButton);
    expect(confirmPasswordField.validationMessage).toBe("");
  });
});

describe("SignUp Form Submit", () => {
  test("Shows error message after clicking Create when fetching with existing email", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        error: {
          message:
            "Validation failed: Email already in use Fix the highlighted fields and try again.",
        },
      }),
    });
    await submitSignUpForm({
      email: "newemail@mail.com",
      password: "Password123!",
      confirmPassword: "Password123!",
    });

    expect(fetch).toHaveBeenCalledTimes(1);

    const emailInUseMessage = await screen.findByText(/Email already in use/i);
    expect(emailInUseMessage).toBeInTheDocument();
  });

  test("Redirects to LogIn on successful form submit", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        message: "Registration successful! Check your email.",
      }),
    });

    await submitSignUpForm({
      email: "newemail@mail.com",
      password: "Password123!",
      confirmPassword: "Password123!",
    });

    const logInButton = await screen.findByRole("button", { name: /Log In/i });
    expect(logInButton).toBeInTheDocument();

    const successMessage = await screen.findByText(
      /Registration successful! Check your email./i,
    );
    expect(successMessage).toBeInTheDocument();
  });

  test("shows error message when network request throws", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(
      new Error("Network error"),
    );

    await submitSignUpForm({
      email: "newemail@mail.com",
      password: "Password123!",
      confirmPassword: "Password123!",
    });

    const networkErrorMessage = await screen.findByText(
      /An error occurred during registration/i,
    );
    expect(networkErrorMessage).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });

  test("shows fallback registration failed message when backend error payload is missing", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({}),
    });

    await submitSignUpForm({
      email: "newemail@mail.com",
      password: "Password123!",
      confirmPassword: "Password123!",
    });

    const fallbackError = await screen.findByText(/^Registration failed\.$/i);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fallbackError).toBeInTheDocument();
  });
});
