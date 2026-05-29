import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AdminDashboard } from "../../../src/components/AdminDashboard/AdminDashboard";
import { Notifications } from "../../../src/components/Notifications";
import { RootContextProvider } from "../../rootContextProvider";

const mockChanges = [
  {
    id: "8687b282-fcc6-4f69-8744-0f8e1585d991",
    entityType: "FACULTY",
    typeOfChange: "UPDATE",
    targetId: 1,
    parentId: 1,
    data: { name: "Faculty of Engineering" },
    createdAt: "2026-05-06T07:34:01.967Z",
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
  fetchMock.mockReset();
  fetchMock.mockImplementation((url) => {
    const requestUrl = String(url);
    if (requestUrl.includes("/csrf-token")) {
      return Promise.resolve(
        createFetchResponse({ data: csrfToken, message: "Success" }),
      );
    }
    if (requestUrl.includes("/pending-changes")) {
      return Promise.resolve(
        createFetchResponse({
          data: pendingRequests,
          message: "Pending requests fetched successfully.",
        }),
      );
    }
    if (requestUrl.includes("/approve-pending-change")) {
      return Promise.resolve(
        createFetchResponse({ message: "Pending change approved successfully." }),
      );
    }
    if (requestUrl.includes("/decline-pending-change")) {
      return Promise.resolve(
        createFetchResponse({ message: "Pending change declined successfully." }),
      );
    }
    throw new Error(`Unexpected fetch request: ${requestUrl}`);
  });
};

function Wrapper({ initialUser = null }) {
  return (
    <RootContextProvider initialUserData={initialUser}>
      <MemoryRouter initialEntries={["/admin-dashboard"]}>
        <Notifications />
        <Routes>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Routes>
      </MemoryRouter>
    </RootContextProvider>
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
    const email = await screen.findByText("johndoe@examplemail.com");
    expect(email).toBeInTheDocument();
    const numberOfRequests = screen.getByLabelText(/pending changes count/i);
    expect(numberOfRequests).toHaveTextContent("1");
  });

  test("renders PendingChanges with 2 requests", async () => {
    const mockChangesMore = [
      ...mockChanges,
      {
        id: "12345678-90ab-cdef-1234-567890abcdef",
        entityType: "UNIVERSITY",
        typeOfChange: "CREATE",
        targetId: null,
        parentId: null,
        data: { name: "New University" },
        createdAt: "2026-05-07T10:20:30.000Z",
        user: { email: "janedoe@examplemail.com" },
        userId: "12345678-90ab-cdef-1234-567890abcdef",
      },
    ];
    setupFetchMock({ pendingRequests: mockChangesMore });
    render(<Wrapper initialUser={{ role: "ADMIN" }} />);
    await screen.findByText("johndoe@examplemail.com");
    expect(screen.getByLabelText(/pending changes count/i)).toHaveTextContent("2");
    expect(screen.getByText("janedoe@examplemail.com")).toBeInTheDocument();
  });

  test("shows no pending requests when fetch throws a network error", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
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
