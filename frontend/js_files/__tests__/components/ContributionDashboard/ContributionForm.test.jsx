import { describe, test, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ContributionDashboard } from "../../../src/components/ContributionDashboard/ContributionDashboard";
import { Notifications } from "../../../src/components/Notifications";
import userEvent from "@testing-library/user-event";
import { RootContextProvider } from "../../rootContextProvider";
import { SERVER_STATUS } from "../../../src/utils/serverStatus";

const mockPendingChanges = [
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

const setupFetchMock = ({ pendingChanges = [], error = null } = {}) => {
  fetchMock.mockReset();
  fetchMock.mockImplementation((url) => {
    const requestUrl = String(url);

    if (requestUrl.includes("/pending-changes/universities")) {
      if (error) {
        return Promise.resolve(createFetchResponse(error, false));
      }

      return Promise.resolve(
        createFetchResponse({
          data: pendingChanges,
          message: "Pending requests fetched successfully.",
        }),
      );
    }

    throw new Error(`Unexpected fetch request: ${requestUrl}`);
  });
};

beforeEach(() => {
  vi.spyOn(globalThis, "fetch").mockImplementation(fetchMock);
  setupFetchMock();
});

afterEach(() => {
  vi.restoreAllMocks();
});

const user = userEvent.setup();

function Wrapper({ initialUser = null }) {
  return (
    <RootContextProvider initialUserData={initialUser}>
      <MemoryRouter initialEntries={["/improve-data"]}>
        <Notifications />
        <Routes>
          <Route path="/improve-data" element={<ContributionDashboard />} />
        </Routes>
      </MemoryRouter>
    </RootContextProvider>
  );
}

function WrapperWithRootValue({ initialUser = null, rootValue = {} }) {
  return (
    <RootContextProvider initialUserData={initialUser} rootValue={rootValue}>
      <MemoryRouter initialEntries={["/improve-data"]}>
        <Notifications />
        <Routes>
          <Route path="/improve-data" element={<ContributionDashboard />} />
        </Routes>
      </MemoryRouter>
    </RootContextProvider>
  );
}

describe("ContributionForm component rendering", () => {
  test("renders Add new data tab button", async () => {
    render(<Wrapper initialUser={{ email: "some@email.com" }} />);

    const tab = await screen.findByRole("button", { name: /Add new data/i });
    expect(tab).toBeInTheDocument();
  });

  test("renders Pending changes tab button", async () => {
    render(<Wrapper initialUser={{ email: "some@email.com" }} />);

    const tab = await screen.findByRole("button", { name: /Pending changes/i });
    expect(tab).toBeInTheDocument();
  });

  test("shows entity type select when Add new data tab is active", async () => {
    render(<Wrapper initialUser={{ email: "some@email.com" }} />);

    const entityTypeLabel = await screen.findByText(/Entity Type/i);
    expect(entityTypeLabel).toBeInTheDocument();
  });

  test("switches to pending changes tab on click", async () => {
    render(<Wrapper initialUser={{ email: "some@email.com" }} />);

    const tab = await screen.findByRole("button", { name: /Pending changes/i });
    await user.click(tab);
    const noChanges = await screen.findByText(/no pending changes/i);
    expect(noChanges).toBeInTheDocument();
  });

  test("shows the pending changes count after loading pending changes", async () => {
    setupFetchMock({ pendingChanges: mockPendingChanges });
    render(<Wrapper initialUser={{ email: "some@email.com" }} />);

    const tab = await screen.findByRole("button", { name: /Pending changes/i });
    await user.click(tab);

    const pendingCount = await screen.findByLabelText(/pending changes count/i);

    expect(pendingCount).toHaveTextContent("1");
    expect(screen.getByText(/Faculty of Engineering/i)).toBeInTheDocument();
  });

  test("shows an error notification when pending changes fail to load", async () => {
    setupFetchMock({
      error: { error: "Pending changes failed to load." },
    });
    render(<Wrapper initialUser={{ email: "some@email.com" }} />);

    const tab = await screen.findByRole("button", { name: /Pending changes/i });
    await user.click(tab);

    const alert = await screen.findByRole("alert");

    expect(alert).toHaveTextContent(/Pending changes failed to load\./i);
    expect(screen.getByText(/no pending changes/i)).toBeInTheDocument();
  });

  test("does not fetch pending changes when the server is waking up", async () => {
    render(
      <WrapperWithRootValue
        initialUser={{ email: "some@email.com" }}
        rootValue={{ serverStatus: SERVER_STATUS.WAKING }}
      />,
    );

    const tab = await screen.findByRole("button", { name: /Pending changes/i });
    await user.click(tab);

    const alert = await screen.findByRole("alert");

    expect(alert).toHaveTextContent(/server might be waking up/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
