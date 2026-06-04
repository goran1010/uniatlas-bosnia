import { Outlet } from "react-router-dom";
import { Navbar } from "./components/Navbar/Navbar";
import { Footer } from "./components/Footer";
import { useStatusCheck } from "./customHooks/useStatusCheck";
import { Notifications } from "./components/Notifications";
import { useNotification } from "./customHooks/useNotification";
import { useServerWakeUp } from "./customHooks/useServerWakeUp";
import { useCloseMenu } from "./customHooks/useCloseMenu";
import { useLanguage } from "./customHooks/useLanguage";
import { HelmetProvider } from "react-helmet-async";
import { RootContext } from "./contextData/RootContext";
import { SERVER_STATUS } from "./components/utils/serverStatus";

function App() {
  const closeMenu = useCloseMenu();

  const { notifications, addNotification, removeNotification } =
    useNotification();
  const { language, setLanguage, t } = useLanguage();
  const serverStatus = useServerWakeUp({
    addNotification,
    removeNotification,
    t,
  });

  const { userData, setUserData } = useStatusCheck(
    addNotification,
    t,
    serverStatus,
  );

  return (
    <RootContext
      value={{
        language,
        setLanguage,
        t,
        notifications,
        addNotification,
        removeNotification,
        userData,
        setUserData,
        serverStatus,
      }}
    >
      <HelmetProvider>
        <>
          <Navbar closeMenu={closeMenu} />
          <Notifications />
          <main className="flex-1 flex flex-col items-center p-2 md:px-5 lg:px-10 xl:px-25 2xl:px-50 relative bg-(--app-bg) text-(--text-primary)">
            <Outlet />
          </main>
          <Footer />
        </>
      </HelmetProvider>
    </RootContext>
  );
}

export { App };
