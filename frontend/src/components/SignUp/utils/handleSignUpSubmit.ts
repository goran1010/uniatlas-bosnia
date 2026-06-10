import { BACKEND_URL } from "../../../utils/envConfig";
import { getCsrfToken } from "../../utils/getCsrfToken";
import { guardedFetch } from "../../../utils/guardedFetch";
import type { SubmitEvent } from "react";
import type { AddNotification } from "../../../customHooks/useNotification";
import type { TFunction } from "../../../customHooks/useLanguage";
import type { ServerStatus } from "../../../utils/serverStatus";
import type { NavigateFunction } from "react-router-dom";

type HandleSignUpSubmit = (
  event: SubmitEvent<HTMLFormElement>,
  setLoading: (loading: boolean) => void,
  inputFields: {
    email: string;
    password: string;
    "confirm-password": string;
  },
  addNotification: AddNotification,
  navigate: NavigateFunction,
  t: TFunction,
  serverStatus: ServerStatus,
) => Promise<void>;

interface StatusSuccessResponse {
  message: string;
  data: {
    email: string;
  };
}

interface StatusErrorResponse {
  error: {
    message: string;
  };
}

async function parseJson<T>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
}

const handleSignUpSubmit: HandleSignUpSubmit = async function (
  event,
  setLoading,
  inputFields,
  addNotification,
  navigate,
  t,
  serverStatus,
) {
  try {
    setLoading(true);
    event.preventDefault();

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
      `${BACKEND_URL}/auth/signup`,
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
          "confirm-password": inputFields["confirm-password"],
        }),
      },
      { serverStatus, addNotification, t },
    );

    if (!response.ok) {
      const result = await parseJson<StatusErrorResponse>(response);
      addNotification({
        type: "error",
        message: result.error.message,
      });
      return;
    }
    const result = await parseJson<StatusSuccessResponse>(response);
    addNotification({
      type: "success",
      message: result.message,
    });
    void navigate("/login");
  } catch (err) {
    addNotification({
      type: "error",
      message: t("messages.auth.registrationError"),
    });
    console.error("Error during registration:", err);
  } finally {
    setLoading(false);
  }
};

export { handleSignUpSubmit };
