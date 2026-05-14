import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
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
        <ContributionDashboard />
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

    return Promise.reject(new Error(`Unhandled request: ${requestUrl}`));
  });
};

beforeEach(async () => {
  vi.spyOn(globalThis, "fetch").mockImplementation(fetchMock);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("PendingChangesRow Component", () => {
  test("renders 1 pending change", async () => {
    setupFetchMock();

    fetchMock.mockImplementation((requestUrl) => {
      if (requestUrl.includes("/pending-changes/postal-codes")) {
        return Promise.resolve(
          createFetchResponse({
            data: [
              {
                id: 1,
                city: "Test City",
                code: "12345",
                post: "",
                typeOfChange: "CREATE",
              },
            ],
            message: "Pending changes retrieved successfully",
          }),
        );
      }
    });

    render(<Wrapper initialUser={{ name: "Test User" }} />);
    const selectElement = screen.getByLabelText(/Choose dataset/i);
    await user.selectOptions(selectElement, "Postal Codes");

    expect(await screen.findByText("Pending Changes")).toBeInTheDocument();
    expect(screen.getByText("Test City")).toBeInTheDocument();
    expect(screen.getByText("12345")).toBeInTheDocument();
    expect(screen.getByText("CREATE")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /discard/i }),
    ).toBeInTheDocument();
  });

  test("renders multiple pending changes are rendered", async () => {
    setupFetchMock();

    fetchMock.mockImplementation((requestUrl) => {
      if (requestUrl.includes("/pending-changes/postal-codes")) {
        return Promise.resolve(
          createFetchResponse({
            data: [
              {
                id: 1,
                city: "Test City",
                code: "12345",
                post: "",
                typeOfChange: "CREATE",
              },
              {
                id: 2,
                city: "Another City",
                code: "67890",
                post: "",
                typeOfChange: "UPDATE",
              },
            ],
            message: "Pending changes retrieved successfully",
          }),
        );
      }
    });

    render(<Wrapper initialUser={{ name: "Test User" }} />);
    const selectElement = screen.getByLabelText(/Choose dataset/i);
    await user.selectOptions(selectElement, "Postal Codes");

    expect(await screen.findByText("Pending Changes")).toBeInTheDocument();
    expect(screen.getByText("Test City")).toBeInTheDocument();
    expect(screen.getByText("12345")).toBeInTheDocument();
    expect(screen.getByText("CREATE")).toBeInTheDocument();

    expect(screen.getByText("Another City")).toBeInTheDocument();
    expect(screen.getByText("67890")).toBeInTheDocument();
    expect(screen.getByText("UPDATE")).toBeInTheDocument();

    const discardButtons = screen.getAllByRole("button", { name: /discard/i });
    expect(discardButtons).toHaveLength(2);
  });

  test("handles Discard action", async () => {
    setupFetchMock();

    fetchMock.mockImplementationOnce((requestUrl) => {
      if (requestUrl.includes("/pending-changes/postal-codes")) {
        return Promise.resolve(
          createFetchResponse({
            data: [
              {
                id: 1,
                city: "Test City",
                code: "12345",
                post: "",
                typeOfChange: "CREATE",
              },
            ],
            message: "Pending changes retrieved successfully",
          }),
        );
      }
    });

    fetchMock.mockImplementationOnce((requestUrl) => {
      if (requestUrl.includes("/csrf-token")) {
        return Promise.resolve(
          createFetchResponse({
            data: "mocked-csrf-token",
            message: "CSRF token generated successfully",
          }),
        );
      }
    });

    fetchMock.mockImplementationOnce((requestUrl) => {
      if (requestUrl.includes("/pending-changes/postal-codes")) {
        return Promise.resolve(
          createFetchResponse({
            data: null,
            message: "Pending changes discarded successfully",
          }),
        );
      }
    });

    render(<Wrapper initialUser={{ name: "Test User" }} />);
    const selectElement = screen.getByLabelText(/Choose dataset/i);
    await user.selectOptions(selectElement, "Postal Codes");

    const discardButton = screen.getByRole("button", { name: /discard/i });
    await user.click(discardButton);

    screen.debug();

    expect(
      await screen.findByText(/No pending changes to display./i),
    ).toBeInTheDocument();
  });
});
