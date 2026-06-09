import { RootContext } from "../../contextData/RootContext";
import { use, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleLogout } from "./utils/handleLogout";
import { Button } from "../sharedComponents/Button";
import { Helmet } from "react-helmet-async";

function Profile() {
  const { userData, setUserData, t, serverStatus, addNotification } =
    use(RootContext);
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
    <div className="flex flex-col flex-1 justify-center items-center h-full w-full">
      <Helmet>
        <title>{`${t("title.profile")} | ${t("title.app")}`}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="w-full max-w-md overflow-hidden bg-(--surface-2) text-(--text-primary) border border-(--border-color) rounded-2xl shadow-(--card-shadow) backdrop-blur-sm">
        <div className="bg-linear-to-r from-blue-600 to-indigo-700 dark:from-blue-900 dark:to-indigo-900 p-4">
          <h1 className="text-2xl font-bold text-white text-center">
            {t("profile.title")}
          </h1>
        </div>
        <div className="p-4 flex flex-col gap-3 text-center items-center">
          <dl className="w-full flex flex-col gap-3">
            <div>
              <dt className="block text-sm font-semibold uppercase tracking-wide text-(--text-secondary)">
                {t("profile.emailAddress")}
              </dt>
              <dd className="text-lg font-bold">{userData?.email}</dd>
            </div>
            <div>
              <dt className="block text-sm font-semibold uppercase tracking-wide text-(--text-secondary)">
                {t("profile.currentRole")}
              </dt>
              <dd className="flex items-center justify-center">
                <span
                  className={`items-center px-4 py-2 rounded-full text-sm font-bold ${
                    userData?.role === "ADMIN"
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      : "bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-slate-100"
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
                  serverStatus,
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
    </div>
  );
}

export { Profile };
