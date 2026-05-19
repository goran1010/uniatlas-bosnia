import { PendingChangesAdmin } from "./PendingChangesAdmin";
import { useContext } from "react";
import { LanguageContext } from "../../contextData/LanguageContext";

function AdminForm() {
  const { t } = useContext(LanguageContext);

  return (
    <div className="relative min-h-full w-full flex flex-1 flex-col items-center py-2 sm:p-3">
      <section className="panel-card w-full max-w-6xl py-4 px-1 sm:px-4 md:p-6 flex flex-col gap-4">
        <h1 className="text-center text-2xl font-bold pb-2 border-b-2 divider-muted">
          {t("admin.dashboardTitle")}
        </h1>

        <PendingChangesAdmin />
      </section>
    </div>
  );
}
export { AdminForm };
