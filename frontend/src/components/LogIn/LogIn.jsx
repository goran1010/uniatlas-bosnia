import { Link, useSearchParams } from "react-router-dom";
import { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { LogInForm } from "./LogInForm.jsx";
import { UserDataContext } from "../../contextData/UserDataContext.js";
import { NotificationContext } from "../../contextData/NotificationContext.js";
import { GitHubLoginLink } from "../sharedComponents/GitHubLoginLink.jsx";
import { DividerOr } from "../sharedComponents/DividerOr.jsx";

function LogIn() {
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();

  const { addNotification } = useContext(NotificationContext);

  useEffect(() => {
    if (searchParams.get("error") === "github") {
      addNotification({
        type: "error",
        message: "GitHub login failed. Please try again.",
      });
    }
  }, [searchParams, addNotification]);

  const navigate = useNavigate();
  const { userData } = useContext(UserDataContext);
  const wasLoggedInOnPageLoad = useRef(Boolean(userData));

  useEffect(() => {
    if (userData) {
      if (wasLoggedInOnPageLoad.current) {
        addNotification({
          type: "warning",
          message: "You are already logged in. Redirected to the home page.",
        });
      }
      navigate("/home");
      return;
    }
  }, [userData, navigate, addNotification]);

  return (
    <div className="panel-card relative min-h-full w-full max-w-xl mx-auto flex items-center justify-center p-4 sm:p-5">
      <div className="w-full max-w-md p-1 sm:p-2 flex flex-col gap-4">
        <h1 className="text-3xl text-center font-bold">Log in</h1>
        <LogInForm setLoading={setLoading} loading={loading} />

        <DividerOr />

        <GitHubLoginLink setLoading={setLoading} loading={loading} />

        <DividerOr />

        <div className="relative">
          <p className="text-center">
            Don't have an account ? Go to the{" "}
            <Link className="hover:underline font-bold" to={"/signup"}>
              Sign Up
            </Link>{" "}
            page.
          </p>
        </div>
      </div>
    </div>
  );
}

export { LogIn };
