import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RootContextProvider } from "../../rootContextProvider";

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
  pendingRequests = [],
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
import { Notifications } from "../../../src/components/Notifications";
import { MemoryRouter, Routes, Route } from "react-router-dom";

function Wrapper({ initialUser = null }) {
  return (
    <RootContextProvider initialUserData={initialUser} rootValue={{ addNotification: vi.fn() }}>
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

describe("AdminForm component rendering", () => {
  test("renders AdminForm component's heading", async () => {
    setupFetchMock();
    render(<Wrapper initialUser={{ role: "ADMIN" }} />);

    const heading = await screen.findByRole("heading", {
      name: /Admin Dashboard/i,
    });

    expect(heading).toBeInTheDocument();

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test("renders pending changes list", async () => {
    setupFetchMock({ pendingRequests: mockChanges });

    render(<Wrapper initialUser={{ role: "ADMIN" }} />);

    const email = await screen.findByText(/johndoe@examplemail.com/i);

    expect(email).toBeInTheDocument();
  });
});

describe("AdminForm component pending changes interaction", () => {
  test("updates pending changes list when a pending request is approved", async () => {
    setupFetchMock({ pendingRequests: mockChanges });
    render(<Wrapper initialUser={{ role: "ADMIN" }} />);

    const pendingCount = await screen.findByLabelText(/pending changes count/i);
    expect(pendingCount).toHaveTextContent("1");

    const user = userEvent.setup();

    const pendingChangesHeading = await screen.findByText("Pending Changes");
    expect(pendingChangesHeading).toBeInTheDocument();

    const confirmButton = await screen.findByRole("button", {
      name: /Approve/i,
    });

    await user.click(confirmButton);

    expect(pendingCount).not.toBeInTheDocument();

    expect(
      screen.getByText(/There are no pending changes at the moment./i),
    ).toBeInTheDocument();
  });

  test("removes pending request from the list when declined", async () => {
    setupFetchMock({ pendingRequests: mockChanges });
    render(<Wrapper initialUser={{ role: "ADMIN" }} />);
    const pendingCount = await screen.findByLabelText(/pending changes count/i);

    const user = userEvent.setup();

    const pendingChangesHeading = await screen.findByText("Pending Changes");
    expect(pendingChangesHeading).toBeInTheDocument();

    const rejectButton = await screen.findByRole("button", {
      name: /Reject/i,
    });

    await user.click(rejectButton);

    expect(pendingCount).not.toBeInTheDocument();

    expect(
      screen.getByText(/There are no pending changes at the moment./i),
    ).toBeInTheDocument();
  });
});
