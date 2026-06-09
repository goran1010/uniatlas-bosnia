import { BACKEND_URL } from "../../../utils/envConfig";
import { getCsrfToken } from "../../utils/getCsrfToken";
import { guardedFetch } from "../../../utils/guardedFetch";
import type { SubmitEvent } from "react";
import type { AddNotification } from "../../../customHooks/useNotification";
import type { TFunction } from "../../../customHooks/useLanguage";
import type { ServerStatus } from "../../../utils/serverStatus";

type HandleSignUpSubmit = (
  event: SubmitEvent<HTMLFormElement>,
  setLoading: (loading: boolean) => void,
  inputFields: {
    email: string;
    password: string;
    "confirm-password": string;
  },
  addNotification: AddNotification,
  navigate: (path: string) => void,
  t: TFunction,
  serverStatus: ServerStatus,
) => Promise<void>;

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

    const result = await response.json();
    if (!response.ok) {
      addNotification({
        type: "error",
        message:
          result?.error?.message ||
          result?.error ||
          t("messages.auth.registrationFailed"),
      });
      return;
    }
    addNotification({
      type: "success",
      message: result.message,
    });
    navigate("/login");
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
