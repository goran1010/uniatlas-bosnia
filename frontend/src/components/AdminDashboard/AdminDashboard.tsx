import { use } from "react";
import { RootContext } from "../../contextData/RootContext";
import { AdminForm } from "./AdminForm";
import { Helmet } from "react-helmet-async";

function AdminDashboard() {
  const { userData, t } = use(RootContext);

  if (!userData?.role) {
    return (
      <>
        <Helmet>
          <title>{`${t("title.admin")} | ${t("title.app")}`}</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div className="relative min-h-full w-full flex items-center justify-center p-3">
          <div className="w-full max-w-6xl p-4 md:p-6 flex flex-col gap-4 bg-(--surface-2) text-(--text-primary) border border-(--border-color) rounded-2xl shadow-(--card-shadow) backdrop-blur-sm">
            <p className="text-center text-(--text-secondary)">
              {userData ? t("admin.needAdmin") : t("admin.needLoginAndAdmin")}
            </p>
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      <Helmet>
        <title>{`${t("title.admin")} | ${t("title.app")}`}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <AdminForm />
    </>
  );
}

export { AdminDashboard };
