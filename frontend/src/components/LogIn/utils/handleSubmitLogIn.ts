import { BACKEND_URL } from "../../../utils/envConfig";
import { getCsrfToken, clearCsrfToken } from "../../utils/getCsrfToken";
import { guardedFetch } from "../../../utils/guardedFetch";
import { readErrorMessage } from "../../../utils/fetchErrorHandling";
import type { SubmitEvent } from "react";
import type { NavigateFunction } from "react-router-dom";
import type { AddNotification } from "../../../types/notification";
import type { TFunction } from "../../../types/i18n";
import type { ServerStatus } from "../../../utils/serverStatus";
import type { UserData } from "../../../types/auth";

type HandleLogInSubmit = (
  e: SubmitEvent<HTMLFormElement>,
  inputFields: {
    email: string;
    password: string;
  },
  setUserData: (data: UserData) => void,
  addNotification: AddNotification,
  setLoading: (loading: boolean) => void,
  navigate: NavigateFunction,
  t: TFunction,
  serverStatus: ServerStatus,
) => Promise<void>;

interface StatusSuccessResponse {
  message: string;
  data: UserData;
}

async function parseJson<T>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
}

const handleSubmitLogIn: HandleLogInSubmit = async function (
  e,
  inputFields,
  setUserData,
  addNotification,
  setLoading,
  navigate,
  t,
  serverStatus,
) {
  try {
    setLoading(true);
    e.preventDefault();

    const csrfToken = await getCsrfToken({
      serverStatus,
      addNotification,
      t,
    });

    if (!csrfToken) {
      addNotification({
        type: "error",
        message: t("messages.csrfTokenFailed"),
      });
      return;
    }

    const response = await guardedFetch(
      `${BACKEND_URL}/auth/login`,
      {
        mode: "cors",
        method: "POST",
        credentials: "include",
        headers: {
          "x-csrf-token": csrfToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: inputFields.email,
          password: inputFields.password,
        }),
      },
      { serverStatus, addNotification, t },
    );

    if (!response.ok) {
      const message =
        (await readErrorMessage(response)) ?? t("messages.auth.loginError");
      addNotification({
        type: "error",
        message,
      });
      return;
    }
    const result = await parseJson<StatusSuccessResponse>(response);
    addNotification({
      type: "success",
      message: result.message,
    });
    setUserData(result.data);

    clearCsrfToken();
    void navigate("/");
  } catch (err) {
    addNotification({
      type: "error",
      message: t("messages.auth.loginError"),
    });
    console.error(err);
  } finally {
    setLoading(false);
  }
};

export { handleSubmitLogIn };
