import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ContributionDashboard } from "../../../src/components/ContributionDashboard/ContributionDashboard";
import { NotificationContext } from "../../../src/contextData/NotificationContext";
import { UserDataContext } from "../../../src/contextData/UserDataContext";
import { useNotification } from "../../../src/customHooks/useNotification";
import { Notifications } from "../../../src/components/Notifications";
import { useState } from "react";
import userEvent from "@testing-library/user-event";

const user = userEvent.setup();

function Wrapper({ initialUser = null }) {
  const [userData, setUserData] = useState(initialUser);
  const { notifications, addNotification, removeNotification } =
    useNotification();

  return (
    <NotificationContext
      value={{ notifications, addNotification, removeNotification }}
    >
      <UserDataContext value={{ userData, setUserData }}>
        <MemoryRouter initialEntries={["/contribution-dashboard"]}>
          <Notifications />
          <Routes>
            <Route
              path="/contribution-dashboard"
              element={<ContributionDashboard />}
            />
          </Routes>
        </MemoryRouter>
      </UserDataContext>
    </NotificationContext>
  );
}

const createFetchResponse = (result, ok = true) => ({
  ok,
  json: async () => result,
});

const fetchMock = vi.fn();

const setupFetchMock = () => {
  fetchMock.mockReset();
  fetchMock.mockImplementation((requestUrl) => {
    if (requestUrl.includes("/csrf-token")) {
      return Promise.resolve(
        createFetchResponse({
          data: "mocked-csrf-token",
          message: "CSRF token generated successfully",
        }),
      );
    }

    if (
      requestUrl.includes("/users/contribution/pending-changes/postal-codes")
    ) {
      return Promise.resolve(
        createFetchResponse({
          data: [
            {
              id: 2,
              city: "Pending City",
              code: "54321",
              post: "",
              typeOfChange: "DELETE",
            },
          ],

          message: "Pending changes retrieved successfully",
        }),
      );
    }

    if (requestUrl.includes("/postal-codes/search")) {
      return Promise.resolve(
        createFetchResponse({
          data: [
            {
              id: 1,
              city: "Test City",
              code: "12345",
              post: "",
            },
          ],
          message: "Postal code found successfully",
        }),
      );
    }

    if (requestUrl.includes("/postal-codes")) {
      return Promise.resolve(
        createFetchResponse({
          data: [
            {
              id: 1,
              city: "Test City",
              code: "12345",
              post: "",
            },
            { id: 2, city: "Test City 2", code: "12346", post: "" },
          ],
          message: "Postal codes retrieved successfully",
        }),
      );
    }

    return Promise.resolve(
      createFetchResponse({ data: [], message: "Success" }),
    );
  });
};

beforeEach(() => {
  vi.spyOn(globalThis, "fetch").mockImplementation(fetchMock);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("GetAllPostalCodes component", () => {
  beforeEach(async () => {
    setupFetchMock();
    render(<Wrapper initialUser={{ role: "CONTRIBUTOR" }} />);

    const selectElement = screen.getByLabelText(/Choose dataset/i);
    await user.selectOptions(selectElement, "Postal Codes");
  });

  test("renders Get All button", async () => {
    const getAllButton = screen.getByRole("button", { name: /get all/i });
    expect(getAllButton).toBeInTheDocument();
  });

  test("shows success notification and results when Get All is successful", async () => {
    setupFetchMock();

    const getAllButton = screen.getByRole("button", { name: /get all/i });
    await user.click(getAllButton);

    const successNotification = await screen.findByText(
      /Postal codes retrieved successfully/i,
    );
    expect(successNotification).toBeInTheDocument();

    const dataCodeRows = await screen.findAllByText("12345");
    const dataInputCity = await screen.findByRole("textbox", {
      name: /city for postal code 12345/i,
    });
    expect(dataCodeRows.length).toBeGreaterThan(0);
    expect(dataInputCity).toHaveValue("Test City");
  });

  test("shows error notification when Get All fails", async () => {
    fetchMock.mockImplementation(() =>
      Promise.resolve(createFetchResponse({ error: "Get All failed" }, false)),
    );

    const getAllButton = screen.getByRole("button", { name: /get all/i });
    await user.click(getAllButton);

    const errorNotification = await screen.findByText(/Get All failed/i);
    expect(errorNotification).toBeInTheDocument();
  });

  test("shows error notification when Get All throws an error", async () => {
    fetchMock.mockImplementation(() =>
      Promise.reject(new Error("Network error")),
    );

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const getAllButton = screen.getByRole("button", { name: /get all/i });
    await user.click(getAllButton);

    const errorNotification = await screen.findByText(
      /An error occurred while fetching postal codes/i,
    );
    expect(errorNotification).toBeInTheDocument();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
