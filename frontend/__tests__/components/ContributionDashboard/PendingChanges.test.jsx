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

    if (requestUrl.includes("/users/contribution/postal-codes")) {
      return Promise.resolve(
        createFetchResponse({
          data: {
            id: 1,
            city: "Test City",
            code: "12345",
            post: "",
            typeOfChange: "CREATE",
          },

          message: "New postal code suggested",
        }),
      );
    }

    return Promise.reject(new Error(`Unhandled request: ${requestUrl}`));
  });
};

beforeEach(() => {
  vi.spyOn(globalThis, "fetch").mockImplementation(fetchMock);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ContributionDashboard - Pending Changes", () => {
  test("renders No pending changes to display when no pending changes exist", async () => {
    fetchMock.mockImplementation((requestUrl) => {
      if (requestUrl.includes("/pending-changes/postal-codes")) {
        return Promise.resolve(
          createFetchResponse({
            data: [],
            message: "Pending changes retrieved successfully",
          }),
        );
      }
      return Promise.reject(new Error(`Unhandled request: ${requestUrl}`));
    });

    render(<Wrapper initialUser={{ email: "some@email.com" }} />);

    const selectElement = screen.getByLabelText(/Choose dataset/i);
    await user.selectOptions(selectElement, "Postal Codes");

    const text = await screen.findByText(/No pending changes to display./i);
    expect(text).toBeInTheDocument();
  });
});

describe("ContributionDashboard - Pending Changes", () => {
  beforeEach(async () => {
    setupFetchMock();
    render(<Wrapper initialUser={{ email: "some@email.com" }} />);

    const selectElement = screen.getByLabelText(/Choose dataset/i);
    await user.selectOptions(selectElement, "Postal Codes");
  });

  test("renders heading when pending changes exist", async () => {
    const heading = await screen.findByRole("heading", {
      name: /Pending Changes/i,
      level: 2,
    });
    expect(heading).toBeInTheDocument();
  });

  test("renders correct pending changes count", async () => {
    const countBadge = await screen.findByLabelText(/pending changes count/i);
    expect(countBadge).toHaveTextContent("1");
  });

  test("renders pending change details", async () => {
    const changeType = await screen.findByText(/CREATE/i);
    const code = await screen.findByText(/12345/i);
    const city = await screen.findByText(/Test City/i);

    expect(changeType).toBeInTheDocument();
    expect(code).toBeInTheDocument();
    expect(city).toBeInTheDocument();
  });
});
