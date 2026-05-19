import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserDataContext } from "../../contextData/UserDataContext.js";
import { Link } from "react-router-dom";
import { SignUpForm } from "./SignUpForm";
import { NotificationContext } from "../../contextData/NotificationContext.js";
import { GitHubLoginLink } from "../sharedComponents/GitHubLoginLink.jsx";
import { DividerOr } from "../sharedComponents/DividerOr.jsx";
import { LanguageContext } from "../../contextData/LanguageContext.js";
import { Helmet } from "react-helmet-async";

function SignUp() {
  const [loading, setLoading] = useState(false);

  const { addNotification } = useContext(NotificationContext);
  const { t } = useContext(LanguageContext);

  const navigate = useNavigate();
  const { userData } = useContext(UserDataContext);

  useEffect(() => {
    if (userData) {
      addNotification({
        type: "warning",
        message: t("auth.signup.blockedWhileLoggedIn"),
      });
      navigate("/home");
      return;
    }
  }, [userData, navigate, addNotification, t]);

  return (
    <>
      <Helmet>
        <title>{`${t("title.signup")} | ${t("title.app")}`}</title>
      </Helmet>
      <div className="panel-card relative min-h-full w-full max-w-xl mx-auto flex items-center justify-center p-4 sm:p-5">
        <div className="w-full max-w-md p-1 sm:p-2 flex flex-col gap-4">
          <div>
            <h1 className="text-3xl text-center font-bold">
              {t("auth.signup.heading")}
            </h1>
          </div>
          <SignUpForm setLoading={setLoading} loading={loading} />

          <DividerOr />

          <GitHubLoginLink setLoading={setLoading} loading={loading} />

          <DividerOr />

          <div className="relative">
            <p className="text-center">
              {t("auth.signup.haveAccountPrefix")}{" "}
              <Link className="hover:underline font-bold" to={"/login"}>
                {t("auth.login.linkText")}
              </Link>{" "}
              {t("auth.pageSuffix")}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export { SignUp };
