import { useContext } from "react";
import { UserDataContext } from "../../contextData/UserDataContext";
import { ContributionForm } from "./ContributionForm";

function ContributionDashboard() {
  const { userData } = useContext(UserDataContext);

  if (!userData) {
    return (
      <section className="panel-card relative min-h-full w-full flex items-center justify-center p-3">
        <p className="label-muted text-center">
          You need to be logged in to see the contribution dashboard.
        </p>
      </section>
    );
  }

  if (userData) {
    return <ContributionForm />;
  }
  return (
    <section className="panel-card relative min-h-full w-full flex items-center justify-center p-3">
      <p className="label-muted text-center">
        You need to be a registered user to propose changes to the content.
      </p>
    </section>
  );
}

export { ContributionDashboard };
