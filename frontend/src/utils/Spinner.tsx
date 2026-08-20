import { use } from "react";
import { RootContext } from "../contextData/RootContext";

function Spinner() {
  const { t } = use(RootContext);

  return (
    <>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div
        role="status"
        aria-label={t("loading")}
        className="w-full h-full flex justify-center items-center"
      >
        <div
          className="border-3 border-(--border-color) border-t-3 border-t-(--accent) rounded-full max-w-10 max-h-10 min-w-5 min-h-5 w-full h-full my-12 mx-auto"
          style={{ animation: "spin 1s linear infinite" }}
        />
      </div>
    </>
  );
}

export { Spinner };
