import { useContext } from "react";
import { UserDataContext } from "../../contextData/UserDataContext";
import { AdminForm } from "./AdminForm";
import { LanguageContext } from "../../contextData/LanguageContext";
import { Helmet } from "react-helmet-async";

function AdminDashboard() {
  const { userData } = useContext(UserDataContext);
  const { t } = useContext(LanguageContext);

  if (userData?.role === "ADMIN") {
    return (
      <>
        <Helmet>
          <title>{`${t("title.admin")} | ${t("title.app")}`}</title>
        </Helmet>
        <AdminForm />
      </>
    );
  }
  return (
    <>
      <Helmet>
        <title>{`${t("title.admin")} | ${t("title.app")}`}</title>
      </Helmet>
      <div className="relative min-h-full w-full flex items-center justify-center p-3">
        <div className="panel-card w-full max-w-6xl p-4 md:p-6 flex flex-col gap-4">
          <p className="label-muted text-center">
            {userData ? t("admin.needAdmin") : t("admin.needLoginAndAdmin")}
          </p>
        </div>
      </div>
    </>
  );
}

export { AdminDashboard };
