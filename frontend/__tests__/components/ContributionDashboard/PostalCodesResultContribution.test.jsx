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
import { clearCsrfToken } from "../../../src/components/utils/getCsrfToken";

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
  clearCsrfToken();
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
              id: 3,
              city: "Pending City",
              code: 54321,
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
              code: 12345,
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
              code: 12345,
              post: "",
            },
            { id: 2, city: "Test City 2", code: 12346, post: "" },
          ],
          message: "Postal codes retrieved successfully",
        }),
      );
    }

    return Promise.resolve(
      createFetchResponse({
        data: [],
        message: "Postal codes retrieved successfully",
      }),
    );
  });
};

beforeEach(() => {
  vi.spyOn(globalThis, "fetch").mockImplementation(fetchMock);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("PostalCodesResultContribution component", () => {
  beforeEach(async () => {
    setupFetchMock();
    render(<Wrapper initialUser={{ role: "CONTRIBUTOR" }} />);

    const selectElement = screen.getByLabelText(/Choose dataset/i);
    await user.selectOptions(selectElement, "Postal Codes");

    const getAllButton = screen.getByRole("button", { name: /get all/i });
    await user.click(getAllButton);
  });

  test("renders search results in the table", async () => {
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

  test("shows no results message when searchResult is empty", async () => {
    fetchMock.mockImplementation(() =>
      Promise.resolve(createFetchResponse({ data: [], message: "Success" })),
    );

    const getAllButton = screen.getByRole("button", { name: /get all/i });
    await user.click(getAllButton);

    const noResultsMessage = await screen.findByText(/No results to display/i);
    expect(noResultsMessage).toBeInTheDocument();
  });

  test("shows error notification when edit fails", async () => {
    fetchMock
      .mockImplementationOnce(() =>
        Promise.resolve(
          createFetchResponse({
            data: "mocked-csrf-token",
            message: "CSRF token generated successfully",
          }),
        ),
      )
      .mockRejectedValueOnce(new Error("Edit failed"));

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const editButtons = await screen.findAllByRole("button", {
      name: /update/i,
    });
    const editButton = editButtons[0];
    await user.click(editButton);

    const errorNotification = await screen.findByText(
      /An error occurred while updating the postal code/i,
    );
    expect(errorNotification).toBeInTheDocument();

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  test("shows success notification and updates data when edit is successful", async () => {
    fetchMock
      .mockImplementationOnce(() =>
        Promise.resolve(
          createFetchResponse({
            data: "mocked-csrf-token",
            message: "CSRF token generated successfully",
          }),
        ),
      )
      .mockImplementationOnce(() =>
        Promise.resolve(
          createFetchResponse({
            data: {
              id: 1,
              typeOfChange: "UPDATE",
              city: "Updated City",
              code: 12345,
              post: "",
            },
            message: "Postal code updated successfully",
          }),
        ),
      );

    const cityInput = await screen.findByDisplayValue("Test City");
    await user.clear(cityInput);
    await user.type(cityInput, "Updated City");

    const editButtons = await screen.findAllByRole("button", {
      name: /update/i,
    });
    const editButton = editButtons[0];
    await user.click(editButton);

    const successNotification = await screen.findByText(
      /Postal code updated successfully/i,
    );
    expect(successNotification).toBeInTheDocument();

    const updatedCityInput = await screen.findByDisplayValue("Updated City");
    expect(updatedCityInput).toBeInTheDocument();
  });

  test("shows error notification when delete fails", async () => {
    fetchMock
      .mockImplementationOnce(() =>
        Promise.resolve(
          createFetchResponse({
            data: "mocked-csrf-token",
            message: "CSRF token generated successfully",
          }),
        ),
      )
      .mockRejectedValueOnce(new Error("Delete failed"));

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const deleteButtons = await screen.findAllByRole("button", {
      name: /delete/i,
    });
    const deleteButton = deleteButtons[0];
    await user.click(deleteButton);

    const errorNotification = await screen.findByText(
      /An error occurred while deleting the postal code/i,
    );
    expect(errorNotification).toBeInTheDocument();

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  test("shows success notification and removes data when delete is successful", async () => {
    fetchMock
      .mockImplementationOnce(() =>
        Promise.resolve(
          createFetchResponse({
            data: "mocked-csrf-token",
            message: "CSRF token generated successfully",
          }),
        ),
      )
      .mockImplementationOnce(() =>
        Promise.resolve(
          createFetchResponse({
            data: {
              id: 2,
              typeOfChange: "DELETE",
              city: "Test City",
              code: 12345,
              post: "",
            },
            message: "Postal code deleted successfully",
          }),
        ),
      );

    const deleteButtons = await screen.findAllByRole("button", {
      name: /delete/i,
    });
    const deleteButton = deleteButtons[0];

    await user.click(deleteButton);

    const successNotification = await screen.findByText(
      /Postal code deleted successfully/i,
    );
    expect(successNotification).toBeInTheDocument();

    const dataCodeRows = await screen.findAllByText("12345");
    expect(dataCodeRows.length).toBeGreaterThan(0);
  });

  test("shows error when csrfToken retrieval fails during edit", async () => {
    fetchMock.mockImplementationOnce(() =>
      Promise.resolve(
        createFetchResponse("Failed to retrieve CSRF token", false),
      ),
    );

    const cityInput = await screen.findByDisplayValue("Test City");
    await user.clear(cityInput);
    await user.type(cityInput, "Updated City");

    const editButtons = await screen.findAllByRole("button", {
      name: /update/i,
    });
    const editButton = editButtons[0];
    await user.click(editButton);

    const errorNotification = await screen.findByText(
      /Failed to retrieve CSRF token/i,
    );
    expect(errorNotification).toBeInTheDocument();
  });

  test("shows error when csrfToken retrieval fails during delete", async () => {
    fetchMock.mockImplementationOnce(() =>
      Promise.resolve(
        createFetchResponse("Failed to retrieve CSRF token", false),
      ),
    );

    const deleteButtons = await screen.findAllByRole("button", {
      name: /delete/i,
    });
    const deleteButton = deleteButtons[0];
    await user.click(deleteButton);

    const errorNotification = await screen.findByText(
      /Failed to retrieve CSRF token/i,
    );
    expect(errorNotification).toBeInTheDocument();
  });
});
