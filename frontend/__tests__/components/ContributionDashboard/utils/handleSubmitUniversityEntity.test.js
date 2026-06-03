import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";

const getCsrfTokenMock = vi.fn();
const guardedFetchMock = vi.fn();

vi.mock("../../../../src/components/utils/getCsrfToken", () => ({
  getCsrfToken: (...args) => getCsrfTokenMock(...args),
}));

vi.mock("../../../../src/utils/guardedFetch", () => ({
  guardedFetch: (...args) => guardedFetchMock(...args),
}));

const t = (key) => key;

const baseArgs = {
  entityType: "UNIVERSITY",
  parentId: "",
  targetId: "",
  typeOfChange: "CREATE",
  data: { name: "University of Sarajevo", city: "Sarajevo" },
  setPendingChanges: vi.fn(),
  addNotification: vi.fn(),
  setLoading: vi.fn(),
  setFormState: vi.fn(),
  t,
  serverStatus: "live",
};

beforeEach(() => {
  getCsrfTokenMock.mockReset();
  guardedFetchMock.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("handleSubmitUniversityEntity", () => {
  test("submits a create request and prepends the pending change", async () => {
    getCsrfTokenMock.mockResolvedValue("csrf-token");
    guardedFetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: { id: "1", entityType: "UNIVERSITY", data: { name: "University of Sarajevo" } },
        message: "Pending change created successfully.",
      }),
    });

    const { handleSubmitUniversityEntity } = await import(
      "../../../../src/components/ContributionDashboard/utils/handleSubmitUniversityEntity"
    );
    const setPendingChanges = vi.fn();
    const addNotification = vi.fn();
    const setLoading = vi.fn();
    const setFormState = vi.fn();

    await handleSubmitUniversityEntity({
      ...baseArgs,
      setPendingChanges,
      addNotification,
      setLoading,
      setFormState,
    });

    expect(guardedFetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/users/contribution/universities"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "x-csrf-token": "csrf-token" }),
      }),
      expect.objectContaining({ serverStatus: "live" }),
    );
    expect(setLoading).toHaveBeenNthCalledWith(1, true);
    expect(setLoading).toHaveBeenLastCalledWith(false);
    expect(addNotification).toHaveBeenCalledWith({
      type: "success",
      message: "Pending change created successfully.",
    });
    expect(setFormState).toHaveBeenCalledWith({
      entityType: "",
      parentId: "",
      targetId: "",
      data: {},
    });

    const updatePendingChanges = setPendingChanges.mock.calls[0][0];
    expect(updatePendingChanges([{ id: "existing" }])).toEqual([
      { id: "1", entityType: "UNIVERSITY", data: { name: "University of Sarajevo" } },
      { id: "existing" },
    ]);
  });

  test("uses PUT and target id for updates", async () => {
    getCsrfTokenMock.mockResolvedValue("csrf-token");
    guardedFetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ data: { id: "1" }, message: "Updated." }),
    });

    const { handleSubmitUniversityEntity } = await import(
      "../../../../src/components/ContributionDashboard/utils/handleSubmitUniversityEntity"
    );

    await handleSubmitUniversityEntity({
      ...baseArgs,
      entityType: "FACULTY",
      targetId: "7",
      typeOfChange: "UPDATE",
      data: { name: "Updated Faculty" },
    });

    expect(guardedFetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({
          entityType: "FACULTY",
          targetId: 7,
          data: { name: "Updated Faculty" },
        }),
      }),
      expect.any(Object),
    );
  });

  test("shows an error notification when the csrf token is missing", async () => {
    getCsrfTokenMock.mockResolvedValue(null);

    const { handleSubmitUniversityEntity } = await import(
      "../../../../src/components/ContributionDashboard/utils/handleSubmitUniversityEntity"
    );
    const addNotification = vi.fn();
    const setLoading = vi.fn();

    await handleSubmitUniversityEntity({
      ...baseArgs,
      addNotification,
      setLoading,
    });

    expect(guardedFetchMock).not.toHaveBeenCalled();
    expect(addNotification).toHaveBeenCalledWith({
      type: "error",
      message: "messages.csrfTokenFailed",
    });
    expect(setLoading).toHaveBeenLastCalledWith(false);
  });

  test("shows the fallback error when the request throws", async () => {
    const requestError = new Error("Network failure");
    getCsrfTokenMock.mockResolvedValue("csrf-token");
    guardedFetchMock.mockRejectedValue(requestError);
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { handleSubmitUniversityEntity } = await import(
      "../../../../src/components/ContributionDashboard/utils/handleSubmitUniversityEntity"
    );
    const addNotification = vi.fn();

    await handleSubmitUniversityEntity({
      ...baseArgs,
      addNotification,
    });

    expect(addNotification).toHaveBeenCalledWith({
      type: "error",
      message: "messages.universities.addError",
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error submitting university entity:",
      requestError,
    );
  });
});