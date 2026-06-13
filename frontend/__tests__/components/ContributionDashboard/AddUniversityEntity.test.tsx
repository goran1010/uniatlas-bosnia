import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddUniversityEntity } from "../../../src/components/ContributionDashboard/AddUniversityEntity";
import { RootContextProvider } from "../../rootContextProvider";

import type { ReactElement } from "react";

const handleSubmitUniversityEntityMock =
  vi.fn<(...args: unknown[]) => undefined>();

vi.mock(
  "../../../src/components/ContributionDashboard/utils/handleSubmitUniversityEntity",
  () => ({
    handleSubmitUniversityEntity: (...args: unknown[]) => {
      handleSubmitUniversityEntityMock(...args);
    },
  }),
);

function Wrapper({ children }: { children: ReactElement }) {
  return <RootContextProvider>{children}</RootContextProvider>;
}

beforeEach(() => {
  localStorage.setItem("language", "en");
  handleSubmitUniversityEntityMock.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("AddUniversityEntity", () => {
  test("renders university create fields when university is selected", async () => {
    render(
      <Wrapper>
        <AddUniversityEntity setPendingChanges={vi.fn()} />
      </Wrapper>,
    );

    const user = userEvent.setup();
    const entityType = screen.getByRole("combobox", { name: /Entity Type/i });

    await user.selectOptions(entityType, "UNIVERSITY");

    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/City/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Entity$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Ownership/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Website/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Submit Suggestion/i }),
    ).toBeInTheDocument();
  });

  test("renders target id and hides data fields for delete changes", async () => {
    render(
      <Wrapper>
        <AddUniversityEntity setPendingChanges={vi.fn()} />
      </Wrapper>,
    );

    const user = userEvent.setup();

    await user.selectOptions(
      screen.getByRole("combobox", { name: /Entity Type/i }),
      "FACULTY",
    );
    await user.selectOptions(
      screen.getByRole("combobox", { name: /Change/i }),
      "DELETE",
    );

    expect(screen.getByLabelText(/^ID$/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Name/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Parent ID/i)).not.toBeInTheDocument();
  });

  test("renders study program specific fields for create changes", async () => {
    render(
      <Wrapper>
        <AddUniversityEntity setPendingChanges={vi.fn()} />
      </Wrapper>,
    );

    const user = userEvent.setup();

    await user.selectOptions(
      screen.getByRole("combobox", { name: /Entity Type/i }),
      "STUDY_PROGRAM",
    );

    expect(screen.getByLabelText(/Parent ID/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cycle/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Duration/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ECTS credits/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Language/i)).toBeInTheDocument();
  });

  test("renders subject specific fields for create changes", async () => {
    render(
      <Wrapper>
        <AddUniversityEntity setPendingChanges={vi.fn()} />
      </Wrapper>,
    );

    const user = userEvent.setup();

    await user.selectOptions(
      screen.getByRole("combobox", { name: /Entity Type/i }),
      "SUBJECT",
    );

    expect(screen.getByLabelText(/Parent ID/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Semester/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ECTS credits/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Subject type/i)).toBeInTheDocument();
  });

  test("renders target id and data fields for update changes", async () => {
    render(
      <Wrapper>
        <AddUniversityEntity setPendingChanges={vi.fn()} />
      </Wrapper>,
    );

    const user = userEvent.setup();

    await user.selectOptions(
      screen.getByRole("combobox", { name: /Entity Type/i }),
      "UNIVERSITY",
    );
    await user.selectOptions(
      screen.getByRole("combobox", { name: /Change/i }),
      "UPDATE",
    );

    expect(screen.getByLabelText(/^ID$/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Parent ID/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/City/i)).toBeInTheDocument();
  });

  test("submits the selected entity data through the handler", async () => {
    const setPendingChanges = vi.fn();

    render(
      <Wrapper>
        <AddUniversityEntity setPendingChanges={setPendingChanges} />
      </Wrapper>,
    );

    const user = userEvent.setup();

    await user.selectOptions(
      screen.getByRole("combobox", { name: /Entity Type/i }),
      "UNIVERSITY",
    );
    await user.type(screen.getByLabelText(/Name/i), "University of Sarajevo");
    await user.type(screen.getByLabelText(/City/i), "Sarajevo");
    await user.selectOptions(screen.getByLabelText(/^Entity$/i), "FBIH");
    await user.selectOptions(screen.getByLabelText(/Ownership/i), "JAVNA");

    await user.click(
      screen.getByRole("button", { name: /Submit Suggestion/i }),
    );

    expect(handleSubmitUniversityEntityMock).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: "UNIVERSITY",
        parentId: "",
        targetId: "",
        typeOfChange: "CREATE",
        data: expect.objectContaining({
          name: "University of Sarajevo",
          city: "Sarajevo",
          entity: "FBIH",
          ownership: "JAVNA",
        }) as unknown,
        setPendingChanges,
        addNotification: expect.any(Function) as unknown,
        setLoading: expect.any(Function) as unknown,
        setFormState: expect.any(Function) as unknown,
        t: expect.any(Function) as unknown,
        serverStatus: "live",
      }),
    );
  });

  test("submits subject data with numeric conversions on update", async () => {
    const setPendingChanges = vi.fn();

    render(
      <Wrapper>
        <AddUniversityEntity setPendingChanges={setPendingChanges} />
      </Wrapper>,
    );

    const user = userEvent.setup();

    await user.selectOptions(
      screen.getByRole("combobox", { name: /Entity Type/i }),
      "SUBJECT",
    );
    await user.selectOptions(
      screen.getByRole("combobox", { name: /Change/i }),
      "UPDATE",
    );

    await user.type(screen.getByLabelText(/^ID$/i), "123");
    await user.type(screen.getByLabelText(/Name/i), "Algorithms");
    await user.type(screen.getByLabelText(/Semester/i), "3");
    await user.type(screen.getByLabelText(/ECTS credits/i), "6");
    await user.selectOptions(
      screen.getByLabelText(/Subject type/i),
      "MANDATORY",
    );

    await user.click(
      screen.getByRole("button", { name: /Submit Suggestion/i }),
    );

    expect(handleSubmitUniversityEntityMock).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: "SUBJECT",
        targetId: "123",
        typeOfChange: "UPDATE",
        data: expect.objectContaining({
          name: "Algorithms",
          semester: 3,
          ects: 6,
          type: "MANDATORY",
        }) as unknown,
        setPendingChanges,
      }),
    );
  });
});
