import { NotificationContext } from "../../contextData/NotificationContext";
import { useContext, useEffect } from "react";
import { UserDataContext } from "../../contextData/UserDataContext";
import { useNavigate } from "react-router-dom";
import { handleLogout } from "./utils/handleLogout";
import { Button } from "../sharedComponents/Button";
import { useState } from "react";
import { LanguageContext } from "../../contextData/LanguageContext";
import { Helmet } from "react-helmet-async";

function Profile() {
  const { addNotification } = useContext(NotificationContext);
  const { userData, setUserData } = useContext(UserDataContext);
  const { t } = useContext(LanguageContext);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userData) {
      addNotification({
        type: "warning",
        message: t("profile.needLogin"),
      });
      navigate("/login");
      return;
    }
  }, [userData, navigate, addNotification, t]);

  return (
    <>
      <Helmet>
        <title>{`${t("title.profile")} | ${t("title.app")}`}</title>
      </Helmet>
      <div className="panel-card w-full max-w-md mx-auto overflow-hidden">
        <div className="bg-linear-to-r from-blue-600 to-indigo-700 dark:from-blue-900 dark:to-indigo-900 p-4">
          <h1 className="text-2xl font-bold text-white text-center">
            {t("profile.title")}
          </h1>
        </div>
        <div className="p-4 flex flex-col gap-3 text-center items-center">
          <dl className="w-full flex flex-col gap-3">
            <div>
              <dt className="label-muted block text-sm font-semibold uppercase tracking-wide">
                {t("profile.emailAddress")}
              </dt>
              <dd className="text-lg font-bold">{userData?.email}</dd>
            </div>
            <div>
              <dt className="label-muted block text-sm font-semibold uppercase tracking-wide">
                {t("profile.currentRole")}
              </dt>
              <dd className="flex items-center justify-center">
                <span
                  className={`items-center px-4 py-2 rounded-full text-sm font-bold ${
                    userData?.role === "ADMIN"
                      ? "role-pill-admin"
                      : "role-pill-user"
                  }`}
                >
                  {userData?.role}
                </span>
              </dd>
            </div>
          </dl>
          <div className="flex flex-col gap-2 w-full max-w-sm">
            <Button
              onClick={() =>
                handleLogout(
                  addNotification,
                  navigate,
                  setUserData,
                  setLoading,
                  t,
                )
              }
              variant="danger"
              className="px-6 py-3 font-semibold"
              type="submit"
              loading={loading}
            >
              {t("profile.logout")}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export { Profile };
