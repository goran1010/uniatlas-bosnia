import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { NotificationContext } from "../../../src/contextData/NotificationContext";

const mockChanges = [
  {
    city: "Divičani",
    code: 70204,
    createdAt: "2026-05-06T07:34:01.967Z",
    id: "8687b282-fcc6-4f69-8744-0f8e1585d991",
    post: "HP_MOSTAR",
    typeOfChange: "UPDATE",
    user: { email: "johndoe@examplemail.com" },
    userId: "058d1adc-58e4-4f31-8021-64e37e7d0dd0",
  },
];

const createFetchResponse = (data, ok = true) => ({
  ok,
  json: async () => data,
});

const fetchMock = vi.fn();

const setupFetchMock = ({
  pendingRequests = mockChanges,
  csrfToken = "csrf-token",
} = {}) => {
  fetchMock.mockImplementation((url) => {
    const requestUrl = String(url);
    if (requestUrl.includes("/csrf-token")) {
      return Promise.resolve(
        createFetchResponse({ data: csrfToken, message: "Success" }),
      );
    }
    if (requestUrl.includes("/users/admin/pending-changes")) {
      return Promise.resolve(
        createFetchResponse({
          data: pendingRequests,
          message: "Pending requests fetched successfully.",
        }),
      );
    }

    if (requestUrl.includes("/approve-pending-change")) {
      return Promise.resolve(
        createFetchResponse({
          message: "Pending change approved successfully.",
        }),
      );
    }

    if (requestUrl.includes("/decline-pending-change")) {
      return Promise.resolve(
        createFetchResponse({
          message: "Pending change declined successfully.",
        }),
      );
    }

    throw new Error(`Unexpected fetch request: ${requestUrl}`);
  });
};

import { AdminDashboard } from "../../../src/components/AdminDashboard/AdminDashboard";
import { useNotification } from "../../../src/customHooks/useNotification";
import { Notifications } from "../../../src/components/Notifications";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { UserDataContext } from "../../../src/contextData/UserDataContext";

function Wrapper({ initialUser = null }) {
  const [userData, setUserData] = useState(initialUser);
  const { notifications, addNotification, removeNotification } =
    useNotification();

  return (
    <NotificationContext
      value={{ notifications, addNotification, removeNotification }}
    >
      <UserDataContext value={{ userData, setUserData }}>
        <MemoryRouter initialEntries={["/admin-dashboard"]}>
          <Notifications />
          <Routes>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
          </Routes>
        </MemoryRouter>
      </UserDataContext>
    </NotificationContext>
  );
}

beforeEach(() => {
  vi.spyOn(globalThis, "fetch").mockImplementation(fetchMock);
  fetchMock.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("PendingChanges Component", () => {
  test("renders PendingChanges with 1 request", async () => {
    setupFetchMock();

    render(<Wrapper initialUser={{ role: "ADMIN" }} />);

    const numberOfRequests = await screen.findByLabelText(
      /pending changes count/i,
    );
    await screen.findAllByText(/Pending Changes/i);

    expect(numberOfRequests).toHaveTextContent("1");

    expect(screen.getByLabelText(/pending changes count/i)).toHaveTextContent(
      "1",
    );
  });

  test("renders multiple pending requests with correct count", async () => {
    const mockChangesMore = [
      {
        city: "Divičani",
        code: 70204,
        createdAt: "2026-05-06T07:34:01.967Z",
        id: "8687b282-fcc6-4f69-8744-0f8e1585d991",
        post: "HP_MOSTAR",
        typeOfChange: "UPDATE",
        user: { email: "johndoe@examplemail.com" },
        userId: "058d1adc-58e4-4f31-8021-64e37e7d0dd0",
      },
      {
        city: "Sarajevo",
        code: 71000,
        createdAt: "2026-05-07T10:20:30.000Z",
        id: "12345678-90ab-cdef-1234-567890abcdef",
        post: "HP_SARAJEVO",
        typeOfChange: "ADD",
        user: { email: "janedoe@examplemail.com" },
        userId: "12345678-90ab-cdef-1234-567890abcdef",
      },
    ];
    setupFetchMock({ pendingRequests: mockChangesMore });

    render(<Wrapper initialUser={{ role: "ADMIN" }} />);

    await screen.findByText("johndoe@examplemail.com");

    expect(screen.getByLabelText(/pending changes count/i)).toHaveTextContent(
      "2",
    );

    expect(screen.getByText("janedoe@examplemail.com")).toBeInTheDocument();
  });

  test("shows no pending requests when fetch throws a network error", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    fetchMock.mockImplementation((url) => {
      const requestUrl = String(url);
      if (requestUrl.includes("/csrf-token")) {
        return Promise.resolve(
          createFetchResponse({ data: "someToken", message: "Success" }),
        );
      }

      return Promise.reject(new Error("Network error"));
    });

    render(<Wrapper initialUser={{ role: "ADMIN" }} />);

    const pendingMessage = await screen.findByText(
      /There are no pending changes at the moment./i,
    );
    expect(pendingMessage).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });
});
