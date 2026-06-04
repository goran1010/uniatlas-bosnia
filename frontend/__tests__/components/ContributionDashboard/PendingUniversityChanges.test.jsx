import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { PendingUniversityChanges } from "../../../src/components/ContributionDashboard/PendingUniversityChanges";
import { RootContextProvider } from "../../rootContextProvider";

const PendingUniversityChangesRowMock = vi.fn();

vi.mock(
  "../../../src/components/ContributionDashboard/PendingUniversityChangesRow",
  () => ({
    PendingUniversityChangesRow: (props) => {
      PendingUniversityChangesRowMock(props);
      return <li>{props.change.data?.name ?? "Mock row"}</li>;
    },
  }),
);

vi.mock("../../../src/utils/Spinner", () => ({
  Spinner: () => <p>Loading...</p>,
}));

function Wrapper({ children }) {
  return <RootContextProvider>{children}</RootContextProvider>;
}

const pendingChanges = [
  {
    id: "1",
    entityType: "UNIVERSITY",
    typeOfChange: "CREATE",
    data: { name: "University of Sarajevo" },
  },
  {
    id: "2",
    entityType: "FACULTY",
    typeOfChange: "UPDATE",
    data: { name: "Faculty of Engineering" },
  },
];

beforeEach(() => {
  localStorage.setItem("language", "en");
  PendingUniversityChangesRowMock.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("PendingUniversityChanges", () => {
  test("renders spinner when loading", () => {
    render(
      <Wrapper>
        <PendingUniversityChanges
          loading={true}
          pendingChanges={[]}
          setPendingChanges={vi.fn()}
        />
      </Wrapper>,
    );

    expect(screen.getByText(/Loading\.\.\./i)).toBeInTheDocument();
  });

  test("renders no pending changes message", () => {
    render(
      <Wrapper>
        <PendingUniversityChanges
          loading={false}
          pendingChanges={[]}
          setPendingChanges={vi.fn()}
        />
      </Wrapper>,
    );

    expect(
      screen.getByText(/No pending changes to display\./i),
    ).toBeInTheDocument();
  });

  test("renders pending changes rows and count", () => {
    const setPendingChanges = vi.fn();

    render(
      <Wrapper>
        <PendingUniversityChanges
          loading={false}
          pendingChanges={pendingChanges}
          setPendingChanges={setPendingChanges}
        />
      </Wrapper>,
    );

    expect(screen.getByText(/^Change$/)).toBeInTheDocument();
    expect(screen.getByText(/^Entity Type$/)).toBeInTheDocument();
    expect(screen.getByText(/^Name$/)).toBeInTheDocument();
    expect(screen.getByText("University of Sarajevo")).toBeInTheDocument();
    expect(screen.getByText("Faculty of Engineering")).toBeInTheDocument();
    expect(screen.getByLabelText(/pending changes count/i)).toHaveTextContent(
      "2",
    );

    expect(PendingUniversityChangesRowMock).toHaveBeenCalledTimes(2);
    expect(PendingUniversityChangesRowMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        index: 0,
        setPendingChanges,
      }),
    );
  });
});
