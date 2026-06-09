import { PendingChangesAdmin } from "./PendingChangesAdmin";
import { use } from "react";
import { RootContext } from "../../contextData/RootContext";

function AdminForm() {
  const { t } = use(RootContext);

  return (
    <div className="relative min-h-full w-full flex flex-1 flex-col items-center py-2 sm:p-3">
      <section className="w-full max-w-6xl py-4 px-1 sm:px-4 md:p-6 flex flex-col gap-4 bg-(--surface-2) text-(--text-primary) border border-(--border-color) rounded-2xl shadow-(--card-shadow) backdrop-blur-sm">
        <h1 className="text-center text-2xl font-bold pb-2 border-b-2 border-[color-mix(in_oklab,var(--border-color),transparent_35%)]">
          {t("admin.dashboardTitle")}
        </h1>

        <PendingChangesAdmin />
      </section>
    </div>
  );
}
export { AdminForm };
