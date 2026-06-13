import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddUniversityEntity } from "../../../src/components/ContributionDashboard/AddUniversityEntity";
import { RootContextProvider } from "../../rootContextProvider";

import type { ReactElement } from "react";
import type { PendingChange } from "../../../src/components/ContributionDashboard/customHooks/useGetPendingChanges";
import type { HandleSubmitUniversityEntityParams } from "../../../src/components/ContributionDashboard/utils/handleSubmitUniversityEntity";

const handleSubmitUniversityEntityMock =
  vi.fn<(args: HandleSubmitUniversityEntityParams) => undefined>();

vi.mock(
  "../../../src/components/ContributionDashboard/utils/handleSubmitUniversityEntity",
  () => ({
    handleSubmitUniversityEntity: (
      args: HandleSubmitUniversityEntityParams,
    ) => {
      handleSubmitUniversityEntityMock(args);
    },
  }),
);

function Wrapper({ children }: { children: ReactElement }) {
  return <RootContextProvider>{children}</RootContextProvider>;
}

function expectSubmitArgs() {
  const submittedArgs = handleSubmitUniversityEntityMock.mock.calls[0]?.[0];

  expect(submittedArgs).toBeDefined();

  return submittedArgs;
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
    const setPendingChanges =
      vi.fn<(value: React.SetStateAction<PendingChange[]>) => void>();

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

    const submittedArgs = expectSubmitArgs();

    expect(submittedArgs.entityType).toBe("UNIVERSITY");
    expect(submittedArgs.parentId).toBe("");
    expect(submittedArgs.targetId).toBe("");
    expect(submittedArgs.typeOfChange).toBe("CREATE");
    expect(submittedArgs.data).toMatchObject({
      name: "University of Sarajevo",
      city: "Sarajevo",
      entity: "FBIH",
      ownership: "JAVNA",
    });
    expect(submittedArgs.setPendingChanges).toBe(setPendingChanges);
    expect(typeof submittedArgs.addNotification).toBe("function");
    expect(typeof submittedArgs.setLoading).toBe("function");
    expect(typeof submittedArgs.setFormState).toBe("function");
    expect(typeof submittedArgs.t).toBe("function");
    expect(submittedArgs.serverStatus).toBe("live");
  });

  test("submits subject data with numeric conversions on update", async () => {
    const setPendingChanges =
      vi.fn<(value: React.SetStateAction<PendingChange[]>) => void>();

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

    const submittedArgs = expectSubmitArgs();

    expect(submittedArgs.entityType).toBe("SUBJECT");
    expect(submittedArgs.targetId).toBe("123");
    expect(submittedArgs.typeOfChange).toBe("UPDATE");
    expect(submittedArgs.data).toMatchObject({
      name: "Algorithms",
      semester: 3,
      ects: 6,
      type: "MANDATORY",
    });
    expect(submittedArgs.setPendingChanges).toBe(setPendingChanges);
  });
});
