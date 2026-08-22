import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminRequests } from "../../../../src/components/AdminDashboard/AdminRequests";
import { Notifications } from "../../../../src/components/Notifications";
import { RootContextProvider } from "../../../utils/rootContextProvider";

import type { AdminRequest } from "../../../../src/schemas/adminRequest";

const user = userEvent.setup();

const mockAdminRequests: AdminRequest[] = [
  {
    id: "058d1adc-58e4-4f31-8021-64e37e7d0dd0",
    email: "johndoe@examplemail.com",
    adminRequestedAt: "2026-08-16T10:00:00.000Z",
  },
];

const createFetchResponse = (data: unknown, ok = true) => ({
  ok,
  json: () => Promise.resolve(data),
});

const fetchMock = vi.fn();

const setupFetchMock = ({
  adminRequests = mockAdminRequests,
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
    if (requestUrl.includes("/admin-requests")) {
      return Promise.resolve(
        createFetchResponse({
          data: adminRequests,
          message: "Admin requests retrieved successfully.",
        }),
      );
    }
    if (requestUrl.includes("/approve-admin-request")) {
      return Promise.resolve(
        createFetchResponse({
          message: "Admin request approved successfully.",
        }),
      );
    }
    if (requestUrl.includes("/decline-admin-request")) {
      return Promise.resolve(
        createFetchResponse({
          message: "Admin request declined successfully.",
        }),
      );
    }
    throw new Error(`Unexpected fetch request: ${requestUrl}`);
  });
};

function Wrapper() {
  return (
    <RootContextProvider
      initialUserData={{ email: "admin@example.com", role: "ADMIN" }}
    >
      <Notifications />
      <AdminRequests />
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

describe("AdminRequests component", () => {
  test("renders a request row with email and count", async () => {
    setupFetchMock();
    render(<Wrapper />);

    expect(
      await screen.findByText("johndoe@examplemail.com"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/admin requests count/i)).toHaveTextContent(
      "1",
    );
    expect(
      screen.getByRole("heading", { name: /Admin Requests/i }),
    ).toBeInTheDocument();
  });

  test("renders the empty state when there are no requests", async () => {
    setupFetchMock({ adminRequests: [] });
    render(<Wrapper />);

    expect(
      await screen.findByText(/There are no admin requests at the moment./i),
    ).toBeInTheDocument();
  });

  test("approves a request and removes the row", async () => {
    setupFetchMock();
    render(<Wrapper />);

    await user.click(await screen.findByRole("button", { name: /Approve/i }));

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/users/admin/approve-admin-request"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ id: mockAdminRequests[0]?.id }),
      }),
    );
    expect(
      await screen.findByText(/Admin request approved./i),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("johndoe@examplemail.com"),
    ).not.toBeInTheDocument();
  });

  test("declines a request and removes the row", async () => {
    setupFetchMock();
    render(<Wrapper />);

    await user.click(await screen.findByRole("button", { name: /Reject/i }));

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/users/admin/decline-admin-request"),
      expect.objectContaining({
        method: "DELETE",
        body: JSON.stringify({ id: mockAdminRequests[0]?.id }),
      }),
    );
    expect(
      await screen.findByText(/Admin request declined./i),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("johndoe@examplemail.com"),
    ).not.toBeInTheDocument();
  });

  test("shows an error notification when fetching requests fails", async () => {
    setupFetchMock();
    fetchMock.mockImplementation(() =>
      Promise.resolve(
        createFetchResponse(
          { error: { message: "Something went wrong." } },
          false,
        ),
      ),
    );
    vi.spyOn(console, "warn").mockImplementation(() => vi.fn());

    render(<Wrapper />);

    expect(
      await screen.findByText(/Error fetching admin requests./i),
    ).toBeInTheDocument();
  });
});
