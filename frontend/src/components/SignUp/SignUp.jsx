import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserDataContext } from "../../contextData/UserDataContext.js";
import { Link } from "react-router-dom";
import { SignUpForm } from "./SignUpForm";
import { NotificationContext } from "../../contextData/NotificationContext.js";
import { GitHubLoginLink } from "../sharedComponents/GitHubLoginLink.jsx";
import { DividerOr } from "../sharedComponents/DividerOr.jsx";

function SignUp() {
  const [loading, setLoading] = useState(false);

  const { addNotification } = useContext(NotificationContext);

  const navigate = useNavigate();
  const { userData } = useContext(UserDataContext);

  useEffect(() => {
    if (userData) {
      addNotification({
        type: "warning",
        message:
          "You can't sign up while logged in. Redirected to the home page.",
      });
      navigate("/home");
      return;
    }
  }, [userData, navigate, addNotification]);

  return (
    <div className="panel-card relative min-h-full w-full max-w-xl mx-auto flex items-center justify-center p-4 sm:p-5">
      <div className="w-full max-w-md p-1 sm:p-2 flex flex-col gap-4">
        <div>
          <h1 className="text-3xl text-center font-bold">
            Create your account
          </h1>
        </div>
        <SignUpForm setLoading={setLoading} loading={loading} />

        <DividerOr />

        <GitHubLoginLink setLoading={setLoading} loading={loading} />

        <DividerOr />

        <div className="relative">
          <p className="text-center">
            Already have an account ? Go back to the{" "}
            <Link className="hover:underline font-bold" to={"/login"}>
              Log In
            </Link>{" "}
            page.
          </p>
        </div>
      </div>
    </div>
  );
}

export { SignUp };
